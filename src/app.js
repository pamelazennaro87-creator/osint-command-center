import { createCase, createEvidence, createSource, createEntity, createHypothesis, createDecision, createRelationship } from './core/model.js';
import { loadState, saveState, addRecord, setActiveCase, getActiveCaseId, filterByActiveCase, setRedTeamMode, isRedTeamMode } from './core/store.js';
import { calculateMetrics, contradictionTriage } from './core/engine.js';
import { buildShadowInvestigation } from './core/drift.js';
import { evaluateDecision } from './core/decision.js';
import { extractInstitutionalMemory, memorySummary } from './core/memory.js';
import { recommendPreInvestigationChecks, buildProfessionalReport, reportFilename } from './core/report.js';
import { validateState } from './core/validation.js';
import { temporalAnalysis, buildTemporalTimeline } from './core/temporal.js';
import { sanitizeForExport, privacySummary } from './core/privacy.js';
import { buildIntelligenceMatrix } from './core/intelligence.js';
import { computeBiasRadar, buildRedTeamPressure } from './core/bias-radar.js';
import { tickVisuals, renderLivingGraph, destroyGraph, applyAtmosphere } from './visual-engine.js';

const $ = id => document.getElementById(id);
const META = {
  command: ['Command Center', 'Evidence, uncertainty and competing explanations in one decision layer.'],
  cases: ['Cases', 'Investigations, objectives, priorities and operational status.'],
  evidence: ['Evidence', 'Claims, provenance, confidence, verification and source independence.'],
  entities: ['Entities & Graph', 'People, organisations, assets and relationships — with a live evidence graph.'],
  hypotheses: ['Hypotheses', 'Competing explanations, falsifiers and confidence.'],
  contradictions: ['Contradictions', 'Conflicts, dependency signals and analytical challenge.'],
  reports: ['Reports', 'A decision-ready assessment generated from the current case state.'],
  governance: ['Governance', 'Validation, privacy boundary, audit trail and readiness controls.']
};
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = v => Math.round(Math.max(0, Math.min(1, Number(v) || 0)) * 100);

function seed(state) {
  if (state.cases.length) return;
  const c = createCase({ title: 'Demo: entity relationship review', objective: 'Demo workspace — replace with a real investigation objective.', priority: 'high' });
  const s = createSource({ name: 'Demo public source', type: 'web', reliability: 0.7, independenceGroup: 'demo-1' });
  const e = createEvidence({ caseId: c.id, sourceId: s.id, title: 'Demo initial observation', claim: 'Demo relationship requires verification.', status: 'UNKNOWN', confidence: 0.4 });
  const a = createEntity({ name: 'Demo entity A', type: 'person' });
  const b = createEntity({ name: 'Demo organisation B', type: 'organization' });
  state.cases.push(c);
  state.sources.push(s);
  state.evidence.push(e);
  state.entities.push(a, b);
  state.relationships.push(createRelationship({ caseId: c.id, fromEntityId: a.id, toEntityId: b.id, type: 'associated_with', evidenceIds: [e.id], confidence: 0.3 }));
  state.hypotheses.push(createHypothesis({ caseId: c.id, statement: 'Demo relationship is genuine.', confidence: 0.4, falsifier: 'Independent evidence disproves the relationship.' }));
  state.meta = state.meta || {};
  state.meta.activeCaseId = c.id;
  saveState(state);
}

function refresh() { render(loadState()); }

function downloadText(name, text, type) {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = u; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 500);
}

function report() {
  const s = loadState();
  downloadText(reportFilename(s), buildProfessionalReport(s), 'text/html');
}

function exportCase() {
  const s = loadState(), p = privacySummary(s);
  if (p.status === 'BLOCK') throw new Error('Export blocked: potential secret-bearing fields detected.');
  downloadText('osint-command-center-export.json', JSON.stringify(sanitizeForExport(s), null, 2), 'application/json');
}

