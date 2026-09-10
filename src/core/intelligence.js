const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));

/**
 * Evidence Intelligence Matrix.
 * Pure derivation layer: it never mutates the workspace and only follows
 * explicit IDs already present in the local state.
 */
export function buildIntelligenceMatrix(state = {}) {
  const sources = state.sources || [];
  const evidence = state.evidence || [];
  const entities = state.entities || [];
  const relationships = state.relationships || [];
  const hypotheses = state.hypotheses || [];
  const contradictions = state.contradictions || [];
  const decisions = state.decisions || [];

  const sourceById = new Map(sources.map(x => [x.id, x]));
  const evidenceById = new Map(evidence.map(x => [x.id, x]));
  const entityById = new Map(entities.map(x => [x.id, x]));
  const hypothesisById = new Map(hypotheses.map(x => [x.id, x]));

  const sourceScore = src => clamp01(src?.reliability ?? .5);
  const evidenceScore = ev => {
    const base = clamp01(ev?.confidence);
    const verification = ev?.humanVerified ? 1 : ev?.status === 'FACT' ? .85 : ev?.status === 'CONTESTED' ? .25 : .55;
    return clamp01(base * .65 + verification * .35);
  };

  const evidenceLinks = evidence.map(ev => {
    const source = sourceById.get(ev.sourceId);
    const score = clamp01(evidenceScore(ev) * (.65 + sourceScore(source) * .35));
    return { type:'EVIDENCE', id:ev.id, label:ev.title, status:ev.status, confidence:score, sourceId:source?.id || null, source:source?.name || 'Unknown source' };
  });

  const relationshipLinks = relationships.map(rel => {
    const a = entityById.get(rel.fromEntityId), b = entityById.get(rel.toEntityId);
    const support = (rel.evidenceIds || []).map(id => evidenceById.get(id)).filter(Boolean);
    const confidence = support.length ? support.reduce((sum, ev) => sum + evidenceScore(ev), 0) / support.length : clamp01(rel.confidence);
    return { type:'RELATIONSHIP', id:rel.id, label:`${a?.name || '?'} → ${b?.name || '?'}`, confidence:clamp01(confidence * .8 + clamp01(rel.confidence) * .2), evidenceIds:support.map(x => x.id) };
  });

  const hypothesisLinks = hypotheses.map(h => {
    const supporting = [...(h.evidenceFor || []), ...(h.evidenceAgainst || [])].map(id => evidenceById.get(id)).filter(Boolean);
    const supportScore = supporting.length ? supporting.reduce((sum, ev) => sum + evidenceScore(ev), 0) / supporting.length : clamp01(h.confidence);
    const falsifierPenalty = h.falsifier ? (h.falsifierTested ? 0 : .08) : .2;
    return { type:'HYPOTHESIS', id:h.id, label:h.statement, confidence:clamp01(supportScore - falsifierPenalty), falsifier:h.falsifier || null, falsifierTested:Boolean(h.falsifierTested) };
  });

  const contradictionLinks = contradictions.map(c => ({ type:'CONTRADICTION', id:c.id, label:c.type, severity:c.severity, status:c.status, confidence:c.severity === 'high' ? .9 : c.severity === 'medium' ? .6 : .3 }));
  const decisionLinks = decisions.map(d => {
    const linked = (d.linkedHypothesisIds || []).map(id => hypothesisById.get(id)).filter(Boolean);
    const confidence = linked.length ? linked.reduce((sum, h) => sum + clamp01(h.confidence), 0) / linked.length : .35;
    return { type:'DECISION', id:d.id, label:d.title, state:d.state, confidence };
  });

  const verified = evidence.filter(x => x.humanVerified || x.status === 'FACT').length;
  const independentGroups = new Set(evidence.map(x => sourceById.get(x.sourceId)?.independenceGroup).filter(Boolean));
  const unlinkedEvidence = evidence.filter(x => !relationships.some(r => (r.evidenceIds || []).includes(x.id))).length;
  const untestedFalsifiers = hypotheses.filter(x => x.falsifier && !x.falsifierTested).length;
  const unsupportedRelationships = relationships.filter(r => !(r.evidenceIds || []).length).length;
  const openContradictions = contradictions.filter(x => x.status === 'open').length;

  const gaps = [];
  if (!evidence.length) gaps.push({code:'NO_EVIDENCE', severity:'high', message:'No source-backed evidence has entered the matrix.'});
  if (evidence.length && !verified) gaps.push({code:'NO_VERIFICATION', severity:'high', message:'Claims exist but none are human-verified.'});
  if (evidence.length && independentGroups.size < 2) gaps.push({code:'SOURCE_DEPENDENCY', severity:'medium', message:'Evidence currently has fewer than two explicit source-independence groups.'});
  if (unlinkedEvidence) gaps.push({code:'ORPHAN_EVIDENCE', severity:'medium', message:`${unlinkedEvidence} evidence item(s) are not connected to a relationship or analytical object.`});
  if (untestedFalsifiers) gaps.push({code:'UNTESTED_FALSIFIER', severity:'medium', message:`${untestedFalsifiers} falsifier(s) are defined but not tested.`});
  if (unsupportedRelationships) gaps.push({code:'UNSUPPORTED_LINK', severity:'high', message:`${unsupportedRelationships} relationship(s) have no explicit evidence support.`});
  if (openContradictions) gaps.push({code:'OPEN_CONTRADICTION', severity:'high', message:`${openContradictions} contradiction(s) remain open.`});
  if (hypotheses.length && !decisions.length) gaps.push({code:'DECISION_GAP', severity:'low', message:'Hypotheses exist without a decision record; keep this open until the decision gate is satisfied.'});

  const integrity = clamp01(
    (verified / Math.max(1, evidence.length)) * .35 +
    Math.min(1, independentGroups.size / 2) * .2 +
    (1 - Math.min(1, unsupportedRelationships / Math.max(1, relationships.length))) * .2 +
    (1 - Math.min(1, openContradictions / Math.max(1, contradictions.length))) * .25
  );

  return {
    nodes: [...evidenceLinks, ...relationshipLinks, ...hypothesisLinks, ...contradictionLinks, ...decisionLinks],
    gaps,
    integrity: Math.round(integrity * 100),
    counts: { sources:sources.length, evidence:evidence.length, entities:entities.length, relationships:relationships.length, hypotheses:hypotheses.length, contradictions:contradictions.length, decisions:decisions.length, verified },
    nextAction: gaps[0]?.message || 'Matrix baseline is clean; test temporal consistency and independence before approval.'
  };
}
