import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase, createSource, createEvidence, createHypothesis } from '../src/core/model.js';
import { detectReasoningDrift, buildShadowInvestigation } from '../src/core/drift.js';

function baseState(){
  const c = createCase({ id:'case_1', title:'Test case' });
  return { cases:[c], sources:[], evidence:[], entities:[], relationships:[], hypotheses:[], contradictions:[], audit:[] };
}

function addSource(state, id, group='g1') {
  const s = createSource({ id, name:id, independenceGroup:group });
  state.sources.push(s); return s;
}

function addEvidence(state, input={}) {
  const e = createEvidence({ caseId:'case_1', sourceId:'src_1', claim:'Observed proposition', ...input });
  state.evidence.push(e); return e;
}

test('AI-assisted FACT is downgraded and does not trigger false guardrail', () => {
  const state = baseState(); addSource(state,'src_1');
  const e = addEvidence(state,{ aiAssisted:true, status:'FACT' });
  assert.equal(e.status,'INFERENCE');
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='AI_GUARDRAIL'),false);
});

test('AI-assisted human-verified evidence triggers AI guardrail', () => {
  const state = baseState(); addSource(state,'src_1');
  addEvidence(state,{ aiAssisted:true, humanVerified:true });
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='AI_GUARDRAIL'),true);
});

test('shared independence group is flagged as source dependency', () => {
  const state = baseState(); addSource(state,'src_1','same'); addSource(state,'src_2','same');
  addEvidence(state,{sourceId:'src_1',id:'ev_1'}); addEvidence(state,{sourceId:'src_2',id:'ev_2'});
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='SOURCE_DEPENDENCY'),true);
});

test('high confidence without support is confidence drift', () => {
  const state = baseState();
  state.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',confidence:.9,falsifier:'Independent disproof'}));
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='CONFIDENCE_DRIFT'),true);
});

test('high confidence with stronger opposition is confidence drift', () => {
  const state = baseState(); addSource(state,'src_1','a'); addSource(state,'src_2','b');
  addEvidence(state,{id:'ev_for',sourceId:'src_1',confidence:.5,claim:'Supports'});
  addEvidence(state,{id:'ev_against',sourceId:'src_2',confidence:.9,claim:'Opposes'});
  state.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',evidenceFor:['ev_for'],evidenceAgainst:['ev_against'],confidence:.9,falsifier:'Opposing evidence'}));
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='CONFIDENCE_DRIFT'),true);
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='OPPOSITION_GAP'),true);
});

test('missing falsifier is detected', () => {
  const state = baseState();
  state.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim'}));
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='MISSING_FALSIFIER'),true);
});

test('polarity conflict is detected as a candidate conflict', () => {
  const state = baseState(); addSource(state,'src_1','a'); addSource(state,'src_2','b');
  addEvidence(state,{id:'ev_1',sourceId:'src_1',claim:'Entity is located in Montreal'});
  addEvidence(state,{id:'ev_2',sourceId:'src_2',claim:'Entity is not located in Montreal'});
  assert.equal(detectReasoningDrift(state).some(f=>f.type==='CLAIM_CONFLICT'),true);
});

test('shadow investigation returns findings, gaps, risk score and status', () => {
  const state = baseState();
  state.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',confidence:.9,falsifier:'Independent disproof'}));
  const shadow = buildShadowInvestigation(state);
  assert.ok(Number.isInteger(shadow.findingCount));
  assert.equal(Array.isArray(shadow.falsificationGaps),true);
  assert.equal(typeof shadow.narrativeRiskScore,'number');
  assert.equal(shadow.integrityStatus,'HIGH_RISK');
});

test('repair modes are attached to drift findings', () => {
  const state = baseState(); addSource(state,'src_1');
  addEvidence(state,{aiAssisted:true,humanVerified:true});
  const finding = detectReasoningDrift(state).find(f=>f.type==='AI_GUARDRAIL');
  assert.equal(finding.repairMode,'HUMAN_VERIFY');
});

test('empty state is safe and clear', () => {
  const shadow = buildShadowInvestigation({});
  assert.equal(shadow.findingCount,0);
  assert.deepEqual(shadow.falsificationGaps,[]);
  assert.equal(shadow.integrityStatus,'CLEAR');
  assert.equal(shadow.narrativeRiskScore,0);
});

test('duplicate evidence IDs are outside drift engine responsibility but do not crash it', () => {
  const state = baseState(); addSource(state,'src_1');
  addEvidence(state,{id:'ev_same'}); addEvidence(state,{id:'ev_same',claim:'Entity is not located in Montreal'});
  assert.doesNotThrow(() => buildShadowInvestigation(state));
});