function openModal(type = 'case') {
  const modal = $('modal');
  if (!modal) return;
  modal.dataset.type = type;
  const title = $('modalTitle');
  const fields = $('modalFields');
  if (type === 'case') {
    if (title) title.textContent = 'New investigation';
    if (fields) fields.innerHTML = `
      <label>Case title<input id="caseName" maxlength="120" placeholder="Short investigative title"></label>
      <label>Objective<input id="caseObjective" maxlength="500" placeholder="What question are we trying to answer?"></label>
      <label>Priority
        <select id="casePriority">
          <option value="high">High</option>
          <option value="medium" selected>Medium</option>
          <option value="low">Low</option>
        </select>
      </label>`;
  } else if (type === 'evidence') {
    if (title) title.textContent = 'Add evidence';
    if (fields) fields.innerHTML = `
      <label>Title<input id="evTitle" maxlength="200" placeholder="Short evidence title"></label>
      <label>Claim / Observation<textarea id="evClaim" rows="3" placeholder="What was observed or claimed?"></textarea></label>
      <label>Source URL / locator<input id="evLocator" maxlength="500" placeholder="https://... or archive locator"></label>
      <label>Confidence (0-1)<input id="evConfidence" type="number" min="0" max="1" step="0.05" value="0.5"></label>
      <label>Status
        <select id="evStatus">
          <option value="UNKNOWN" selected>UNKNOWN</option>
          <option value="INFERENCE">INFERENCE</option>
          <option value="ASSUMPTION">ASSUMPTION</option>
          <option value="FACT">FACT (use only after verification)</option>
          <option value="CONTESTED">CONTESTED</option>
        </select>
      </label>`;
  } else if (type === 'entity') {
    if (title) title.textContent = 'Add entity';
    if (fields) fields.innerHTML = `
      <label>Name<input id="entName" maxlength="200" placeholder="Person, organisation, asset..."></label>
      <label>Type
        <select id="entType">
          <option value="person">Person</option>
          <option value="organization">Organization</option>
          <option value="company">Company</option>
          <option value="asset">Asset</option>
          <option value="location">Location</option>
          <option value="event">Event</option>
          <option value="unknown" selected>Unknown</option>
        </select>
      </label>`;
  } else if (type === 'hypothesis') {
    if (title) title.textContent = 'Add hypothesis';
    if (fields) fields.innerHTML = `
      <label>Statement<textarea id="hypStatement" rows="3" placeholder="Competing explanation"></textarea></label>
      <label>Falsifier (what would prove this wrong?)<textarea id="hypFalsifier" rows="2" placeholder="Required for decision integrity"></textarea></label>
      <label>Initial confidence (0-1)<input id="hypConfidence" type="number" min="0" max="1" step="0.05" value="0.5"></label>`;
  } else if (type === 'relationship') {
    if (title) title.textContent = 'Add relationship';
    const s = loadState();
    const opts = (s.entities || []).map(e => `<option value="${esc(e.id)}">${esc(e.name)} (${esc(e.type)})</option>`).join('');
    if (fields) fields.innerHTML = `
      <label>From entity<select id="relFrom">${opts}</select></label>
      <label>To entity<select id="relTo">${opts}</select></label>
      <label>Type<input id="relType" value="associated_with" maxlength="80"></label>
      <label>Confidence (0-1)<input id="relConfidence" type="number" min="0" max="1" step="0.05" value="0.4"></label>`;
  }
  modal.classList.add('open');
  setTimeout(() => modal.querySelector('input, textarea, select')?.focus(), 50);
}

function closeModal() { $('modal')?.classList.remove('open'); }

function saveModal() {
  const type = $('modal')?.dataset.type || 'case';
  const s = loadState();
  const activeId = getActiveCaseId(s);

  if (type === 'case') {
    const title = $('caseName')?.value?.trim();
    if (!title) return alert('Title is required');
    const c = createCase({
      title,
      objective: $('caseObjective')?.value?.trim() || '',
      priority: $('casePriority')?.value || 'medium'
    });
    addRecord('cases', c);
  } else if (type === 'evidence') {
    if (!activeId) return alert('Create or focus a case first');
    const title = $('evTitle')?.value?.trim();
    const claim = $('evClaim')?.value?.trim();
    if (!title || !claim) return alert('Title and claim are required');
    const locator = $('evLocator')?.value?.trim() || '';
    let src = s.sources.find(x => x.locator === locator && locator);
    if (!src) {
      src = createSource({
        name: locator || 'Analyst-entered source',
        locator,
        reliability: 0.5,
        independenceGroup: locator || `manual-${Date.now()}`
      });
      addRecord('sources', src);
    }
    addRecord('evidence', createEvidence({
      caseId: activeId,
      sourceId: src.id,
      title,
      claim,
      locator,
      status: $('evStatus')?.value || 'UNKNOWN',
      confidence: Number($('evConfidence')?.value) || 0.5
    }));
  } else if (type === 'entity') {
    const name = $('entName')?.value?.trim();
    if (!name) return alert('Name is required');
    addRecord('entities', createEntity({ name, type: $('entType')?.value || 'unknown' }));
  } else if (type === 'hypothesis') {
    if (!activeId) return alert('Create or focus a case first');
    const statement = $('hypStatement')?.value?.trim();
    if (!statement) return alert('Statement is required');
    addRecord('hypotheses', createHypothesis({
      caseId: activeId,
      statement,
      falsifier: $('hypFalsifier')?.value?.trim() || '',
      confidence: Number($('hypConfidence')?.value) || 0.5
    }));
  } else if (type === 'relationship') {
    if (!activeId) return alert('Create or focus a case first');
    const from = $('relFrom')?.value;
    const to = $('relTo')?.value;
    if (!from || !to || from === to) return alert('Select two different entities');
    addRecord('relationships', createRelationship({
      caseId: activeId,
      fromEntityId: from,
      toEntityId: to,
      type: $('relType')?.value?.trim() || 'associated_with',
      confidence: Number($('relConfidence')?.value) || 0.4,
      evidenceIds: []
    }));
  }
  closeModal();
  refresh();
}

