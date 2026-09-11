import test from 'node:test';
import assert from 'node:assert/strict';

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
};

const { loadState, saveState, getRecoveryHistory } = await import('../src/core/store.js');

test('legacy global state is never auto-imported into a private installation', () => {
  storage.clear();
  storage.set('osint-enterprise-state-v1', JSON.stringify({ cases: [{ id: 'legacy-case' }] }));
  const state = loadState();
  assert.deepEqual(state.cases, []);
  assert.ok(storage.has('osint-enterprise-state-v1'));
});

test('local revisions retain bounded recovery history', () => {
  storage.clear();
  const first = saveState({ cases: [{ id: 'one' }] });
  saveState({ cases: [{ id: 'two' }] });
  saveState({ cases: [{ id: 'three' }] });
  assert.equal(first.meta.revision, 1);
  assert.equal(loadState().meta.revision, 3);
  const history = getRecoveryHistory();
  assert.equal(history.length, 2);
  assert.equal(history[0].state.cases[0].id, 'one');
  assert.equal(history[1].state.cases[0].id, 'two');
});

test('malformed primary state is recoverable without crashing save', () => {
  storage.clear();
  storage.set('osint-installation-id-v2', 'test-installation');
  storage.set('osint-enterprise-state-v2:test-installation', '{bad json');
  const state = loadState();
  assert.deepEqual(state.cases, []);
  const saved = saveState(state);
  assert.equal(saved.meta.revision, 1);
  assert.equal(loadState().meta.revision, 1);
});
