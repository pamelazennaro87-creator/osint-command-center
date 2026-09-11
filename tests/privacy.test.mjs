import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeForExport, privacyAudit, privacySummary } from '../src/core/privacy.js';

test('sanitized exports remove direct identity and secret fields', () => {
  const input = { title: 'case', email: 'person@example.com', ip: '1.2.3.4', token: 'secret', nested: { phone: '+1', value: 'keep' } };
  const out = sanitizeForExport(input);
  assert.equal(out.email, undefined);
  assert.equal(out.ip, undefined);
  assert.equal(out.token, undefined);
  assert.equal(out.nested.phone, undefined);
  assert.equal(out.nested.value, 'keep');
});

test('privacy audit blocks secret-bearing fields and reviews identity fields', () => {
  const result = privacySummary({ cases: [{ id: 'c1', email: 'person@example.com', token: 'x' }] });
  assert.equal(result.status, 'BLOCK');
  assert.ok(result.findings.some(x => x.severity === 'high' && x.key === 'token'));
  assert.ok(privacyAudit({ cases: [{ id: 'c1', email: 'person@example.com' }] }).some(x => x.severity === 'medium'));
});

test('embedded credentials in free-text fields are detected and redacted', () => {
  const input = { notes: 'api_key=supersecret123', rationale: 'Bearer abcdefghijklmnop1234' };
  const out = sanitizeForExport(input);
  assert.match(out.notes, /REDACTED_SECRET/);
  assert.match(out.rationale, /REDACTED_SECRET/);
  const result = privacySummary({ cases: [input] });
  assert.equal(result.status, 'BLOCK');
  assert.ok(result.findings.some(x => x.severity === 'high' && x.key === 'notes'));
  assert.ok(result.findings.some(x => x.severity === 'high' && x.key === 'rationale'));
});
