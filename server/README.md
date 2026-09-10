# Enterprise API Foundation

This directory is the server-side boundary for the production architecture.

The initial service deliberately fails closed: it exposes only health/readiness endpoints and returns `501` for intelligence operations until authentication, authorization and persistent storage are implemented.

## Required production dependencies

- OIDC-compatible identity provider
- Server-side token verification
- RBAC + case-level authorization
- PostgreSQL or equivalent transactional database
- Encrypted object storage for evidence artifacts
- Append-only/tamper-evident audit storage
- Managed secrets
- Centralized logs, metrics and alerts

## Environment contract

`OIDC_ISSUER`, `OIDC_AUDIENCE`, and `DATABASE_URL` are required before readiness can report production-ready. No secret belongs in the repository or browser bundle.

## Design rule

The browser is a client. The server becomes authoritative for identity, authorization, persistence, decision approval and audit history.
