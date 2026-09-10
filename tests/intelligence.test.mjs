import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIntelligenceMatrix } from '../src/core/intelligence.js';
import { createCase, createSource, createEvidence, createEntity, createRelationship, createHypothesis, createDecision, createContradiction } from '../src/core/model.js';

const base = () => {
  const c = createCase({title:'Matrix test'});
  const s1 = createSource({name:'Source A', reliability:.9, independenceGroup:'A'});
  const s2 = createSource({name:'Source B', reliability:.8, independenceGroup:'B'});
  const e1 = createEvidence({caseId:c.id, sourceId:s1.id, title:'Claim A', claim:'A', status:'FACT', confidence:.9, humanVerified:true});
  const e2 = createEvidence({caseId:c.id, sourceId:s2.id, title:'Claim B', claim:'B', status:'INFERENCE', confidence:.7});
  const a = createEntity({name:'Alice',type:'person'}), b = createEntity({name:'Org',type:'organization'});
  const r = createRelationship({caseId:c.id, fromEntityId:a.id, toEntityId:b.id, evidenceIds:[e1.id], confidence:.8});
  const h = createHypothesis({caseId:c.id, statement:'Alice is linked to Org', evidenceFor:[e1.id], confidence:.8, falsifier:'Independent disproof'});
  const d = createDecision({caseId:c.id,title:'Test decision',linkedHypothesisIds:[h.id]});
  const contradiction = createContradiction({caseId:c.id,severity:'high',status:'open'});
  return {cases:[c],sources:[s1,s2],evidence:[e1,e2],entities:[a,b],relationships:[r],hypotheses:[h],contradictions:[contradiction],decisions:[d],audit:[]};
};

test('intelligence matrix derives the evidence chain and gaps', () => {
  const matrix = buildIntelligenceMatrix(base());
  assert.equal(matrix.counts.verified, 1);
  assert.equal(matrix.counts.entities, 2);
  assert.ok(matrix.nodes.some(x => x.type === 'EVIDENCE'));
  assert.ok(matrix.nodes.some(x => x.type === 'RELATIONSHIP'));
  assert.ok(matrix.nodes.some(x => x.type === 'HYPOTHESIS'));
  assert.ok(matrix.nodes.some(x => x.type === 'DECISION'));
  assert.ok(matrix.gaps.some(x => x.code === 'UNTESTED_FALSIFIER'));
  assert.ok(matrix.gaps.some(x => x.code === 'OPEN_CONTRADICTION'));
  assert.ok(matrix.integrity >= 0 && matrix.integrity <= 100);
});

test('unsupported relationship is explicitly surfaced', () => {
  const s = base();
  s.relationships[0].evidenceIds = [];
  const matrix = buildIntelligenceMatrix(s);
  assert.ok(matrix.gaps.some(x => x.code === 'UNSUPPORTED_LINK'));
});

test('empty workspace fails visibly instead of producing a false clean state', () => {
  const matrix = buildIntelligenceMatrix({});
  assert.equal(matrix.integrity, 0);
  assert.ok(matrix.gaps.some(x => x.code === 'NO_EVIDENCE'));
});
