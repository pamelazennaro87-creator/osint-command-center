import { createCase, createEvidence, createSource, createEntity, createHypothesis, createDecision, createRelationship } from './core/model.js';
import { loadState, saveState, addRecord } from './core/store.js';
import { calculateMetrics, contradictionTriage } from './core/engine.js';
import { buildShadowInvestigation } from './core/drift.js';
import { evaluateDecision, transitionDecision } from './core/decision.js';
import { extractInstitutionalMemory, memorySummary, queryInstitutionalMemory } from './core/memory.js';
import { recommendPreInvestigationChecks, buildProfessionalReport, reportFilename } from './core/report.js';
import { validateState } from './core/validation.js';
import { temporalAnalysis, buildTemporalTimeline } from './core/temporal.js';
import { sanitizeForExport, privacySummary } from './core/privacy.js';

const $ = id => document.getElementById(id);
const META = {
  command: ['Command Center', 'Evidence, uncertainty and competing explanations in one decision layer.'],
  cases: ['Cases', 'Create and inspect investigations stored in this browser.'],
  evidence: ['Evidence', 'Record claims with source provenance and uncertainty status.'],
  entities: ['Entities & Graph', 'Track people, organizations, assets and relationships.'],
  hypotheses: ['Hypotheses', 'Keep competing explanations explicit and falsifiable.'],
  contradictions: ['Contradictions', 'Review conflicts and analytical challenge signals.'],
  reports: ['Reports', 'Export a professional assessment from the current state.'],
  governance: ['Governance', 'Validate state and inspect the integrity boundary of this prototype.']
};

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function seed(state) {
  if (state.cases.length) return;
  const c = createCase({ title: 'Entity relationship review', objective: 'Determine whether observed relationships are supported by independent evidence.', priority: 'high' });
  const s = createSource({ name: 'Demo public source', type: 'web', reliability: 0.7, independenceGroup: 'demo-1' });
  const e = createEvidence({ caseId: c.id, sourceId: s.id, title: 'Initial observation', claim: 'Observed relationship requires verification.', status: 'UNKNOWN', confidence: 0.4 });
  state.cases.push(c); state.sources.push(s); state.evidence.push(e);
  const a = createEntity({ name: 'Example entity A', type: 'person' });
  const b = createEntity({ name: 'Example organization B', type: 'organization' });
  state.entities.push(a, b); state.relationships = state.relationships || [];
  state.relationships.push(createRelationship({ caseId: c.id, fromEntityId: a.id, toEntityId: b.id, evidenceIds: [e.id], confidence: 0.3 }));
  state.hypotheses.push(createHypothesis({ caseId: c.id, statement: 'The observed relationship is genuine.', confidence: 0.4, falsifier: 'Independent evidence disproves the relationship.' }));
  saveState(state);
}

function renderChallenge(state) {
  const panel = $('challengeList'); if (!panel) return;
  const result = buildShadowInvestigation(state);
  const status = $('challengeStatus');
  if (status) { status.textContent = String(result.integrityStatus || 'REVIEW').replaceAll('_', ' '); status.className = `tag ${result.integrityStatus === 'HIGH_RISK' ? 'bad' : result.integrityStatus === 'REVIEW' ? 'warn' : 'ok'}`; }
  if ($('challengeHigh')) $('challengeHigh').textContent = String(result.highRiskCount || 0);
  if ($('challengeMedium')) $('challengeMedium').textContent = String(result.mediumRiskCount || 0);
  if ($('challengeTotal')) $('challengeTotal').textContent = String((result.findingCount || 0) + (result.falsificationGaps?.length || 0));
  const rows = [...(result.findings || []).slice(0, 8).map(f => `<div class="row"><div><strong>${esc(f.type)}</strong><small>${esc(f.message)}</small></div><span class="tag ${f.severity === 'high' ? 'bad' : 'warn'}">${esc(String(f.severity || 'review').toUpperCase())}</span></div>`), ...(result.falsificationGaps || []).slice(0, 4).map(g => `<div class="row"><div><strong>FALSIFICATION GAP</strong><small>${esc(g.message)}</small></div><span class="tag warn">CHALLENGE</span></div>`)];
  panel.innerHTML = rows.join('') || '<div class="row"><small>No current challenge signals.</small></div>';
}

function renderDecision(state) {
  const panel = $('decisionIntegrityList'); if (!panel) return;
  const decisions = state.decisions || [];
  if (!decisions.length) { panel.innerHTML = '<div class="row"><div><strong>No decision submitted</strong><small>Create a decision after testing the evidence.</small></div><span class="tag warn">STANDBY</span></div>'; return; }
  const decision = decisions[decisions.length - 1]; const result = evaluateDecision(decision, state);
  panel.innerHTML = `<div class="row"><div><strong>${esc(decision.title)}</strong><small>${esc(result.status)} · score ${result.score}/100 · ${result.blockingReasons.length} blocker(s)</small></div><span class="tag ${result.status === 'PASS' ? 'ok' : result.status === 'REVIEW' ? 'warn' : 'bad'}">${esc(result.status)}</span></div>`;
}

