import { createContradiction, STATUS } from './model.js';

export function calculateMetrics(state) {
  const evidence = state.evidence || [];
  const verified = evidence.filter(e => e.status === STATUS.FACT).length;
  const corroborated = evidence.filter(e => e.status === STATUS.FACT || e.status === 'CORROBORATED').length;
  const ai = evidence.filter(e => e.aiAssisted).length;
  const pct = (n, d) => d ? Math.round((n / d) * 100) : 0;
  return {
    cases: (state.cases || []).filter(c => c.status !== 'closed').length,
    evidence: evidence.length,
    hypotheses: (state.hypotheses || []).length,
    contradictions: (state.contradictions || []).filter(c => c.status === 'open').length,
    verifiedPct: pct(verified, evidence.length),
    corroboratedPct: pct(corroborated, evidence.length),
    aiPct: pct(ai, evidence.length)
  };
}

function normalizeClaim(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function contradictionTriage(state) {
  const evidence = state.evidence || [];
  const findings = [];
  const byCase = new Map();
  for (const item of evidence) {
    if (!byCase.has(item.caseId)) byCase.set(item.caseId, []);
    byCase.get(item.caseId).push(item);
  }

  for (const [caseId, items] of byCase) {
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i], b = items[j];
        const ac = normalizeClaim(a.claim), bc = normalizeClaim(b.claim);
        if (!ac || !bc || ac === bc) continue;
        const aNeg = ac.startsWith('not ') || ac.includes(' did not ');
        const bNeg = bc.startsWith('not ') || bc.includes(' did not ');
        const aCore = ac.replace(/^not /, '').replace(' did not ', ' did ');
        const bCore = bc.replace(/^not /, '').replace(' did not ', ' did ');
        if (aCore === bCore && aNeg !== bNeg) {
          findings.push(createContradiction({
            caseId, severity: 'high', leftEvidenceId: a.id, rightEvidenceId: b.id,
            explanation: 'Two evidence claims appear logically incompatible and require analyst review.'
          }));
        }
      }
    }
  }
  return findings;
}

export function evidenceForHypothesis(state, hypothesisId) {
  const h = (state.hypotheses || []).find(x => x.id === hypothesisId);
  if (!h) return { supporting: [], opposing: [] };
  const evidence = state.evidence || [];
  return {
    supporting: evidence.filter(e => h.evidenceFor.includes(e.id)),
    opposing: evidence.filter(e => h.evidenceAgainst.includes(e.id))
  };
}

export function counterNarrativePrompt(hypothesis) {
  return hypothesis?.falsifier || 'What credible observation would make this hypothesis false?';
}
