/**
 * Live public-source intelligence — browser-safe real-time feeds.
 * Wikipedia OpenSearch (CORS) + optional RSS via public proxy.
 * All results remain RAW until human promotion to evidence.
 */

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
    snippet: String(result.snippet || '').slice(0, 400),
    provenance: 'ONLINE_RESULT',
    assessment: 'RAW',
    verified: false
  };
}

export function deduplicateResults(results = []) {
  const seen = new Set();
  return results.map(classifyResult).filter(item => {
    const key = item.url || `${item.title}|${item.publisher}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, MAX_RESULTS);
}

/** Wikipedia OpenSearch — works from browser (CORS enabled) */
export async function fetchWikipedia(query) {
  const q = normalizeQuery(query);
  if (!q) return [];
  const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=8&namespace=0&format=json&origin=*`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  const data = await res.json();
  // [query, titles[], descriptions[], urls[]]
  const titles = data[1] || [];
  const descs = data[2] || [];
  const urls = data[3] || [];
  return titles.map((title, i) => ({
    id: `wiki-${i}-${Date.now()}`,
    title,
    url: urls[i] || '',
    publisher: 'Wikipedia',
    sourceType: 'encyclopedia',
    independenceGroup: 'wikipedia.org',
    snippet: descs[i] || '',
    accessedAt: new Date().toISOString()
  }));
}

/** Optional RSS via public CORS proxy (allorigins) — fails soft */
export async function fetchRssFeed(feedUrl, label = 'RSS') {
  try {
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
    const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const text = await res.text();
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const items = [...doc.querySelectorAll('item')].slice(0, 6);
    return items.map((item, i) => {
      const title = item.querySelector('title')?.textContent || 'Untitled';
      const link = item.querySelector('link')?.textContent || '';
      const desc = item.querySelector('description')?.textContent || '';
      const pub = item.querySelector('pubDate')?.textContent || null;
      return {
        id: `rss-${label}-${i}-${Date.now()}`,
        title: title.replace(/<[^>]+>/g, '').slice(0, 240),
        url: link,
        publisher: label,
        sourceType: 'news-rss',
        independenceGroup: label.toLowerCase().replace(/\s+/g, '-'),
        snippet: desc.replace(/<[^>]+>/g, '').slice(0, 280),
        publishedAt: pub,
        accessedAt: new Date().toISOString()
      };
    });
  } catch {
    return [];
  }
}

/** Orchestrated live search: Wikipedia + a few public news RSS */
export async function searchLiveSources(query) {
  const q = normalizeQuery(query);
  if (!q) return buildLiveSession('', []);

  const tasks = [
    fetchWikipedia(q).catch(() => []),
    fetchRssFeed(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`, 'Google News').catch(() => []),
    fetchRssFeed('https://feeds.bbci.co.uk/news/world/rss.xml', 'BBC World').catch(() => [])
  ];

  const batches = await Promise.all(tasks);
  const merged = deduplicateResults(batches.flat());
  // Prefer results that mention the query in title
  const ranked = merged.sort((a, b) => {
    const qa = a.title.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
    const qb = b.title.toLowerCase().includes(q.toLowerCase()) ? 1 : 0;
    return qb - qa;
  });

  return buildLiveSession(q, ranked);
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
    nextActions: items.length
      ? ['Find primary source', 'Search for contradiction', 'Promote only after human review']
      : ['Enter a focused public-source query']
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
      locator: item.url,
      whatProves: String(review.whatProves || 'Not yet assessed.'),
      doesNotProve: String(review.doesNotProve || 'Online retrieval alone does not establish truth.'),
      provenance: 'PROMOTED_FROM_ONLINE_RESULT_REQUIRES_HUMAN_REVIEW'
    }
  };
}
