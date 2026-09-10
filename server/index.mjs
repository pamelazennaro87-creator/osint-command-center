import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 8080);
const NODE_ENV = process.env.NODE_ENV || 'development';
const MAX_BODY_BYTES = 1024 * 1024;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const MAX_RATE_BUCKETS = 10_000;
const buckets = new Map();

function requestId() {
  return crypto.randomUUID();
}

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
}

function clientKey(req) {
  // Do not trust forwarded headers as an identity signal. A reverse proxy may
  // normalize the socket address before this service receives the request.
  return req.socket.remoteAddress || 'unknown';
}

function rateLimited(req) {
  const key = clientKey(req);
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now - current.startedAt >= WINDOW_MS) {
    if (buckets.size >= MAX_RATE_BUCKETS && !current) {
      const oldestKey = buckets.keys().next().value;
      if (oldestKey !== undefined) buckets.delete(oldestKey);
    }
    buckets.set(key, { startedAt: now, count: 1 });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function send(res, status, body, requestIdValue) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Request-ID', requestIdValue);
  res.end(JSON.stringify(body));
}

function requireProductionConfiguration() {
  if (NODE_ENV !== 'production') return;
  const required = ['OIDC_ISSUER', 'OIDC_AUDIENCE', 'DATABASE_URL'];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length) {
    throw new Error(`Production configuration incomplete: ${missing.join(', ')}`);
  }
}

function safeReadyResponse(error, rid) {
  // Configuration details belong in private server logs, never in a public
  // readiness response. The client only needs to know that the service is not ready.
  if (NODE_ENV !== 'production') {
    return { status: 'not_ready', reason: 'production configuration incomplete', requestId: rid };
  }
  return { status: 'not_ready', requestId: rid };
}

function rejectOversizedBody(req, res, rid) {
  const contentLength = Number(req.headers['content-length'] || 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    send(res, 413, { error: 'payload_too_large', requestId: rid }, rid);
    req.resume();
    return true;
  }
  return false;
}

const server = http.createServer((req, res) => {
  const rid = requestId();
  securityHeaders(res);
  res.setHeader('X-Request-ID', rid);

  try {
    if (rateLimited(req)) {
      return send(res, 429, { error: 'rate_limited', requestId: rid }, rid);
    }

    if (rejectOversizedBody(req, res, rid)) return;

    const url = new URL(req.url || '/', 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/health') {
      return send(res, 200, { status: 'ok', service: 'osint-command-center-api', requestId: rid }, rid);
    }

    if (req.method === 'GET' && url.pathname === '/ready') {
      try {
        requireProductionConfiguration();
        return send(res, 200, { status: 'ready', requestId: rid }, rid);
      } catch (error) {
        console.error(`[${rid}] readiness check failed: ${error.message}`);
        return send(res, 503, safeReadyResponse(error, rid), rid);
      }
    }

    // Intelligence routes remain intentionally unavailable until authentication,
    // authorization and server-side persistence are installed. Failing closed here
    // prevents the browser client from being mistaken for an authoritative backend.
    return send(res, 501, {
      error: 'not_implemented',
      message: 'Authenticated enterprise API is not enabled yet.',
      requestId: rid
    }, rid);
  } catch (error) {
    console.error(`[${rid}] request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    return send(res, 500, { error: 'internal_error', requestId: rid }, rid);
  }
});

server.on('clientError', (error, socket) => {
  console.error(`client protocol error: ${error.message}`);
  socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});

server.listen(PORT, () => {
  console.log(`OSINT Command Center API listening on ${PORT}`);
});

export { server, requireProductionConfiguration, rateLimited, rejectOversizedBody, safeReadyResponse };
