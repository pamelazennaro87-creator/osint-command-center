# Security Model

## Security boundary

The current static GitHub Pages application is a demonstration client. Browser `localStorage` is not a trusted security boundary and must not be treated as secure persistence, authentication, authorization, or immutable audit storage.

## Production security requirements

Production deployments must move authority to server-side services:

1. Authenticate users through an OIDC-compatible identity provider.
2. Validate issuer, audience, signature, expiry and required claims server-side.
3. Authorize every case/evidence/decision operation server-side using RBAC and, where required, case-level policy.
4. Keep secrets outside source control and client bundles.
5. Encrypt traffic with TLS and encrypt persistent sensitive data at rest.
6. Treat client input and imported evidence as untrusted data.
7. Encode untrusted output and avoid unsafe HTML injection.
8. Apply rate limits to authentication, search, imports and expensive analytical operations.
9. Record security-relevant actions in a server-authoritative, append-only or tamper-evident audit system.
10. Never allow a client to self-assert an approved decision, actor identity, authorization result, or audit event.

## AI security boundary

AI assistance is advisory. Model output must never become authoritative evidence or an authorization decision merely because a model produced it. AI-assisted evidence remains subject to the repository's human-verification and analytical-state rules.

## Threat classes

The production threat model must explicitly test:

- account takeover and token abuse
- broken object-level authorization / IDOR
- privilege escalation
- cross-tenant data access
- evidence tampering
- audit-log tampering
- XSS and injection through evidence/source fields
- malicious imported documents or URLs
- denial of service / resource exhaustion
- secret leakage through logs, errors or client bundles
- supply-chain and dependency compromise
- prompt injection through hostile source material
- AI-generated false attribution or unsupported certainty

## Release principle

A green UI deployment is not a security certification. Production Enterprise status requires implementation and verification of the controls in `ENTERPRISE_READINESS.md`.
