import test from 'node:test';
import assert from 'node:assert/strict';
import { createCase, createHypothesis } from '../src/core/model.js';
import { extractInstitutionalMemory, queryInstitutionalMemory, memorySummary } from '../src/core/memory.js';

function state(){ return {cases:[],sources:[],evidence:[],entities:[],relationships:[],hypotheses:[],contradictions:[],decisions:[],audit:[]}; }

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
