import { createCase, createEvidence, createSource, createEntity, createHypothesis, createDecision } from './core/model.js';
import { loadState, saveState, addRecord } from './core/store.js';
import { calculateMetrics, contradictionTriage } from './core/engine.js';
import { buildShadowInvestigation } from './core/drift.js';
import { evaluateDecision, transitionDecision } from './core/decision.js';
import { extractInstitutionalMemory, memorySummary, queryInstitutionalMemory } from './core/memory.js';
import { recommendPreInvestigationChecks, buildProfessionalReport, reportFilename } from './core/report.js';
import { validateState } from './core/validation.js';

const $ = id => document.getElementById(id);
const state = loadState();

function seed() {
  if (state.cases.length) return;
  const c = createCase({ title: 'Entity relationship review', objective: 'Determine whether observed relationships are supported by independent evidence.', priority: 'high' });
  const s = createSource({ name: 'Demo public source', type: 'web', reliability: .7, independenceGroup: 'demo-1' });
  const e = createEvidence({ caseId: c.id, sourceId: s.id, title: 'Initial observation', claim: 'Observed relationship requires verification.', status: 'UNKNOWN', confidence: .4, aiAssisted: false });
  state.cases.push(c); state.sources.push(s); state.evidence.push(e);
  state.entities.push(createEntity({ name: 'Example entity A', type: 'person' }));
  state.entities.push(createEntity({ name: 'Example organization B', type: 'organization' }));
  state.hypotheses.push(createHypothesis({ caseId: c.id, statement: 'The observed relationship is genuine.', evidenceFor: [], evidenceAgainst: [], confidence: .4, falsifier: 'Independent evidence disproves the relationship.' }));
  saveState(state);
}

function render() {
  const m = calculateMetrics(state);
  const map = { cases:m.cases, evidence:m.evidence, hypotheses:m.hypotheses, contradictions:m.contradictions };
  Object.entries(map).forEach(([key,value]) => { const el=$(`metric-${key}`); if(el) el.textContent=String(value).padStart(2,'0'); });
  ['verifiedPct','corroboratedPct','aiPct'].forEach(k=>{const el=$(k); if(el){el.textContent=`${m[k]}%`; const bar=$(k+'Bar'); if(bar)bar.style.width=`${m[k]}%`;}});
  const list=$('caseList');
  if(list) list.innerHTML = state.cases.slice(-6).reverse().map(c=>`<div class="row"><div><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.id)} · ${escapeHtml(c.status)}</small></div><span class="tag ${c.priority==='high'?'bad':c.priority==='low'?'ok':'warn'}">${escapeHtml(c.priority.toUpperCase())}</span></div>`).join('') || '<div class="row"><small>No investigations yet.</small></div>';
  renderChallenge(); renderDecisionIntegrity(); renderMemory(); renderPreInvestigation();
}
function renderChallenge(){
  const shadow=buildShadowInvestigation(loadState());
  const status=$('challengeStatus'); if(status){ status.textContent=shadow.integrityStatus.replace('_',' '); status.className=`tag ${shadow.integrityStatus==='HIGH_RISK'?'bad':shadow.integrityStatus==='REVIEW'?'warn':'ok'}`; }
  const high=$('challengeHigh'), medium=$('challengeMedium'), total=$('challengeTotal');
  if(high) high.textContent=String(shadow.highRiskCount); if(medium) medium.textContent=String(shadow.mediumRiskCount); if(total) total.textContent=String(shadow.findingCount+shadow.falsificationGaps.length);
  const panel=$('challengeList'); if(!panel) return;
  const items=shadow.findings.slice(0,8); const gaps=shadow.falsificationGaps.slice(0,4);
  if(!items.length && !gaps.length){ panel.innerHTML='<div class="row"><div><strong>No challenge signals</strong><small>The shadow investigation found no current guardrail breach. Absence of a signal is not proof of correctness.</small></div><span class="tag ok">CLEAR</span></div>'; return; }
  const rows=[...items.map(f=>`<div class="row"><div><strong>${escapeHtml(formatType(f.type))}</strong><small>${escapeHtml(f.message)} · Repair: ${escapeHtml(f.repairMode||'ANALYST_REVIEW')}</small></div><span class="tag ${f.severity==='high'?'bad':f.severity==='medium'?'warn':'ok'}">${escapeHtml((f.severity||'review').toUpperCase())}</span></div>`),...gaps.map(g=>`<div class="row"><div><strong>FALSIFICATION GAP</strong><small>${escapeHtml(g.message)} · Repair: ${escapeHtml(g.repairMode)}</small></div><span class="tag warn">CHALLENGE</span></div>` )];
  panel.innerHTML=rows.join('');
}
function renderDecisionIntegrity(){
  const panel=$('decisionIntegrityList'); if(!panel) return;
  const decisions=Array.isArray(state.decisions)?state.decisions:[];
  if(!decisions.length){ panel.innerHTML='<div class="row"><div><strong>No decision submitted</strong><small>Decision Integrity Gate activates when a decision is linked to hypotheses and evidence.</small></div><span class="tag warn">STANDBY</span></div>'; return; }
  const decision=decisions[decisions.length-1]; const result=evaluateDecision(decision,state);
  const cls=result.status==='PASS'?'ok':result.status==='REVIEW'?'warn':'bad';
  panel.innerHTML=`<div class="row"><div><strong>${escapeHtml(decision.title)}</strong><small>${escapeHtml(result.status)} · score ${result.score}/100 · ${result.blockingReasons.length} blocker(s), ${result.warnings.length} warning(s)</small></div><span class="tag ${cls}">${escapeHtml(result.status)}</span></div><div class="row"><div><strong>Approval eligibility</strong><small>${result.approvalEligible?'All integrity checks pass.':'Approval is not currently permitted.'}</small></div><span class="tag ${result.approvalEligible?'ok':'bad'}">${result.approvalEligible?'ELIGIBLE':'BLOCKED'}</span></div>`;
}
function renderMemory(){
  const summary=memorySummary(loadState());
  const total=$('memoryTotal'), recurring=$('memoryRecurring');
  if(total) total.textContent=String(summary.total); if(recurring) recurring.textContent=String(summary.recurring);
  const panel=$('memoryList'); if(!panel) return;
  const memory=extractInstitutionalMemory(loadState()).slice(0,6);
  if(!memory.length){ panel.innerHTML='<div class="row"><div><strong>No reusable patterns yet</strong><small>Institutional Memory is derived from observed failures, repairs, contradictions and falsifiers.</small></div><span class="tag warn">EMPTY</span></div>'; return; }
  panel.innerHTML=memory.map(item=>`<div class="row"><div><strong>${escapeHtml(formatType(item.type))}</strong><small>${escapeHtml(item.pattern)} · ${item.caseCount} case(s) · ${item.occurrences} occurrence(s)</small></div><span class="tag ${item.caseCount>1?'ok':'warn'}">${item.caseCount>1?'RECURRING':'NEW'}</span></div>`).join('');
}
function renderPreInvestigation(){
  const panel=$('preInvestigationList'); if(!panel) return;
  const current=loadState(); const latest=current.cases?.[current.cases.length-1]||{}; const brief=recommendPreInvestigationChecks(latest,current);
  panel.innerHTML=brief.recommendedChecks.slice(0,5).map(c=>`<div class="row"><div><strong>${escapeHtml(c.title)}</strong><small>${escapeHtml(c.reason)}</small></div><span class="tag ${brief.memoryDerived?'ok':'warn'}">${brief.memoryDerived?'MEMORY':'BASELINE'}</span></div>`).join('') || '<div class="row"><small>No pre-investigation checks generated.</small></div>';
}
function formatType(v){return String(v||'signal').replaceAll('_',' ');}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function refresh(){ Object.assign(state,loadState()); render(); }
function downloadText(filename,text,type='text/plain'){ const blob=new Blob([text],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(url),500); }
function createProfessionalReport(){ const report=buildProfessionalReport(loadState()); downloadText(reportFilename(loadState()),report,'text/html'); }

