import { clearState, loadState } from './core/store.js';
import { privacySummary } from './core/privacy.js';

const DEMO_CASE_TITLE = 'Demo: entity relationship review';

function isDemoSeed(state) {
  return Array.isArray(state?.cases) && state.cases.length === 1 && state.cases[0]?.title === DEMO_CASE_TITLE &&
    Array.isArray(state?.sources) && state.sources.some(x => x?.name === 'Demo public source');
}

function renderError(message) {
  const existing = document.getElementById('appErrorToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'appErrorToast';
  toast.setAttribute('role', 'alert');
  toast.className = 'app-error-toast';
  toast.innerHTML = `<strong>Workspace action failed</strong><small>${String(message || 'Unknown application error').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]))}</small>`;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 7000);
}

function harden() {
  const state = loadState();

  // Production workspace must never silently populate itself with synthetic investigative data.
  if (isDemoSeed(state)) {
    clearState();
    window.dispatchEvent(new CustomEvent('occ:re-render'));
  }

  // Keep privacy state observable without exposing raw records or identifiers.
  const privacy = privacySummary(loadState());
  const status = document.getElementById('runtimeStatus');
  if (status) {
    status.textContent = privacy.status === 'PASS' ? 'Local · privacy checks clear' : `Local · privacy ${privacy.status.toLowerCase()}`;
  }

  window.addEventListener('error', event => {
    if (event?.error) renderError(event.error.message);
  });
  window.addEventListener('unhandledrejection', event => {
    renderError(event?.reason?.message || event?.reason || 'Unhandled application error');
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', harden, { once: true });
else harden();
