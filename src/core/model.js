export const STATUS = Object.freeze({
  FACT: 'FACT',
  INFERENCE: 'INFERENCE',
  ASSUMPTION: 'ASSUMPTION',
  UNKNOWN: 'UNKNOWN',
  CONTESTED: 'CONTESTED'
});

export const ENTITY_TYPES = Object.freeze([
  'person', 'organization', 'company', 'asset', 'location', 'event', 'unknown'
]);

export function id(prefix = 'id') {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function now() {
  return new Date().toISOString();
}

export function createCase(input = {}) {
  return {
    id: input.id || id('case'),
    title: input.title || 'Untitled investigation',
    objective: input.objective || '',
    priority: input.priority || 'medium',
    status: input.status || 'open',
    createdAt: input.createdAt || now(),
    updatedAt: now()
  };
}

export function createSource(input = {}) {
  return {
    id: input.id || id('src'),
    name: input.name || 'Unknown source',
    type: input.type || 'web',
    locator: input.locator || '',
    publisher: input.publisher || '',
    reliability: Number.isFinite(input.reliability) ? input.reliability : 0.5,
    independenceGroup: input.independenceGroup || '',
    capturedAt: input.capturedAt || now()
  };
}

export function createEvidence(input = {}) {
  return {
    id: input.id || id('ev'),
    caseId: input.caseId || '',
    sourceId: input.sourceId || '',
    title: input.title || 'Untitled evidence',
    kind: input.kind || 'observation',
    claim: input.claim || '',
    locator: input.locator || '',
    status: input.status || STATUS.UNKNOWN,
    confidence: Number.isFinite(input.confidence) ? input.confidence : 0.5,
    observedAt: input.observedAt || now(),
    capturedAt: input.capturedAt || now(),
    aiAssisted: Boolean(input.aiAssisted),
    notes: input.notes || ''
  };
}

export function createEntity(input = {}) {
  return {
    id: input.id || id('ent'),
    type: ENTITY_TYPES.includes(input.type) ? input.type : 'unknown',
    name: input.name || 'Unnamed entity',
    aliases: Array.isArray(input.aliases) ? input.aliases : [],
    notes: input.notes || ''
  };
}

export function createRelationship(input = {}) {
  return {
    id: input.id || id('rel'),
    caseId: input.caseId || '',
    fromEntityId: input.fromEntityId || '',
    toEntityId: input.toEntityId || '',
    type: input.type || 'associated_with',
    evidenceIds: Array.isArray(input.evidenceIds) ? input.evidenceIds : [],
    confidence: Number.isFinite(input.confidence) ? input.confidence : 0.5,
    status: input.status || STATUS.INFERENCE
  };
}

export function createHypothesis(input = {}) {
  return {
    id: input.id || id('hyp'),
    caseId: input.caseId || '',
    statement: input.statement || '',
    status: input.status || 'untested',
    evidenceFor: Array.isArray(input.evidenceFor) ? input.evidenceFor : [],
    evidenceAgainst: Array.isArray(input.evidenceAgainst) ? input.evidenceAgainst : [],
    confidence: Number.isFinite(input.confidence) ? input.confidence : 0.5,
    falsifier: input.falsifier || '',
    updatedAt: now()
  };
}

export function createContradiction(input = {}) {
  return {
    id: input.id || id('con'),
    caseId: input.caseId || '',
    type: input.type || 'claim_conflict',
    severity: input.severity || 'medium',
    leftEvidenceId: input.leftEvidenceId || '',
    rightEvidenceId: input.rightEvidenceId || '',
    explanation: input.explanation || '',
    status: input.status || 'open',
    createdAt: input.createdAt || now()
  };
}

export function createAuditEvent(input = {}) {
  return {
    id: input.id || id('audit'),
    action: input.action || 'unknown',
    objectType: input.objectType || '',
    objectId: input.objectId || '',
    actor: input.actor || 'local-user',
    timestamp: input.timestamp || now(),
    details: input.details || ''
  };
}
