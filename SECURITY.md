# Security Model

## Privacy and anonymity boundary

The browser prototype is designed for privacy minimization, not absolute anonymity. It does not require a real name for local use and stores application state under a per-installation pseudonymous browser key. No client-side identifier is a security credential.

The system must never imply that GitHub Pages, a browser, a network connection, an identity provider, or a future backend can provide absolute anonymity. Network, hosting, browser, device, and legal metadata may exist outside the application boundary.

## Data isolation

A user's intelligence data must never be exposed to another user. The current browser-local implementation isolates state by an anonymous installation identifier. This is privacy isolation for the local prototype, not multi-tenant server authorization.

Legacy state from the old global `osint-enterprise-state-v1` key is not automatically imported because that key has no installation ownership boundary. This deliberately favors isolation over silent migration. Recovery history is stored under the same installation namespace and is bounded to the most recent local revisions.

Production must enforce isolation server-side on every read, write, search, export, and analytical operation. Client-supplied case IDs, tenant IDs, roles, or actor identities must never be trusted as authorization proof. Test explicitly for IDOR/BOLA, enumeration, cross-tenant joins, export leakage, and privilege escalation.

## Privacy-by-design requirements

1. Collect the minimum identity data necessary for the requested capability.
2. Prefer pseudonymous internal identifiers over direct identity fields.
3. Keep secrets, tokens, cookies and credentials out of source control and client bundles.
4. Do not place personal identity data in URLs, client logs, telemetry, analytics, or error messages unless strictly necessary.
5. Sanitize exports and reports to prevent accidental identity or secret leakage.
6. Detect secret-like content inside free-text fields; field-name filtering alone is insufficient.
7. Avoid third-party tracking/analytics by default.
8. Encrypt traffic with TLS and encrypt persistent sensitive data at rest in production.
9. Define retention and deletion controls appropriate to the deployment and jurisdiction.
10. Keep identity/authentication data logically separated from intelligence data where practical.
11. Record security-relevant actions in a server-authoritative, append-only or tamper-evident audit system in production.

## Local integrity and recovery boundary

The local prototype provides bounded revision history and monotonically increasing local revisions to improve recovery from accidental corruption or destructive edits. These controls are **recovery and continuity controls, not cryptographic tamper-proofing**: a party who fully controls the browser storage can alter both the current state and its recovery history.

The product must therefore distinguish:

- **local revision history** — recovery aid;
- **analytical audit trail** — contextual record of actions;
- **tamper-evident/server-authoritative audit** — production integrity control.

No local mechanism should be described as immutable evidence or authoritative institutional history.

## Production security requirements

Production deployments must move authority to server-side services:

1. Authenticate users through an OIDC-compatible identity provider.
2. Validate issuer, audience, signature, expiry and required claims server-side.
3. Authorize every case/evidence/decision operation server-side using RBAC and case-level/tenant-level policy.
4. Keep secrets outside source control and client bundles.
5. Treat client input and imported evidence as untrusted data.
6. Encode untrusted output and avoid unsafe HTML injection.
7. Apply rate limits to authentication, search, imports and expensive analytical operations.
8. Never allow a client to self-assert an approved decision, actor identity, authorization result, or audit event.

## AI security boundary

AI assistance is advisory. Model output must never become authoritative evidence or an authorization decision merely because a model produced it. AI-assisted evidence remains subject to human verification and analytical-state rules. Imported source material must be treated as potentially hostile prompt-injection content.

## Threat classes

The production threat model must explicitly test:

- account takeover and token abuse
- broken object-level authorization / IDOR / BOLA
- privilege escalation
- cross-tenant data access
- case and export enumeration
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
