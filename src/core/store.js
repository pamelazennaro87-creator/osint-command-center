import { createAuditEvent } from './model.js';
import { getPrivateStateKey } from './privacy.js';

const LEGACY_KEY = 'osint-enterprise-state-v1';

const emptyState = () => ({
  cases: [], sources: [], evidence: [], entities: [], relationships: [],
  hypotheses: [], contradictions: [], decisions: [], audit: []
});

export function loadState() {
  try {
    const key = getPrivateStateKey();
    const raw = localStorage.getItem(key);
    if (raw) return { ...emptyState(), ...JSON.parse(raw) };
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = { ...emptyState(), ...JSON.parse(legacy) };
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
  localStorage.setItem(getPrivateStateKey(), JSON.stringify(state));
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
