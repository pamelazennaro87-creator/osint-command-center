/* Runtime action bridge: makes dynamic controls resolve to one stable command path. */
(function () {
  if (window.__occActionBridge) return;
  window.__occActionBridge = true;
  let replaying = false;
  const route = {
    'new-case': ['command', '#newCase'],
    'new-evidence': ['evidence', '[data-action="new-evidence"]'],
    'new-entity': ['entities', '[data-action="new-entity"]'],
    'new-relationship': ['entities', '[data-action="new-relationship"]'],
    'new-hypothesis': ['hypotheses', '[data-action="new-hypothesis"]'],
    'triage': ['contradictions', '[data-action="triage"]'],
    'create-report': ['reports', '[data-action="create-report"]'],
    'preview-json': ['reports', '[data-action="preview-json"]']
  };
  function replay(selector, view) {
    if (view && window.osintEnterprise?.showView) window.osintEnterprise.showView(view);
    const button = document.querySelector(selector);
    if (!button) throw new Error(`Action target unavailable: ${selector}`);
    replaying = true;
    try { button.click(); } finally { replaying = false; }
  }
  function run(action) {
    if (action === 'clear-focus') {
      window.osintEnterprise?.setActiveCase?.(null);
      window.osintEnterprise?.showView?.(location.hash.slice(1) || 'command');
      return true;
    }
    if (action === 'toggle-redteam') {
      const state = window.osintEnterprise?.getState?.();
      if (!state || !window.osintEnterprise?.setRedTeamMode) throw new Error('Runtime command API unavailable.');
      window.osintEnterprise.setRedTeamMode(!Boolean(state.meta?.redTeamMode));
      window.osintEnterprise.showView(location.hash.slice(1) || 'command');
      return true;
    }
    if (action === 'fit-graph') {
      window.osintEnterprise?.showView?.('entities');
      return true;
    }
    if (action === 'export-case') {
      window.osintEnterprise?.exportCase?.();
      return true;
    }
    if (action === 'run-triage') {
      window.osintEnterprise?.triage?.();
      window.osintEnterprise?.showView?.('contradictions');
      return true;
    }
    const target = route[action];
    if (!target) return false;
    replay(target[1], target[0]);
    return true;
  }
  document.addEventListener('click', event => {
    if (replaying) return;
    const control = event.target?.closest?.('[data-action]');
    if (!control) return;
    const action = control.dataset.action;
    if (!action) return;
    try {
      if (!run(action)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    } catch (error) {
      console.error('[OCC action bridge]', action, error);
    }
  }, true);
})();
