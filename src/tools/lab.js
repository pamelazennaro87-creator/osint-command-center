const BLOCKED_SCHEMES = /^(?:javascript|data|file|ftp):/i;

export function normalizeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) throw new Error('URL is empty.');
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  if (BLOCKED_SCHEMES.test(candidate)) throw new Error('Unsupported or unsafe URL scheme.');
  const u = new URL(candidate);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only HTTP(S) URLs are supported.');
  u.hash = '';
  return u;
}

export function parseUrl(value) {
  const u = normalizeUrl(value);
  const host = u.hostname.toLowerCase();
  const labels = host.split('.').filter(Boolean);
  const registrableDomain = labels.length >= 2 ? labels.slice(-2).join('.') : host;
  return {
    normalized: u.href,
    protocol: u.protocol.replace(':', ''),
    hostname: host,
    registrableDomain,
    port: u.port || (u.protocol === 'https:' ? '443' : '80'),
    path: u.pathname || '/',
    query: u.search ? u.search.slice(1) : '',
    parameters: [...u.searchParams.keys()],
    username: u.username || '',
    passwordPresent: Boolean(u.password),
    suspiciousScheme: BLOCKED_SCHEMES.test(u.protocol),
  };
}

export async function sha256(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(await input.arrayBuffer());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function extractSignals(text) {
  const value = String(text ?? '');
  const emails = [...new Set(value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [])];
  const urls = [...new Set(value.match(/https?:\/\/[^\s<>()]+/gi) || [])];
  const ipv4 = [...new Set(value.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [])].filter(ip => ip.split('.').every(n => Number(n) <= 255));
  const hashes = [...new Set(value.match(/\b(?:[a-f\d]{32}|[a-f\d]{40}|[a-f\d]{64})\b/gi) || [])];
  const dates = [...new Set(value.match(/\b(?:19|20)\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b/g) || [])];
  const mentions = [...new Set(value.match(/@[a-z0-9_][a-z0-9_.-]{2,30}/gi) || [])];
  const domains = [...new Set(value.match(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}\b/gi) || [])];
  return { emails, urls, ipv4, hashes, dates, mentions, domains };
}

export function usernamePermutations(value) {
  const base = String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9._ -]/g, '').replace(/\s+/g, ' ');
  if (!base) return [];
  const compact = base.replace(/[._ -]+/g, '');
  const tokens = base.split(/[._ -]+/).filter(Boolean);
  const first = tokens[0] || compact;
  const last = tokens.at(-1) || '';
  const initials = tokens.map(x => x[0]).join('');
  return [...new Set([base, compact, first, last, `${first}${last}`, `${first}.${last}`, `${first}_${last}`, `${initials}${last}`, `${first}${initials}`, `${compact}1`, `${compact}01`, `${compact}123`].filter(Boolean))].slice(0, 20);
}

export function dmsToDecimal(degrees, minutes, seconds, hemisphere = 'N') {
  const d = Number(degrees), m = Number(minutes), s = Number(seconds);
  if (![d,m,s].every(Number.isFinite) || m < 0 || m >= 60 || s < 0 || s >= 60) throw new Error('Invalid DMS coordinate.');
  const sign = /[SW]/i.test(hemisphere) ? -1 : 1;
  return sign * (Math.abs(d) + m / 60 + s / 3600);
}

export function decimalToDms(value, axis = 'lat') {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error('Invalid decimal coordinate.');
  const abs = Math.abs(n), degrees = Math.floor(abs), minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat), seconds = (minutesFloat - minutes) * 60;
  const hemi = axis === 'lon' ? (n < 0 ? 'W' : 'E') : (n < 0 ? 'S' : 'N');
  return { degrees, minutes, seconds: Number(seconds.toFixed(4)), hemisphere: hemi };
}

export function geoDistanceBearing(lat1, lon1, lat2, lon2) {
  const a = [lat1, lon1, lat2, lon2].map(Number);
  if (!a.every(Number.isFinite)) throw new Error('Invalid coordinates.');
  const r = Math.PI / 180, R = 6371;
  const p1 = a[0] * r, p2 = a[2] * r, dp = (a[2] - a[0]) * r, dl = (a[3] - a[1]) * r;
  const h = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  const distanceKm = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  const y = Math.sin(dl) * Math.cos(p2), x = Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  const bearing = (Math.atan2(y,x)/r + 360) % 360;
  return { distanceKm: Number(distanceKm.toFixed(3)), bearing: Number(bearing.toFixed(2)) };
}

export function normalizeTimestamp(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error('Unrecognised timestamp.');
  return { iso: d.toISOString(), epochMs: d.getTime(), epochSeconds: Math.floor(d.getTime()/1000) };
}

export function textDiff(a, b) {
  const left = String(a ?? '').split(/\r?\n/), right = String(b ?? '').split(/\r?\n/);
  const max = Math.max(left.length, right.length), rows = [];
  for (let i=0;i<max;i++) if (left[i] !== right[i]) rows.push({ line: i+1, before: left[i] ?? '', after: right[i] ?? '' });
  return rows;
}

export function evidenceStrength({ sourceReliability=0, corroboration=0, provenance=0, humanVerified=false, contradictionPenalty=0 } = {}) {
  const score = Math.max(0, Math.min(100, Math.round(((Number(sourceReliability)+Number(corroboration)+Number(provenance))/3 * 100) + (humanVerified ? 10 : 0) - Number(contradictionPenalty))));
  return { score, band: score >= 80 ? 'STRONG' : score >= 55 ? 'REVIEW' : 'WEAK' };
}

export async function fingerprintText(value) {
  const hash = await sha256(String(value ?? ''));
  return { algorithm: 'SHA-256', fingerprint: hash, length: String(value ?? '').length };
}
