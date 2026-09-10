import test from 'node:test';
import assert from 'node:assert/strict';
import { createInvestigationBundle, classifyTarget, runInvestigationLoop } from '../src/core/investigation-loop.js';

test('classifies common investigation targets', () => {
  assert.equal(classifyTarget('https://example.org/a'), 'url');
  assert.equal(classifyTarget('analyst@example.org'), 'email');
  assert.equal(classifyTarget('@analyst_01'), 'username');
  assert.equal(classifyTarget('203.0.113.7'), 'ip');
});

test('creates a fail-safe investigation bundle', () => {
  const b = createInvestigationBundle({ target: 'Example Subject' });
  assert.ok(b.case.id && b.source.id && b.entity.id && b.evidence.id && b.hypothesis.id && b.decision.id);
  assert.equal(b.evidence.status, 'UNKNOWN');
  assert.equal(b.evidence.humanVerified, false);
  assert.match(b.evidence.notes, /not proof/i);
  assert.equal(b.decision.state, 'draft');
});

test('loop exposes known, inferred, unknown, falsifier and next action', () => {
  const state = { cases: [], sources: [], evidence: [], entities: [], relationships: [], hypotheses: [], contradictions: [], decisions: [] };
  const result = runInvestigationLoop(state, { target: 'Example Subject' });
  for (const key of ['known','inferred','unknown','falsifier','nextBestAction','daid','decisionGate']) assert.ok(key in result);
  assert.equal(result.decisionGate.state, 'HOLD');
  assert.ok(result.unknown.length > 0);
});
