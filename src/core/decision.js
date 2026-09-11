import { detectReasoningDrift } from './drift.js';

export const GATE_STATUS = Object.freeze(['PASS', 'REVIEW', 'BLOCKED']);

const findingTypes = new Set(['AI_GUARDRAIL', 'SOURCE_DEPENDENCY', 'CONFIDENCE_DRIFT', 'CLAIM_CONFLICT', 'OPPOSITION_GAP']);
const VALID_FALSIFIER_RESULTS = new Set(['supported', 'failed', 'inconclusive', 'not_triggered', 'triggered', 'disproved']);
const VALID_DECISION_STATES = new Set(['draft', 'review', 'approved', 'rejected', 'superseded']);
const VALID_FALSIFIER_PROVENANCE = new Set(['ANALYST_DECLARED', 'EVIDENCE_BACKED']);

function check(id, label, status, message) { return { id, label, status, message }; }

export function evaluateDecision(decision, state = {}) {
  const evaluatedAt = new Date().toISOString();
  const checks = [], blockingReasons = [], warnings = [];
  const current = decision || {};
  const cases = Array.isArray(state.cases) ? state.cases : [];
  const hypotheses = Array.isArray(state.hypotheses) ? state.hypotheses : [];
  const evidence = Array.isArray(state.evidence) ? state.evidence : [];
  const sources = Array.isArray(state.sources) ? state.sources : [];
  const contradictions = Array.isArray(state.contradictions) ? state.contradictions : [];
  const driftFindings = Array.isArray(state.driftFindings) ? state.driftFindings : detectReasoningDrift(state);

  const caseExists = cases.some(c => c.id === current.caseId);
  checks.push(check('CASE_EXISTS', 'Case exists', caseExists ? 'PASS' : 'BLOCKED', caseExists ? 'Referenced case exists.' : 'Decision references a missing case.'));
  if (!caseExists) blockingReasons.push('Referenced case does not exist.');

  const linked = hypotheses.filter(h => (current.linkedHypothesisIds || []).includes(h.id));
  checks.push(check('HYPOTHESES_LINKED', 'Hypotheses linked', linked.length ? 'PASS' : 'BLOCKED', linked.length ? `${linked.length} hypothesis/hypotheses linked.` : 'No hypotheses are linked to the decision.'));
  if (!linked.length) blockingReasons.push('Decision has no linked hypothesis.');

  const supportIds = [...new Set(linked.flatMap(h => h.evidenceFor || []))];
  const support = evidence.filter(e => supportIds.includes(e.id));
  checks.push(check('SUPPORTING_EVIDENCE', 'Supporting evidence', support.length ? 'PASS' : 'BLOCKED', support.length ? `${support.length} supporting evidence item(s) linked.` : 'No supporting evidence is linked through the selected hypotheses.'));
  if (!support.length) blockingReasons.push('No supporting evidence is linked to the decision.');

  const falsifierDefined = linked.length > 0 && linked.every(h => Boolean(h.falsifier?.trim()));
  checks.push(check('FALSIFIER_DEFINED', 'Falsifier defined', falsifierDefined ? 'PASS' : 'BLOCKED', falsifierDefined ? 'Every linked hypothesis has a falsifier.' : 'At least one linked hypothesis lacks a falsifier.'));
  if (!falsifierDefined) blockingReasons.push('A linked hypothesis has no falsifier/counter-narrative condition.');

  const falsifierTested = linked.length > 0 && linked.every(h => h.falsifierTested === true && VALID_FALSIFIER_RESULTS.has(String(h.falsifierResult || '').toLowerCase()));
  const provenanceValid = linked.length > 0 && linked.every(h => {
    const test = h.falsifierTest || {};
    const methodValid = String(test.method || '').trim().length >= 3;
    const noteValid = String(test.note || '').trim().length >= 3;
    const testedAtValid = Boolean(test.testedAt);
    const evidenceIds = Array.isArray(test.evidenceIds) ? test.evidenceIds : [];
    const linkedTestEvidence = evidenceIds.filter(id => evidence.some(e => e.id === id));
    return VALID_FALSIFIER_PROVENANCE.has(test.provenance) && methodValid && noteValid && testedAtValid && test.provenance === 'EVIDENCE_BACKED' && linkedTestEvidence.length > 0;
  });
  const falsifierIntegrity = falsifierTested && provenanceValid;
  checks.push(check('FALSIFIER_TESTED', 'Falsifier tested', falsifierIntegrity ? 'PASS' : 'BLOCKED', falsifierIntegrity ? 'Falsifier testing is recorded with evidence-backed provenance for every linked hypothesis.' : 'Falsifier testing must include method, note, timestamp and at least one linked evidence item; analyst declaration alone is insufficient for approval.'));
  if (!falsifierIntegrity) blockingReasons.push('Falsifier testing lacks evidence-backed provenance.');

  const oppositionConsidered = linked.length > 0 && linked.every(h => (h.evidenceAgainst || []).length > 0);
  checks.push(check('OPPOSING_EVIDENCE', 'Opposing evidence considered', oppositionConsidered ? 'PASS' : 'REVIEW', oppositionConsidered ? 'Every linked hypothesis has opposing evidence recorded.' : 'One or more linked hypotheses have no opposing evidence recorded.'));
  if (!oppositionConsidered) warnings.push('Opposing evidence is incomplete; analyst review is required.');

  const openHigh = contradictions.filter(c => c.caseId === current.caseId && c.status === 'open' && c.severity === 'high');
  checks.push(check('CONTRADICTIONS_RESOLVED', 'High-severity contradictions resolved', openHigh.length ? 'BLOCKED' : 'PASS', openHigh.length ? `${openHigh.length} open high-severity contradiction(s) remain.` : 'No open high-severity contradiction remains.'));
  if (openHigh.length) blockingReasons.push('Open high-severity contradictions remain.');

  const sourceIds = [...new Set(support.map(e => e.sourceId).filter(Boolean))];
  const supportingSources = sources.filter(s => sourceIds.includes(s.id));
  const missingIndependenceMetadata = supportingSources.some(s => !String(s.independenceGroup || '').trim());
  const groups = new Set(supportingSources.map(s => String(s.independenceGroup || '').trim()).filter(Boolean));
  const independentCoverage = support.length > 0 && groups.size >= Math.min(2, support.length);
  const sourceIndependence = support.length === 0 ? 'REVIEW' : missingIndependenceMetadata || !independentCoverage ? 'REVIEW' : 'PASS';
  const sourceMessage = support.length === 0
    ? 'No supporting source coverage is available.'
    : missingIndependenceMetadata
      ? 'One or more supporting sources lack independence-group metadata; independence cannot be established.'
      : independentCoverage
        ? 'Supporting evidence has sufficient source independence for the current sample.'
        : 'Supporting evidence is concentrated in one independence group.';
  checks.push(check('SOURCE_INDEPENDENCE', 'Independent source coverage', sourceIndependence, sourceMessage));
  if (sourceIndependence === 'REVIEW') warnings.push(missingIndependenceMetadata ? 'Source independence metadata is incomplete.' : 'Source independence is weak.');

  const confidenceAligned = linked.length > 0 && linked.every(h => {
    const vals = support.filter(e => (h.evidenceFor || []).includes(e.id)).map(e => Number(e.confidence)).filter(Number.isFinite);
    return vals.length === 0 || Number(h.confidence) <= Math.max(...vals) + 0.05;
  });
  checks.push(check('CONFIDENCE_ALIGNED', 'Confidence aligned with evidence', confidenceAligned ? 'PASS' : 'BLOCKED', confidenceAligned ? 'Hypothesis confidence is not materially above supporting evidence.' : 'At least one hypothesis is materially more confident than its supporting evidence.'));
  if (!confidenceAligned) blockingReasons.push('Confidence exceeds the strength of supporting evidence.');

  const aiGuardrail = support.some(e => e.aiAssisted && !e.humanVerified);
  checks.push(check('AI_GUARDRAIL', 'AI evidence verified', aiGuardrail ? 'BLOCKED' : 'PASS', aiGuardrail ? 'AI-assisted supporting evidence lacks human verification.' : 'No unverified AI-assisted supporting evidence detected.'));
  if (aiGuardrail) blockingReasons.push('Unverified AI-assisted evidence supports the decision.');

  const caseDrift = driftFindings.filter(f => !f.caseId || f.caseId === current.caseId);
  const criticalFindings = caseDrift.filter(f => findingTypes.has(f.type) && f.severity === 'high');
  checks.push(check('DRIFT_CLEAR', 'Critical reasoning drift clear', criticalFindings.length ? 'BLOCKED' : 'PASS', criticalFindings.length ? `${criticalFindings.length} high-severity drift signal(s) detected by the gate.` : 'No high-severity reasoning drift signal remains.'));
  if (criticalFindings.length) blockingReasons.push('High-severity reasoning drift is present.');

  const rationalePresent = Boolean(current.rationale?.trim());
  checks.push(check('RATIONALE_PRESENT', 'Decision rationale', rationalePresent ? 'PASS' : 'BLOCKED', rationalePresent ? 'Rationale is recorded.' : 'Decision rationale is missing.'));
  if (!rationalePresent) blockingReasons.push('Decision rationale is missing.');

  const riskAccepted = Boolean(current.riskAcceptance?.trim());
  checks.push(check('RISK_ACCEPTED', 'Risk acceptance', riskAccepted ? 'PASS' : 'REVIEW', riskAccepted ? 'Residual risk acceptance is recorded.' : 'Residual risk acceptance is not recorded.'));
  if (!riskAccepted) warnings.push('Residual risk acceptance is not recorded.');

  const preApprovalStatus = blockingReasons.length ? 'BLOCKED' : warnings.length ? 'REVIEW' : 'PASS';
  const approvalConflict = current.state === 'approved' && preApprovalStatus !== 'PASS';
  checks.push(check('APPROVAL_ELIGIBILITY', 'Approval eligibility', approvalConflict ? 'BLOCKED' : 'PASS', approvalConflict ? `Decision is marked approved but the integrity gate is ${preApprovalStatus}.` : 'Decision state is compatible with the current integrity result.'));
  if (approvalConflict) blockingReasons.push(`Approved state is not permitted while the integrity gate is ${preApprovalStatus}.`);

  const status = blockingReasons.length ? 'BLOCKED' : warnings.length ? 'REVIEW' : 'PASS';
  const score = Math.max(0, Math.round(100 - blockingReasons.length * 15 - warnings.length * 5));
  return {
    status,
    approvalEligible: status === 'PASS',
    score,
    evaluatedAt,
    checks,
    blockingReasons: [...new Set(blockingReasons)],
    warnings: [...new Set(warnings)]
  };
}

export function transitionDecision(decision, nextState, state = {}) {
  const target = String(nextState || '').toLowerCase();
  if (!VALID_DECISION_STATES.has(target)) throw new Error(`Invalid decision state: ${nextState}`);
  const current = decision || {};
  if (target === 'approved') {
    const gate = evaluateDecision({ ...current, state: 'review' }, state);
    if (gate.status !== 'PASS') {
      throw new Error(`Decision approval blocked by integrity gate: ${gate.status}. ${gate.blockingReasons.join(' ')}`);
    }
  }
  return { ...current, state: target, updatedAt: new Date().toISOString() };
}
