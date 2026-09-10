import test from 'node:test';
import assert from 'node:assert/strict';
import {extractStableIdentifiers, temporalAnalysis, buildTemporalTimeline, TEMPORAL_TYPES} from '../src/core/temporal.js';

const evidence=(id,observedAt,claim,extra={})=>({id,caseId:'case-1',observedAt,claim,...extra});

test('extracts stable identifiers without hardcoding a case',()=>{
  assert.deepEqual(extractStableIdentifiers(evidence('a','2026-01-01','IMO 9311531')),['imo:9311531']);
  assert.deepEqual(extractStableIdentifiers(evidence('b','2026-01-01','MMSI: 273122820')),['mmsi:273122820']);
  assert.ok(extractStableIdentifiers(evidence('c','2026-01-01','registry record',{stableIdentifiers:['CUSTOM-42']})).includes('custom-42'));
});

test('classifies a historical field change as STATE_CHANGE',()=>{
  const state={evidence:[
    evidence('a','2026-03-03','LINDOR IMO 9311531',{temporalFields:{name:'LINDOR'}}),
    evidence('b','2026-08-01','BERILL IMO 9311531',{temporalFields:{name:'BERILL'}}),
  ]};
  const result=temporalAnalysis(state);
  assert.equal(result.length,1);
  assert.equal(result[0].type,TEMPORAL_TYPES.STATE_CHANGE);
  assert.equal(result[0].field,'name');
  assert.equal(result[0].from,'LINDOR');
  assert.equal(result[0].to,'BERILL');
});

test('does not report unchanged values',()=>{
  const state={evidence:[
    evidence('a','2026-01-01','BERILL IMO 9311531',{temporalFields:{name:'BERILL'}}),
    evidence('b','2026-02-01','BERILL IMO 9311531',{temporalFields:{name:'BERILL'}}),
  ]};
  assert.equal(temporalAnalysis(state).length,0);
});

test('keeps independent stable identifiers separated',()=>{
  const state={evidence:[
    evidence('a','2026-01-01','IMO 1111111',{temporalFields:{name:'A'}}),
    evidence('b','2026-02-01','IMO 2222222',{temporalFields:{name:'B'}}),
  ]};
  assert.equal(temporalAnalysis(state).length,0);
});

test('builds a chronological timeline with identifiers',()=>{
  const state={evidence:[
    evidence('b','2026-08-01','BERILL IMO 9311531'),
    evidence('a','2026-03-03','LINDOR IMO 9311531'),
  ]};
  const timeline=buildTemporalTimeline(state,'case-1');
  assert.deepEqual(timeline.map(x=>x.id),['a','b']);
  assert.deepEqual(timeline[0].stableIdentifiers,['imo:9311531']);
});

test('supports explicit stable identifiers and generic temporal fields',()=>{
  const state={evidence:[
    evidence('a','2025-01-01','entity record',{stableIdentifiers:['ENTITY-9'],temporalFields:{owner:'Alpha'}}),
    evidence('b','2026-01-01','entity record',{stableIdentifiers:['ENTITY-9'],temporalFields:{owner:'Beta'}}),
  ]};
  const result=temporalAnalysis(state);
  assert.equal(result.length,1);
  assert.equal(result[0].field,'owner');
  assert.equal(result[0].from,'Alpha');
  assert.equal(result[0].to,'Beta');
});
