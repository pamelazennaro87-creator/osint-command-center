const MAX_RESULTS = 12;
const BLOCKED_PROTOCOLS = new Set(['file:', 'ftp:', 'data:', 'javascript:']);

export function normalizeQuery(value = '') {
  return String(value).trim().replace(/\s+/g, ' ').slice(0, 240);
}

export function normalizeLocator(value = '') {
  try {
    const u = new URL(String(value).trim());
    if (BLOCKED_PROTOCOLS.has(u.protocol)) return '';
    u.hash = '';
    return u.toString();
  } catch {
    return '';
  }
}

export function classifyResult(result = {}) {
  const url = normalizeLocator(result.url);
  let domain = '';
  try { domain = new URL(url).hostname.toLowerCase(); } catch {}
  return {
    id: String(result.id || `live-${Math.random().toString(36).slice(2, 10)}`),
    title: String(result.title || 'Untitled source').slice(0, 240),
    url,
    domain,
    publisher: String(result.publisher || domain || 'Unknown publisher').slice(0, 160),
    publishedAt: result.publishedAt || null,
    accessedAt: result.accessedAt || new Date().toISOString(),
    sourceType: String(result.sourceType || 'web'),
    independenceGroup: String(result.independenceGroup || domain || 'unknown-origin'),
    provenance: 'ONLINE_RESULT',
    assessment: 'RAW',
    verified: false,
  };
}

export function deduplicateResults(results = []) {
  const seen = new Set();
  return results.map(classifyResult).filter(item => {
    const key = item.url || `${item.title}|${item.publisher}`;
    if (!key || seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, MAX_RESULTS);
}

export function buildLiveSession(query = '', results = []) {
  const normalized = normalizeQuery(query);
  const items = deduplicateResults(results);
  const groups = new Set(items.map(x => x.independenceGroup).filter(Boolean));
  return {
    id: `session-${Date.now().toString(36)}`,
    query: normalized,
    createdAt: new Date().toISOString(),
    results: items,
    independentOrigins: groups.size,
    principle: 'ONLINE DATA ≠ VERIFIED EVIDENCE',
    nextActions: items.length ? ['Find primary source', 'Search for contradiction', 'Check temporal snapshot'] : ['Run a public-source search'],
  };
}

export function promoteResultToEvidence(result, review = {}) {
  const item = classifyResult(result);
  return {
    source: { ...item, assessment: 'REVIEWED' },
    evidence: {
      title: item.title,
      claim: String(review.claim || item.title).slice(0, 500),
      status: 'UNKNOWN',
      confidence: 0,
      humanVerified: false,
      sourceId: item.id,
      sourceIds: [item.id],
      whatProves: String(review.whatProves || 'Not yet assessed.'),
      doesNotProve: String(review.doesNotProve || 'Online retrieval alone does not establish truth.'),
      provenance: 'PROMOTED_FROM_ONLINE_RESULT_REQUIRES_HUMAN_REVIEW'
    }
  };
}
