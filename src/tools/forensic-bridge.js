import { createEvidence, now } from '../core/model.js';

/**
 * Convert an analytical finding into an explicitly unverified evidence item.
 * The bridge never upgrades a signal to FACT and never invents confidence.
 */
export function findingToEvidence({
  caseId,
  analysisType,
  title,
  claim,
  details = '',
  locator = '',
  entityIds = [],
  originalLanguage = 'en'
} = {}) {
  if (!caseId) throw new Error('caseId is required');
  if (!analysisType) throw new Error('analysisType is required');
  if (!claim) throw new Error('claim is required');

  return createEvidence({
    caseId,
    title: title || `${analysisType} finding`,
    kind: 'forensic_signal',
    claim,
    originalText: details || claim,
    originalLanguage,
    locator,
    entityIds: Array.isArray(entityIds) ? entityIds : [],
    status: 'UNKNOWN',
    confidence: 0,
    humanVerified: false,
    aiAssisted: false,
    whatProves: 'Independent source review and human verification.',
    doesNotProve: 'This analytical signal is not, by itself, proof of identity, intent, criminality, authorship, deception, or coordination.',
    notes: `analysisType=${analysisType}; createdAt=${now()}`
  });
}

export function findingLabel(finding = {}) {
  return finding.title || finding.type || finding.signal || finding.kind || 'Forensic finding';
}
