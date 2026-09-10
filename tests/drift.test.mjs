import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase, createSource, createEvidence, createHypothesis, createDecision } from '../src/core/model.js';
import { detectReasoningDrift, buildShadowInvestigation } from '../src/core/drift.js';
import { evaluateDecision } from '../src/core/decision.js';

function baseState(){
  const c = createCase({ id:'case_1', title:'Test case' });
  return { cases:[c], sources:[], evidence:[], entities:[], relationships:[], hypotheses:[], contradictions:[], decisions:[], audit:[] };
}
function addSource(state, id, group='g1') { const s=createSource({id,name:id,independenceGroup:group}); state.sources.push(s); return s; }
function addEvidence(state, input={}) { const e=createEvidence({caseId:'case_1',sourceId:'src_1',claim:'Observed proposition',status:'INFERENCE',confidence:.7,...input}); state.evidence.push(e); return e; }
function cleanDecision(state, overrides={}) {
  addSource(state,'src_1','a'); addSource(state,'src_2','b');
  addEvidence(state,{id:'ev_for',sourceId:'src_1',confidence:.8});
  addEvidence(state,{id:'ev_against',sourceId:'src_2',confidence:.5,claim:'Alternative explanation'});
  state.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',evidenceFor:['ev_for'],evidenceAgainst:['ev_against'],confidence:.75,falsifier:'Independent disproof',falsifierTested:true,falsifierResult:'not_triggered'}));
  return createDecision({id:'d1',caseId:'case_1',title:'Decision',statement:'Proceed',linkedHypothesisIds:['h1'],rationale:'Evidence supports the decision after challenge.',riskAcceptance:'Residual risk accepted by owner.',owner:'analyst',...overrides});
}

