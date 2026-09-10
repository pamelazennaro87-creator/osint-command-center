import { detectReasoningDrift } from './drift.js';

export const MEMORY_TYPES = Object.freeze(['FAILURE_SIGNATURE','REPAIR_MODE','CONTRADICTION_PATTERN','FALSIFIER_PATTERN']);

function normalize(value='') { return String(value).trim().toLowerCase().replace(/\s+/g, ' '); }
function memoryKey(type, pattern) { return `${type}:${normalize(pattern)}`; }
function add(map, type, pattern, context={}) {
  const normalized=normalize(pattern); if(!normalized) return;
  const key=memoryKey(type,normalized);
  const item=map.get(key)||{type,pattern:normalized,occurrences:0,caseIds:new Set(),examples:[]};
  item.occurrences+=1;
  if(context.caseId) item.caseIds.add(context.caseId);
  if(context.example && !item.examples.includes(context.example) && item.examples.length<3) item.examples.push(context.example);
  map.set(key,item);
}

export function extractInstitutionalMemory(state={}) {
  const map=new Map();
  const drift=Array.isArray(state.driftFindings) ? state.driftFindings : detectReasoningDrift(state);
  const contradictions=Array.isArray(state.contradictions)?state.contradictions:[];
  const hypotheses=Array.isArray(state.hypotheses)?state.hypotheses:[];
  for(const finding of drift){
    const type=finding.type==='UNTESTED_FALSIFIER'?'FALSIFIER_PATTERN':finding.type==='CLAIM_CONFLICT'?'CONTRADICTION_PATTERN':'FAILURE_SIGNATURE';
    add(map,type,finding.type||finding.message,{caseId:finding.caseId,example:finding.message});
    if(finding.repairMode) add(map,'REPAIR_MODE',finding.repairMode,{caseId:finding.caseId,example:finding.message});
  }
  for(const contradiction of contradictions) add(map,'CONTRADICTION_PATTERN',contradiction.type||'claim_conflict',{caseId:contradiction.caseId,example:contradiction.explanation});
  for(const hypothesis of hypotheses) if(hypothesis.falsifier) add(map,'FALSIFIER_PATTERN',hypothesis.falsifier,{caseId:hypothesis.caseId});
  return [...map.values()].map(item=>({...item,caseIds:[...item.caseIds].sort(),caseCount:item.caseIds.size})).sort((a,b)=>b.occurrences-a.occurrences||a.type.localeCompare(b.type)||a.pattern.localeCompare(b.pattern));
}

export function queryInstitutionalMemory(state={},query='') {
  const q=normalize(query), memory=extractInstitutionalMemory(state);
  return q ? memory.filter(item=>normalize(`${item.type} ${item.pattern} ${item.examples.join(' ')}`).includes(q)) : memory;
}

export function memorySummary(state={}) {
  const memory=extractInstitutionalMemory(state);
  const byType=Object.fromEntries(MEMORY_TYPES.map(type=>[type,memory.filter(item=>item.type===type).length]));
  return {total:memory.length,byType,recurring:memory.filter(item=>item.caseCount>1).length};
}
