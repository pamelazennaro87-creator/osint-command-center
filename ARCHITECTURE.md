# OSINT Enterprise Architecture

## Mission
OSINT Enterprise is a **Decision Integrity Operating System**, not a collection of OSINT tools. Its purpose is to make investigations structurally resistant to confirmation bias, source illusion, reasoning drift, premature certainty, and narrative lock-in.

The product does not merely help an analyst collect information. It continuously asks whether the current explanation deserves to survive.

## Five-engine operating model

`Evidence Graph → Narrative Engine → Adversarial Engine → Decision Integrity → Institutional Memory`

These engines form a closed analytical loop:

`Observe → Attribute → Corroborate → Challenge → Falsify → Compare → Decide → Preserve → Learn`

### 1. Evidence Graph
Captures evidence, provenance, sources, entities, relationships, timestamps, status, confidence, and AI-assistance metadata. Relationships are claims requiring evidence, not facts created by proximity in a graph.

### 2. Narrative Engine
Maintains competing hypotheses and the evidence for and against them. The system preserves uncertainty and alternative explanations instead of forcing premature narrative closure.

### 3. Adversarial Engine
Runs the **Shadow Investigation** against the primary narrative. It detects structural weaknesses such as unsupported certainty, source dependency, corroboration collapse, opposing-evidence gaps, untested falsifiers, candidate claim conflicts, and AI attribution risks. Each signal maps to a Repair Mode.

### 4. Decision Integrity Engine
Treats decisions as first-class records. The **Decision Integrity Gate** evaluates case linkage, evidence support, falsification, contradictions, source independence, confidence alignment, AI verification, reasoning drift, rationale, and risk acceptance. It produces `PASS`, `REVIEW`, or `BLOCKED` and exposes whether approval is eligible.

### 5. Institutional Memory
Converts recurring analytical failures and corrective patterns into reusable memory. It currently derives deterministic records for failure signatures, repair modes, contradiction patterns, and falsifier patterns. Patterns are canonicalized, counted across cases, and queryable. This is not an ML prediction claim: it is auditable structured learning from prior investigations.

## Core lifecycle

`Case → Evidence → Source → Entity → Relationship → Hypothesis → Contradiction → Challenge → Decision → Report → Memory`

Every transition is designed to preserve provenance and an auditable trail.

## Analytical states

- **FACT** — directly supported by traceable evidence.
- **INFERENCE** — analytical interpretation derived from evidence.
- **ASSUMPTION** — working premise that has not been established.
- **UNKNOWN** — insufficient evidence.
- **CONTESTED** — credible evidence conflicts with the current claim.

## Non-negotiable rules

1. A plausible conclusion is never automatically an established fact.
2. Corroboration requires independence, not repetition.
3. A conclusion without a credible falsifier is analytically incomplete.
4. AI assistance never becomes authority by default.
5. A contradiction is a signal to investigate, not proof of deception.
6. A material decision must remain traceable to the evidence and hypotheses that produced it.
7. The system must preserve what is unknown instead of silently filling gaps.
8. An approved decision must be eligible under the integrity gate; blocked reasoning cannot be silently promoted to approval.
9. Institutional memory must remain attributable to the cases and analytical signals that produced it.

## Product boundary

The current GitHub Pages implementation is a browser-local foundation. It demonstrates the domain model and integrity engines but is not a secure enterprise backend. Production requires authenticated server-side services, authorization, encrypted storage, immutable audit, secure secrets, backups, controlled source acquisition, retention policy, and tenant isolation where applicable.

No secrets, credentials, API keys, or sensitive case material belong in the static client.