function renderMemory(state) {
  const summary = memorySummary(state);
  if ($('memoryTotal')) $('memoryTotal').textContent = String(summary.total || 0);
  if ($('memoryRecurring')) $('memoryRecurring').textContent = String(summary.recurring || 0);
  const panel = $('memoryList'); if (!panel) return;
  panel.innerHTML = extractInstitutionalMemory(state).slice(0, 6).map(item => `<div class="row"><div><strong>${esc(item.type)}</strong><small>${esc(item.pattern)}</small></div><span class="tag">${item.caseCount > 1 ? 'RECURRING' : 'NEW'}</span></div>`).join('') || '<div class="row"><small>No reusable patterns yet.</small></div>';
}

function renderPre(state) {
  const panel = $('preInvestigationList'); if (!panel) return;
  const currentCase = state.cases[state.cases.length - 1] || {};
  const brief = recommendPreInvestigationChecks(currentCase, state);
  panel.innerHTML = brief.recommendedChecks.slice(0, 5).map(item => `<div class="row"><div><strong>${esc(item.title)}</strong><small>${esc(item.reason)}</small></div><span class="tag">${brief.memoryDerived ? 'MEMORY' : 'BASELINE'}</span></div>`).join('') || '<div class="row"><small>No checks generated.</small></div>';
}

function renderLists(state) {
  const cases = $('casesList');
  if (cases) cases.innerHTML = state.cases.map(item => `<div class="card" style="margin-bottom:10px"><div class="row"><div><strong>${esc(item.title)}</strong><small>${esc(item.objective || 'Objective pending')} · ${esc(item.status)} · ${esc(item.priority)}</small></div></div></div>`).join('') || '<div class="empty">No cases.</div>';
  const evidence = $('evidenceList');
  if (evidence) evidence.innerHTML = state.evidence.map(item => { const source = state.sources.find(s => s.id === item.sourceId); return `<div class="card" style="margin-bottom:10px"><div class="row"><div><strong>${esc(item.title)}</strong><small>${esc(item.claim)}</small><small>Source: ${esc(source?.name || 'Unknown')} · Confidence: ${Math.round((item.confidence || 0) * 100)}%</small></div><span class="tag">${esc(item.status)}</span></div></div>`; }).join('') || '<div class="empty">No evidence.</div>';
  const entities = $('entitiesList');
  if (entities) { const relationships = state.relationships || []; const entityRows = state.entities.map(item => `<div class="row"><div><strong>${esc(item.name)}</strong><small>${esc(item.type)}</small></div><span class="tag">ENTITY</span></div>`); const relationshipRows = relationships.map(item => { const from = state.entities.find(e => e.id === item.fromEntityId); const to = state.entities.find(e => e.id === item.toEntityId); return `<div class="row"><div><strong>${esc(from?.name || '?')} → ${esc(to?.name || '?')}</strong><small>${esc(item.type || 'relationship')} · ${Math.round((item.confidence || 0) * 100)}%</small></div><span class="tag warn">RELATIONSHIP</span></div>`; }); entities.innerHTML = [...entityRows, ...relationshipRows].join('') || '<div class="empty">No entities or relationships.</div>'; }
  const hypotheses = $('hypothesesList');
  if (hypotheses) hypotheses.innerHTML = state.hypotheses.map(item => `<div class="card" style="margin-bottom:10px"><div class="row"><div><strong>${esc(item.statement)}</strong><small>Falsifier: ${esc(item.falsifier || 'Not defined')}</small></div><span class="tag">${Math.round((item.confidence || 0) * 100)}%</span></div></div>`).join('') || '<div class="empty">No hypotheses.</div>';
  const contradictions = $('contradictionsList');
  if (contradictions) contradictions.innerHTML = state.contradictions.map(item => `<div class="card" style="margin-bottom:10px"><div class="row"><div><strong>${esc(item.type)}</strong><small>${esc(item.explanation || 'Analyst review required.')}</small></div><span class="tag warn">${esc(String(item.severity || 'review').toUpperCase())}</span></div></div>`).join('') || '<div class="empty">No contradictions currently recorded.</div>';
}