window.osintEnterprise = {
  getState: () => structuredClone(loadState()),
  validate: () => validateState(loadState()),
  createCase: input => { const r=addRecord('cases',createCase(input)); refresh(); return r; },
  createEvidence: input => { const r=addRecord('evidence',createEvidence(input)); refresh(); return r; },
  createDecision: input => { const r=addRecord('decisions',createDecision(input)); refresh(); return r; },
  evaluateDecision: decisionOrId => { const current=loadState(); const decision=typeof decisionOrId==='string' ? current.decisions?.find(d=>d.id===decisionOrId) : decisionOrId; if(!decision) throw new Error('Decision not found.'); return evaluateDecision(decision,current); },
  transitionDecision: (decisionOrId, nextState) => { const current=loadState(); const decision=typeof decisionOrId==='string' ? current.decisions?.find(d=>d.id===decisionOrId) : decisionOrId; if(!decision) throw new Error('Decision not found.'); const transitioned=transitionDecision(decision,nextState,current); if(typeof decisionOrId==='string'){ const index=current.decisions.findIndex(d=>d.id===decision.id); current.decisions[index]=transitioned; saveState(current); refresh(); } return transitioned; },
  institutionalMemory: () => extractInstitutionalMemory(loadState()),
  queryInstitutionalMemory: query => queryInstitutionalMemory(loadState(),query),
  memorySummary: () => memorySummary(loadState()),
  preInvestigationBrief: caseInput => recommendPreInvestigationChecks(caseInput||{},loadState()),
  createProfessionalReport: () => { createProfessionalReport(); return reportFilename(loadState()); },
  triage: () => { const findings=contradictionTriage(loadState()); findings.forEach(f=>addRecord('contradictions',f)); refresh(); return findings; },
  shadowInvestigation: () => buildShadowInvestigation(loadState()),
  exportCase: () => downloadText('osint-enterprise-export.json',JSON.stringify(loadState(),null,2),'application/json')
};

seed(); render();

$('create')?.addEventListener('click',()=>{ const title=$('caseName')?.value.trim(); if(!title)return; window.osintEnterprise.createCase({title, objective:'Investigation objective pending analyst definition.', priority:'medium'}); $('modal')?.classList.remove('open'); $('caseName').value=''; });
$('audit')?.addEventListener('click',()=>{ const findings=window.osintEnterprise.triage(); const shadow=window.osintEnterprise.shadowInvestigation(); renderChallenge(); alert(`${findings.length} contradiction candidate(s) generated. Shadow investigation found ${shadow.findingCount} reasoning-drift signal(s).`); });
$('challenge')?.addEventListener('click',()=>{ const shadow=window.osintEnterprise.shadowInvestigation(); renderChallenge(); $('challengePanel')?.scrollIntoView({behavior:'smooth',block:'start'}); if(!shadow.findingCount && !shadow.falsificationGaps.length) alert('Shadow investigation clear: no current drift signal detected. This is not proof of correctness.'); });
$('report')?.addEventListener('click',()=>window.osintEnterprise.createProfessionalReport());
$('export')?.addEventListener('click',()=>window.osintEnterprise.exportCase());
