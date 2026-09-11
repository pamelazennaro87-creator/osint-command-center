import test from 'node:test';
import assert from 'node:assert/strict';
import { validateState } from '../src/core/validation.js';

const validState = {
  cases: [{ id: 'case-1' }],
  sources: [{ id: 'source-1' }],
  evidence: [{ id: 'e-1', caseId: 'case-1', sourceId: 'source-1', claim: 'Observed fact', confidence: 0.8, status: 'UNKNOWN' }],
  entities: [],
  relationships: [],
  hypotheses: [{ id: 'h-1', caseId: 'case-1', statement: 'Possible explanation', falsifier: 'Independent evidence disproves it.' }],
  contradictions: [],
  decisions: [],
  audit: []
};

test('validateState exposes boolean status while preserving error-array behavior', () => {
  const result = validateState(validState);
  assert.deepEqual([...result], []);
  assert.equal(result.valid, true);
  assert.equal(Array.isArray(result), true);
});

test('validateState marks invalid state without changing error-array semantics', () => {
  const result = validateState({ cases: [], sources: [], evidence: [{ id: 'e-1', caseId: 'missing', sourceId: 'missing', claim: '', confidence: 2 }] });
  assert.equal(result.valid, false);
  assert.ok(result.length >= 3);
  assert.ok(result.some(message => message.includes('existing case')));
});
