import { loadState } from './core/store.js';

if (!window.__occEntityInspector) {
  window.__occEntityInspector = true;
  const style = document.createElement('style');
  style.textContent = `
    .occ-inspector{position:fixed;right:18px;top:18px;bottom:18px;z-index:880;width:min(390px,calc(100vw - 36px));border:1px solid #315d64;border-radius:18px;background:linear-gradient(160deg,rgba(12,23,29,.98),rgba(5,10,14,.99));box-shadow:0 28px 90px rgba(0,0,0,.62);transform:translateX(calc(100% + 30px));transition:transform .22s ease;overflow:auto}.occ-inspector.open{transform:none}.occ-inspector-head{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px;border-bottom:1px solid var(--ui-border);background:rgba(8,16,21,.92);backdrop-filter:blur(12px);z-index:2}.occ-inspector-head small{display:block;color:var(--ui-accent);font:8px ui-monospace,monospace;letter-spacing:.15em;text-transform:uppercase}.occ-inspector-head strong{display:block;margin-top:4px;font-size:16px}.occ-inspector-close{width:34px;height:34px;border:1px solid #29424a;border-radius:9px;background:#0b171d;color:#c9d7d9;cursor:pointer}.occ-inspector-body{padding:16px;display:grid;gap:12px}.occ-stat{padding:11px;border:1px solid #1b2a33;border-radius:11px;background:#091218}.occ-stat span{display:block;font-size:8px;letter-spacing:.12em;color:#71858c;text-transform:uppercase}.occ-stat b{display:block;margin-top:4px;font-size:11px;line-height:1.45;overflow-wrap:anywhere}.occ-list{display:grid;gap:7px}.occ-list>strong{font-size:9px;letter-spacing:.12em;color:var(--ui-accent);text-transform:uppercase}.occ-list div{padding:9px;border-left:2px solid #2c5960;background:#0a151b;font-size:10px;line-height:1.45}.occ-list small{display:block;color:#71858c;margin-top:2px}.occ-selected{stroke:#9af5ee!important;stroke-width:2.5!important;filter:url(#glow)}@media(max-width:720px){.occ-inspector{right:10px;top:10px;bottom:10px;width:calc(100vw - 20px)}}@media(prefers-reduced-motion:reduce){.occ-inspector{transition:none}}
  `;
  document.head.appendChild(style);

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const panel = document.createElement('aside');
  panel.className = 'occ-inspector';
  panel.setAttribute('aria-hidden','true');
  panel.innerHTML = `<div class="occ-inspector-head"><div><small>Entity intelligence</small><strong id="occInspectorTitle">—</strong></div><button class="occ-inspector-close" type="button" aria-label="Close entity inspector">×</button></div><div class="occ-inspector-body" id="occInspectorBody"></div>`;
  document.body.appendChild(panel);

  function close(){
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden','true');
    document.querySelectorAll('.living-node').forEach(n => n.classList.remove('occ-selected'));
  }

  function open(entityId,node){
    const state = loadState();
    const entity = (state.entities || []).find(e => e.id === entityId);
    if (!entity) return;
    const rels = (state.relationships || []).filter(r => r.fromEntityId === entityId || r.toEntityId === entityId);
    const evidenceIds = new Set(rels.flatMap(r => r.evidenceIds || []));
    const evidence = (state.evidence || []).filter(e => evidenceIds.has(e.id));
    const related = rels.map(r => {
      const otherId = r.fromEntityId === entityId ? r.toEntityId : r.fromEntityId;
      return { r, other: (state.entities || []).find(e => e.id === otherId) };
    }).filter(x => x.other);
    const avg = rels.length ? Math.round(rels.reduce((n,r) => n + (Number(r.confidence) || 0), 0) / rels.length * 100) : 0;

    document.querySelectorAll('.living-node').forEach(n => n.classList.remove('occ-selected'));
    node?.classList.add('occ-selected');
    document.getElementById('occInspectorTitle').textContent = entity.name || 'Unknown entity';
    document.getElementById('occInspectorBody').innerHTML = `
      <div class="occ-stat"><span>Type</span><b>${esc(entity.type || 'unknown')}</b></div>
      <div class="occ-stat"><span>Network</span><b>${rels.length} relationships · mean confidence ${avg}%</b></div>
      <div class="occ-stat"><span>Linked evidence</span><b>${evidence.length} source-backed records</b></div>
      <div class="occ-list"><strong>Relationships</strong>${related.length ? related.map(x => `<div>${esc(x.r.type || 'associated_with')} → ${esc(x.other.name)}<small>confidence ${Math.round((Number(x.r.confidence) || 0) * 100)}% · ${x.r.evidenceIds?.length ? 'evidence-backed' : 'unsupported link'}</small></div>`).join('') : '<div>No relationships recorded.</div>'}</div>
      <div class="occ-list"><strong>Evidence chain</strong>${evidence.length ? evidence.map(e => `<div>${esc(e.title)}<small>${esc(e.status || 'UNKNOWN')} · confidence ${Math.round((Number(e.confidence) || 0) * 100)}%</small></div>`).join('') : '<div>No evidence attached to this entity network.</div>'}</div>`;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden','false');
  }

  panel.querySelector('.occ-inspector-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
  document.addEventListener('click', e => {
    const node = e.target.closest?.('.living-node');
    if (node?.dataset.entityId) open(node.dataset.entityId, node);
  });
}
