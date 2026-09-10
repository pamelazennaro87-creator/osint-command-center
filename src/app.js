import { createCase, createEvidence, createSource, createEntity, createRelationship, createHypothesis } from './core/model.js';
import { loadState, saveState, addRecord } from './core/store.js';
import { calculateMetrics, contradictionTriage } from './core/engine.js';

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
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

window.osintEnterprise = {
  getState: () => structuredClone(loadState()),
  createCase: input => { const r=addRecord('cases',createCase(input)); Object.assign(state,loadState()); render(); return r; },
  createEvidence: input => { const r=addRecord('evidence',createEvidence(input)); Object.assign(state,loadState()); render(); return r; },
  triage: () => { const findings=contradictionTriage(loadState()); findings.forEach(f=>addRecord('contradictions',f)); Object.assign(state,loadState()); render(); return findings; }
};

seed();
render();

$('create')?.addEventListener('click',()=>{
  const title=$('caseName')?.value.trim();
  if(!title)return;
  window.osintEnterprise.createCase({title, objective:'Investigation objective pending analyst definition.', priority:'medium'});
  $('modal')?.classList.remove('open'); $('caseName').value='';
});
$('audit')?.addEventListener('click',()=>{
  const findings=window.osintEnterprise.triage();
  alert(`${findings.length} contradiction candidate(s) generated for analyst review.`);
});
