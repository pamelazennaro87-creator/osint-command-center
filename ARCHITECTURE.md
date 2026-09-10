# OSINT Enterprise Architecture

## Mission
OSINT Enterprise is an evidence-first intelligence operating system. It is designed to prevent plausible analysis from being mistaken for established fact.

## Core lifecycle

`Case → Evidence → Source → Entity → Relationship → Hypothesis → Contradiction → Confidence → Decision → Report`

Every transition preserves provenance and an auditable trail.

## Core modules

### Evidence Intelligence
Captures evidence items with type, source, status, timestamp, and analyst notes. Evidence states are explicitly separated into verified, corroborated, unverified, disputed, and rejected.

### Source Intelligence
Tracks provenance and source quality. Source quality is not the same as truth: reliability, independence, recency, and corroboration are separate signals.

### Entity & Relationship Graph
Represents people, organizations, companies, assets, locations, and other entities. Relationships are observations that require evidence rather than assumptions.

### Hypothesis Engine
Allows competing hypotheses to coexist. A hypothesis can be supported, weakened, contested, untested, or rejected.

### Contradiction Engine
Flags conflicts between evidence, entities, timelines, and hypotheses. Contradictions are investigation signals, not automatic proof of deception.

### Confidence & Uncertainty
Separates fact, inference, assumption, and unknown. Confidence is attached to an analytical claim and must remain traceable to its supporting evidence.

### Counter-Narrative Engine
For every important conclusion, the system asks what evidence would falsify it and whether a credible alternative explanation exists.

### AI Reasoning Audit
AI-assisted findings are explicitly marked. Human verification is mandatory before an AI-generated observation can become a verified intelligence claim.

### Investigation Workflow
Cases contain objectives, tasks, evidence, hypotheses, contradictions, decisions, and an audit history.

### Decision Intelligence
Transforms validated analysis into decision-ready outputs while preserving uncertainty and competing explanations.

### Reporting
Produces structured intelligence packages from the case record instead of free-floating conclusions.

### Governance
Records access role, audit events, verification responsibility, and system guardrails. No collaboration or social features are required for the core product.

## Analytical states

- **FACT** — directly supported by traceable evidence.
- **INFERENCE** — analytical interpretation derived from evidence.
- **ASSUMPTION** — working premise that has not been established.
- **UNKNOWN** — insufficient evidence.
- **CONTESTED** — credible evidence conflicts with the current claim.

## Non-negotiable rule

> The system must never confuse a plausible conclusion with an established fact.

## Security boundary

The current GitHub Pages implementation is a client-side prototype. Local browser storage is used for demonstration data persistence. No secrets, credentials, API keys, or sensitive case material should be embedded in the static client. Production deployment requires a server-side API, authenticated identity, encrypted storage, authorization policy, immutable audit logging, and secure secret management.
