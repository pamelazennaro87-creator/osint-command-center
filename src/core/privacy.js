import './i18n.js';

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

const SECRET_KEYS = /^(?:token|secret|password|passwd|pwd|authorization|cookie|api[-_]?key|access[-_]?key|private[-_]?key|client[-_]?secret|credential|credentials)$/i;
const IDENTITY_KEYS = /^(?:email|e[-_]?mail|phone|telephone|address|full[-_]?name|first[-_]?name|last[-_]?name|ip|ip[-_]?address|user[-_]?name|username)$/i;
const INSTALLATION_KEYS = /^(?:installation[-_]?id|anonymous[-_]?installation[-_]?id)$/i;

const SECRET_PATTERNS = [
  /\b(?:sk|rk)-[A-Za-z0-9_-]{16,}\b/gi,
  /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/gi,
  /\bglpat-[A-Za-z0-9_-]{20,}\b/gi,
  /\bAKIA[0-9A-Z]{16}\b/gi,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}\b/gi,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9._-]{8,}\.[A-Za-z0-9._-]{8,}\b/gi,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/gi,
  /\b(?:password|passwd|pwd|api[-_ ]?key|secret|token|authorization|credential)\s*[:=]\s*[^\s,;]{6,}/gi
];

function redactString(value) {
  let output = String(value);
  for (const pattern of SECRET_PATTERNS) output = output.replace(pattern, '[REDACTED_SECRET]');
  return output;
}

export function sanitizeForExport(value) {
  if (Array.isArray(value)) return value.map(sanitizeForExport);
  if (!value || typeof value !== 'object') return typeof value === 'string' ? redactString(value) : value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !SECRET_KEYS.test(key) && !IDENTITY_KEYS.test(key) && !INSTALLATION_KEYS.test(key))
    .map(([key, val]) => [key, sanitizeForExport(val)]));
}

export function privacyAudit(state) {
  const findings = [];
  const scan = (value, collection, index, path = '') => {
    if (typeof value === 'string') {
      for (const pattern of SECRET_PATTERNS) {
        pattern.lastIndex = 0;
        if (pattern.test(value)) {
          findings.push({ severity: 'high', collection, index, key: path, message: 'Potential secret detected in field content.' });
          break;
        }
      }
      return;
    }
    if (!value || typeof value !== 'object') return;
    Object.entries(value).forEach(([key, child]) => {
      const nextPath = path ? `${path}.${key}` : key;
      if (SECRET_KEYS.test(key)) findings.push({ severity: 'high', collection, index, key: nextPath, message: 'Potential secret-bearing field detected.' });
      else if (IDENTITY_KEYS.test(key)) findings.push({ severity: 'medium', collection, index, key: nextPath, message: 'Potential direct identity field detected; minimize or pseudonymize it.' });
      else if (INSTALLATION_KEYS.test(key)) findings.push({ severity: 'medium', collection, index, key: nextPath, message: 'Installation identifier should not be exported as analytical data.' });
      scan(child, collection, index, nextPath);
    });
  };
  for (const [collection, records] of Object.entries(state || {})) {
    if (Array.isArray(records)) records.forEach((record, index) => scan(record, collection, index));
    else scan(records, collection, null, collection);
  }
  return findings;
}

export function privacySummary(state) {
  const findings = privacyAudit(state);
  return { status: findings.some(x => x.severity === 'high') ? 'BLOCK' : findings.length ? 'REVIEW' : 'PASS', findings };
}
