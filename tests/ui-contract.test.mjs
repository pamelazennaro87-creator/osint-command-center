import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('index.html');
const app = read('src/app.js');
const step2 = read('src/step2-integrity.js');
const graph = read('src/graph-ui.js');
const lab = read('src/tools/lab-ui.js');
const forensics = read('src/tools/forensics-ui.js');

const actionOwners = {
  'new-case': app,
  'new-evidence': app,
  'new-entity': app,
  'new-relationship': app,
  'new-hypothesis': app,
  triage: app,
  'create-report': app,
  'clear-focus': app,
  'toggle-redteam': app
};

test('every static data-action has an implementation owner', () => {
  const actions = [...html.matchAll(/data-action="([^"]+)"/g)].map(m => m[1]);
  assert.ok(actions.length > 0);
  for (const action of actions) {
    assert.ok(actionOwners[action], `No implementation owner mapped for data-action: ${action}`);
    assert.match(actionOwners[action], new RegExp(`['"]${action.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')}['"]|${action.replace(/-/g, '\\-')}`), `Implementation marker missing for ${action}`);
  }
});

test('dashboard command controls have handlers', () => {
  for (const id of ['newCase', 'audit', 'challenge', 'report', 'export']) {
    assert.match(app, new RegExp(`['"]${id}['"]`), `Missing handler reference for #${id}`);
  }
});

test('modal contract is present', () => {
  for (const id of ['modal', 'modalClose', 'modalCancel', 'modalSave', 'modalFields']) {
    assert.match(html, new RegExp(`id="${id}"`), `Missing modal DOM contract: ${id}`);
  }
  for (const marker of ['openModal', 'saveModal', 'closeModal']) {
    assert.match(app, new RegExp(marker), `Missing modal implementation: ${marker}`);
  }
});

test('Step 2, graph inspector and utility surfaces are wired', () => {
  for (const marker of ['data-step2-link', 'data-step2-rel', 'step2CreateDecision', 'step2ApproveDecision']) {
    assert.match(step2, new RegExp(marker), `Missing Step 2 contract: ${marker}`);
  }
  assert.match(graph, /entityInspector|inspectEntity/, 'Graph entity inspector contract missing');
  assert.match(lab, /toolUrlRun|evRun/, 'Utility Lab controls missing');
  assert.match(forensics, /fxTimesRun|fxGhostRun|promote-finding/, 'Forensics controls missing');
});

test('all statically loaded module entrypoints exist', () => {
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(Boolean);
  for (const script of scripts) {
    assert.equal(fs.existsSync(path.join(root, script)), true, `Missing module: ${script}`);
  }
});