function showView(view) {
  const selected = META[view] ? view : 'command';
  document.querySelectorAll('.view').forEach(x => x.classList.toggle('active', x.id === `view-${selected}`));
  document.querySelectorAll('.nav button[data-view]').forEach(x => {
    x.classList.toggle('active', x.dataset.view === selected);
    x.setAttribute('aria-current', x.dataset.view === selected ? 'page' : 'false');
  });
  if ($('pageTitle')) $('pageTitle').textContent = META[selected][0];
  if ($('pageSub')) $('pageSub').textContent = META[selected][1];
  if (location.hash.slice(1) !== selected) history.replaceState(null, '', `#${selected}`);
  render(loadState());
}

function renderFocusStrip(s) {
  const strip = $('focusStrip');
  if (!strip) return;
  const activeId = getActiveCaseId(s);
  const active = (s.cases || []).find(c => c.id === activeId);
  if (!active) {
    strip.innerHTML = `<div><strong>No active case</strong><small>Create or select an investigation to focus the workspace.</small></div>
      <button class="button primary" data-action="new-case">+ New investigation</button>`;
    return;
  }
  strip.innerHTML = `
    <div>
      <strong>FOCUS · ${esc(active.title)}</strong>
      <small>${esc(active.objective || 'Objective pending')} · priority ${esc(active.priority)}</small>
    </div>
    <div class="actions">
      <button class="button" data-action="clear-focus">Clear focus</button>
      <button class="button primary" data-action="new-case">+ New case</button>
    </div>`;
}

function renderBiasRadar(s) {
  const p = $('biasRadarPanel');
  if (!p) return;
  const radar = computeBiasRadar(s);
  const dims = Object.values(radar.dimensions);
  p.innerHTML = `
    <div class="bias-head">
      <div>
        <span class="ey">BIAS & INDEPENDENCE RADAR</span>
        <strong>Structural Bias Index ${radar.biasIndex}</strong>
        <small>${esc(radar.recommendation)}</small>
      </div>
      <span class="tag ${radar.level === 'HIGH' ? 'bad' : radar.level === 'ELEVATED' ? 'warn' : radar.level === 'MODERATE' ? 'warn' : 'ok'}">${radar.level}</span>
    </div>
    <div class="bias-grid">
      ${dims.map(d => `
        <div class="bias-dim">
          <div class="bias-bar"><i style="width:${d.score}%;background:${d.score >= 60 ? 'var(--danger)' : d.score >= 35 ? 'var(--warn)' : 'var(--ok)'}"></i></div>
          <strong>${d.score}</strong>
          <small>${esc(d.label)}</small>
        </div>`).join('')}
    </div>
    <div class="actions">
      <button class="button ${isRedTeamMode(s) ? 'primary' : ''}" data-action="toggle-redteam">
        ${isRedTeamMode(s) ? '● Red Team Mode ON' : '○ Activate Red Team Mode'}
      </button>
    </div>`;
}

