import { createAuditEvent } from './model.js';

const KEY = 'osint-enterprise-state-v1';

const emptyState = () => ({
  cases: [], sources: [], evidence: [], entities: [], relationships: [],
  hypotheses: [], contradictions: [], decisions: [], audit: []
});

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
  return state;
}

export function addRecord(collection, record) {
  const state = loadState();
  if (!Array.isArray(state[collection])) throw new Error(`Unknown collection: ${collection}`);
  state[collection].push(record);
  state.audit.push(createAuditEvent({
    action: 'create', objectType: collection, objectId: record.id,
    details: `Created ${collection} record`
  }));
  saveState(state);
  return record;
}

export function updateRecord(collection, recordId, patch) {
  const state = loadState();
  const list = state[collection];
  const index = Array.isArray(list) ? list.findIndex(item => item.id === recordId) : -1;
  if (index < 0) throw new Error(`Record not found: ${recordId}`);
  state[collection][index] = { ...state[collection][index], ...patch, updatedAt: new Date().toISOString() };
  state.audit.push(createAuditEvent({ action: 'update', objectType: collection, objectId: recordId }));
  saveState(state);
  return state[collection][index];
}

export function clearState() {
  saveState(emptyState());
}

export function seedDemoData(factory) {
  const state = loadState();
  if (state.cases.length) return state;
  const demo = factory();
  saveState(demo);
  return demo;
}
