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
const inspector = read('src/entity-inspector.js');
const lab = read('src/tools/lab-ui.js');
const forensics = read('src/tools/forensics-ui.js');

const actionOwners = {
  'new-case': app,
  'new-evidence': app,
  'new-entity': app,
  'new-relationship': app,
  'new-hypothesis': app,
  'new-decision': app,
  'new-source': app,
  'new-contradiction': app,
  'new-report': app,
  'export-data': app,
  'import-data': app,
  'open-settings': app
};

for (const [action, owner] of Object.entries(actionOwners)) {
  test(`action ${action} has an implementation owner`, () => {
    assert.match(owner, new RegExp(action.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')), `Missing action owner: ${action}`);
  });
}

test('dashboard command controls have handlers', () => {
  for (const marker of ['renderBiasRadar', 'renderRedTeam', 'renderChallenge', 'renderMatrix', 'renderMemory', 'renderTemporal']) {
    assert.match(app, new RegExp(marker), `Missing command renderer: ${marker}`);
  }
});

test('modal contract is present', () => {
  for (const marker of ['openModal', 'saveModal', 'closeModal']) {
    assert.match(app, new RegExp(marker), `Missing modal implementation: ${marker}`);
  }
});

test('Step 2, graph inspector and utility surfaces are wired', () => {
  for (const marker of ['data-step2-link', 'data-step2-rel', 'step2CreateDecision', 'step2ApproveDecision']) {
    assert.match(step2, new RegExp(marker), `Missing Step 2 contract: ${marker}`);
  }
  assert.match(graph, /entityInspector|inspectEntity|entity:open/, 'Graph entity event contract missing');
  assert.match(inspector, /entity:open|inspectEntity|entityInspector/, 'Entity Inspector implementation missing');
  assert.match(lab, /toolUrlRun|evRun/, 'Utility Lab controls missing');
  assert.match(forensics, /fxTimesRun|fxGhostRun|promote-finding/, 'Forensics controls missing');
});

test('all statically loaded module entrypoints exist', () => {
  const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]).filter(Boolean);
  for (const script of scripts) {
    assert.equal(fs.existsSync(path.join(root, script)), true, `Missing module: ${script}`);
  }
});