function renderRedTeam(s) {
  const p = $('redTeamPanel');
  if (!p) return;
  if (!isRedTeamMode(s)) {
    p.innerHTML = `<div class="row"><small>Red Team Mode is off. Activate it from the Bias Radar to force cognitive friction on gaps and unsupported claims.</small></div>`;
    return;
  }
  const pressure = buildRedTeamPressure(s);
  p.innerHTML = `
    <div class="challenge-head">
      <div>
        <h2>Red Team Pressure Board</h2>
        <div class="sub">${pressure.principle}</div>
      </div>
      <span class="tag bad">${pressure.highCount} HIGH · ${pressure.count} TOTAL</span>
    </div>
    <div class="challenge-principle">Cognitive friction is intentional. Resolve or explicitly accept each item before deciding.</div>
    ${pressure.items.map(item => `
      <div class="row">
        <div>
          <strong>${esc(item.title)}</strong>
          <small>${esc(item.message)}</small>
          <small>→ ${esc(item.action)}</small>
        </div>
        <span class="tag ${item.severity === 'high' ? 'bad' : 'warn'}">${esc(item.severity.toUpperCase())}</span>
      </div>`).join('') || '<div class="row"><small>No high-pressure items detected.</small></div>'}`;
}

function renderChallenge(s) {
  const p = $('challengeList');
  if (!p) return;
  const r = buildShadowInvestigation(s);
  const st = $('challengeStatus');
  if (st) {
    st.textContent = String(r.integrityStatus || 'REVIEW').replaceAll('_', ' ');
    st.className = `tag ${r.integrityStatus === 'HIGH_RISK' ? 'bad' : r.integrityStatus === 'REVIEW' ? 'warn' : 'ok'}`;
  }
  if ($('challengeHigh')) $('challengeHigh').textContent = r.highRiskCount || 0;
  if ($('challengeMedium')) $('challengeMedium').textContent = r.mediumRiskCount || 0;
  if ($('challengeTotal')) $('challengeTotal').textContent = (r.findingCount || 0) + (r.falsificationGaps?.length || 0);
  p.innerHTML = [
    ...(r.findings || []).slice(0, 8).map(f => `<div class="row"><div><strong>${esc(f.type)}</strong><small>${esc(f.message)}</small></div><span class="tag ${f.severity === 'high' ? 'bad' : 'warn'}">${esc(String(f.severity || 'review').toUpperCase())}</span></div>`),
    ...(r.falsificationGaps || []).slice(0, 4).map(g => `<div class="row"><div><strong>FALSIFICATION GAP</strong><small>${esc(g.message)}</small></div><span class="tag warn">CHALLENGE</span></div>`)
  ].join('') || '<div class="row"><small>No current challenge signals.</small></div>';
}

function renderDecision(s) {
  const p = $('decisionIntegrityList');
  if (!p) return;
  const ds = filterByActiveCase(s, 'decisions');
  if (!ds.length) {
    p.innerHTML = '<div class="row"><div><strong>No decision submitted</strong><small>Move from evidence to a decision only after testing alternatives.</small></div><span class="tag warn">STANDBY</span></div>';
    return;
  }
  const d = ds.at(-1), r = evaluateDecision(d, s);
  p.innerHTML = `<div class="row"><div><strong>${esc(d.title)}</strong><small>${esc(r.status)} · score ${r.score}/100 · ${r.blockingReasons.length} blocker(s)</small></div><span class="tag ${r.status === 'PASS' ? 'ok' : r.status === 'REVIEW' ? 'warn' : 'bad'}">${esc(r.status)}</span></div>`;
}

function renderMemory(s) {
  const m = memorySummary(s);
  if ($('memoryTotal')) $('memoryTotal').textContent = m.total || 0;
  if ($('memoryRecurring')) $('memoryRecurring').textContent = m.recurring || 0;
  const p = $('memoryList');
  if (!p) return;
  p.innerHTML = extractInstitutionalMemory(s).slice(0, 6).map(x => `<div class="row"><div><strong>${esc(x.type)}</strong><small>${esc(x.pattern)}</small></div><span class="tag">${x.caseCount > 1 ? 'RECURRING' : 'NEW'}</span></div>`).join('') || '<div class="row"><small>No reusable patterns yet.</small></div>';
}

function renderPre(s) {
  const p = $('preInvestigationList');
  if (!p) return;
  const activeId = getActiveCaseId(s);
  const activeCase = (s.cases || []).find(c => c.id === activeId) || s.cases.at(-1) || {};
  const b = recommendPreInvestigationChecks(activeCase, s);
  p.innerHTML = b.recommendedChecks.slice(0, 6).map(x => `<div class="row"><div><strong>${esc(x.title)}</strong><small>${esc(x.reason)}</small></div><span class="tag">${b.memoryDerived ? 'MEMORY' : 'BASELINE'}</span></div>`).join('') || '<div class="row"><small>No pre-investigation controls generated.</small></div>';
}

