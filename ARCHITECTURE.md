# OSINT Enterprise Architecture

## Mission
OSINT Enterprise is a **Decision Integrity Operating System**, not a collection of OSINT tools. Its purpose is to make an investigation structurally resistant to confirmation bias, source illusion, reasoning drift, premature certainty, and narrative lock-in.

The product does not merely help an analyst collect information. It continuously asks whether the current explanation deserves to survive.

## What makes it different

Most intelligence software optimizes collection, search, graphing, or reporting. OSINT Enterprise optimizes the **integrity of the reasoning chain between evidence and decision**.

Its distinctive loop is:

`Observe → Attribute → Corroborate → Challenge → Falsify → Compare → Decide → Preserve`

The primary narrative and a deliberately adversarial **Shadow Investigation** are maintained as parallel analytical objects. The shadow is not an AI opinion and not a second dashboard: it is a deterministic challenge layer that exposes structural weaknesses in the investigation.

## Core lifecycle

`Case → Evidence → Source → Entity → Relationship → Hypothesis → Contradiction → Challenge → Decision → Report`

Every transition preserves provenance and an auditable trail.

## Decision Integrity Model

### 1. Evidence Intelligence
Captures observations with provenance, status, timestamp, confidence, locator, and AI-assistance metadata. Evidence is never promoted from interpretation to fact merely because it sounds plausible.

### 2. Source Independence Intelligence
Tracks reliability separately from independence. Ten articles repeating one original claim are not ten independent confirmations. Independence groups expose this hidden duplication.

### 3. Entity & Relationship Graph
Represents people, organizations, companies, assets, locations, and events. Relationships are claims requiring evidence, not facts created by proximity in a graph.

### 4. Competing Hypothesis Space
Important cases should not collapse into one narrative too early. Multiple hypotheses can coexist with explicit supporting and opposing evidence.

### 5. Contradiction Engine
Flags candidate conflicts across claims and hypotheses. A contradiction is an investigation signal, never an automatic declaration that someone is lying.

### 6. Confidence Discipline
Confidence belongs to a claim and must remain traceable to its evidence. High confidence without proportional support becomes a measurable reasoning-drift signal.

### 7. Falsification Contract
Every material hypothesis should state what would make it fail. The system distinguishes between a falsifier that is merely defined and one that has actually been tested.

### 8. Shadow Investigation
The system independently scans the case for:
- unsupported certainty
- source dependency
- corroboration collapse
- opposing-evidence gaps
- untested falsifiers
- candidate claim conflicts
- AI attribution/verification risks

Each finding receives a **Repair Mode** rather than merely an alert. This turns detection into an operational correction loop.

### 9. Decision Integrity Layer
Decisions are first-class records rather than the final paragraph of a report. A decision can be draft, review, approved, rejected, or superseded and carries rationale, linked hypotheses, owner, and explicit risk acceptance.

### 10. Institutional Memory
The durable unit of knowledge is not a bookmark or document. It is the relationship between an observation, its provenance, the hypothesis it changed, the challenge that tested it, and the decision it influenced. This creates a future-ready analytical memory model.

### 11. AI Reasoning Audit
AI is treated as an accelerator, not an authority. AI-assisted evidence is explicitly marked and verification boundaries are preserved. The architecture is designed so an AI layer can later propose candidates while the integrity layer remains deterministic and auditable.

### 12. Enterprise Reporting
Reports should be generated from the decision record, preserving uncertainty, alternative explanations, contradictions, and unresolved gaps instead of producing a polished narrative that hides them.

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
6. Every material decision must remain traceable to the evidence and hypotheses that produced it.
7. The system must preserve what is unknown instead of silently filling gaps.

## Product boundary

The current GitHub Pages implementation is a browser-local foundation. It demonstrates the domain model and integrity engine but is not a secure enterprise backend. Production requires authenticated server-side services, authorization, encrypted storage, immutable audit, secure secrets, backups, controlled source acquisition, retention policy, and tenant isolation where applicable.

No secrets, credentials, API keys, or sensitive case material belong in the static client.
