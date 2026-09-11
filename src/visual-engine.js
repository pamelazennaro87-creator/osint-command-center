/**
 * Living Visual Engine
 * Makes the workspace feel alive: force-directed graph, ambient atmosphere
 * driven by Bias Index, pulse signals, and Red Team cognitive pressure overlay.
 */

import { loadState, getActiveCaseId, filterByActiveCase, isRedTeamMode } from './core/store.js';
import { computeBiasRadar } from './core/bias-radar.js';
import { buildShadowInvestigation } from './core/drift.js';
import { buildIntelligenceMatrix } from './core/intelligence.js';

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

/* ─── Ambient Atmosphere ─────────────────────────────────────────────── */
export function applyAtmosphere(state = loadState()) {
  const radar = computeBiasRadar(state);
  const root = document.documentElement;
  const level = radar.level;

  // Color temperature shifts with structural risk
  const hue =
    level === 'HIGH'     ? 0 :     // cold red
    level === 'ELEVATED' ? 28 :    // amber
    level === 'MODERATE' ? 160 :   // teal-green
                           175;    // clean cyan

  root.style.setProperty('--atm-hue', hue);
  root.style.setProperty('--bias-index', radar.biasIndex);
  root.style.setProperty('--atm-intensity', Math.min(1, radar.biasIndex / 80));

  document.body.classList.toggle('atm-high', level === 'HIGH');
  document.body.classList.toggle('atm-elevated', level === 'ELEVATED');
  document.body.classList.toggle('atm-moderate', level === 'MODERATE');
  document.body.classList.toggle('atm-low', level === 'LOW');
  document.body.classList.toggle('redteam-active', isRedTeamMode(state));

  // Runtime status pulse
  const status = $('runtimeStatus');
  if (status) {
    status.textContent = isRedTeamMode(state)
      ? `● RED TEAM ACTIVE · Bias ${radar.biasIndex}`
      : `Local workspace · Bias Index ${radar.biasIndex} (${level})`;
  }
}

/* ─── Signal Board (real data) ───────────────────────────────────────── */
export function renderLivingSignals(state = loadState()) {
  const matrix = buildIntelligenceMatrix(state);
  const shadow = buildShadowInvestigation(state);
  const radar = computeBiasRadar(state);
  const evidence = filterByActiveCase(state, 'evidence');
  const hypotheses = filterByActiveCase(state, 'hypotheses');
  const verified = evidence.filter(e => e.humanVerified || e.status === 'FACT').length;

  const know = verified
    ? { title: `${verified} verified claims`, body: `${evidence.length} total evidence items under active case.` }
    : { title: evidence.length ? 'Claims exist but unverified' : 'No evidence yet', body: 'Start by capturing source-backed observations.' };

  const think = hypotheses.length
    ? { title: `${hypotheses.length} competing hypotheses`, body: hypotheses[0]?.statement?.slice(0, 90) || 'Active explanations present.' }
    : { title: 'No competing explanations', body: 'Create at least one alternative hypothesis.' };

  const wrong = (shadow.falsificationGaps?.length || 0) + (shadow.highRiskCount || 0)
    ? { title: `${(shadow.falsificationGaps?.length || 0) + (shadow.highRiskCount || 0)} falsification pressures`, body: 'Shadow investigation has active challenge signals.' }
    : { title: 'Falsifiers relatively clean', body: 'Still test every leading claim.' };

  const next = radar.recommendation || matrix.nextAction || 'Continue structured intake.';
  const missing = matrix.gaps[0]
    ? { title: matrix.gaps[0].code.replaceAll('_', ' '), body: matrix.gaps[0].message }
    : { title: 'No structural gap flagged', body: 'Matrix baseline is currently clean.' };

  setSignal('know', know);
  setSignal('think', think);
  setSignal('wrong', wrong);
  setSignal('next', { title: 'Recommended move', body: next });
  setSignal('missing', missing);
}

function setSignal(key, data) {
  const t = $(`signal-${key}-title`);
  const b = $(`signal-${key}-body`);
  if (t) t.textContent = data.title;
  if (b) b.textContent = data.body;
}

/* ─── Force-Directed Living Graph ────────────────────────────────────── */
let sim = null;
let raf = null;

