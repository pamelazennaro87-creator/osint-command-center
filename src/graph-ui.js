import { loadState } from './core/store.js';

const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const pct = v => Math.round(Math.max(0, Math.min(1, Number(v) || 0)) * 100);

function ensureInspector() {
  if ($('entityInspector')) return $('entityInspector');
  const p = document.createElement('aside');
  p.id = 'entityInspector';
  p.className = 'entity-inspector';
  p.setAttribute('aria-live', 'polite');
  p.innerHTML = '<button class="x" type="button" aria-label="Close entity inspector">×</button><div class="ey">ENTITY INSPECTOR</div><h3 id="inspectorName"></h3><div id="inspectorBody"></div>';
  document.body.appendChild(p);
  p.querySelector('.x').addEventListener('click', () => p.classList.remove('open'));
  return p;
}

function inspectEntity(id) {
  const state = loadState();
  const entity = (state.entities || []).find(x => x.id === id);
  if (!entity) return;
  const inspector = ensureInspector();
  const relationships = (state.relationships || []).filter(r => r.fromEntityId === id || r.toEntityId === id);
  const relationshipIds = new Set(relationships.map(r => r.id));
  const evidenceIds = new Set(relationships.flatMap(r => r.evidenceIds || []));
  const directEvidence = (state.evidence || []).filter(e => evidenceIds.has(e.id));
  const sources = new Set(directEvidence.map(e => e.sourceId).filter(Boolean));
  const relatedEntities = relationships.map(r => {
    const otherId = r.fromEntityId === id ? r.toEntityId : r.fromEntityId;
    return state.entities.find(e => e.id === otherId)?.name;
  }).filter(Boolean);

  $('inspectorName').textContent = entity.name || 'Unnamed entity';
  $('inspectorBody').innerHTML = `<div class="ins-grid"><div><small>Type</small><strong>${esc(entity.type || 'unknown')}</strong></div><div><small>Relationships</small><strong>${relationships.length}</strong></div><div><small>Evidence</small><strong>${directEvidence.length}</strong></div><div><small>Sources</small><strong>${sources.size}</strong></div></div><div class="loop-action"><strong>LINKED ENTITIES</strong><small>${esc(relatedEntities.join(' · ') || 'None recorded')}</small></div><div class="loop-action"><strong>EVIDENCE FOOTPRINT</strong>${directEvidence.slice(0, 6).map(e => `<small>${esc(e.title || 'Evidence')} · ${esc(e.status || 'UNKNOWN')} · ${pct(e.confidence)}%</small>`).join('') || '<small>No relationship-linked evidence. This node is not proof of a relationship.</small>'}</div>`;
  inspector.classList.add('open');
}

function bind() {
  if (window.__occGraphInspectorBound) return;
  window.__occGraphInspectorBound = true;
  const activate = event => {
    const node = event.target.closest?.('.entity-node[data-entity-id]');
    if (node) inspectEntity(node.dataset.entityId);
  };
  document.addEventListener('click', activate);
  document.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.closest?.('.entity-node[data-entity-id]')) {
      event.preventDefault();
      inspectEntity(event.target.closest('.entity-node[data-entity-id]').dataset.entityId);
    }
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
}
