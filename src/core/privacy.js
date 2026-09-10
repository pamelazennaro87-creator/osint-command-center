const INSTALLATION_KEY = 'osint-installation-id-v2';
const STATE_PREFIX = 'osint-enterprise-state-v2:';

const randomId = () => globalThis.crypto?.randomUUID?.() || `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function getAnonymousInstallationId(storage = globalThis.localStorage) {
  if (!storage) throw new Error('Local storage is unavailable.');
  let id = storage.getItem(INSTALLATION_KEY);
  if (!id) {
    id = randomId();
    storage.setItem(INSTALLATION_KEY, id);
  }
  return id;
}

export function getPrivateStateKey(storage = globalThis.localStorage) {
  return `${STATE_PREFIX}${getAnonymousInstallationId(storage)}`;
}

const SECRET_KEYS = /^(?:token|secret|password|authorization|cookie|api[-_]?key|access[-_]?key|private[-_]?key|client[-_]?secret)$/i;
const IDENTITY_KEYS = /^(?:email|e[-_]?mail|phone|telephone|address|full[-_]?name|first[-_]?name|last[-_]?name|ip|ip[-_]?address|user[-_]?name)$/i;

export function sanitizeForExport(value) {
  if (Array.isArray(value)) return value.map(sanitizeForExport);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !SECRET_KEYS.test(key) && !IDENTITY_KEYS.test(key))
    .map(([key, val]) => [key, sanitizeForExport(val)]));
}

export function privacyAudit(state) {
  const findings = [];
  for (const [collection, records] of Object.entries(state || {})) {
    if (!Array.isArray(records)) continue;
    records.forEach((record, index) => {
      Object.keys(record || {}).forEach(key => {
        if (SECRET_KEYS.test(key)) findings.push({ severity: 'high', collection, index, key, message: 'Potential secret-bearing field detected.' });
        else if (IDENTITY_KEYS.test(key)) findings.push({ severity: 'medium', collection, index, key, message: 'Potential direct identity field detected; minimize or pseudonymize it.' });
      });
    });
  }
  return findings;
}

export function privacySummary(state) {
  const findings = privacyAudit(state);
  return { status: findings.some(x => x.severity === 'high') ? 'BLOCK' : findings.length ? 'REVIEW' : 'PASS', findings };
}
