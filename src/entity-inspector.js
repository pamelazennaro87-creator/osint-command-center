/**
 * Entity Inspector — single source of truth
 * Opens from living graph nodes (.living-node[data-entity-id]).
 * No other module should create a competing inspector panel.
 */
import { loadState } from './core/store.js';

if (!window.__occEntityInspector) {
  window.__occEntityInspector = true;

  const style = document.createElement('style');
  style.textContent = `
    .occ-inspector{
      position:fixed; right:18px; top:18px; bottom:18px; z-index:880;
      width:min(390px, calc(100vw - 36px));
      border:1px solid #315d64; border-radius:18px;
      background:linear-gradient(160deg, rgba(12,23,29,.98), rgba(5,10,14,.99));
      box-shadow:0 28px 90px rgba(0,0,0,.62);
      transform:translateX(calc(100% + 30px));
      transition:transform .22s ease;
      overflow:auto;
      display:flex; flex-direction:column;
    }
    .occ-inspector.open{ transform:none; }
    .occ-inspector-head{
      position:sticky; top:0; display:flex; align-items:center; justify-content:space-between;
      gap:10px; padding:16px; border-bottom:1px solid var(--ui-border, #1b2a33);
      background:rgba(8,16,21,.94); backdrop-filter:blur(12px); z-index:2;
    }
    .occ-inspector-head small{
      display:block; color:var(--ui-accent, #62e6dc);
      font:8px ui-monospace, monospace; letter-spacing:.15em; text-transform:uppercase;
    }
    .occ-inspector-head strong{ display:block; margin-top:4px; font-size:16px; line-height:1.3; }
    .occ-inspector-close{
      width:34px; height:34px; flex-shrink:0;
      border:1px solid #29424a; border-radius:9px;
      background:#0b171d; color:#c9d7d9; cursor:pointer;
      font-size:16px; line-height:1;
    }
    .occ-inspector-close:hover{ border-color:#3a626b; background:#102129; }
    .occ-inspector-body{ padding:16px; display:grid; gap:12px; flex:1; }
    .occ-stat{
      padding:11px; border:1px solid #1b2a33; border-radius:11px; background:#091218;
    }
    .occ-stat span{
      display:block; font-size:8px; letter-spacing:.12em; color:#71858c; text-transform:uppercase;
    }
    .occ-stat b{
      display:block; margin-top:4px; font-size:11px; line-height:1.45; overflow-wrap:anywhere;
    }
    .occ-list{ display:grid; gap:7px; }
    .occ-list > strong{
      font-size:9px; letter-spacing:.12em; color:var(--ui-accent, #62e6dc); text-transform:uppercase;
    }
    .occ-list div{
      padding:9px; border-left:2px solid #2c5960; background:#0a151b;
      font-size:10px; line-height:1.45;
    }
    .occ-list small{ display:block; color:#71858c; margin-top:2px; }
    .occ-status-tag{
      display:inline-block; margin-top:3px; padding:2px 6px; border-radius:999px;
      font-size:8px; letter-spacing:.06em; border:1px solid #294750;
    }
    .occ-status-tag.FACT{ border-color:#2b5f59; color:#8fe9dc; }
    .occ-status-tag.INFERENCE{ border-color:#2a4a5a; color:#9ec9d4; }
    .occ-status-tag.ASSUMPTION{ border-color:#66532b; color:#ddc684; }
    .occ-status-tag.UNKNOWN{ border-color:#3a4a52; color:#9aa8ad; }
    .occ-status-tag.CONTESTED{ border-color:#633d42; color:#efa8aa; }
    .occ-selected{
      stroke:#9af5ee !important; stroke-width:2.5 !important; filter:url(#glow);
    }
    @media (max-width:720px){
      .occ-inspector{ right:10px; top:10px; bottom:10px; width:calc(100vw - 20px); }
    }
    @media (prefers-reduced-motion:reduce){
      .occ-inspector{ transition:none; }
    }
  `;
  document.head.appendChild(style);

  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  const panel = document.createElement('aside');
  panel.className = 'occ-inspector';
  panel.id = 'occEntityInspector';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('aria-labelledby', 'occInspectorTitle');
  panel.innerHTML = `
    <div class="occ-inspector-head">
      <div>
        <small>Entity intelligence</small>
        <strong id="occInspectorTitle">—</strong>
      </div>
      <button class="occ-inspector-close" type="button" aria-label="Close entity inspector">×</button>
    </div>
    <div class="occ-inspector-body" id="occInspectorBody"></div>
  `;
  document.body.appendChild(panel);

  let lastFocused = null;

  function close() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.living-node').forEach(n => n.classList.remove('occ-selected'));
    if (lastFocused && typeof lastFocused.focus === 'function') {
      try { lastFocused.focus(); } catch (_) {}
    }
    lastFocused = null;
  }

  function trapFocus(e) {
    if (e.key !== 'Tab' || !panel.classList.contains('open')) return;
    const focusable = [...panel.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(el => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function statusClass(status) {
    const s = String(status || 'UNKNOWN').toUpperCase();
    if (['FACT', 'INFERENCE', 'ASSUMPTION', 'UNKNOWN', 'CONTESTED'].includes(s)) return s;
    return 'UNKNOWN';
  }

  function open(entityId, node) {
    const state = loadState();
    const entity = (state.entities || []).find(e => e.id === entityId);
    if (!entity) return;

    lastFocused = document.activeElement;

    const rels = (state.relationships || []).filter(
      r => r.fromEntityId === entityId || r.toEntityId === entityId
    );
    const evidenceIds = new Set(rels.flatMap(r => r.evidenceIds || []));
    const evidence = (state.evidence || []).filter(
      e => evidenceIds.has(e.id) || (e.entityIds || []).includes(entityId)
    );
    const related = rels.map(r => {
      const otherId = r.fromEntityId === entityId ? r.toEntityId : r.fromEntityId;
      return { r, other: (state.entities || []).find(e => e.id === otherId) };
    }).filter(x => x.other);

    const avg = rels.length
      ? Math.round(rels.reduce((n, r) => n + (Number(r.confidence) || 0), 0) / rels.length * 100)
      : 0;

    document.querySelectorAll('.living-node').forEach(n => n.classList.remove('occ-selected'));
    if (node) node.classList.add('occ-selected');

    document.getElementById('occInspectorTitle').textContent = entity.name || 'Unknown entity';
    document.getElementById('occInspectorBody').innerHTML = `
      <div class="occ-stat"><span>Type</span><b>${esc(entity.type || 'unknown')}</b></div>
      <div class="occ-stat"><span>Network</span><b>${rels.length} relationships · mean confidence ${avg}%</b></div>
      <div class="occ-stat"><span>Linked evidence</span><b>${evidence.length} source-backed records</b></div>
      <div class="occ-list">
        <strong>Relationships</strong>
        ${related.length
          ? related.map(x => `
              <div>
                ${esc(x.r.type || 'associated_with')} → ${esc(x.other.name)}
                <small>
                  confidence ${Math.round((Number(x.r.confidence) || 0) * 100)}%
                  · ${x.r.evidenceIds?.length ? 'evidence-backed' : 'unsupported link'}
                </small>
              </div>`).join('')
          : '<div>No relationships recorded.</div>'}
      </div>
      <div class="occ-list">
        <strong>Evidence chain</strong>
        ${evidence.length
          ? evidence.map(e => `
              <div>
                ${esc(e.title || 'Untitled evidence')}
                <small>
                  <span class="occ-status-tag ${statusClass(e.status)}">${esc(e.status || 'UNKNOWN')}</span>
                  · confidence ${Math.round((Number(e.confidence) || 0) * 100)}%
                </small>
              </div>`).join('')
          : '<div>No evidence attached to this entity network.</div>'}
      </div>
    `;

    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    panel.querySelector('.occ-inspector-close')?.focus();
  }

  panel.querySelector('.occ-inspector-close').addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      e.preventDefault();
      close();
      return;
    }
    trapFocus(e);
  });

  document.addEventListener('click', e => {
    const node = e.target.closest?.('.living-node[data-entity-id]');
    if (!node) return;
    e.stopPropagation();
    open(node.dataset.entityId, node);
  });

  document.addEventListener('keydown', e => {
    const node = e.target.closest?.('.living-node[data-entity-id]');
    if (!node) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open(node.dataset.entityId, node);
    }
  });
}
