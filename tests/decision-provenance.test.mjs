import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase, createDecision, createEvidence, createHypothesis, createSource } from '../src/core/model.js';
import { evaluateDecision, transitionDecision } from '../src/core/decision.js';

function baseState(falsifierTest) {
  const c = createCase({ id: 'case_provenance' });
  const s1 = createSource({ id: 'src_1', name: 'Source A', independenceGroup: 'group-a' });
  const s2 = createSource({ id: 'src_2', name: 'Source B', independenceGroup: 'group-b' });
  const support = createEvidence({ id: 'ev_support', caseId: c.id, sourceId: s1.id, title: 'Support', claim: 'support', status: 'FACT', confidence: 0.8 });
  const opposition = createEvidence({ id: 'ev_against', caseId: c.id, sourceId: s2.id, title: 'Opposition', claim: 'opposition', status: 'CONTESTED', confidence: 0.8 });
  const testEvidence = createEvidence({ id: 'ev_falsifier', caseId: c.id, sourceId: s2.id, title: 'Falsifier check', claim: 'falsifier check', status: 'FACT', confidence: 0.8 });
  const h = createHypothesis({ id: 'hyp_1', caseId: c.id, statement: 'Test hypothesis', evidenceFor: [support.id], evidenceAgainst: [opposition.id], confidence: 0.8, falsifier: 'Find evidence that disproves the claim.', falsifierTested: true, falsifierResult: 'inconclusive', falsifierTest });
  const d = createDecision({ id: 'dec_1', caseId: c.id, title: 'Decision', statement: 'Proceed', rationale: 'Evidence reviewed.', riskAcceptance: 'Residual uncertainty accepted.', linkedHypothesisIds: [h.id], state: 'review' });
  return { cases: [c], sources: [s1, s2], evidence: [support, opposition, testEvidence], hypotheses: [h], decisions: [d], contradictions: [], driftFindings: [], audit: [] };
}

test('falsifier boolean alone cannot satisfy the approval gate', () => {
  const result = evaluateDecision(baseState(null).decisions[0], baseState(null));
  assert.equal(result.status, 'BLOCKED');
  assert.match(result.blockingReasons.join(' '), /falsifier testing lacks evidence-backed provenance/i);
});

test('analyst-declared falsifier testing cannot satisfy the approval gate', () => {
  const state = baseState({ provenance: 'ANALYST_DECLARED', method: 'manual review', note: 'Checked manually', testedAt: new Date().toISOString(), evidenceIds: [] });
  const result = evaluateDecision(state.decisions[0], state);
  assert.equal(result.status, 'BLOCKED');
});

test('evidence-backed falsifier provenance satisfies the falsifier integrity check', () => {
  const state = baseState({ provenance: 'EVIDENCE_BACKED', method: 'source comparison', note: 'Compared primary source against independent record.', testedAt: new Date().toISOString(), evidenceIds: ['ev_falsifier'] });
  const result = evaluateDecision(state.decisions[0], state);
  assert.equal(result.status, 'PASS');
  assert.equal(result.approvalEligible, true);
  const approved = transitionDecision(state.decisions[0], 'approved', state);
  assert.equal(approved.state, 'approved');
});

test('evidence-backed provenance cannot reference nonexistent evidence', () => {
  const state = baseState({ provenance: 'EVIDENCE_BACKED', method: 'source comparison', note: 'Compared records.', testedAt: new Date().toISOString(), evidenceIds: ['missing-evidence'] });
  const result = evaluateDecision(state.decisions[0], state);
  assert.equal(result.status, 'BLOCKED');
});
