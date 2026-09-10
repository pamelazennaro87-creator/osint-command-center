# OSINT Command Center

## Enterprise Intelligence Operating System

OSINT Command Center is an evidence-first intelligence operating system for structured investigations. It connects evidence, provenance, entities, relationships, hypotheses, contradictions, uncertainty, counter-narratives and decision support.

> **Find the signal. Trace the evidence. Challenge the conclusion.**

### Implemented foundation

The GitHub Pages application provides a functional browser-local intelligence foundation:

- Case creation and persistence with `localStorage`
- Structured evidence, source, entity, relationship, hypothesis and contradiction models
- Bounded confidence values and analytical status states
- Source reliability and independence metadata
- Deterministic contradiction triage
- Temporal Integrity Engine for historical identity/state changes
- Counter-narrative / falsifier fields for hypotheses
- AI-assisted evidence attribution with human-review guardrails
- Audit-event model for traceability
- State validation for broken references and duplicate IDs
- Live Command Center metrics derived from stored state
- GitHub Actions quality gate
- GitHub Pages deployment pipeline

### Temporal integrity

The Temporal Integrity Engine groups observations by stable identifiers and compares historical field values across dated evidence. It can surface changes in names, flags, ownership, management, status or other analyst-defined temporal fields without treating a later state as a logical contradiction of an earlier snapshot.

**Core rule: `STATE_CHANGE ≠ CONTRADICTION`.** A historical discrepancy becomes analytically meaningful only when the evidence supports that interpretation; the engine therefore preserves the timeline and leaves the conclusion to the analyst.

Stable identifiers may be supplied explicitly or extracted from supported embedded identifiers such as IMO, MMSI, LEI and ICAO. The model is not tied to the BERILL case or to a single identifier type.

### Analytical rule

The system distinguishes:

- **FACT** — directly supported by traceable evidence
- **INFERENCE** — interpretation derived from evidence
- **ASSUMPTION** — working premise, not established
- **UNKNOWN** — insufficient evidence
- **CONTESTED** — credible evidence conflicts with the claim

**A plausible conclusion is never automatically an established fact.**

### Architecture

`Case → Evidence → Source → Entity → Relationship → Hypothesis → Contradiction → Confidence → Decision → Report`

The temporal layer operates across the Evidence portion of this chain:

`Evidence → Stable Identifier → Historical Field State → Timeline → Temporal Signal → Analyst Assessment`

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the domain specification and production boundary.

### Production boundary

The current deployment is intentionally client-side and uses browser-local storage. It is a functional foundation, not a claim of production security. A production deployment must move sensitive data behind an authenticated server/API and add authorization, encrypted storage, immutable audit logging, secure secret management, backups, and controlled source acquisition.

No API keys, credentials or secrets belong in the static site.

### Repository structure

```text
.
├── index.html
├── ARCHITECTURE.md
├── src/
│   ├── app.js
│   └── core/
│       ├── model.js
│       ├── store.js
│       ├── engine.js
│       ├── temporal.js
│       └── validation.js
├── tests/
│   ├── drift.test.mjs
│   └── temporal.test.mjs
└── .github/workflows/
    ├── pages.yml
    └── quality.yml
```
