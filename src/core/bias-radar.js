/**
 * Bias & Independence Radar + Red Team Cognitive Pressure
 * Unique analytical layer: quantifies structural risk of confirmation bias,
 * source mono-culture, confidence inflation and untested claims.
 */

import { buildShadowInvestigation } from './drift.js';
import { buildIntelligenceMatrix } from './intelligence.js';

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));

export function computeBiasRadar(state = {}) {
  const matrix = buildIntelligenceMatrix(state);
  const shadow = buildShadowInvestigation(state);
  const evidence = state.evidence || [];
  const sources = state.sources || [];
  const hypotheses = state.hypotheses || [];
  const relationships = state.relationships || [];

  // 1. Source mono-culture risk (0-100, higher = worse)
  const groups = new Set(sources.map(s => s.independenceGroup || s.id).filter(Boolean));
  const monoCulture = sources.length === 0 ? 80 : clamp(100 - (groups.size / Math.max(1, sources.length)) * 100);

  // 2. Confidence inflation (hypotheses more confident than supporting evidence)
  let inflationScore = 0;
  let inflationCount = 0;
  for (const h of hypotheses) {
    const support = evidence.filter(e => (h.evidenceFor || []).includes(e.id));
    if (!support.length) {
      if (h.confidence >= 0.6) { inflationScore += 40; inflationCount++; }
      continue;
    }
    const avg = support.reduce((s, e) => s + (Number(e.confidence) || 0), 0) / support.length;
    if (h.confidence > avg + 0.15) {
      inflationScore += Math.min(50, (h.confidence - avg) * 100);
      inflationCount++;
    }
  }
  const confidenceInflation = hypotheses.length ? clamp(inflationScore / Math.max(1, inflationCount)) : 0;

  // 3. Untested claims pressure
  const untestedFalsifiers = hypotheses.filter(h => !h.falsifier?.trim() || !h.falsifierTested).length;
  const untestedPressure = hypotheses.length ? clamp((untestedFalsifiers / hypotheses.length) * 100) : 0;

  // 4. AI dependency risk
  const aiItems = evidence.filter(e => e.aiAssisted && !e.humanVerified).length;
  const aiRisk = evidence.length ? clamp((aiItems / evidence.length) * 100) : 0;

  // 5. Unsupported relationships
  const unsupportedLinks = relationships.filter(r => !(r.evidenceIds || []).length).length;
  const linkRisk = relationships.length ? clamp((unsupportedLinks / relationships.length) * 100) : 0;

  // 6. Open high-severity contradictions + shadow findings
  const openHigh = (state.contradictions || []).filter(c => c.status === 'open' && c.severity === 'high').length;
  const shadowPressure = clamp(shadow.narrativeRiskScore || 0);

  // Composite Bias Index (0 = clean, 100 = high structural bias risk)
  const biasIndex = clamp(
    monoCulture * 0.22 +
    confidenceInflation * 0.22 +
    untestedPressure * 0.18 +
    aiRisk * 0.12 +
    linkRisk * 0.12 +
    shadowPressure * 0.14
  );

  const level =
    biasIndex >= 65 ? 'HIGH' :
    biasIndex >= 40 ? 'ELEVATED' :
    biasIndex >= 20 ? 'MODERATE' : 'LOW';

  return {
    biasIndex,
    level,
    dimensions: {
      monoCulture: { score: monoCulture, label: 'Source mono-culture', groups: groups.size, sources: sources.length },
      confidenceInflation: { score: confidenceInflation, label: 'Confidence inflation', count: inflationCount },
      untestedPressure: { score: untestedPressure, label: 'Untested falsifiers', count: untestedFalsifiers },
      aiRisk: { score: aiRisk, label: 'Unverified AI evidence', count: aiItems },
      linkRisk: { score: linkRisk, label: 'Unsupported relationships', count: unsupportedLinks },
      shadowPressure: { score: shadowPressure, label: 'Shadow investigation risk', high: shadow.highRiskCount || 0 }
    },
    integrity: matrix.integrity,
    recommendation:
      biasIndex >= 65 ? 'Activate Red Team Mode and resolve high-pressure dimensions before any decision.' :
      biasIndex >= 40 ? 'Review independence groups and force at least one strong falsifier test.' :
      biasIndex >= 20 ? 'Maintain adversarial discipline; structural risk is still present.' :
      'Structural bias pressure is currently low. Continue testing alternatives.'
  };
}

/**
 * Red Team pressure list – aggressive gap list for cognitive forcing.
 */
export function buildRedTeamPressure(state = {}) {
  const radar = computeBiasRadar(state);
  const shadow = buildShadowInvestigation(state);
  const hypotheses = state.hypotheses || [];
  const evidence = state.evidence || [];
  const relationships = state.relationships || [];

  const pressure = [];

  // From radar dimensions
  Object.entries(radar.dimensions).forEach(([key, dim]) => {
    if (dim.score >= 35) {
      pressure.push({
        id: `radar-${key}`,
        severity: dim.score >= 60 ? 'high' : 'medium',
        type: 'STRUCTURAL',
        title: dim.label,
        message: `Score ${dim.score}/100. ${radar.recommendation}`,
        action: key === 'monoCulture' ? 'Add independent sources from different origin groups' :
                key === 'confidenceInflation' ? 'Downgrade hypothesis confidence or strengthen supporting evidence' :
                key === 'untestedPressure' ? 'Define and explicitly test a falsifier' :
                key === 'aiRisk' ? 'Human-verify every AI-assisted item before using it as support' :
                key === 'linkRisk' ? 'Attach evidence IDs to every relationship' :
                'Run full shadow investigation and address high-risk findings'
      });
    }
  });

  // Explicit missing falsifiers
  hypotheses.filter(h => !h.falsifier?.trim()).forEach(h => {
    pressure.push({
      id: `falsifier-${h.id}`,
      severity: 'high',
      type: 'FALSIFIER',
      title: 'Missing falsifier',
      message: `Hypothesis has no failure condition: "${(h.statement || '').slice(0, 80)}"`,
      action: 'Write what observation would make this hypothesis false'
    });
  });

  // Unsupported relationships
  relationships.filter(r => !(r.evidenceIds || []).length).forEach(r => {
    pressure.push({
      id: `link-${r.id}`,
      severity: 'high',
      type: 'UNSUPPORTED_LINK',
      title: 'Relationship without evidence',
      message: 'A graph edge exists without supporting evidence IDs.',
      action: 'Either attach evidence or remove the relationship'
    });
  });

  // Shadow findings
  (shadow.findings || []).filter(f => f.severity === 'high').slice(0, 6).forEach(f => {
    pressure.push({
      id: `shadow-${f.type}-${f.hypothesisId || f.evidenceId || Math.random()}`,
      severity: 'high',
      type: f.type,
      title: f.type.replaceAll('_', ' '),
      message: f.message,
      action: f.repairMode || 'Analyst review required'
    });
  });

  // Deduplicate by title+message roughly
  const seen = new Set();
  const unique = pressure.filter(p => {
    const k = `${p.title}|${p.message.slice(0, 40)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    active: true,
    biasIndex: radar.biasIndex,
    level: radar.level,
    count: unique.length,
    highCount: unique.filter(p => p.severity === 'high').length,
    items: unique.slice(0, 12),
    principle: 'Red Team Mode exists to increase cognitive friction, not to confirm the primary narrative.'
  };
}
