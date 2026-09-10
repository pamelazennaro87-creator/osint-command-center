# Enterprise Readiness Gate

## Purpose

This document is the release gate for OSINT Command Center. The project must not be labelled production Enterprise until every mandatory control below is implemented and verified.

## Current state

**Architecture maturity:** Enterprise-oriented prototype / pre-production.

The analytical core already provides evidence provenance, competing hypotheses, adversarial challenge, decision integrity, Signal Debt assurance, institutional memory, validation, audit events, and automated quality/deployment checks.

The current GitHub Pages deployment remains a browser-local demonstration boundary. It is not an enterprise security boundary.

## Mandatory production gates

### 1. Identity and access
- [ ] External identity provider / OIDC integration
- [ ] Short-lived access tokens with secure validation
- [ ] Role-based access control (RBAC)
- [ ] Case-level authorization checks server-side
- [ ] Administrative actions separately authorized
- [ ] Session/token revocation strategy

### 2. Data security
- [ ] Server-side persistent database
- [ ] Encryption in transit
- [ ] Encryption at rest
- [ ] Managed secrets; no credentials in source
- [ ] Tenant isolation where multi-tenant deployment is used
- [ ] Backup and tested restore procedure
- [ ] Retention and deletion policy

### 3. Integrity and audit
- [ ] Server-authoritative audit log
- [ ] Append-only / tamper-evident audit storage
- [ ] Actor identity tied to authenticated principal
- [ ] Decision approvals require server-side integrity-gate evaluation
- [ ] Evidence provenance preserved across revisions
- [ ] Clock/timestamp policy

### 4. Application security
- [ ] Server-side schema validation
- [ ] Output encoding / XSS controls
- [ ] CSRF protection where cookie authentication is used
- [ ] Rate limiting and abuse controls
- [ ] Secure HTTP headers
- [ ] Dependency and vulnerability scanning
- [ ] Error handling that does not leak secrets or internal state

### 5. Reliability and operations
- [ ] Health/readiness endpoints
- [ ] Structured application logging
- [ ] Metrics and alerting
- [ ] Failure recovery procedure
- [ ] Disaster recovery target and restore test
- [ ] Migration/versioning strategy
- [ ] CI blocks release on failed mandatory checks

### 6. Intelligence integrity
- [x] Explicit FACT / INFERENCE / ASSUMPTION / UNKNOWN / CONTESTED states
- [x] Source reliability and independence metadata
- [x] Competing hypotheses
- [x] Falsifier requirement
- [x] Adversarial / Shadow Investigation
- [x] Decision integrity gate
- [x] Signal Debt assurance
- [x] Institutional Memory
- [x] Human verification boundary for AI-assisted evidence
- [ ] Server-enforced policy equivalents for all critical integrity controls

### 7. Release evidence
- [ ] Automated test suite covers critical paths and negative cases
- [ ] Security test suite passes
- [ ] Architecture/security review completed
- [ ] Production deployment is not GitHub Pages/localStorage
- [ ] Rollback procedure tested
- [ ] Final release checklist signed by the responsible operator

## Release rule

A release may be called **Production Enterprise** only when all mandatory unchecked items are resolved and the evidence for each gate is recorded in CI, tests, deployment configuration, or an auditable review artifact.

Until then, the correct label is **Enterprise-oriented pre-production**.

## Target architecture

```text
Client
  -> Identity Provider / OIDC
  -> API Gateway / TLS / Rate limits
  -> Authenticated Intelligence API
      -> Authorization Policy Engine
      -> Decision Integrity + Assurance Engines
      -> PostgreSQL (encrypted, versioned)
      -> Append-only Audit Store
      -> Object Storage (encrypted evidence artifacts)
      -> Secrets Manager
  -> Observability / Metrics / Alerts
  -> Backup + Disaster Recovery
```

The browser remains a client. It must not become the authoritative security, identity, audit, or persistence layer.
