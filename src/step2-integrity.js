import { loadState, updateRecord, addRecord, getActiveCaseId } from './core/store.js';
import { createDecision } from './core/model.js';
import { evaluateDecision, transitionDecision } from './core/decision.js';

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;', "'":'&#39;' }[c]));

function activeState() { const s = loadState(); return { s, caseId: getActiveCaseId(s) }; }
function evidenceOptions(s, caseId) { return (s.evidence || []).filter(e => !caseId || e.caseId === caseId).map(e => `<option value="${esc(e.id)}">${esc(e.title)} · ${esc(e.status)}</option>`).join(''); }

function decorateHypotheses(s, caseId) {
  const root = $('hypothesesList'); if (!root) return;
  root.querySelectorAll('.step2-hypothesis-controls').forEach(x => x.remove());
  root.querySelectorAll('.data-card').forEach((card, i) => {
    const h = (s.hypotheses || []).filter(x => !caseId || x.caseId === caseId)[i]; if (!h) return;
    const box = document.createElement('div'); box.className = 'step2-hypothesis-controls actions';
    box.innerHTML = `<select aria-label="Evidence for hypothesis" class="step2-evidence-select"><option value="">Link evidence…</option>${evidenceOptions(s, caseId)}</select><button class="button" data-step2-link="for">Support</button><button class="button" data-step2-link="against">Challenge</button>`;
    box.dataset.hypothesisId = h.id; card.appendChild(box);
  });
}

function decorateRelationships(s, caseId) {
  const root = $('entitiesList'); if (!root) return;
  root.querySelectorAll('.step2-rel-controls').forEach(x => x.remove());
  root.querySelectorAll('.relationship-list > .row').forEach((row, i) => {
    const relationships = (s.relationships || []).filter(x => !caseId || x.caseId === caseId), rel = relationships[i]; if (!rel) return;
    const box = document.createElement('div'); box.className = 'step2-rel-controls actions';
    box.innerHTML = `<select aria-label="Evidence for relationship" class="step2-rel-evidence"><option value="">Link evidence…</option>${evidenceOptions(s, caseId)}</select><button class="button" data-step2-rel="link">Attach</button>`;
    box.dataset.relationshipId = rel.id; row.appendChild(box);
  });
}

