import test from 'node:test';
import assert from 'node:assert/strict';
import { requireProductionConfiguration, safeReadyResponse } from '../server/index.mjs';

test('production configuration fails closed when required settings are absent', () => {
  const previous = {
    NODE_ENV: process.env.NODE_ENV,
    OIDC_ISSUER: process.env.OIDC_ISSUER,
    OIDC_AUDIENCE: process.env.OIDC_AUDIENCE,
    DATABASE_URL: process.env.DATABASE_URL
  };

  process.env.NODE_ENV = 'production';
  delete process.env.OIDC_ISSUER;
  delete process.env.OIDC_AUDIENCE;
  delete process.env.DATABASE_URL;

  assert.throws(() => requireProductionConfiguration(), /Production configuration incomplete/);

  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('readiness response does not expose production configuration details', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  const response = safeReadyResponse(new Error('DATABASE_URL=super-secret'), 'rid-test');
  assert.deepEqual(response, { status: 'not_ready', requestId: 'rid-test' });
  assert.equal(JSON.stringify(response).includes('super-secret'), false);
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
});

test('non-production readiness response stays generic', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  const response = safeReadyResponse(new Error('internal detail'), 'rid-dev');
  assert.deepEqual(response, {
    status: 'not_ready',
    reason: 'production configuration incomplete',
    requestId: 'rid-dev'
  });
  if (previous === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previous;
});