function renderLists(s) {
  const activeId = getActiveCaseId(s);
  const evidence = filterByActiveCase(s, 'evidence');
  const relationships = filterByActiveCase(s, 'relationships');
  const hypotheses = filterByActiveCase(s, 'hypotheses');
  const contradictions = filterByActiveCase(s, 'contradictions');

  const c = $('casesList');
  if (c) c.innerHTML = s.cases.map(x => `
    <article class="card data-card ${x.id === activeId ? 'focused' : ''}">
      <div class="row-head">
        <div>
          <strong>${esc(x.title)}</strong>
          <small>${esc(x.objective || 'Objective pending')}</small>
          <small>${esc(x.status)} · priority ${esc(x.priority)} · ${esc(x.id)}</small>
        </div>
        <span class="tag ${x.priority === 'high' ? 'bad' : x.priority === 'low' ? 'ok' : 'warn'}">${esc(String(x.priority).toUpperCase())}</span>
      </div>
      <div class="actions">
        <button class="button ${x.id === activeId ? 'primary' : ''}" data-focus-case="${esc(x.id)}">${x.id === activeId ? '● Focused' : 'Focus case'}</button>
      </div>
    </article>`).join('') || '<div class="empty"><strong>No investigations yet.</strong><small>Start with an objective, not a conclusion.</small><button class="button primary" data-action="new-case">Create first investigation</button></div>';

  const e = $('evidenceList');
  if (e) e.innerHTML = evidence.map(x => {
    const src = s.sources.find(z => z.id === x.sourceId);
    return `<article class="card data-card">
      <div class="row-head">
        <div>
          <strong>${esc(x.title)}</strong>
          <small>${esc(x.claim)}</small>
          <small>Source: ${esc(src?.name || 'Unknown')} · confidence ${pct(x.confidence)}% · ${esc(x.status)}</small>
        </div>
        <span class="tag ${x.humanVerified ? 'ok' : x.status === 'CONTESTED' ? 'bad' : 'warn'}">${x.humanVerified ? 'VERIFIED' : esc(x.status)}</span>
      </div>
      ${x.locator ? `<div class="locator">${esc(x.locator)}</div>` : ''}
    </article>`;
  }).join('') || '<div class="empty"><strong>No evidence captured.</strong><small>Every claim should carry a source and an uncertainty status.</small><button class="button primary" data-action="new-evidence">Add evidence</button></div>';

  const ent = $('entitiesList');
  if (ent) {
    ent.innerHTML = `
      <div class="graph-shell">
        <div class="graph-head">
          <div><strong>Living relationship graph</strong><small>${s.entities.length} entities · ${relationships.length} relationships</small></div>
          <div class="actions">
            <button class="button" data-action="new-entity">+ Entity</button>
            <button class="button" data-action="new-relationship">+ Relationship</button>
            <button class="button" data-action="fit-graph">Restart simulation</button>
          </div>
        </div>
        <div id="graphCanvas" class="graph-canvas"></div>
      </div>
      ${s.entities.map(x => `<article class="card data-card compact"><div class="row-head"><div><strong>${esc(x.name)}</strong><small>${esc(x.type)} · ${esc(x.id)}</small></div><span class="tag">ENTITY</span></div></article>`).join('')}
      ${relationships.length ? `<div class="relationship-list">${relationships.map(x => {
        const a = s.entities.find(z => z.id === x.fromEntityId);
        const b = s.entities.find(z => z.id === x.toEntityId);
        return `<div class="row"><div><strong>${esc(a?.name || '?')} → ${esc(b?.name || '?')}</strong><small>${esc(x.type)} · confidence ${pct(x.confidence)}% · ${esc(x.status)}</small></div><span class="tag warn">LINK</span></div>`;
      }).join('')}</div>` : '<div class="empty"><strong>No relationships yet.</strong><small>Connections should be supported by evidence, not proximity.</small></div>'}`;
  }

  const h = $('hypothesesList');
  if (h) h.innerHTML = hypotheses.map(x => `
    <article class="card data-card">
      <div class="row-head">
        <div>
          <strong>${esc(x.statement)}</strong>
          <small>Falsifier: ${esc(x.falsifier || 'Not defined')}</small>
          <small>${esc(x.status)} · confidence ${pct(x.confidence)}% ${x.falsifierTested ? '· tested' : ''}</small>
        </div>
        <span class="tag">${pct(x.confidence)}%</span>
      </div>
    </article>`).join('') || '<div class="empty"><strong>No hypotheses.</strong><small>Keep at least one alternative explanation alive when evidence is incomplete.</small><button class="button primary" data-action="new-hypothesis">Add hypothesis</button></div>';

  const co = $('contradictionsList');
  if (co) co.innerHTML = contradictions.map(x => `
    <article class="card data-card">
      <div class="row-head">
        <div>
          <strong>${esc(x.type)}</strong>
          <small>${esc(x.explanation || 'Analyst review required.')}</small>
          <small>${esc(x.status)} · ${esc(x.caseId)}</small>
        </div>
        <span class="tag ${x.severity === 'high' ? 'bad' : 'warn'}">${esc(String(x.severity || 'review').toUpperCase())}</span>
      </div>
    </article>`).join('') || '<div class="empty"><strong>No contradictions recorded.</strong><small>Run triage to actively search for conflicts instead of waiting for them.</small><button class="button primary" data-action="triage">Run triage</button></div>';
}