function renderDecisionGate() {
  const root = $('governanceList'); if (!root) return;
  const { s, caseId } = activeState(); if (!caseId) return;
  let panel = $('step2DecisionGate');
  if (!panel) { panel = document.createElement('article'); panel.id = 'step2DecisionGate'; panel.className = 'card step2-gate'; root.appendChild(panel); }
  const decisions = (s.decisions || []).filter(d => d.caseId === caseId), latest = decisions.at(-1), evaluation = latest ? evaluateDecision(latest, s) : null;
  const hypotheses = (s.hypotheses || []).filter(h => h.caseId === caseId);
  const selected = new Set(latest?.linkedHypothesisIds || []);
  panel.innerHTML = `<div class="row-head"><div><span class="ey">DECISION INTEGRITY GATE</span><strong>${latest ? esc(latest.title) : 'No decision recorded'}</strong><small>${latest ? `${esc(evaluation.status)} · ${evaluation.score}/100 · ${evaluation.blockingReasons.length} blocker(s) · ${evaluation.warnings.length} warning(s)` : 'Build a decision only from explicit hypotheses, evidence, falsifiers and contradiction review.'}</small></div><span class="tag ${!evaluation ? 'warn' : evaluation.status === 'PASS' ? 'ok' : evaluation.status === 'REVIEW' ? 'warn' : 'bad'}">${evaluation?.status || 'STANDBY'}</span></div><div class="step2-decision-form"><input id="step2DecisionTitle" maxlength="160" placeholder="Decision title"><textarea id="step2DecisionStatement" rows="2" maxlength="500" placeholder="Decision statement"></textarea><input id="step2DecisionRationale" maxlength="500" placeholder="Rationale / uncertainty"><input id="step2DecisionRisk" maxlength="500" placeholder="Residual risk acceptance"><label class="step2-hypothesis-picker">Linked hypotheses<select id="step2DecisionHypotheses" multiple size="${Math.min(5, Math.max(2, hypotheses.length || 2))}">${hypotheses.map(h => `<option value="${esc(h.id)}" ${selected.has(h.id) ? 'selected' : ''}>${esc(h.statement.slice(0,100))}</option>`).join('')}</select></label><button class="button primary" id="step2CreateDecision">${latest ? 'Update decision checkpoint' : 'Create decision checkpoint'}</button>${latest ? '<button class="button" id="step2ApproveDecision">Attempt approval</button>' : ''}</div>${latest && evaluation.blockingReasons.length ? `<div class="step2-blockers"><strong>BLOCKERS</strong>${evaluation.blockingReasons.slice(0,8).map(x => `<small>• ${esc(x)}</small>`).join('')}</div>` : ''}${latest && evaluation.warnings.length ? `<div class="step2-blockers"><strong>WARNINGS</strong>${evaluation.warnings.slice(0,8).map(x => `<small>• ${esc(x)}</small>`).join('')}</div>` : ''}`;
  $('step2CreateDecision')?.addEventListener('click', () => {
    const title = $('step2DecisionTitle')?.value.trim(), statement = $('step2DecisionStatement')?.value.trim(), rationale = $('step2DecisionRationale')?.value.trim(), riskAcceptance = $('step2DecisionRisk')?.value.trim();
    const linkedHypothesisIds = [...($('step2DecisionHypotheses')?.selectedOptions || [])].map(o => o.value);
    if (!title || !statement || !linkedHypothesisIds.length) return;
    if (latest) updateRecord('decisions', latest.id, { title, statement, rationale, riskAcceptance, linkedHypothesisIds, state: latest.state === 'approved' ? 'review' : latest.state });
    else addRecord('decisions', createDecision({ caseId, title, statement, rationale, riskAcceptance, state: 'draft', linkedHypothesisIds }));
    window.dispatchEvent(new Event('occ:re-render'));
  });
  $('step2ApproveDecision')?.addEventListener('click', () => {
    const current = loadState().decisions.find(d => d.id === latest.id); if (!current) return;
    try { updateRecord('decisions', current.id, transitionDecision(current, 'approved', loadState())); } catch (err) { alert(String(err.message || err)); }
    window.dispatchEvent(new Event('occ:re-render'));
  });
}

function handleClick(e) {
  const support = e.target.closest('[data-step2-link]');
  if (support) {
    const box = support.closest('.step2-hypothesis-controls'), evidenceId = box?.querySelector('.step2-evidence-select')?.value, hypothesisId = box?.dataset.hypothesisId; if (!evidenceId || !hypothesisId) return;
    const s = loadState(), h = (s.hypotheses || []).find(x => x.id === hypothesisId); if (!h) return;
    const field = support.dataset.step2Link === 'for' ? 'evidenceFor' : 'evidenceAgainst', other = field === 'evidenceFor' ? 'evidenceAgainst' : 'evidenceFor';
    updateRecord('hypotheses', hypothesisId, { [field]: Array.from(new Set([...(h[field] || []), evidenceId])), [other]: (h[other] || []).filter(id => id !== evidenceId), status: 'tested', updatedAt: new Date().toISOString() });
    window.dispatchEvent(new Event('occ:re-render')); return;
  }
  const attach = e.target.closest('[data-step2-rel="link"]');
  if (attach) {
    const box = attach.closest('.step2-rel-controls'), evidenceId = box?.querySelector('.step2-rel-evidence')?.value, relationshipId = box?.dataset.relationshipId; if (!evidenceId || !relationshipId) return;
    const s = loadState(), r = (s.relationships || []).find(x => x.id === relationshipId); if (!r) return;
    updateRecord('relationships', relationshipId, { evidenceIds: Array.from(new Set([...(r.evidenceIds || []), evidenceId])), status: 'INFERENCE' }); window.dispatchEvent(new Event('occ:re-render'));
  }
}

function refresh() { const { s, caseId } = activeState(); decorateHypotheses(s, caseId); decorateRelationships(s, caseId); renderDecisionGate(); }
if (typeof document !== 'undefined') { document.addEventListener('click', handleClick); const boot = () => { refresh(); window.addEventListener('occ:re-render', refresh); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot(); }
