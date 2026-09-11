import { loadState } from './core/store.js';
import { privacySummary } from './core/privacy.js';
import { validateState } from './core/validation.js';

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
  const state = loadState();
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
