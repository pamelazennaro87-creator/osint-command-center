import { STATUS, createContradiction } from './model.js';

const POSITIVE = /\b(is|are|was|were|has|have|did|owns|controls|works|met|located|operated)\b/i;
const NEGATIVE = /\b(not|never|no|did not|was not|were not|has no|does not)\b/i;

export function detectReasoningDrift(state) {
  const findings = [];
  const evidence = state.evidence || [];
  const sources = new Map((state.sources || []).map(s => [s.id, s]));
  const hypotheses = state.hypotheses || [];

  // 1. AI-assisted evidence presented as fact or treated as human-verified.
  for (const e of evidence) {
    if (e.aiAssisted && (e.status === STATUS.FACT || e.humanVerified)) {
      findings.push({ type:'AI_GUARDRAIL', severity:'high', evidenceId:e.id,
        message:'AI-assisted evidence is marked as fact or human-verified; review the attribution and verification chain.' });
    }
  }

  // 2. Independence collapse: several sources share the same declared origin.
  const groups = new Map();
  for (const e of evidence) {
    const s = sources.get(e.sourceId); if (!s?.independenceGroup) continue;
    if (!groups.has(s.independenceGroup)) groups.set(s.independenceGroup, []);
    groups.get(s.independenceGroup).push(e);
  }
  for (const [group, items] of groups) {
    if (items.length >= 2) findings.push({ type:'SOURCE_DEPENDENCY', severity:'medium', independenceGroup:group,
      evidenceIds:items.map(x=>x.id), message:'Multiple evidence items share the same source-independence group; apparent corroboration may not be independent.' });
  }

  // 3. Hypothesis overconfidence: high confidence with weak/absent supporting evidence.
  for (const h of hypotheses) {
    const support = evidence.filter(e => (h.evidenceFor || []).includes(e.id));
    const opposing = evidence.filter(e => (h.evidenceAgainst || []).includes(e.id));
    if (h.confidence >= .8 && support.length === 0) findings.push({ type:'CONFIDENCE_DRIFT', severity:'high', hypothesisId:h.id,
      message:'Hypothesis confidence is high without explicit supporting evidence.' });
    if (h.confidence >= .8 && opposing.length >= support.length && opposing.length > 0) findings.push({ type:'CONFIDENCE_DRIFT', severity:'high', hypothesisId:h.id,
      message:'Hypothesis confidence is high despite equal or stronger opposing evidence.' });
    if (!h.falsifier?.trim()) findings.push({ type:'MISSING_FALSIFIER', severity:'medium', hypothesisId:h.id,
      message:'Hypothesis has no explicit falsifier. A conclusion without a failure condition is difficult to challenge.' });
  }

  // 4. Contradiction candidates from simple polarity conflicts.
  const byCase = new Map();
  for (const e of evidence) { if (!byCase.has(e.caseId)) byCase.set(e.caseId, []); byCase.get(e.caseId).push(e); }
  for (const items of byCase.values()) {
    for (let i=0;i<items.length;i++) for (let j=i+1;j<items.length;j++) {
      const a=items[i], b=items[j];
      const ac=a.claim.trim().toLowerCase(), bc=b.claim.trim().toLowerCase();
      if (!ac || !bc || ac===bc) continue;
      const sameFrame = ac.replace(NEGATIVE,'').replace(/\s+/g,' ').trim() === bc.replace(NEGATIVE,'').replace(/\s+/g,' ').trim();
      if (sameFrame && NEGATIVE.test(ac) !== NEGATIVE.test(bc) && POSITIVE.test(ac+bc)) {
        findings.push({ type:'CLAIM_CONFLICT', severity:'high', evidenceIds:[a.id,b.id],
          message:'Evidence claims appear to describe the same proposition with conflicting polarity; analyst review required.' });
      }
    }
  }
  return findings;
}

export function buildShadowInvestigation(state) {
  const findings = detectReasoningDrift(state);
  const hypotheses = state.hypotheses || [];
  const evidence = state.evidence || [];
  const gaps = hypotheses.filter(h => !(h.evidenceAgainst || []).length).map(h => ({ hypothesisId:h.id, message:'No explicit opposing evidence is linked to this hypothesis.' }));
  return { generatedAt:new Date().toISOString(), findingCount:findings.length, findings, falsificationGaps:gaps,
    principle:'The shadow investigation exists to challenge the primary narrative, not to confirm it.' };
}
