import { createAuditEvent } from './model.js';
import { getAnonymousInstallationId, getPrivateStateKey } from './privacy.js';

const HISTORY_PREFIX = 'osint-enterprise-history-v2:';
const HISTORY_LIMIT = 10;

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
    lastUpdated: null,
    revision: 0
  }
});

function normalize(state) {
  const base = emptyState();
  const merged = { ...base, ...state };
  merged.meta = { ...base.meta, ...(state?.meta || {}) };
  for (const key of Object.keys(base)) {
    if (key !== 'meta' && !Array.isArray(merged[key])) merged[key] = [];
  }
  merged.meta.revision = Number.isInteger(merged.meta.revision) && merged.meta.revision >= 0 ? merged.meta.revision : 0;
  return merged;
}

function historyKey() {
  return `${HISTORY_PREFIX}${getAnonymousInstallationId()}`;
}

function readStoredState() {
  try {
    const raw = localStorage.getItem(getPrivateStateKey());
    return raw ? normalize(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function appendHistory(previous) {
  if (!previous) return;
  try {
    const key = historyKey();
    const raw = localStorage.getItem(key);
    const history = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(history) ? history : [];
    next.push({ revision: Number(previous.meta?.revision || 0), savedAt: previous.meta?.lastUpdated || null, state: previous });
    localStorage.setItem(key, JSON.stringify(next.slice(-HISTORY_LIMIT)));
  } catch {
    // Recovery history is best-effort; primary state remains authoritative for runtime.
  }
}

export function loadState() {
  return readStoredState() || emptyState();
}

export function saveState(state) {
  const key = getPrivateStateKey();
  const previous = readStoredState();
  const next = normalize(state);
  next.meta.lastUpdated = new Date().toISOString();
  next.meta.revision = Number(previous?.meta?.revision || next.meta.revision || 0) + 1;
  appendHistory(previous);
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}

export function getRecoveryHistory() {
  try {
    const raw = localStorage.getItem(historyKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
