/* Graph behavior controller — UI-only. No model/store/privacy/decision mutations. */

const GRAPH_STATUS = Object.freeze({
  SUPPORTED: 'supported',
  INFERRED: 'inferred',
  UNSUPPORTED: 'unsupported'
});

function graphStatus(edge = {}) {
  const raw = String(edge.status || edge.certainty || edge.evidenceStatus || '').toLowerCase();
  if (['supported', 'verified', 'fact', 'confirmed'].includes(raw)) return GRAPH_STATUS.SUPPORTED;
  if (['inferred', 'inference', 'likely'].includes(raw)) return GRAPH_STATUS.INFERRED;
  return GRAPH_STATUS.UNSUPPORTED;
}

function edgeLabel(edge = {}) {
  const relation = edge.relation || edge.label || edge.type || 'relationship';
  const status = graphStatus(edge);
  return `${relation} · ${status}`;
}

export function installGraphBehavior(root = document) {
  const canvas = root.getElementById?.('graphCanvas');
  if (!canvas || canvas.dataset.graphBehaviorInstalled === 'true') return false;
  canvas.dataset.graphBehaviorInstalled = 'true';

  const focus = (node) => {
    const svg = canvas.querySelector('.living-svg');
    if (!svg || !node) return;
    svg.classList.add('is-focusing');
    canvas.querySelectorAll('.living-node').forEach((candidate) => {
      candidate.classList.toggle('is-selected', candidate === node);
      candidate.classList.toggle('is-neighbor', candidate !== node && (
        candidate.dataset.parentId === node.dataset.id ||
        candidate.dataset.connectedTo === node.dataset.id
      ));
    });
    canvas.dispatchEvent(new CustomEvent('graph:focus', { detail: { id: node.dataset.id || null } }));
  };

  canvas.addEventListener('click', (event) => {
    const node = event.target.closest?.('.living-node');
    if (node) focus(node);
  });

  canvas.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const node = event.target.closest?.('.living-node');
    if (!node) return;
    event.preventDefault();
    focus(node);
  });

  canvas.addEventListener('pointerover', (event) => {
    const edge = event.target.closest?.('.edge');
    if (!edge) return;
    const tip = root.querySelector('.graph-edge-tip') || document.createElement('div');
    tip.className = 'graph-edge-tip';
    tip.textContent = edge.dataset.edgeLabel || edge.getAttribute('aria-label') || 'Relationship';
    if (!tip.parentNode) root.body.appendChild(tip);
    const rect = edge.getBoundingClientRect();
    tip.style.left = `${Math.round(rect.left + rect.width / 2)}px`;
    tip.style.top = `${Math.round(rect.top - 30)}px`;
    tip.classList.add('open');
    edge.classList.add('is-hovered');
  });

  canvas.addEventListener('pointerout', (event) => {
    const edge = event.target.closest?.('.edge');
    if (!edge) return;
    edge.classList.remove('is-hovered');
    root.querySelector('.graph-edge-tip')?.classList.remove('open');
  });

  return true;
}

export { GRAPH_STATUS, graphStatus, edgeLabel };
