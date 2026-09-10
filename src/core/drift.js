import { STATUS } from './model.js';

const POSITIVE = /\b(is|are|was|were|has|have|did|owns|controls|works|met|located|operated)\b/i;
const NEGATIVE = /\b(not|never|no|did not|was not|were not|has no|does not)\b/i;

function repairMode(type){
  return ({
    AI_GUARDRAIL:'HUMAN_VERIFY', SOURCE_DEPENDENCY:'SOURCE_DIVERSIFY', CONFIDENCE_DRIFT:'DOWNGRADE_OR_TEST',
    MISSING_FALSIFIER:'DEFINE_FALSIFIER', CLAIM_CONFLICT:'RECONCILE_TIMELINE'
  })[type] || 'ANALYST_REVIEW';
}

export function detectReasoningDrift(state = {}) {
  const findings = [];
  const evidence = state.evidence || [];
  const sources = new Map((state.sources || []).map(s => [s.id, s]));
  const hypotheses = state.hypotheses || [];

  for (const e of evidence) {
    if (e.aiAssisted && (e.status === STATUS.FACT || e.humanVerified)) {
      findings.push({ type:'AI_GUARDRAIL', severity:'high', evidenceId:e.id, repairMode:repairMode('AI_GUARDRAIL'),
        message:'AI-assisted evidence is marked as fact or human-verified; review the attribution and verification chain.' });
    }
  }

  const groups = new Map();
  for (const e of evidence) {
    const s = sources.get(e.sourceId); if (!s?.independenceGroup) continue;
    if (!groups.has(s.independenceGroup)) groups.set(s.independenceGroup, []);
    groups.get(s.independenceGroup).push(e);
  }
  for (const [group, items] of groups) {
    if (items.length >= 2) findings.push({ type:'SOURCE_DEPENDENCY', severity:'medium', independenceGroup:group,
      evidenceIds:items.map(x=>x.id), repairMode:repairMode('SOURCE_DEPENDENCY'),
      message:'Multiple evidence items share the same source-independence group; apparent corroboration may not be independent.' });
  }

  for (const h of hypotheses) {
    const support = evidence.filter(e => (h.evidenceFor || []).includes(e.id));
    const opposing = evidence.filter(e => (h.evidenceAgainst || []).includes(e.id));
    const linked = [...support, ...opposing];
    const independentGroups = new Set(linked.map(e => sources.get(e.sourceId)?.independenceGroup).filter(Boolean));
    const evidenceStrength = support.reduce((sum,e)=>sum+(Number(e.confidence)||0),0);
    const opposingStrength = opposing.reduce((sum,e)=>sum+(Number(e.confidence)||0),0);
    if (h.confidence >= .8 && support.length === 0) findings.push({ type:'CONFIDENCE_DRIFT', severity:'high', hypothesisId:h.id, repairMode:repairMode('CONFIDENCE_DRIFT'),
      message:'Hypothesis confidence is high without explicit supporting evidence.' });
    if (h.confidence >= .8 && opposing.length >= support.length && opposing.length > 0) findings.push({ type:'CONFIDENCE_DRIFT', severity:'high', hypothesisId:h.id, repairMode:repairMode('CONFIDENCE_DRIFT'),
      message:'Hypothesis confidence is high despite equal or stronger opposing evidence.' });
    if (!h.falsifier?.trim()) findings.push({ type:'MISSING_FALSIFIER', severity:'medium', hypothesisId:h.id, repairMode:repairMode('MISSING_FALSIFIER'),
      message:'Hypothesis has no explicit falsifier. A conclusion without a failure condition is difficult to challenge.' });
    if (support.length > 0 && independentGroups.size === 1 && linked.length >= 2) findings.push({ type:'CORROBORATION_COLLAPSE', severity:'medium', hypothesisId:h.id, repairMode:'SOURCE_DIVERSIFY',
      message:'Support is linked to multiple items but only one declared independence group; corroboration may be weaker than it appears.' });
    if (h.confidence >= .7 && support.length > 0 && evidenceStrength / support.length < h.confidence - .15) findings.push({ type:'CONFIDENCE_DRIFT', severity:'medium', hypothesisId:h.id, repairMode:repairMode('CONFIDENCE_DRIFT'),
      message:'Hypothesis confidence appears ahead of the average confidence of its supporting evidence.' });
    if (h.confidence >= .7 && opposingStrength > evidenceStrength) findings.push({ type:'OPPOSITION_GAP', severity:'high', hypothesisId:h.id, repairMode:'REVIEW_OPPOSING_EVIDENCE',
      message:'Aggregate confidence in opposing evidence exceeds aggregate confidence in supporting evidence.' });
  }

  const byCase = new Map();
  for (const e of evidence) { if (!byCase.has(e.caseId)) byCase.set(e.caseId, []); byCase.get(e.caseId).push(e); }
  for (const items of byCase.values()) {
    for (let i=0;i<items.length;i++) for (let j=i+1;j<items.length;j++) {
      const a=items[i], b=items[j];
      const ac=String(a.claim||'').trim().toLowerCase(), bc=String(b.claim||'').trim().toLowerCase();
      if (!ac || !bc || ac===bc) continue;
      const sameFrame = ac.replace(NEGATIVE,'').replace(/\s+/g,' ').trim() === bc.replace(NEGATIVE,'').replace(/\s+/g,' ').trim();
      if (sameFrame && NEGATIVE.test(ac) !== NEGATIVE.test(bc) && POSITIVE.test(ac+bc)) {
        findings.push({ type:'CLAIM_CONFLICT', severity:'high', evidenceIds:[a.id,b.id], repairMode:repairMode('CLAIM_CONFLICT'),
          message:'Evidence claims appear to describe the same proposition with conflicting polarity; analyst review required.' });
      }
    }
  }
  return findings;
}

export function buildShadowInvestigation(state = {}) {
  const findings = detectReasoningDrift(state);
  const hypotheses = state.hypotheses || [];
  const gaps = hypotheses.filter(h => !(h.evidenceAgainst || []).length).map(h => ({ hypothesisId:h.id,
    message:'No explicit opposing evidence is linked to this hypothesis.', repairMode:'SEEK_COUNTEREVIDENCE' }));
  const high = findings.filter(f=>f.severity==='high').length;
  const medium = findings.filter(f=>f.severity==='medium').length;
  const riskScore = Math.min(100, high*25 + medium*10 + gaps.length*8);
  return { generatedAt:new Date().toISOString(), findingCount:findings.length, findings, falsificationGaps:gaps,
    highRiskCount:high, mediumRiskCount:medium, narrativeRiskScore:riskScore,
    integrityStatus: high ? 'HIGH_RISK' : (medium || gaps.length ? 'REVIEW' : 'CLEAR'),
    principle:'The shadow investigation exists to challenge the primary narrative, not to confirm it.' };
}
