import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDAID2, daid2PromptEnvelope } from '../src/core/daid2.js';

test('DAID 2.0 detects missing evidence and selects repair mode', () => {
  const d = buildDAID2({ cases: [], evidence: [], hypotheses: [], contradictions: [], decisions: [] }, { integrity: 0, gaps: [{ code: 'NO_EVIDENCE' }], counts: {} });
  assert.equal(d.version, '2.0');
  assert.equal(d.mode, 'REPAIR');
  assert.ok(d.failureSignatures.includes('NO_EVIDENCE'));
  assert.equal(d.nextBestAction.action, 'CAPTURE_EVIDENCE');
});

test('DAID 2.0 challenges untested falsifiers', () => {
  const state = { cases: [{ objective: 'Establish relationship' }], evidence: [{ humanVerified: true }], hypotheses: [{ falsifier: 'Independent evidence disproves it', falsifierTested: false }], contradictions: [], decisions: [] };
  const d = buildDAID2(state, { integrity: 60, gaps: [{ code: 'UNTESTED_FALSIFIER' }], counts: {} });
  assert.equal(d.mode, 'TEST');
  assert.ok(d.failureSignatures.includes('UNTESTED_FALSIFIER'));
  assert.equal(d.nextBestAction.action, 'TEST_FALSIFIER');
});

test('DAID prompt envelope preserves epistemic constraints', () => {
  const e = daid2PromptEnvelope({ mode: 'CHALLENGE', uncertainty: 'HIGH', intentEnvelope: { objective: 'test' } });
  assert.equal(e.mode, 'CHALLENGE');
  assert.ok(e.constraints.includes('Do not invent evidence'));
  assert.ok(e.requiredOutput.includes('UNKNOWN'));
});
