# OSINT Research Methodology

## Purpose

This document describes the working method used in this portfolio for open-source intelligence research.

The goal is not to automate conclusions. The goal is to make research **traceable, testable and appropriately cautious**.

## Investigation chain

```text
Research question
      ↓
Claims to test
      ↓
Source discovery
      ↓
Source assessment
      ↓
Independent verification
      ↓
Corroboration / contradiction
      ↓
Timeline + relationship analysis
      ↓
Confidence assessment
      ↓
Report + limitations
```

## 1. Define the question

Start with a specific question and a defined scope.

Record:

- what is being investigated;
- the relevant date or time window;
- geographic or jurisdictional scope;
- what would count as evidence;
- what would falsify the working hypothesis.

Avoid changing the question silently during collection.

## 2. Separate claims from facts

Every important statement should be treated as a **claim to test**, not as a fact merely because it appears online.

Useful categories:

- **Observed** — directly visible in a source.
- **Corroborated** — supported by independent sources.
- **Reported** — attributed to a source but not independently verified.
- **Inferred** — a reasoned interpretation from available evidence.
- **Unresolved** — evidence is insufficient or contradictory.

## 3. Evaluate sources

Source quality is contextual. Consider:

- provenance;
- primary vs secondary status;
- publication date;
- proximity to the event;
- independence from other sources;
- incentives or potential conflicts;
- whether the underlying evidence is accessible;
- whether the claim has been copied across otherwise independent-looking pages.

A large number of identical repetitions does not automatically equal independent corroboration.

## 4. Corroborate

Prefer **independent paths to the same fact**.

Useful corroboration can include:

- official/public records;
- archived versions;
- reputable reporting;
- corporate or organizational records;
- geospatial evidence;
- technical metadata;
- contemporaneous statements;
- independent databases.

Document meaningful contradictions instead of hiding them.

## 5. Build timelines

Dates can expose weak assumptions.

For each material event, record:

| Date | Event | Source | Confidence | Notes |
|---|---|---|---|---|

Check whether the proposed sequence is actually possible and whether later sources are being incorrectly used to establish earlier facts.

## 6. Map relationships

Relationships should be represented as claims with evidence, not as visual decoration.

For an important relationship, record:

**Entity A → relationship → Entity B → supporting evidence → date/context**

Unsupported edges should remain visibly unsupported.

## 7. Use AI carefully

AI can accelerate:

- discovery;
- classification;
- summarization;
- translation;
- pattern detection;
- query expansion.

AI output is not evidence by itself.

Human verification remains required for material claims. When AI-assisted discovery produces a lead, return to the underlying source and verify the claim independently.

## 8. Handle uncertainty explicitly

A professional report should be comfortable saying:

- confirmed;
- strongly supported;
- plausible but unverified;
- disputed;
- insufficient evidence;
- contradicted.

Do not convert uncertainty into false precision.

## 9. Protect people and data

Collect only what is necessary for the research question.

Do not publish:

- credentials;
- authentication tokens;
- private messages obtained without authorization;
- unnecessary personal identifiers;
- sensitive payloads when a non-sensitive fingerprint is sufficient.

Responsible disclosure should preserve the evidence needed to understand the mechanism without unnecessarily reproducing harm.

## 10. Reporting structure

A concise case report should normally contain:

1. Research question
2. Scope and date
3. Key claims
4. Sources
5. Method
6. Evidence
7. Corroboration and contradictions
8. Timeline / relationships
9. Analysis
10. Confidence
11. Limitations
12. Conclusion
13. Reproducibility notes

## Core rule

**The conclusion must never be stronger than the evidence supporting it.**