function renderTemporal(s) {
  const p = $('temporalIntegrityList');
  if (!p) return;
  const f = temporalAnalysis(s);
  if ($('temporalCount')) $('temporalCount').textContent = f.length;
  if ($('temporalStatus')) {
    $('temporalStatus').textContent = f.length ? 'REVIEW TIMELINE' : 'NO TEMPORAL SIGNAL';
    $('temporalStatus').className = `tag ${f.length ? 'warn' : 'ok'}`;
  }
  p.innerHTML = f.slice(0, 8).map(x => `<div class="row"><div><strong>${esc(String(x.type || '').replaceAll('_', ' '))}</strong><small>${esc(x.message)}</small><small>${esc(x.earlierDate)} → ${esc(x.laterDate)}</small></div><span class="tag warn">MEDIUM</span></div>`).join('') || '<div class="row"><small>No temporal discrepancies detected.</small></div>';
  const t = $('temporalTimeline');
  if (t) {
    const activeId = getActiveCaseId(s);
    t.innerHTML = buildTemporalTimeline(s, activeId).slice(0, 10).map(x => `<div class="row"><div><strong>${esc(x.title || 'Evidence')}</strong><small>${esc(x.date)} · ${esc(x.claim)}</small></div><span class="tag">${esc(x.status)}</span></div>`).join('') || '<div class="row"><small>No timeline entries yet.</small></div>';
  }
}

function renderMatrix(s) {
  const p = $('intelligenceMatrix');
  if (!p) return;
  const m = buildIntelligenceMatrix(s);
  const gap = m.gaps[0];
  p.innerHTML = `
    <div class="matrix-head">
      <div>
        <span class="ey">EVIDENCE INTELLIGENCE MATRIX</span>
        <strong>Integrity ${m.integrity}%</strong>
        <small>${m.counts.sources} sources · ${m.counts.evidence} evidence · ${m.counts.entities} entities · ${m.counts.relationships} links · ${m.counts.hypotheses} hypotheses · ${m.counts.contradictions} contradictions · ${m.counts.decisions} decisions</small>
      </div>
      <span class="tag ${m.integrity >= 75 ? 'ok' : m.integrity >= 45 ? 'warn' : 'bad'}">${gap ? esc(gap.code.replaceAll('_', ' ')) : 'BASELINE CLEAN'}</span>
    </div>
    <div class="matrix-flow">${['SOURCE', 'CLAIM', 'ENTITY', 'RELATIONSHIP', 'HYPOTHESIS', 'CONTRADICTION', 'FALSIFIER', 'DECISION'].map((x, i) => `<span class="matrix-step">${x}${i < 7 ? '<b>›</b>' : ''}</span>`).join('')}</div>
    <div class="matrix-gaps">${m.gaps.slice(0, 4).map(g => `<div class="row"><div><strong>${esc(g.code.replaceAll('_', ' '))}</strong><small>${esc(g.message)}</small></div><span class="tag ${g.severity === 'high' ? 'bad' : 'warn'}">${esc(g.severity.toUpperCase())}</span></div>`).join('') || '<div class="row"><small>No structural gaps detected.</small></div>'}</div>
    <div class="actions"><button class="button" data-action="refresh-matrix">Recalculate matrix</button></div>`;
}

