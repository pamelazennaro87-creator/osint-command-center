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

test('privacy boundary redacts JWTs, GitLab tokens and private keys in free text', () => {
  const input = {
    notes: 'glpat-abcdefghijklmnopqrstuvwxyz1234567890',
    jwt: 'eyJabcdefghijk.abcdefghijk.abcdefghijk',
    key: '-----BEGIN PRIVATE KEY-----\\nsecret-material\\n-----END PRIVATE KEY-----'
  };
  const out = sanitizeForExport(input);
  assert.equal(out.notes, '[REDACTED_SECRET]');
  assert.equal(out.jwt, '[REDACTED_SECRET]');
  assert.equal(out.key, '[REDACTED_SECRET]');
  assert.equal(privacySummary({ cases: [input] }).status, 'BLOCK');
});

test('installation identifiers are not exported or treated as analytical identity', () => {
  const input = { installationId: 'anon-installation', title: 'case' };
  const out = sanitizeForExport(input);
  assert.equal(out.installationId, undefined);
  assert.ok(privacyAudit({ cases: [input] }).some(x => x.severity === 'medium' && x.key === 'installationId'));
});

test('compound secret and identity field names are minimized', () => {
  const input = {
    apiKey: 'supersecret',
    githubToken: 'ghp_compound_should_not_export',
    contactEmail: 'person@example.com',
    ownerName: 'Person Example',
    usefulLabel: 'retain'
  };
  const out = sanitizeForExport(input);
  assert.equal(out.apiKey, undefined);
  assert.equal(out.githubToken, undefined);
  assert.equal(out.contactEmail, undefined);
  assert.equal(out.ownerName, undefined);
  assert.equal(out.usefulLabel, 'retain');
  const findings = privacyAudit({ cases: [input] });
  assert.ok(findings.some(x => x.severity === 'high' && x.key === 'apiKey'));
  assert.ok(findings.some(x => x.severity === 'high' && x.key === 'githubToken'));
  assert.ok(findings.some(x => x.severity === 'medium' && x.key === 'contactEmail'));
  assert.ok(findings.some(x => x.severity === 'medium' && x.key === 'ownerName'));
});
