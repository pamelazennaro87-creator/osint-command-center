import { STATUS, clampConfidence } from './model.js';

export function validateEvidence(evidence, state = {}) {
  const errors = [];
  if (!evidence?.caseId || !state.cases?.some(c => c.id === evidence.caseId)) errors.push('Evidence must reference an existing case.');
  if (!evidence?.sourceId || !state.sources?.some(s => s.id === evidence.sourceId)) errors.push('Evidence must reference an existing source.');
  if (!evidence?.claim?.trim()) errors.push('Evidence claim is required.');
  if (clampConfidence(evidence.confidence) !== Number(evidence.confidence)) errors.push('Confidence must be between 0 and 1.');
  if (evidence.aiAssisted && evidence.status === STATUS.FACT) errors.push('AI-assisted evidence cannot be FACT without human verification.');
  return errors;
}

export function validateHypothesis(hypothesis, state = {}) {
  const errors = [];
  if (!hypothesis?.caseId || !state.cases?.some(c => c.id === hypothesis.caseId)) errors.push('Hypothesis must reference an existing case.');
  if (!hypothesis?.statement?.trim()) errors.push('Hypothesis statement is required.');
  if (!hypothesis?.falsifier?.trim()) errors.push('A falsifier/counter-narrative condition is required.');
  if (hypothesis.evidenceFor?.some(id => !state.evidence?.some(e => e.id === id))) errors.push('Supporting evidence contains an unknown ID.');
  if (hypothesis.evidenceAgainst?.some(id => !state.evidence?.some(e => e.id === id))) errors.push('Opposing evidence contains an unknown ID.');
  return errors;
}

export function validateDecision(decision, state = {}) {
  const errors = [];
  if (!decision?.caseId || !state.cases?.some(c => c.id === decision.caseId)) errors.push('Decision must reference an existing case.');
  if (!decision?.title?.trim()) errors.push('Decision title is required.');
  if (!decision?.statement?.trim()) errors.push('Decision statement is required.');
  if (decision.linkedHypothesisIds?.some(id => !state.hypotheses?.some(h => h.id === id))) errors.push('Decision contains an unknown hypothesis ID.');
  if (decision.state === 'approved' && !decision.rationale?.trim()) errors.push('Approved decisions require a rationale.');
  if (decision.state === 'approved' && !decision.riskAcceptance?.trim()) errors.push('Approved decisions require explicit risk acceptance.');
  return errors;
}

export function validateState(state) {
  const errors = [];
  const ids = new Set();
  for (const collection of ['cases','sources','evidence','entities','relationships','hypotheses','contradictions','decisions','audit']) {
    for (const record of state?.[collection] || []) {
      if (!record.id) errors.push(`${collection}: record without ID.`);
      else if (ids.has(record.id)) errors.push(`Duplicate ID: ${record.id}`);
      ids.add(record.id);
    }
  }
  for (const evidence of state?.evidence || []) errors.push(...validateEvidence(evidence,state));
  for (const hypothesis of state?.hypotheses || []) errors.push(...validateHypothesis(hypothesis,state));
  for (const decision of state?.decisions || []) errors.push(...validateDecision(decision,state));
  const result = [...new Set(errors)];
  Object.defineProperty(result, 'valid', { value: result.length === 0, enumerable: false });
  return result;
}
