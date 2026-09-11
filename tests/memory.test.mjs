import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase, createHypothesis, createSource, createEvidence, createDecision } from '../src/core/model.js';
import { extractInstitutionalMemory, queryInstitutionalMemory, memorySummary } from '../src/core/memory.js';
import { transitionDecision } from '../src/core/decision.js';

function state(){ return {cases:[],sources:[],evidence:[],entities:[],relationships:[],hypotheses:[],contradictions:[],decisions:[],audit:[]}; }

function cleanDecisionState(){
  const s=state();
  s.cases.push(createCase({id:'case_1'}));
  s.sources.push(createSource({id:'src_1',independenceGroup:'a'}),createSource({id:'src_2',independenceGroup:'b'}));
  s.evidence.push(createEvidence({id:'ev_for',caseId:'case_1',sourceId:'src_1',claim:'Supports',confidence:.8}),createEvidence({id:'ev_against',caseId:'case_1',sourceId:'src_2',claim:'Opposes',confidence:.5}),createEvidence({id:'ev_falsifier',caseId:'case_1',sourceId:'src_2',claim:'Falsifier check',confidence:.8}));
  s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',evidenceFor:['ev_for'],evidenceAgainst:['ev_against'],confidence:.75,falsifier:'Independent disproof',falsifierTested:true,falsifierResult:'not_triggered',falsifierTest:{provenance:'EVIDENCE_BACKED',method:'source comparison',note:'Compared independent records against the falsifier condition.',testedAt:new Date().toISOString(),evidenceIds:['ev_falsifier']}}));
  return s;
}

test('institutional memory derives drift findings when not persisted',()=>{
  const s=state();
  s.cases.push(createCase({id:'case_1'}));
  s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',falsifier:'Independent disproof'}));
  const memory=extractInstitutionalMemory(s);
  assert.ok(memory.some(x=>x.type==='FALSIFIER_PATTERN' && x.pattern==='independent disproof'));
  assert.ok(memory.some(x=>x.type==='FAILURE_SIGNATURE' && x.pattern==='untested_falsifier'));
});

test('same falsifier pattern becomes reusable across cases',()=>{
  const s=state();
  s.cases.push(createCase({id:'case_1'}),createCase({id:'case_2'}));
  s.hypotheses.push(
    createHypothesis({id:'h1',caseId:'case_1',statement:'Claim A',falsifier:'Independent disproof',falsifierTested:true,falsifierResult:'not_triggered'}),
    createHypothesis({id:'h2',caseId:'case_2',statement:'Claim B',falsifier:' independent   disproof ',falsifierTested:true,falsifierResult:'not_triggered'})
  );
  const item=extractInstitutionalMemory(s).find(x=>x.type==='FALSIFIER_PATTERN' && x.pattern==='independent disproof');
  assert.equal(item.occurrences,2);
  assert.deepEqual(item.caseIds,['case_1','case_2']);
  assert.equal(item.caseCount,2);
});

test('memory query and summary are deterministic',()=>{
  const s=state();
  s.cases.push(createCase({id:'case_1'}));
  s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',falsifier:'Independent disproof'}));
  const a=extractInstitutionalMemory(s), b=extractInstitutionalMemory(s);
  assert.deepEqual(a,b);
  assert.ok(queryInstitutionalMemory(s,'falsifier').length>0);
  const summary=memorySummary(s);
  assert.equal(summary.total,a.length);
  assert.equal(summary.byType.FALSIFIER_PATTERN>0,true);
});

test('empty and malformed state are safe',()=>{
  assert.deepEqual(extractInstitutionalMemory({}),[]);
  assert.deepEqual(queryInstitutionalMemory({hypotheses:null},'anything'),[]);
  assert.equal(memorySummary({}).total,0);
});

test('approval transition is blocked unless the integrity gate passes',()=>{
  const s=state();
  s.cases.push(createCase({id:'case_1'}));
  s.hypotheses.push(createHypothesis({id:'h1',caseId:'case_1',statement:'Claim',falsifier:'Independent disproof'}));
  const d=createDecision({id:'d1',caseId:'case_1',title:'Decision',statement:'Proceed',linkedHypothesisIds:['h1'],rationale:'Rationale',riskAcceptance:'Accepted'});
  assert.throws(()=>transitionDecision(d,'approved',s),/approval blocked by integrity gate/);
});

test('approval transition succeeds for a clean decision',()=>{
  const s=cleanDecisionState();
  const d=createDecision({id:'d1',caseId:'case_1',title:'Decision',statement:'Proceed',linkedHypothesisIds:['h1'],rationale:'Evidence supports the decision after challenge.',riskAcceptance:'Residual risk accepted by owner.'});
  const transitioned=transitionDecision(d,'approved',s);
  assert.equal(transitioned.state,'approved');
});

test('invalid decision state is rejected',()=>{
  const s=state();
  const d=createDecision({id:'d1'});
  assert.throws(()=>transitionDecision(d,'banana',s),/Invalid decision state/);
});