test('AI-assisted FACT is downgraded and does not trigger false guardrail',()=>{const s=baseState();addSource(s,'src_1');const e=addEvidence(s,{aiAssisted:true,status:'FACT'});assert.equal(e.status,'INFERENCE');assert.equal(detectReasoningDrift(s).some(f=>f.type==='AI_GUARDRAIL'),false);});
test('AI-assisted human-verified evidence triggers AI guardrail',()=>{const s=baseState();addSource(s,'src_1');addEvidence(s,{aiAssisted:true,humanVerified:true});assert.equal(detectReasoningDrift(s).some(f=>f.type==='AI_GUARDRAIL'),true);});
test('shared independence group is flagged',()=>{const s=baseState();addSource(s,'src_1','same');addSource(s,'src_2','same');addEvidence(s,{sourceId:'src_1',id:'ev_1'});addEvidence(s,{sourceId:'src_2',id:'ev_2'});assert.equal(detectReasoningDrift(s).some(f=>f.type==='SOURCE_DEPENDENCY'),true);});
test('high confidence without support is confidence drift',()=>{const s=baseState();s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',confidence:.9,falsifier:'Independent disproof'}));assert.equal(detectReasoningDrift(s).some(f=>f.type==='CONFIDENCE_DRIFT'),true);});
test('high confidence with stronger opposition is challenged',()=>{const s=baseState();addSource(s,'src_1','a');addSource(s,'src_2','b');addEvidence(s,{id:'ev_for',sourceId:'src_1',confidence:.5,claim:'Supports'});addEvidence(s,{id:'ev_against',sourceId:'src_2',confidence:.9,claim:'Opposes'});s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',evidenceFor:['ev_for'],evidenceAgainst:['ev_against'],confidence:.9,falsifier:'Opposing evidence'}));const f=detectReasoningDrift(s);assert.equal(f.some(x=>x.type==='CONFIDENCE_DRIFT'),true);assert.equal(f.some(x=>x.type==='OPPOSITION_GAP'),true);});
test('missing falsifier is detected',()=>{const s=baseState();s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim'}));assert.equal(detectReasoningDrift(s).some(f=>f.type==='MISSING_FALSIFIER'),true);});
test('defined but untested falsifier is detected',()=>{const s=baseState();s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',falsifier:'Independent disproof'}));const f=detectReasoningDrift(s).find(x=>x.type==='UNTESTED_FALSIFIER');assert.ok(f);assert.equal(f.repairMode,'TEST_FALSIFIER');});
test('tested falsifier does not create untested finding',()=>{const s=baseState();s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',falsifier:'Independent disproof',falsifierTested:true,falsifierResult:'not_triggered'}));assert.equal(detectReasoningDrift(s).some(f=>f.type==='UNTESTED_FALSIFIER'),false);});
test('polarity conflict is explicitly a candidate conflict',()=>{const s=baseState();addSource(s,'src_1','a');addSource(s,'src_2','b');addEvidence(s,{id:'ev_1',sourceId:'src_1',claim:'Entity is located in Montreal'});addEvidence(s,{id:'ev_2',sourceId:'src_2',claim:'Entity is not located in Montreal'});const f=detectReasoningDrift(s).find(x=>x.type==='CLAIM_CONFLICT');assert.ok(f);assert.match(f.message,/candidate conflict/i);});
test('risk score is deterministic and capped',()=>{const s=baseState();for(let i=0;i<10;i++)s.hypotheses.push(createHypothesis({id:`h${i}`,caseId:'case_1',statement:`Claim ${i}`,confidence:.95,falsifier:'Disproof'}));const a=buildShadowInvestigation(s),b=buildShadowInvestigation(s);assert.equal(a.narrativeRiskScore,100);assert.equal(a.narrativeRiskScore,b.narrativeRiskScore);});
test('duplicate findings are collapsed',()=>{const s=baseState();addSource(s,'src_1');addEvidence(s,{aiAssisted:true,humanVerified:true});const f=detectReasoningDrift(s).filter(x=>x.type==='AI_GUARDRAIL');assert.equal(f.length,1);});
test('empty state is safe and clear',()=>{const shadow=buildShadowInvestigation({});assert.equal(shadow.findingCount,0);assert.deepEqual(shadow.falsificationGaps,[]);assert.equal(shadow.integrityStatus,'CLEAR');assert.equal(shadow.narrativeRiskScore,0);});
test('duplicate evidence IDs do not crash drift engine',()=>{const s=baseState();addSource(s,'src_1');addEvidence(s,{id:'ev_same'});addEvidence(s,{id:'ev_same',claim:'Entity is not located in Montreal'});assert.doesNotThrow(()=>buildShadowInvestigation(s));});

test('decision is blocked without supporting evidence',()=>{const s=baseState();s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',falsifier:'Disproof',falsifierTested:true,falsifierResult:'not_triggered'}));const d=createDecision({caseId:'case_1',statement:'Proceed',linkedHypothesisIds:['h1'],rationale:'Rationale',riskAcceptance:'Accepted'});const g=evaluateDecision(d,s);assert.equal(g.status,'BLOCKED');assert.ok(g.blockingReasons.some(x=>/supporting evidence/i.test(x)));});
test('decision is blocked when falsifier is untested',()=>{const s=baseState();addSource(s,'src_1','a');addEvidence(s,{id:'ev_for'});s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',evidenceFor:['ev_for'],falsifier:'Disproof'}));const d=createDecision({caseId:'case_1',statement:'Proceed',linkedHypothesisIds:['h1'],rationale:'Rationale',riskAcceptance:'Accepted'});assert.equal(evaluateDecision(d,s).status,'BLOCKED');});
test('clean decision passes the integrity gate',()=>{const s=baseState();const d=cleanDecision(s);const g=evaluateDecision(d,s);assert.equal(g.status,'PASS');assert.equal(g.blockingReasons.length,0);});
test('decision is deterministic for the same state',()=>{const s=baseState();const d=cleanDecision(s);const a=evaluateDecision(d,s);const b=evaluateDecision(d,s);assert.equal(a.status,b.status);assert.equal(a.score,b.score);assert.deepEqual(a.checks.map(x=>[x.id,x.status]),b.checks.map(x=>[x.id,x.status]));});
test('decision enters review when only non-blocking warnings remain',()=>{const s=baseState();const d=cleanDecision(s,{riskAcceptance:''});const g=evaluateDecision(d,s);assert.equal(g.status,'REVIEW');assert.ok(g.warnings.some(x=>/risk acceptance/i.test(x)));});
