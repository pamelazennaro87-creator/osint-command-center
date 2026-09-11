import { createAuditEvent } from './model.js';
import { getPrivateStateKey } from './privacy.js';

const LEGACY_KEY = 'osint-enterprise-state-v1';

const emptyState = () => ({
  cases: [],
  sources: [],
  evidence: [],
  entities: [],
  relationships: [],
  hypotheses: [],
  contradictions: [],
  decisions: [],
  audit: [],
  meta: {
    activeCaseId: null,
    redTeamMode: false,
    lastUpdated: null
  }
});

function normalize(state) {
  const base = emptyState();
  const merged = { ...base, ...state };
  merged.meta = { ...base.meta, ...(state?.meta || {}) };
  for (const key of Object.keys(base)) {
    if (key !== 'meta' && !Array.isArray(merged[key])) merged[key] = [];
  }
  return merged;
}

export function loadState() {
  try {
    const key = getPrivateStateKey();
    const raw = localStorage.getItem(key);
    if (raw) return normalize(JSON.parse(raw));
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = normalize(JSON.parse(legacy));
      localStorage.setItem(key, JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_KEY);
      return migrated;
    }
    return emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  const next = normalize(state);
  next.meta.lastUpdated = new Date().toISOString();
  localStorage.setItem(getPrivateStateKey(), JSON.stringify(next));
  return next;
}

export function addRecord(collection, record) {
  const state = loadState();
  if (!Array.isArray(state[collection])) throw new Error(`Unknown collection: ${collection}`);
  state[collection].push(record);
  state.audit.push(createAuditEvent({
    action: 'create',
    objectType: collection,
    objectId: record.id,
    details: `Created ${collection} record`
  }));
  if (collection === 'cases') state.meta.activeCaseId = record.id;
  return saveState(state);
}

export function updateRecord(collection, recordId, patch) {
  const state = loadState();
  const list = state[collection];
  const index = Array.isArray(list) ? list.findIndex(item => item.id === recordId) : -1;
  if (index < 0) throw new Error(`Record not found: ${recordId}`);
  state[collection][index] = {
    ...state[collection][index],
    ...patch,
    updatedAt: new Date().toISOString()
  };
  state.audit.push(createAuditEvent({
    action: 'update',
    objectType: collection,
    objectId: recordId
  }));
  return saveState(state);
}

export function deleteRecord(collection, recordId) {
  const state = loadState();
  if (!Array.isArray(state[collection])) throw new Error(`Unknown collection: ${collection}`);
  state[collection] = state[collection].filter(x => x.id !== recordId);
  state.audit.push(createAuditEvent({
    action: 'delete',
    objectType: collection,
    objectId: recordId
  }));
  if (collection === 'cases' && state.meta.activeCaseId === recordId) {
    state.meta.activeCaseId = state.cases[0]?.id || null;
  }
  return saveState(state);
}

export function setActiveCase(caseId) {
  const state = loadState();
  state.meta.activeCaseId = caseId || null;
  return saveState(state);
}

export function getActiveCaseId(state = loadState()) {
  return state.meta?.activeCaseId || state.cases?.[0]?.id || null;
}

export function filterByActiveCase(state, collection) {
  const activeId = getActiveCaseId(state);
  if (!activeId || !Array.isArray(state[collection])) return state[collection] || [];
  const scoped = new Set(['evidence', 'relationships', 'hypotheses', 'contradictions', 'decisions']);
  if (!scoped.has(collection)) return state[collection];
  return state[collection].filter(x => x.caseId === activeId);
}

export function setRedTeamMode(enabled) {
  const state = loadState();
  state.meta.redTeamMode = Boolean(enabled);
  return saveState(state);
}

export function isRedTeamMode(state = loadState()) {
  return Boolean(state.meta?.redTeamMode);
}

export function clearState() {
  return saveState(emptyState());
}
