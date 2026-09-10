export const GATE_STATUS = Object.freeze(['PASS', 'REVIEW', 'BLOCKED']);

const findingTypes = new Set(['AI_GUARDRAIL', 'SOURCE_DEPENDENCY', 'CONFIDENCE_DRIFT', 'CLAIM_CONFLICT', 'OPPOSITION_GAP']);

function check(id, label, status, message) {
  return { id, label, status, message };
}

export function evaluateDecision(decision, state = {}) {
  const evaluatedAt = new Date().toISOString();
  const checks = [];
  const blockingReasons = [];
  const warnings = [];

  const current = decision || {};
  const cases = Array.isArray(state.cases) ? state.cases : [];
  const hypotheses = Array.isArray(state.hypotheses) ? state.hypotheses : [];
  const evidence = Array.isArray(state.evidence) ? state.evidence : [];
  const sources = Array.isArray(state.sources) ? state.sources : [];
  const contradictions = Array.isArray(state.contradictions) ? state.contradictions : [];

  const caseExists = cases.some(c => c.id === current.caseId);
  checks.push(check('CASE_EXISTS', 'Case exists', caseExists ? 'PASS' : 'BLOCKED', caseExists ? 'Referenced case exists.' : 'Decision references a missing case.'));
  if (!caseExists) blockingReasons.push('Referenced case does not exist.');

  const linked = hypotheses.filter(h => (current.linkedHypothesisIds || []).includes(h.id));
  const hypothesesLinked = linked.length > 0;
  checks.push(check('HYPOTHESES_LINKED', 'Hypotheses linked', hypothesesLinked ? 'PASS' : 'BLOCKED', hypothesesLinked ? `${linked.length} hypothesis/hypotheses linked.` : 'No hypotheses are linked to the decision.'));
  if (!hypothesesLinked) blockingReasons.push('Decision has no linked hypothesis.');

  const supportIds = [...new Set(linked.flatMap(h => h.evidenceFor || []))];
  const support = evidence.filter(e => supportIds.includes(e.id));
  const supportingEvidence = support.length > 0;
  checks.push(check('SUPPORTING_EVIDENCE', 'Supporting evidence', supportingEvidence ? 'PASS' : 'BLOCKED', supportingEvidence ? `${support.length} supporting evidence item(s) linked.` : 'No supporting evidence is linked through the selected hypotheses.'));
  if (!supportingEvidence) blockingReasons.push('No supporting evidence is linked to the decision.');

  const falsifierDefined = linked.length > 0 && linked.every(h => Boolean(h.falsifier?.trim()));
  checks.push(check('FALSIFIER_DEFINED', 'Falsifier defined', falsifierDefined ? 'PASS' : 'BLOCKED', falsifierDefined ? 'Every linked hypothesis has a falsifier.' : 'At least one linked hypothesis lacks a falsifier.'));
  if (!falsifierDefined) blockingReasons.push('A linked hypothesis has no falsifier/counter-narrative condition.');

  const falsifierTested = linked.length > 0 && linked.every(h => h.falsifierTested === true && ['supported', 'failed', 'inconclusive'].includes(String(h.falsifierResult || '').toLowerCase()));
  checks.push(check('FALSIFIER_TESTED', 'Falsifier tested', falsifierTested ? 'PASS' : 'BLOCKED', falsifierTested ? 'Falsifier testing is recorded for every linked hypothesis.' : 'Falsifier testing is missing or incomplete.'));
  if (!falsifierTested) blockingReasons.push('Falsifier testing is missing or incomplete.');

  const oppositionConsidered = linked.length > 0 && linked.every(h => (h.evidenceAgainst || []).length > 0);
  checks.push(check('OPPOSING_EVIDENCE', 'Opposing evidence considered', oppositionConsidered ? 'PASS' : 'REVIEW', oppositionConsidered ? 'Every linked hypothesis has opposing evidence recorded.' : 'One or more linked hypotheses have no opposing evidence recorded.'));
  if (!oppositionConsidered) warnings.push('Opposing evidence is incomplete; analyst review is required.');

  const openHigh = contradictions.filter(c => c.caseId === current.caseId && c.status === 'open' && c.severity === 'high');
  const contradictionsResolved = openHigh.length === 0;
  checks.push(check('CONTRADICTIONS_RESOLVED', 'High-severity contradictions resolved', contradictionsResolved ? 'PASS' : 'BLOCKED', contradictionsResolved ? 'No open high-severity contradiction remains.' : `${openHigh.length} open high-severity contradiction(s) remain.`));
  if (!contradictionsResolved) blockingReasons.push('Open high-severity contradictions remain.');

  const sourceIds = [...new Set(support.map(e => e.sourceId).filter(Boolean))];
  const groups = new Set(sources.filter(s => sourceIds.includes(s.id)).map(s => s.independenceGroup).filter(Boolean));
  const sourceIndependence = support.length === 0 || groups.size >= Math.min(2, support.length);
  checks.push(check('SOURCE_INDEPENDENCE', 'Independent source coverage', sourceIndependence ? 'PASS' : 'REVIEW', sourceIndependence ? 'Supporting evidence has sufficient source independence for the current sample.' : 'Supporting evidence is concentrated in one independence group.'));
  if (!sourceIndependence) warnings.push('Source independence is weak.');

  const confidenceAligned = linked.length > 0 && linked.every(h => {
    const vals = support.filter(e => (h.evidenceFor || []).includes(e.id)).map(e => Number(e.confidence)).filter(Number.isFinite);
    return vals.length === 0 || Number(h.confidence) <= Math.max(...vals) + 0.05;
  });
  checks.push(check('CONFIDENCE_ALIGNED', 'Confidence aligned with evidence', confidenceAligned ? 'PASS' : 'BLOCKED', confidenceAligned ? 'Hypothesis confidence is not materially above supporting evidence.' : 'At least one hypothesis is materially more confident than its supporting evidence.'));
  if (!confidenceAligned) blockingReasons.push('Confidence exceeds the strength of supporting evidence.');

  const aiGuardrail = support.some(e => e.aiAssisted && !e.humanVerified);
  checks.push(check('AI_GUARDRAIL', 'AI evidence verified', aiGuardrail ? 'BLOCKED' : 'PASS', aiGuardrail ? 'AI-assisted supporting evidence lacks human verification.' : 'No unverified AI-assisted supporting evidence detected.'));
  if (aiGuardrail) blockingReasons.push('Unverified AI-assisted evidence supports the decision.');

  const criticalFindings = (state.driftFindings || []).filter(f => findingTypes.has(f.type) && f.severity === 'high');
  if (criticalFindings.length) {
    checks.push(check('DRIFT_CLEAR', 'Critical reasoning drift clear', 'BLOCKED', `${criticalFindings.length} high-severity drift signal(s) supplied to the gate.`));
    blockingReasons.push('High-severity reasoning drift is present.');
  } else {
    checks.push(check('DRIFT_CLEAR', 'Critical reasoning drift clear', 'PASS', 'No supplied high-severity reasoning drift signal remains.'));
  }

  const rationalePresent = Boolean(current.rationale?.trim());
  checks.push(check('RATIONALE_PRESENT', 'Decision rationale', rationalePresent ? 'PASS' : 'BLOCKED', rationalePresent ? 'Rationale is recorded.' : 'Decision rationale is missing.'));
  if (!rationalePresent) blockingReasons.push('Decision rationale is missing.');

  const riskAccepted = Boolean(current.riskAcceptance?.trim());
  checks.push(check('RISK_ACCEPTED', 'Risk acceptance', riskAccepted ? 'PASS' : 'REVIEW', riskAccepted ? 'Residual risk acceptance is recorded.' : 'Residual risk acceptance is not recorded.'));
  if (!riskAccepted) warnings.push('Residual risk acceptance is not recorded.');

  const status = blockingReasons.length ? 'BLOCKED' : warnings.length ? 'REVIEW' : 'PASS';
  const score = Math.max(0, Math.round(100 - blockingReasons.length * 15 - warnings.length * 5));
  return { status, score, evaluatedAt, checks, blockingReasons: [...new Set(blockingReasons)], warnings: [...new Set(warnings)] };
}
