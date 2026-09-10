import { createCase, createDecision, createEntity, createEvidence, createHypothesis, createSource, now } from './model.js';
import { buildIntelligenceMatrix } from './intelligence.js';
import { buildDAID2 } from './daid2.js';

const clean = value => String(value ?? '').trim();
const unique = values => [...new Set(values.filter(Boolean))];

export function classifyTarget(target = '') {
  const value = clean(target);
  if (/^https?:\/\//i.test(value)) return 'url';
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return 'ip';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email';
  if (/^@?[A-Za-z0-9._-]{3,32}$/.test(value)) return 'username';
  return 'subject';
}

export function buildFalsifier(target, kind) {
  const t = clean(target) || 'the target';
  const noun = kind === 'url' ? 'the URL' : kind === 'email' ? 'the identity' : kind === 'ip' ? 'the infrastructure attribution' : 'the target relationship or identity';
  return `Independent, provenance-backed evidence shows that ${noun} is not attributable to ${t}, or establishes a materially incompatible explanation.`;
}

export function buildInvestigationPlan(state = {}, input = {}) {
  const target = clean(input.target);
  const objective = clean(input.objective) || `Determine what can and cannot be established about ${target || 'the target'}.`;
  const kind = input.kind || classifyTarget(target);
  const caseId = input.caseId || state.cases?.at(-1)?.id || '';
  const scopedEvidence = (state.evidence || []).filter(e => !caseId || e.caseId === caseId);
  const scopedHypotheses = (state.hypotheses || []).filter(h => !caseId || h.caseId === caseId);
  const scopedContradictions = (state.contradictions || []).filter(c => !caseId || c.caseId === caseId);
  const known = scopedEvidence.filter(e => e.status === 'FACT' && e.humanVerified).map(e => e.claim).filter(Boolean);
  const inferred = [...scopedEvidence.filter(e => e.status === 'INFERENCE').map(e => e.claim), ...scopedHypotheses.map(h => h.statement)].filter(Boolean);
  const unknown = [];
  if (!scopedEvidence.length) unknown.push('No source-backed evidence has been captured for this target.');
  if (scopedEvidence.some(e => !e.humanVerified)) unknown.push('At least one claim still requires human verification.');
  if (!scopedHypotheses.some(h => h.falsifier)) unknown.push('No explicit falsifier is currently recorded.');
  if (!scopedContradictions.length) unknown.push('No contradiction test has yet produced a recorded conflict; absence of conflict is not proof.');
  const next = scopedEvidence.length ? 'Add an independent source and test the strongest falsifier.' : 'Capture the first primary source with locator, original language and provenance.';
  return { target, objective, kind, caseId, known: unique(known), inferred: unique(inferred), unknown: unique(unknown), falsifier: buildFalsifier(target, kind), nextBestAction: next };
}

export function createInvestigationBundle(input = {}) {
  const target = clean(input.target);
  if (!target) throw new Error('Investigation target is required.');
  const objective = clean(input.objective) || `Determine what can and cannot be established about ${target}.`;
  const language = clean(input.language) || 'en';
  const timestamp = now();
  const c = createCase({ title: input.title || `Investigation: ${target}`, objective, investigationLanguage: language, searchLanguages: [language] });
  const source = createSource({ name: `Intake: ${target}`, type: 'intake', locator: target, url: /^https?:\/\//i.test(target) ? target : '', originalLanguage: language, provenance: 'Analyst-provided investigation target', capturedAt: timestamp });
  const entity = createEntity({ name: target, type: input.entityType || 'unknown' });
  const evidence = createEvidence({ caseId: c.id, sourceId: source.id, title: 'Investigation intake signal', claim: `Target received: ${target}`, originalText: target, originalLanguage: language, status: 'UNKNOWN', confidence: 0, locator: target, humanVerified: false, notes: 'Intake signal only. This is not proof of the target identity, ownership, relationship or allegation.' });
  const hypothesis = createHypothesis({ caseId: c.id, statement: `The investigation target ${target} can be substantiated by independent public evidence.`, evidenceFor: [], confidence: 0, falsifier: buildFalsifier(target, classifyTarget(target)) });
  const decision = createDecision({ caseId: c.id, title: 'Investigation gate', statement: 'Do not reach a substantive conclusion until evidence, independence and falsification have been tested.', state: 'draft', linkedHypothesisIds: [hypothesis.id], rationale: 'Initial gate created by the Investigation Loop.' });
  return { case: c, source, entity, evidence, hypothesis, decision };
}

export function runInvestigationLoop(state = {}, input = {}) {
  const plan = buildInvestigationPlan(state, input);
  const matrix = buildIntelligenceMatrix(state);
  const daid = buildDAID2(state, matrix);
  const missing = unique([...plan.unknown, ...(matrix.gaps || []).slice(0, 6).map(g => g.message)]);
  return {
    version: '1.0',
    generatedAt: now(),
    target: plan.target,
    kind: plan.kind,
    objective: plan.objective,
    stage: daid.mode,
    known: plan.known,
    inferred: plan.inferred,
    unknown: missing,
    falsifier: plan.falsifier,
    nextBestAction: daid.nextBestAction?.reason ? `${daid.nextBestAction.action}: ${daid.nextBestAction.reason}` : plan.nextBestAction,
    daid,
    integrity: matrix.integrity,
    gaps: matrix.gaps || [],
    decisionGate: { state: 'HOLD', reason: 'Investigation Loop will not convert intake or inference into verified evidence.' }
  };
}