export function destroyGraph() {
  if (raf) cancelAnimationFrame(raf);
  raf = null;
  sim = null;
}

export function renderLivingGraph(state = loadState()) {
  const canvas = $('graphCanvas');
  if (!canvas) return;

  const entities = state.entities || [];
  const relationships = filterByActiveCase(state, 'relationships') || [];

  if (!entities.length) {
    destroyGraph();
    canvas.innerHTML = '<div class="graph-empty living">No entities yet. Add people, organisations or assets to activate the living graph.</div>';
    return;
  }

  // Limit for performance
  const nodes = entities.slice(0, 24).map(e => ({
    id: e.id,
    name: e.name || '?',
    type: e.type || 'unknown',
    x: Math.random() * 800 + 60,
    y: Math.random() * 280 + 40,
    vx: 0, vy: 0,
    radius: 16
  }));

  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const links = relationships
    .filter(r => nodeMap.has(r.fromEntityId) && nodeMap.has(r.toEntityId))
    .map(r => ({
      source: nodeMap.get(r.fromEntityId),
      target: nodeMap.get(r.toEntityId),
      supported: (r.evidenceIds || []).length > 0,
      confidence: Number(r.confidence) || 0.4
    }));

  // Degree → radius
  links.forEach(l => {
    l.source.radius = Math.min(28, l.source.radius + 2.2);
    l.target.radius = Math.min(28, l.target.radius + 2.2);
  });

  const W = 920, H = 340;
  canvas.innerHTML = `<svg id="livingSvg" viewBox="0 0 ${W} ${H}" class="living-svg">
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="nodeGrad" cx="35%" cy="30%"><stop offset="0%" stop-color="#1a4a52"/><stop offset="100%" stop-color="#0a2228"/></radialGradient>
    </defs>
    <g id="linkLayer"></g>
    <g id="nodeLayer"></g>
  </svg>
  <div class="graph-legend living">
    <span class="pulse-dot"></span> Living force graph
    <span class="supported">— Evidence-backed</span>
    <span class="unsupported">— Unsupported claim</span>
    <span>Drag nodes · click to inspect</span>
  </div>`;

  const svg = $('livingSvg');
  const linkLayer = $('linkLayer');
  const nodeLayer = $('nodeLayer');

  // Create DOM elements once
  const linkEls = links.map(l => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('edge', l.supported ? 'supported' : 'unsupported');
    line.setAttribute('stroke-width', 1.2 + l.confidence * 1.6);
    linkLayer.appendChild(line);
    return { el: line, link: l };
  });

  const nodeEls = nodes.map(n => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('entity-node', 'living-node');
    g.dataset.entityId = n.id;
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', n.radius);
    circle.classList.add('node');
    circle.setAttribute('filter', 'url(#glow)');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dy', '0.35em');
    text.textContent = n.name.slice(0, 12);

    g.appendChild(circle);
    g.appendChild(text);
    nodeLayer.appendChild(g);
    return { el: g, circle, text, node: n };
  });

  // Simple force simulation
  const alphaTarget = 0.015;
  let alpha = 1;

  function tick() {
    alpha += (alphaTarget - alpha) * 0.04;

    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (1800 / (dist * dist)) * alpha;
        dx = (dx / dist) * force;
        dy = (dy / dist) * force;
        a.vx -= dx; a.vy -= dy;
        b.vx += dx; b.vy += dy;
      }
    }

    // Link spring
    links.forEach(l => {
      const dx = l.target.x - l.source.x;
      const dy = l.target.y - l.source.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ideal = 110;
      const force = (dist - ideal) * 0.012 * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      l.source.vx += fx; l.source.vy += fy;
      l.target.vx -= fx; l.target.vy -= fy;
    });

    // Center gravity + damping
    nodes.forEach(n => {
      n.vx += (W / 2 - n.x) * 0.0018 * alpha;
      n.vy += (H / 2 - n.y) * 0.0018 * alpha;
      n.vx *= 0.86;
      n.vy *= 0.86;
      n.x += n.vx;
      n.y += n.vy;
      // Soft bounds
      n.x = Math.max(30, Math.min(W - 30, n.x));
      n.y = Math.max(24, Math.min(H - 24, n.y));
    });

    // Update DOM
    linkEls.forEach(({ el, link }) => {
      el.setAttribute('x1', link.source.x);
      el.setAttribute('y1', link.source.y);
      el.setAttribute('x2', link.target.x);
      el.setAttribute('y2', link.target.y);
    });
    nodeEls.forEach(({ el, circle, text, node }) => {
      el.setAttribute('transform', `translate(${node.x},${node.y})`);
      circle.setAttribute('r', node.radius);
    });

    raf = requestAnimationFrame(tick);
  }

  // Drag support
  let dragging = null;
  nodeEls.forEach(({ el, node }) => {
    el.addEventListener('pointerdown', e => {
      e.preventDefault();
      dragging = node;
      el.setPointerCapture(e.pointerId);
      alpha = 0.4;
    });
    el.addEventListener('pointermove', e => {
      if (!dragging || dragging !== node) return;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const ctm = svg.getScreenCTM().inverse();
      const loc = pt.matrixTransform(ctm);
      node.x = loc.x; node.y = loc.y;
      node.vx = 0; node.vy = 0;
    });
    el.addEventListener('pointerup', () => { dragging = null; });
    el.addEventListener('pointercancel', () => { dragging = null; });
  });

  destroyGraph();
  sim = { nodes, links };
  raf = requestAnimationFrame(tick);
}

