import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const PORT = 4173;
let server;
let browser;
let profile;
let ws;
let nextId = 1;
const pending = new Map();
const runtimeErrors = [];

async function waitFor(fn, timeout = 10000, interval = 100) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {}
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('Timed out waiting for condition.');
}

async function cdp(method, params = {}) {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }
    }, 15000);
  });
}

async function evaluate(expression, awaitPromise = true) {
  const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || 'Browser evaluation failed');
  return result.result?.result?.value;
}

async function browserFetch(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  return r.json();
}

async function boot() {
  profile = await mkdtemp(join(tmpdir(), 'occ-ui-'));
  server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
  await waitFor(async () => {
    try { return (await fetch(`http://127.0.0.1:${PORT}/index.html`)).ok; } catch { return false; }
  });

  browser = spawn('chromium', ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--remote-debugging-port=9222', `--user-data-dir=${profile}`, `http://127.0.0.1:${PORT}/index.html`], { stdio: 'ignore' });
  const target = await waitFor(async () => {
    const pages = await browserFetch('http://127.0.0.1:9222/json/list');
    return pages.find(p => p.type === 'page' && p.url.includes('/index.html'));
  });

  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails);
    if (message.id && pending.has(message.id)) {
      const item = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) item.reject(new Error(message.error.message));
      else item.resolve(message.result);
    }
  });

  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await evaluate(`localStorage.clear(); sessionStorage.clear(); location.reload()`);
  await waitFor(async () => (await evaluate(`document.readyState === 'complete' && !!window.osintEnterprise`)) === true);
  await new Promise(r => setTimeout(r, 300));
}

async function click(selector) {
  const ok = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.click(); return true; })()`);
  assert.equal(ok, true, `Missing clickable control: ${selector}`);
  await new Promise(r => setTimeout(r, 120));
}

async function fill(selector, value) {
  const ok = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set; if (setter) setter.call(el, ${JSON.stringify(value)}); else el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); return true; })()`);
  assert.equal(ok, true, `Missing form field: ${selector}`);
}

async function setSelect(selector, value) {
  const ok = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return false; el.value = ${JSON.stringify(value)}; el.dispatchEvent(new Event('change', {bubbles:true})); return el.value === ${JSON.stringify(value)}; })()`);
  assert.equal(ok, true, `Unable to set select: ${selector}`);
}

async function text(selector) {
  return evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent?.trim() || ''`);
}

async function viewIs(view) {
  return evaluate(`document.querySelector('.view.active')?.id === ${JSON.stringify(`view-${view}`)}`);
}

async function shutdown() {
  try { ws?.close(); } catch {}
  try { browser?.kill('SIGTERM'); } catch {}
  try { server?.kill('SIGTERM'); } catch {}
  if (profile) await rm(profile, { recursive: true, force: true });
}

test.before(async () => boot());
test.after(async () => shutdown());

test('runtime UI smoke: navigation, CRUD modals, graph inspector and core commands', async () => {
  assert.equal(await evaluate('document.title'), 'OSINT Command Center — Living Analyst Cockpit');
  assert.equal(await viewIs('command'), true, 'Command view must boot active');

  for (const view of ['cases', 'evidence', 'entities', 'hypotheses', 'contradictions', 'reports', 'governance', 'command']) {
    await click(`[data-view="${view}"]`);
    assert.equal(await viewIs(view), true, `${view} navigation must activate its view`);
  }

  await click('#newCase');
  assert.equal(await evaluate(`document.querySelector('#modal')?.classList.contains('open')`), true, 'New investigation must open modal');
  await fill('#caseName', 'Runtime Smoke Investigation');
  await fill('#caseObjective', 'Verify the operational UI path end to end.');
  await click('#modalSave');
  assert.equal(await evaluate(`document.querySelector('#modal')?.classList.contains('open')`), false, 'Case modal must close after save');
  assert.equal(await evaluate(`localStorage.length > 0`), true, 'Case save must persist locally');

  await click('[data-view="cases"]');
  assert.match(await text('#casesList'), /Runtime Smoke Investigation/);

  await click('[data-view="evidence"]');
  await click('[data-action="new-evidence"]');
  await fill('#evTitle', 'Runtime Evidence');
  await fill('#evClaim', 'A source-backed runtime claim.');
  await fill('#evLocator', 'https://example.test/source');
  await setSelect('#evStatus', 'FACT');
  await fill('#evConfidence', '0.8');
  await click('#modalSave');
  assert.match(await text('#evidenceList'), /Runtime Evidence/);

  await click('[data-view="entities"]');
  for (const name of ['Runtime Entity A', 'Runtime Entity B']) {
    await click('[data-action="new-entity"]');
    await fill('#entName', name);
    await setSelect('#entType', 'person');
    await click('#modalSave');
  }
  await waitFor(async () => (await evaluate(`document.querySelectorAll('.living-node[data-entity-id]').length`)) >= 2);
  assert.equal(await evaluate(`document.querySelectorAll('.living-node[data-entity-id]').length >= 2`), true, 'Graph must render created entities');

  await click('.living-node[data-entity-id]');
  assert.equal(await evaluate(`document.querySelector('#occEntityInspector')?.classList.contains('open')`), true, 'Entity click must open inspector');
  assert.match(await text('#occInspectorTitle'), /Runtime Entity/);
  await click('.occ-inspector-close');
  assert.equal(await evaluate(`document.querySelector('#occEntityInspector')?.classList.contains('open')`), false, 'Inspector close must work');

  await click('[data-action="new-relationship"]');
  assert.equal(await evaluate(`document.querySelectorAll('#relFrom option').length >= 2 && document.querySelectorAll('#relTo option').length >= 2`), true, 'Relationship modal must expose entity options');
  const ids = await evaluate(`[...document.querySelectorAll('#relFrom option')].slice(0,2).map(o => o.value)`);
  await setSelect('#relFrom', ids[0]);
  await setSelect('#relTo', ids[1]);
  await fill('#relType', 'associated_with');
  await fill('#relConfidence', '0.7');
  await click('#modalSave');
  assert.equal(await evaluate(`document.querySelectorAll('#livingSvg line.edge').length >= 1`), true, 'Graph must render saved relationship');

  await click('[data-view="hypotheses"]');
  await click('[data-action="new-hypothesis"]');
  await fill('#hypStatement', 'Alternative runtime explanation.');
  await fill('#hypFalsifier', 'A primary source disproves it.');
  await fill('#hypConfidence', '0.55');
  await click('#modalSave');
  assert.match(await text('#hypothesesList'), /Alternative runtime explanation/);

  await click('[data-view="contradictions"]');
  await click('[data-action="triage"]');
  assert.equal(await viewIs('contradictions'), true, 'Triage must preserve contradictions view');

  await click('[data-view="command"]');
  await waitFor(async () => Boolean(await evaluate(`document.querySelector('#biasRadarPanel [data-action="toggle-redteam"]')`)));
  await click('#biasRadarPanel [data-action="toggle-redteam"]');
  assert.match(await text('#runtimeStatus'), /RED TEAM ACTIVE/);

  await click('[data-view="reports"]');
  assert.equal(await evaluate(`document.querySelector('[data-action="create-report"]') !== null`), true, 'Report action must be rendered');
  await click('[data-action="create-report"]');

  await click('[data-view="governance"]');
  assert.match(await text('#governanceList'), /STATE/);

  assert.equal(runtimeErrors.length, 0, `Runtime JavaScript exceptions detected: ${runtimeErrors.map(x => x.text || 'unknown').join(' | ')}`);
});
