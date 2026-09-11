/**
 * Graph UX behavior layer (UI only).
 * Enhances the living graph after visual-engine renders it:
 * - 1-hop focus
 * - edge hover tip
 * - keyboard-accessible nodes
 * - empty-state CTA when missing
 * Does not touch model/store/decision/privacy.
 */
(function occGraphUxBehavior() {
  const $ = (id) => document.getElementById(id);

  function ensureTip() {
    let tip = $('graphEdgeTip');
    if (tip) return tip;
    tip = document.createElement('div');
    tip.id = 'graphEdgeTip';
    tip.className = 'graph-edge-tip';
    tip.hidden = true;
    document.body.appendChild(tip);
    return tip;
  }

  function clearFocus(svg) {
    if (!svg) return;
    svg.classList.remove('is-focusing');
    svg.querySelectorAll('.living-node').forEach((n) => n.classList.remove('is-selected', 'is-neighbor'));
    svg.querySelectorAll('.edge').forEach((e) => e.classList.remove('is-connected', 'is-hovered'));
  }

  function selectNode(svg, id) {
    clearFocus(svg);
    const nodes = [...svg.querySelectorAll('.living-node')];
    const selected = nodes.find((n) => n.dataset.entityId === id);
    if (!selected) return;
    selected.classList.add('is-selected');
    svg.classList.add('is-focusing');
    const edges = [...svg.querySelectorAll('.edge')];
    edges.forEach((edge) => {
      if (edge.dataset.from === id || edge.dataset.to === id) {
        edge.classList.add('is-connected');
        const other = edge.dataset.from === id ? edge.dataset.to : edge.dataset.from;
        const n = nodes.find((x) => x.dataset.entityId === other);
        if (n) n.classList.add('is-neighbor');
      }
    });
    if (!edges.some((e) => e.dataset.from || e.dataset.to)) {
      const sel = selected.getAttribute('transform') || '';
      const m = /translate\(([^,]+),([^)]+)\)/.exec(sel);
      if (!m) return;
      const sx = parseFloat(m[1]);
      const sy = parseFloat(m[2]);
      edges.forEach((edge) => {
        const x1 = parseFloat(edge.getAttribute('x1'));
        const y1 = parseFloat(edge.getAttribute('y1'));
        const x2 = parseFloat(edge.getAttribute('x2'));
        const y2 = parseFloat(edge.getAttribute('y2'));
        const d1 = Math.hypot(x1 - sx, y1 - sy);
        const d2 = Math.hypot(x2 - sx, y2 - sy);
        if (d1 < 8 || d2 < 8) {
          edge.classList.add('is-connected');
          const ox = d1 < 8 ? x2 : x1;
          const oy = d1 < 8 ? y2 : y1;
          nodes.forEach((n) => {
            if (n === selected) return;
            const t = n.getAttribute('transform') || '';
            const tm = /translate\(([^,]+),([^)]+)\)/.exec(t);
            if (!tm) return;
            if (Math.hypot(parseFloat(tm[1]) - ox, parseFloat(tm[2]) - oy) < 8) n.classList.add('is-neighbor');
          });
        }
      });
    }
  }

  function enhanceEdges(svg) {
    const tip = ensureTip();
    svg.querySelectorAll('.edge').forEach((edge) => {
      if (edge.dataset.uxBound) return;
      edge.dataset.uxBound = '1';
      edge.style.pointerEvents = 'stroke';
      if (!edge.classList.contains('inferred') && !edge.classList.contains('supported') && !edge.classList.contains('unsupported')) edge.classList.add('unsupported');
      edge.addEventListener('pointerenter', (e) => {
        edge.classList.add('is-hovered');
        const kind = edge.classList.contains('supported') ? 'Evidence-backed' : edge.classList.contains('inferred') ? 'Inferred' : 'Unsupported';
        const confidence = Number(edge.dataset.confidence);
        const conf = Number.isFinite(confidence) ? ` · ${Math.round(confidence * 100)}% confidence` : '';
        tip.textContent = `${kind}${conf}`;
        tip.hidden = false;
        tip.classList.add('open');
        tip.style.left = `${e.clientX + 12}px`;
        tip.style.top = `${e.clientY + 12}px`;
      });
      edge.addEventListener('pointermove', (e) => {
        if (!tip.hidden) {
          tip.style.left = `${e.clientX + 12}px`;
          tip.style.top = `${e.clientY + 12}px`;
        }
      });
      edge.addEventListener('pointerleave', () => {
        edge.classList.remove('is-hovered');
        tip.hidden = true;
        tip.classList.remove('open');
      });
    });
  }

  function enhanceNodes(svg) {
    svg.querySelectorAll('.living-node').forEach((node) => {
      if (node.dataset.uxBound) return;
      node.dataset.uxBound = '1';
      if (!node.getAttribute('role')) node.setAttribute('role', 'button');
      if (!node.getAttribute('tabindex')) node.setAttribute('tabindex', '0');
      const activate = () => {
        const id = node.dataset.entityId;
        if (id) selectNode(svg, id);
      };
      node.addEventListener('click', activate);
      node.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        activate();
      });
    });
    if (svg.dataset.uxCanvasBound !== '1') {
      svg.dataset.uxCanvasBound = '1';
      svg.addEventListener('click', (event) => {
        if (event.target === svg || event.target.id === 'linkLayer' || event.target.id === 'nodeLayer') clearFocus(svg);
      });
    }
  }

  function enhanceEmpty(canvas) {
    const empty = canvas.querySelector('.graph-empty');
    if (!empty || empty.dataset.uxEnhanced) return;
    empty.dataset.uxEnhanced = '1';
    if (!empty.querySelector('[data-action]')) {
      const btn = document.createElement('button');
      btn.className = 'button primary';
      btn.dataset.action = 'new-entity';
      btn.textContent = '+ Entity';
      empty.appendChild(btn);
    }
  }

  function enhance() {
    const canvas = $('graphCanvas');
    if (!canvas) return;
    enhanceEmpty(canvas);
    const svg = canvas.querySelector('svg.living-svg') || $('livingSvg');
    if (!svg) return;
    enhanceNodes(svg);
    enhanceEdges(svg);
  }

  function boot() {
    const canvas = $('graphCanvas');
    if (canvas) {
      const observer = new MutationObserver(() => enhance());
      observer.observe(canvas, { childList: true, subtree: true });
    }
    enhance();
    window.addEventListener('occ:re-render', () => setTimeout(enhance, 50));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