function renderReports(s) {
  const p = $('reportPreview');
  if (!p) return;
  const m = calculateMetrics(s), r = buildShadowInvestigation(s), v = validateState(s), im = buildIntelligenceMatrix(s);
  p.innerHTML = `
    <div class="report-grid">
      <div><span class="ey">ASSESSMENT</span><strong>${s.cases.length ? 'Ready to draft' : 'Awaiting case'}</strong><small>${s.cases.length ? `Workspace contains ${s.evidence.length} evidence items and ${s.hypotheses.length} hypotheses.` : 'Create an investigation before producing an assessment.'}</small></div>
      <div><span class="ey">MATRIX</span><strong>${im.integrity}%</strong><small>Evidence intelligence integrity.</small></div>
      <div><span class="ey">CHALLENGE</span><strong>${r.findingCount || 0}</strong><small>${r.integrityStatus || 'REVIEW'} challenge findings.</small></div>
      <div><span class="ey">VALIDATION</span><strong>${v.valid ? 'PASS' : 'REVIEW'}</strong><small>${(v.errors || []).length} errors · ${(v.warnings || []).length} warnings.</small></div>
    </div>
    <div class="actions">
      <button class="button primary" data-action="create-report">Generate professional report</button>
      <button class="button" data-action="preview-json">Show sanitized export summary</button>
    </div>`;
}

function renderGovernance(s) {
  const p = $('governanceResult') || $('governanceList');
  if (!p) return;
  const v = validateState(s), pr = privacySummary(s);
  p.innerHTML = `
    <div class="governance-grid">
      <div><span class="ey">STATE</span><strong>${v.valid ? 'VALID' : 'REVIEW REQUIRED'}</strong><small>${(v.errors || []).length} errors · ${(v.warnings || []).length} warnings</small></div>
      <div><span class="ey">PRIVACY</span><strong>${esc(pr.status || 'LOCAL')}</strong><small>Browser-local state; exports are sanitized and secret-bearing fields are blocked.</small></div>
      <div><span class="ey">AUDIT</span><strong>${s.audit?.length || 0}</strong><small>Local creation/update events retained with case state.</small></div>
    </div>
    <div class="validation-list">${[...(v.errors || []), ...(v.warnings || [])].slice(0, 20).map(x => `<div class="row"><small>${esc(typeof x === 'string' ? x : JSON.stringify(x))}</small></div>`).join('') || '<div class="row"><small>No validation findings. Governance boundary is clean.</small></div>'}</div>`;
}

function render(s) {
  const m = calculateMetrics(s);
  [['cases', m.cases], ['evidence', m.evidence], ['hypotheses', m.hypotheses], ['contradictions', m.contradictions]].forEach(([k, v]) => {
    if ($(`metric-${k}`)) $(`metric-${k}`).textContent = String(v).padStart(2, '0');
  });
  if ($('verifiedPct')) $('verifiedPct').textContent = `${m.verifiedPct ?? m.verified ?? 0}%`;
  if ($('verifiedPctBar')) $('verifiedPctBar').style.width = `${m.verifiedPct ?? m.verified ?? 0}%`;
  if ($('corroboratedPct')) $('corroboratedPct').textContent = `${m.corroboratedPct ?? m.corroborated ?? 0}%`;
  if ($('corroboratedPctBar')) $('corroboratedPctBar').style.width = `${m.corroboratedPct ?? m.corroborated ?? 0}%`;
  if ($('aiPct')) $('aiPct').textContent = `${m.aiPct ?? m.aiAssisted ?? 0}%`;
  if ($('aiPctBar')) $('aiPctBar').style.width = `${m.aiPct ?? m.aiAssisted ?? 0}%`;

  if ($('caseList')) {
    $('caseList').innerHTML = s.cases.slice(-6).reverse().map(x => `
      <div class="row">
        <div><strong>${esc(x.title)}</strong><small>${esc(x.objective || 'Objective pending')}</small></div>
        <span class="tag ${x.priority === 'high' ? 'bad' : x.priority === 'low' ? 'ok' : 'warn'}">${esc(String(x.priority || 'medium').toUpperCase())}</span>
      </div>`).join('') || '<div class="row"><small>No investigations yet.</small></div>';
  }

  renderFocusStrip(s);
  renderBiasRadar(s);
  renderRedTeam(s);
  renderChallenge(s);
  renderDecision(s);
  renderMemory(s);
  renderPre(s);
  renderLists(s);
  renderTemporal(s);
  renderMatrix(s);
  renderReports(s);
  renderGovernance(s);
  // Living layer
  tickVisuals(s);
  try { renderLivingGraph(s); } catch (e) { console.warn('Living graph fallback', e); }
}