function renderTemporal(state) {
  const panel = $('temporalIntegrityList'); if (!panel) return;
  const findings = temporalAnalysis(state);
  if ($('temporalCount')) $('temporalCount').textContent = String(findings.length);
  if ($('temporalStatus')) { const has = findings.length > 0; $('temporalStatus').textContent = has ? 'REVIEW TIMELINE' : 'NO TEMPORAL SIGNAL'; $('temporalStatus').className = `tag ${has ? 'warn' : 'ok'}`; }
  panel.innerHTML = findings.slice(0, 8).map(f => `<div class="row"><div><strong>${esc(String(f.type || '').replaceAll('_', ' '))}</strong><small>${esc(f.message)}</small><small>${esc(f.earlierDate)} → ${esc(f.laterDate)}</small></div><span class="tag warn">MEDIUM</span></div>`).join('') || '<div class="row"><small>No temporal discrepancies detected.</small></div>';
  const timeline = $('temporalTimeline'); if (!timeline) return;
  const caseId = state.cases.find(c => String(c.title).toLowerCase().includes('berill'))?.id;
  timeline.innerHTML = buildTemporalTimeline(state, caseId).slice(0, 10).map(x => `<div class="row"><div><strong>${esc(x.title || 'Evidence')}</strong><small>${esc(x.date)} · ${esc(x.claim)}</small></div><span class="tag">${esc(x.status)}</span></div>`).join('') || '<div class="row"><small>Timeline unavailable.</small></div>';
}

function render(state) {
  const metrics = calculateMetrics(state);
  [['cases', metrics.cases], ['evidence', metrics.evidence], ['hypotheses', metrics.hypotheses], ['contradictions', metrics.contradictions]].forEach(([key, value]) => { const element = $(`metric-${key}`); if (element) element.textContent = String(value).padStart(2, '0'); });
  ['verifiedPct', 'corroboratedPct', 'aiPct'].forEach(key => { const element = $(key); if (!element) return; element.textContent = `${metrics[key]}%`; const bar = $(`${key}Bar`); if (bar) bar.style.width = `${metrics[key]}%`; });
  const queue = $('caseList'); if (queue) queue.innerHTML = state.cases.slice(-6).reverse().map(item => `<div class="row"><div><strong>${esc(item.title)}</strong><small>${esc(item.id)} · ${esc(item.status)}</small></div><span class="tag ${item.priority === 'high' ? 'bad' : item.priority === 'low' ? 'ok' : 'warn'}">${esc(String(item.priority || 'medium').toUpperCase())}</span></div>`).join('') || '<div class="row"><small>No investigations yet.</small></div>';
  renderChallenge(state); renderDecision(state); renderMemory(state); renderPre(state); renderLists(state); renderTemporal(state);
}

