const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, Number(n) || 0));

export const DAID_VERSION = '2.0';
export const DAID_TERMS = Object.freeze({
  BRIDGEWORD: 'Bridgeword',
  FAILURE_SIGNATURE: 'Failure Signature',
  REPAIR_MODE: 'Repair Mode',
  INTENT_ENVELOPE: 'Intent Envelope',
  UNCERTAINTY_ETIQUETTE: 'Uncertainty Etiquette',
  ARTIFICIAL_RESPONSE_DRIFT: 'Artificial Response Drift',
  ASSURANCE_FEEDBACK: 'Assurance Feedback',
  COGNITIVE_SYNCING: 'Cognitive Syncing',
  DATA_GRAVITY: 'Data Gravity',
  GENERALIZATION_MIRAGE: 'Generalization Mirage',
  SIGNAL_DEBT: 'Signal Debt',
  PATTERN_OVERSHOOT: 'Pattern Overshoot',
  TRIAGE_INTELLIGENCE: 'Triage Intelligence'
});

function unique(values) { return [...new Set(values.filter(Boolean))]; }

export function buildDAID2(state = {}, matrix = null) {
  const m = matrix || {};
  const counts = m.counts || {};
  const gaps = Array.isArray(m.gaps) ? m.gaps : [];
  const evidence = Array.isArray(state.evidence) ? state.evidence : [];
  const hypotheses = Array.isArray(state.hypotheses) ? state.hypotheses : [];
  const contradictions = Array.isArray(state.contradictions) ? state.contradictions : [];
  const decisions = Array.isArray(state.decisions) ? state.decisions : [];

  const unresolved = gaps.length + contradictions.filter(x => String(x.status || '').toUpperCase() !== 'RESOLVED').length;
  const verifiedRatio = evidence.length ? evidence.filter(x => x.humanVerified === true).length / evidence.length : 0;
  const falsifierRatio = hypotheses.length ? hypotheses.filter(x => x.falsifierTested === true).length / hypotheses.length : 0;
  const contradictionPressure = clamp(contradictions.length / Math.max(1, evidence.length));
  const signalDebt = clamp((gaps.length + Math.max(0, hypotheses.length - evidence.length)) / Math.max(1, evidence.length + hypotheses.length + 1));
  const integrity = clamp((Number(m.integrity) || 0) / 100);

  const failureSignatures = [];
  if (!evidence.length) failureSignatures.push('NO_EVIDENCE');
  if (gaps.some(g => g.code === 'SOURCE_DEPENDENCY')) failureSignatures.push('SOURCE_DEPENDENCY');
  if (gaps.some(g => g.code === 'UNTESTED_FALSIFIER')) failureSignatures.push('UNTESTED_FALSIFIER');
  if (gaps.some(g => g.code === 'OPEN_CONTRADICTION') || contradictions.some(x => String(x.status).toUpperCase() !== 'RESOLVED')) failureSignatures.push('OPEN_CONTRADICTION');
  if (gaps.some(g => g.code === 'DECISION_GAP')) failureSignatures.push('DECISION_GAP');
  if (hypotheses.length > 0 && falsifierRatio === 0) failureSignatures.push('PATTERN_OVERSHOOT_RISK');
  if (evidence.length >= 3 && verifiedRatio === 0) failureSignatures.push('VERIFICATION_DEBT');

  const repairModes = [];
  if (!evidence.length) repairModes.push({ action: 'CAPTURE_EVIDENCE', reason: 'No evidence exists to support an analytical claim.' });
  if (evidence.length && verifiedRatio < 0.5) repairModes.push({ action: 'VERIFY_EVIDENCE', reason: 'Unverified evidence is limiting confidence propagation.' });
  if (gaps.some(g => g.code === 'SOURCE_DEPENDENCY')) repairModes.push({ action: 'SEEK_INDEPENDENT_ORIGIN', reason: 'Repeated sources may share one origin.' });
  if (gaps.some(g => g.code === 'UNTESTED_FALSIFIER')) repairModes.push({ action: 'TEST_FALSIFIER', reason: 'A live hypothesis lacks an adversarial test.' });
  if (contradictionPressure > 0) repairModes.push({ action: 'TRIAGE_CONTRADICTION', reason: 'Conflicting signals require explicit resolution.' });
  if (!decisions.length && evidence.length) repairModes.push({ action: 'DEFER_DECISION', reason: 'Evidence exists, but the decision layer is not yet populated.' });

  let mode = 'OBSERVE';
  if (failureSignatures.includes('NO_EVIDENCE')) mode = 'REPAIR';
  else if (failureSignatures.includes('OPEN_CONTRADICTION') || failureSignatures.includes('SOURCE_DEPENDENCY')) mode = 'CHALLENGE';
  else if (failureSignatures.includes('UNTESTED_FALSIFIER') || signalDebt > 0.35) mode = 'TEST';
  else if (integrity >= 0.75 && falsifierRatio >= 0.5) mode = 'DECIDE';

  const next = repairModes[0] || { action: 'RUN_TRIAGE', reason: 'No blocking repair signal; challenge the current interpretation before advancing.' };
  const uncertainty = integrity < 0.45 ? 'HIGH' : integrity < 0.75 ? 'MEDIUM' : 'LOW';

  return {
    version: DAID_VERSION,
    mode,
    uncertainty,
    intentEnvelope: { objective: state.cases?.at(-1)?.objective || 'No explicit investigation objective.', bounded: Boolean(state.cases?.at(-1)?.objective) },
    bridgeword: next.action,
    failureSignatures: unique(failureSignatures),
    repairModes,
    signalDebt: Math.round(signalDebt * 100),
    patternOvershootRisk: Math.round(clamp((1 - falsifierRatio) * 0.7 + contradictionPressure * 0.3) * 100),
    artificialResponseDrift: Math.round(clamp((1 - verifiedRatio) * 0.6 + signalDebt * 0.4) * 100),
    cognitiveSync: Math.round(clamp(integrity * 0.55 + verifiedRatio * 0.25 + falsifierRatio * 0.20) * 100),
    assuranceFeedback: { verifiedRatio: Math.round(verifiedRatio * 100), falsifierRatio: Math.round(falsifierRatio * 100), unresolvedSignals: unresolved },
    nextBestAction: next,
    principle: 'AI may accelerate reasoning; it may not silently upgrade uncertainty into evidence.',
    counts
  };
}

export function daid2PromptEnvelope(analysis) {
  return {
    intent: analysis?.intentEnvelope || {},
    mode: analysis?.mode || 'OBSERVE',
    uncertainty: analysis?.uncertainty || 'HIGH',
    constraints: ['Do not invent evidence', 'Separate observation from inference', 'Expose unresolved contradictions', 'State what would falsify the hypothesis'],
    requiredOutput: ['KNOWN', 'INFERRED', 'UNKNOWN', 'NEXT BEST ACTION']
  };
}
