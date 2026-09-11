import { clearState, loadState } from './core/store.js';
import { privacySummary } from './core/privacy.js';
import { validateState } from './core/validation.js';

const DEMO_CASE_TITLE = 'Demo: entity relationship review';

function isDemoSeed(state) {
  return Array.isArray(state?.cases) && state.cases.length === 1 && state.cases[0]?.title === DEMO_CASE_TITLE &&
    Array.isArray(state?.sources) && state.sources.some(x => x?.name === 'Demo public source');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function renderError(message) {
  const existing = document.getElementById('appErrorToast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'appErrorToast';
  toast.setAttribute('role', 'alert');
  toast.className = 'app-error-toast';
  toast.innerHTML = `<strong>Workspace action failed</strong><small>${escapeHtml(message || 'Unknown application error')}</small>`;
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 7000);
}

function renderRuntime(state) {
  const privacy = privacySummary(state);
  const validation = validateState(state);
  const runtime = document.getElementById('runtimeStatus');
  const validationStatus = document.getElementById('validationStatus');

  if (runtime) {
    runtime.textContent = privacy.status === 'PASS'
      ? 'Local · privacy checks clear'
      : `Local · privacy ${String(privacy.status || 'REVIEW').toLowerCase()}`;
  }

  if (validationStatus) {
    validationStatus.textContent = validation.valid ? 'VALID' : `${validation.length} ISSUE${validation.length === 1 ? '' : 'S'}`;
    validationStatus.className = `tag ${validation.valid ? 'ok' : 'warn'}`;
    validationStatus.title = validation.valid ? 'State validation passed.' : validation.join(' ');
  }
}

function harden() {
  let state = loadState();

  // Production workspace must never silently populate itself with synthetic investigative data.
  if (isDemoSeed(state)) {
    clearState();
    state = loadState();
    window.dispatchEvent(new CustomEvent('occ:re-render'));
  }

  // Expose only aggregate runtime health; never expose raw records or identifiers.
  renderRuntime(state);

  window.addEventListener('error', event => {
    if (event?.error) renderError(event.error.message);
  });
  window.addEventListener('unhandledrejection', event => {
    renderError(event?.reason?.message || event?.reason || 'Unhandled application error');
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', harden, { once: true });
else harden();