function showView(view) {
  const selected = META[view] ? view : 'command';
  document.querySelectorAll('.view').forEach(element => element.classList.toggle('active', element.id === `view-${selected}`));
  document.querySelectorAll('.nav button[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === selected));
  if ($('pageTitle')) $('pageTitle').textContent = META[selected][0];
  if ($('pageSub')) $('pageSub').textContent = META[selected][1];
  if (location.hash.slice(1) !== selected) history.replaceState(null, '', `#${selected}`);
  render(loadState());
}

function refresh() { render(loadState()); }
function downloadText(name, text, type) { const url = URL.createObjectURL(new Blob([text], { type })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 500); }
function createProfessionalReport() { const state = loadState(); downloadText(reportFilename(state), buildProfessionalReport(state), 'text/html'); }
function exportCase() { const state = loadState(); const privacy = privacySummary(state); if (privacy.status === 'BLOCK') throw new Error('Export blocked: potential secret-bearing fields detected.'); downloadText('osint-enterprise-export.json', JSON.stringify(sanitizeForExport(state), null, 2), 'application/json'); }
function openModal() { $('modal')?.classList.add('open'); $('caseName')?.focus(); }
function closeModal() { $('modal')?.classList.remove('open'); }

function newEvidence() {
  const state = loadState(); if (!state.cases.length) return alert('Create a case first.');
  const title = prompt('Evidence title'); if (!title?.trim()) return;
  const claim = prompt('Observed claim'); if (!claim?.trim()) return;
  const locator = prompt('Source URL / locator (optional)') || '';
  let source = state.sources.find(item => item.locator === locator);
  if (!source) { source = createSource({ name: locator || 'Analyst-entered source', locator, reliability: 0.5, independenceGroup: locator || `manual-${Date.now()}` }); addRecord('sources', source); }
  addRecord('evidence', createEvidence({ caseId: state.cases[state.cases.length - 1].id, sourceId: source.id, title: title.trim(), claim: claim.trim(), locator, status: 'UNKNOWN', confidence: 0.5 })); refresh();
}
function newEntity() { const name = prompt('Entity name'); if (!name?.trim()) return; const type = prompt('Type: person, organization, company, asset, location, event, unknown', 'unknown') || 'unknown'; addRecord('entities', createEntity({ name: name.trim(), type: type.trim() || 'unknown' })); refresh(); }
function newHypothesis() { const state = loadState(); if (!state.cases.length) return alert('Create a case first.'); const statement = prompt('Hypothesis statement'); if (!statement?.trim()) return; const falsifier = prompt('What evidence would falsify it?') || ''; addRecord('hypotheses', createHypothesis({ caseId: state.cases[state.cases.length - 1].id, statement: statement.trim(), falsifier: falsifier.trim(), confidence: 0.5 })); refresh(); }
function runTriage() { const findings = contradictionTriage(loadState()); findings.forEach(item => addRecord('contradictions', item)); refresh(); return findings; }
function runValidation() { const result = validateState(loadState()); const panel = $('governanceResult'); if (panel) { const errors = result.errors || []; const warnings = result.warnings || []; panel.innerHTML = `<strong>${result.valid ? 'VALIDATION PASSED' : 'VALIDATION FAILED'}</strong><p class="sub">${errors.length} error(s) · ${warnings.length} warning(s)</p>${errors.concat(warnings).slice(0, 20).map(item => `<div class="row"><small>${esc(typeof item === 'string' ? item : JSON.stringify(item))}</small></div>`).join('')}`; } return result; }

function bindEvents() {
  document.querySelectorAll('.nav button[data-view]').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
  $('newCase')?.addEventListener('click', openModal); $('casesNew')?.addEventListener('click', openModal); $('close')?.addEventListener('click', closeModal);
  $('modal')?.addEventListener('click', event => { if (event.target === $('modal')) closeModal(); });
  $('create')?.addEventListener('click', () => { const title = $('caseName')?.value.trim(); if (!title) return; addRecord('cases', createCase({ title, objective: 'Define the investigation objective before collecting evidence.', priority: 'medium' })); if ($('caseName')) $('caseName').value = ''; closeModal(); showView('cases'); });
  $('audit')?.addEventListener('click', () => alert(`${runTriage().length} contradiction candidate(s) generated.`));
  $('challenge')?.addEventListener('click', () => { $('challengePanel')?.scrollIntoView({ behavior: 'smooth' }); renderChallenge(loadState()); });
  $('report')?.addEventListener('click', createProfessionalReport); $('reportSecondary')?.addEventListener('click', createProfessionalReport); $('reportWorkspace')?.addEventListener('click', createProfessionalReport);
  $('export')?.addEventListener('click', () => { try { exportCase(); } catch (error) { alert(error.message); } });
  $('evidenceNew')?.addEventListener('click', newEvidence); $('entityNew')?.addEventListener('click', newEntity); $('hypothesisNew')?.addEventListener('click', newHypothesis);
  $('contradictionRun')?.addEventListener('click', () => { runTriage(); showView('contradictions'); }); $('validateWorkspace')?.addEventListener('click', runValidation);
  window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'command'));
}

window.osintEnterprise = {
  getState: () => structuredClone(loadState()), validate: () => validateState(loadState()), privacy: () => privacySummary(loadState()),
  createCase: input => { const record = addRecord('cases', createCase(input)); refresh(); return record; },
  createEvidence: input => { const record = addRecord('evidence', createEvidence(input)); refresh(); return record; },
  createDecision: input => { const record = addRecord('decisions', createDecision(input)); refresh(); return record; },
  evaluateDecision: input => { const state = loadState(); const decision = typeof input === 'string' ? state.decisions?.find(item => item.id === input) : input; if (!decision) throw new Error('Decision not found.'); return evaluateDecision(decision, state); },
  transitionDecision: (input, nextState) => { const state = loadState(); const decision = typeof input === 'string' ? state.decisions?.find(item => item.id === input) : input; if (!decision) throw new Error('Decision not found.'); const transitioned = transitionDecision(decision, nextState, state); if (typeof input === 'string') { state.decisions[state.decisions.findIndex(item => item.id === decision.id)] = transitioned; saveState(state); refresh(); } return transitioned; },
  institutionalMemory: () => extractInstitutionalMemory(loadState()), queryInstitutionalMemory: query => queryInstitutionalMemory(loadState(), query), memorySummary: () => memorySummary(loadState()),
  preInvestigationBrief: input => recommendPreInvestigationChecks(input || {}, loadState()), createProfessionalReport, triage: runTriage,
  shadowInvestigation: () => buildShadowInvestigation(loadState()), temporalAnalysis: () => temporalAnalysis(loadState()), temporalTimeline: caseId => buildTemporalTimeline(loadState(), caseId), exportCase, showView
};

function boot() { const state = loadState(); seed(state); bindEvents(); const requestedView = location.hash.slice(1); showView(META[requestedView] ? requestedView : 'command'); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true }); else boot();
