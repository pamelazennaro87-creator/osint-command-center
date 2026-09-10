const clamp = value => Math.min(100, Math.max(0, Math.round(value)));

function arr(value) { return Array.isArray(value) ? value : []; }

/**
 * Signal Debt is the measurable burden created by unresolved uncertainty.
 * It is a triage metric, not a probability and never substitutes for evidence.
 */
export function calculateSignalDebt(state = {}) {
  const evidence = arr(state.evidence);
  const hypotheses = arr(state.hypotheses);
  const contradictions = arr(state.contradictions);
  const sources = arr(state.sources);
  const driftFindings = arr(state.driftFindings);

  const components = [];
  const add = (id, label, count, weight, reason) => {
    if (count > 0) components.push({ id, label, count, weight, points: count * weight, reason });
  };

  add('UNKNOWN_EVIDENCE', 'Unresolved evidence', evidence.filter(e => e.status === 'UNKNOWN').length, 4, 'Unknown evidence remains unresolved.');
  add('UNTESTED_FALSIFIER', 'Untested falsifiers', hypotheses.filter(h => h.falsifier?.trim() && h.falsifierTested !== true).length, 8, 'A hypothesis has a defined falsifier that has not been tested.');
  add('MISSING_FALSIFIER', 'Missing falsifiers', hypotheses.filter(h => !h.falsifier?.trim()).length, 10, 'A hypothesis cannot be challenged because no falsifier is defined.');
  add('OPEN_CONTRADICTION', 'Open contradictions', contradictions.filter(c => c.status === 'open').length, 7, 'An unresolved contradiction can distort the current narrative.');
  add('UNVERIFIED_AI', 'Unverified AI evidence', evidence.filter(e => e.aiAssisted && !e.humanVerified).length, 9, 'AI-assisted material has not received human verification.');
  add('SOURCE_METADATA_GAP', 'Source independence gaps', evidence.filter(e => e.sourceId && !sources.some(s => s.id === e.sourceId && String(s.independenceGroup || '').trim())).length, 5, 'Evidence points to a source without usable independence metadata.');
  add('HIGH_CONFIDENCE_UNKNOWN', 'Unsupported high confidence', hypotheses.filter(h => Number(h.confidence) >= .8 && !(h.evidenceFor || []).length).length, 10, 'High confidence exists without linked supporting evidence.');
  add('DRIFT_SIGNAL', 'Reasoning drift signals', driftFindings.filter(f => f.severity === 'high').length, 8, 'High-severity reasoning drift remains active.');

  const raw = components.reduce((sum, item) => sum + item.points, 0);
  const score = clamp(raw);
  const status = score >= 60 ? 'HIGH' : score >= 25 ? 'MEDIUM' : score > 0 ? 'LOW' : 'CLEAR';
  return {
    score,
    status,
    components,
    totalSignals: components.reduce((sum, item) => sum + item.count, 0),
    principle: 'Signal Debt measures unresolved analytical burden; it is not a confidence score and cannot establish truth.'
  };
}

export function assuranceSummary(state = {}) {
  const debt = calculateSignalDebt(state);
  return { score: debt.score, status: debt.status, totalSignals: debt.totalSignals };
}