/* ─── Next Actions (dynamic) ─────────────────────────────────────────── */
export function renderNextActions(state = loadState()) {
  const list = $('nextActionsList');
  if (!list) return;
  const radar = computeBiasRadar(state);
  const matrix = buildIntelligenceMatrix(state);
  const shadow = buildShadowInvestigation(state);
  const evidence = filterByActiveCase(state, 'evidence');
  const hypotheses = filterByActiveCase(state, 'hypotheses');

  const actions = [];

  if (!state.cases.length) {
    actions.push({ rank: '01', title: 'Create first investigation', body: 'Define an objective before collecting claims.', action: 'new-case' });
  } else if (!evidence.length) {
    actions.push({ rank: '01', title: 'Capture first evidence', body: 'Every claim needs a source and an uncertainty status.', action: 'new-evidence' });
  } else if (!hypotheses.length) {
    actions.push({ rank: '01', title: 'Write a competing hypothesis', body: 'Keep at least one alternative explanation alive.', action: 'new-hypothesis' });
  }

  if (radar.dimensions.untestedPressure.score >= 40) {
    actions.push({ rank: String(actions.length + 1).padStart(2, '0'), title: 'Define & test falsifiers', body: 'High untested-falsifier pressure detected.', action: 'new-hypothesis' });
  }
  if (radar.dimensions.monoCulture.score >= 50) {
    actions.push({ rank: String(actions.length + 1).padStart(2, '0'), title: 'Diversify independence groups', body: 'Evidence is concentrated in too few origin groups.', action: 'new-evidence' });
  }
  if (shadow.highRiskCount > 0) {
    actions.push({ rank: String(actions.length + 1).padStart(2, '0'), title: 'Run / review shadow investigation', body: `${shadow.highRiskCount} high-risk drift signals are active.`, action: 'triage' });
  }
  if (matrix.gaps.some(g => g.code === 'UNSUPPORTED_LINK')) {
    actions.push({ rank: String(actions.length + 1).padStart(2, '0'), title: 'Attach evidence to relationships', body: 'Graph edges without evidence are claims, not facts.', action: 'new-relationship' });
  }

  if (!actions.length) {
    actions.push({ rank: '01', title: 'Maintain adversarial discipline', body: 'Structural pressure is currently manageable. Keep testing alternatives.', action: null });
  }

  list.innerHTML = actions.slice(0, 4).map(a => `
    <div class="next-action">
      <div>
        <strong>${esc(a.title)}</strong>
        <small>${esc(a.body)}</small>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="action-rank">${a.rank}</span>
        ${a.action ? `<button class="button" data-action="${esc(a.action)}">Do it</button>` : ''}
      </div>
    </div>`).join('');
}

/* ─── Public tick ────────────────────────────────────────────────────── */
export function tickVisuals(state = loadState()) {
  applyAtmosphere(state);
  renderLivingSignals(state);
  renderNextActions(state);
  // Graph is heavier — only re-render when structure changes or on explicit call
}
