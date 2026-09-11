import { loadState, updateRecord, addRecord, getActiveCaseId } from './core/store.js';
import { createDecision } from './core/model.js';
import { evaluateDecision } from './core/decision.js';

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

function activeState() {
  const s = loadState();
  const caseId = getActiveCaseId(s);
  return { s, caseId };
}

function evidenceOptions(s, caseId) {
  return (s.evidence || []).filter(e => !caseId || e.caseId === caseId)
    .map(e => `<option value="${esc(e.id)}">${esc(e.title)} · ${esc(e.status)}</option>`).join('');
}

function decorateHypotheses(s, caseId) {
  const root = $('hypothesesList');
  if (!root) return;
  root.querySelectorAll('.step2-hypothesis-controls').forEach(x => x.remove());
  root.querySelectorAll('.data-card').forEach((card, i) => {
    const h = (s.hypotheses || []).filter(x => !caseId || x.caseId === caseId)[i];
    if (!h) return;
    const box = document.createElement('div');
    box.className = 'step2-hypothesis-controls actions';
    box.innerHTML = `<select aria-label="Evidence for hypothesis" class="step2-evidence-select"><option value="">Link evidence…</option>${evidenceOptions(s, caseId)}</select><button class="button" data-step2-link="for">Support</button><button class="button" data-step2-link="against">Challenge</button>`;
    box.dataset.hypothesisId = h.id;
    card.appendChild(box);
  });
}

function decorateRelationships(s, caseId) {
  const root = $('entitiesList');
  if (!root) return;
  root.querySelectorAll('.step2-rel-controls').forEach(x => x.remove());
  root.querySelectorAll('.relationship-list > .row').forEach((row, i) => {
    const relationships = (s.relationships || []).filter(x => !caseId || x.caseId === caseId);
    const rel = relationships[i];
    if (!rel) return;
    const box = document.createElement('div');
    box.className = 'step2-rel-controls actions';
    box.innerHTML = `<select aria-label="Evidence for relationship" class="step2-rel-evidence"><option value="">Link evidence…</option>${evidenceOptions(s, caseId)}</select><button class="button" data-step2-rel="link">Attach</button>`;
    box.dataset.relationshipId = rel.id;
    row.appendChild(box);
  });
}

function renderDecisionGate() {
  const root = $('governanceList');
  if (!root) return;
  const { s, caseId } = activeState();
  if (!caseId) return;
  let panel = $('step2DecisionGate');
  if (!panel) {
    panel = document.createElement('article');
    panel.id = 'step2DecisionGate';
    panel.className = 'card step2-gate';
    root.appendChild(panel);
  }
  const decisions = (s.decisions || []).filter(d => d.caseId === caseId);
  const latest = decisions.at(-1);
  const evaluation = latest ? evaluateDecision(latest, s) : null;
  panel.innerHTML = `<div class="row-head"><div><span class="ey">DECISION INTEGRITY GATE</span><strong>${latest ? esc(latest.title) : 'No decision recorded'}</strong><small>${latest ? `${esc(evaluation.status)} · ${evaluation.score}/100 · ${evaluation.blockingReasons.length} blocker(s)` : 'Convert the current evidence and hypothesis state into an explicit, reviewable decision.'}</small></div><span class="tag ${!evaluation ? 'warn' : evaluation.status === 'PASS' ? 'ok' : evaluation.status === 'REVIEW' ? 'warn' : 'bad'}">${evaluation?.status || 'STANDBY'}</span></div><div class="step2-decision-form"><input id="step2DecisionTitle" maxlength="160" placeholder="Decision title"><textarea id="step2DecisionStatement" rows="2" maxlength="500" placeholder="Decision statement"></textarea><input id="step2DecisionRationale" maxlength="500" placeholder="Rationale / uncertainty"><button class="button primary" id="step2CreateDecision">Create decision checkpoint</button></div>${latest && evaluation.blockingReasons.length ? `<div class="step2-blockers"><strong>BLOCKERS</strong>${evaluation.blockingReasons.slice(0,6).map(x => `<small>• ${esc(x)}</small>`).join('')}</div>` : ''}`;
  $('step2CreateDecision')?.addEventListener('click', () => {
    const title = $('step2DecisionTitle')?.value.trim();
    const statement = $('step2DecisionStatement')?.value.trim();
    const rationale = $('step2DecisionRationale')?.value.trim();
    if (!title || !statement) return;
    addRecord('decisions', createDecision({ caseId, title, statement, rationale, state: 'draft', linkedHypothesisIds: decisions.length ? latest.linkedHypothesisIds : [] }));
    window.dispatchEvent(new Event('occ:re-render'));
  });
}

function handleClick(e) {
  const support = e.target.closest('[data-step2-link]');
  if (support) {
    const box = support.closest('.step2-hypothesis-controls');
    const evidenceId = box?.querySelector('.step2-evidence-select')?.value;
    const hypothesisId = box?.dataset.hypothesisId;
    if (!evidenceId || !hypothesisId) return;
    const s = loadState();
    const h = (s.hypotheses || []).find(x => x.id === hypothesisId);
    if (!h) return;
    const field = support.dataset.step2Link === 'for' ? 'evidenceFor' : 'evidenceAgainst';
    const other = field === 'evidenceFor' ? 'evidenceAgainst' : 'evidenceFor';
    const next = Array.from(new Set([...(h[field] || []), evidenceId]));
    updateRecord('hypotheses', hypothesisId, { [field]: next, [other]: (h[other] || []).filter(id => id !== evidenceId), status: 'tested', updatedAt: new Date().toISOString() });
    window.dispatchEvent(new Event('occ:re-render'));
    return;
  }
  const attach = e.target.closest('[data-step2-rel="link"]');
  if (attach) {
    const box = attach.closest('.step2-rel-controls');
    const evidenceId = box?.querySelector('.step2-rel-evidence')?.value;
    const relationshipId = box?.dataset.relationshipId;
    if (!evidenceId || !relationshipId) return;
    const s = loadState();
    const r = (s.relationships || []).find(x => x.id === relationshipId);
    if (!r) return;
    updateRecord('relationships', relationshipId, { evidenceIds: Array.from(new Set([...(r.evidenceIds || []), evidenceId])), status: 'INFERENCE' });
    window.dispatchEvent(new Event('occ:re-render'));
  }
}

function refresh() {
  const { s, caseId } = activeState();
  decorateHypotheses(s, caseId);
  decorateRelationships(s, caseId);
  renderDecisionGate();
}

if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClick);
  const boot = () => { refresh(); window.addEventListener('occ:re-render', refresh); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
}