function runTriage() {
  const f = contradictionTriage(loadState());
  f.forEach(x => addRecord('contradictions', x));
  refresh();
  return f;
}

function createDecisionFromUI() {
  const s = loadState();
  const activeId = getActiveCaseId(s);
  if (!activeId) return alert('Create or focus a case first.');
  const title = prompt('Decision title');
  if (!title?.trim()) return;
  const statement = prompt('Decision statement');
  if (!statement?.trim()) return;
  addRecord('decisions', createDecision({
    caseId: activeId,
    title: title.trim(),
    statement: statement.trim(),
    rationale: 'Analyst-entered decision; review before approval.'
  }));
  refresh();
  showView('command');
}

function bind() {
  document.querySelectorAll('.nav button[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
  $('newCase')?.addEventListener('click', () => openModal('case'));
  $('modalClose')?.addEventListener('click', closeModal);
  $('modalCancel')?.addEventListener('click', closeModal);
  $('modalSave')?.addEventListener('click', saveModal);
  $('modal')?.addEventListener('click', e => { if (e.target === $('modal')) closeModal(); });

  document.addEventListener('click', e => {
    const focusBtn = e.target.closest('[data-focus-case]');
    if (focusBtn) {
      setActiveCase(focusBtn.dataset.focusCase);
      refresh();
      return;
    }
    const a = e.target.closest('[data-action]');
    if (!a) return;
    const act = a.dataset.action;
    if (act === 'new-case') openModal('case');
    if (act === 'new-evidence') openModal('evidence');
    if (act === 'new-entity') openModal('entity');
    if (act === 'new-hypothesis') openModal('hypothesis');
    if (act === 'new-relationship') openModal('relationship');
    if (act === 'triage') { runTriage(); showView('contradictions'); }
    if (act === 'create-report') report();
    if (act === 'preview-json') alert(JSON.stringify(sanitizeForExport(loadState()), null, 2).slice(0, 5000));
    if (act === 'fit-graph') { destroyGraph(); renderLivingGraph(loadState()); }
    if (act === 'refresh-matrix') renderMatrix(loadState());
    if (act === 'clear-focus') { setActiveCase(null); refresh(); }
    if (act === 'toggle-redteam') {
      setRedTeamMode(!isRedTeamMode());
      refresh();
    }
  });

  document.addEventListener('click', e => {
    const n = e.target.closest('.entity-node');
    if (!n) return;
    const id = n.dataset.entityId;
    const s = loadState();
    const ent = s.entities.find(x => x.id === id);
    if (ent) {
      const rels = (s.relationships || []).filter(r => r.fromEntityId === id || r.toEntityId === id);
      alert(`ENTITY\n${ent.name}\nType: ${ent.type}\nRelationships: ${rels.length}\nEvidence links: ${rels.reduce((a, r) => a + (r.evidenceIds || []).length, 0)}`);
    }
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      $('commandSearch')?.focus();
    }
    if (e.key === 'Escape') closeModal();
  });

  $('commandSearch')?.addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase();
    document.querySelectorAll('.data-card').forEach(c => {
      c.style.display = !q || c.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  window.addEventListener('hashchange', () => showView(location.hash.slice(1) || 'command'));

  $('audit')?.addEventListener('click', () => { runTriage(); showView('contradictions'); });
  $('challenge')?.addEventListener('click', () => { buildShadowInvestigation(loadState()); refresh(); });
  $('report')?.addEventListener('click', report);
  $('export')?.addEventListener('click', () => { try { exportCase(); } catch (err) { alert(err.message); } });
}

window.osintEnterprise = {
  getState: () => structuredClone(loadState()),
  validate: () => validateState(loadState()),
  privacy: () => privacySummary(loadState()),
  intelligence: () => buildIntelligenceMatrix(loadState()),
  biasRadar: () => computeBiasRadar(loadState()),
  redTeam: () => buildRedTeamPressure(loadState()),
  createCase: i => { const r = addRecord('cases', createCase(i)); refresh(); return r; },
  createDecisionFromUI,
  createProfessionalReport: report,
  triage: runTriage,
  shadowInvestigation: () => buildShadowInvestigation(loadState()),
  temporalAnalysis: () => temporalAnalysis(loadState()),
  temporalTimeline: id => buildTemporalTimeline(loadState(), id),
  exportCase,
  showView,
  setActiveCase,
  setRedTeamMode
};

function boot() {
  const s = loadState();
  seed(s);
  bind();
  showView(META[location.hash.slice(1)] ? location.hash.slice(1) : 'command');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
