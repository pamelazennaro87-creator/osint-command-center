# OSINT Investigation Quality Gate

**Purpose:** prevent a plausible narrative, repeated claim, or attractive graph from being mistaken for a verified finding.

This gate is designed for public-source investigations, including multilingual, corporate, cyber, geospatial, maritime, and AI-related research. It is a review protocol, not a numerical truth score.

## The Evidence Delta method

For each material claim, record what changed after a source was examined:

- **New evidence:** a source or record adds a verifiable fact.
- **Corroboration:** an independent source supports an existing claim.
- **Contradiction:** evidence conflicts with the current explanation.
- **Context shift:** date, jurisdiction, role, entity, or definition changes the interpretation.
- **No delta:** the source repeats what is already known without adding independent evidence.
- **Unknown:** the source cannot be evaluated sufficiently.

A source that adds no independent evidence may still be useful for source genealogy, but it must not be counted as another independent confirmation.

## Gate 0 — Scope and safety

Before collection, write down:

- the research question and decision it is intended to inform;
- time window, geography and relevant jurisdiction;
- public sources and methods that are in scope;
- excluded methods and data;
- privacy, safety and potential-harm constraints;
- the point at which the investigation should stop or be escalated.

Do not bypass access controls, impersonate people, obtain private information without authorization, or publish credentials and sensitive payloads. Prefer the least intrusive method capable of answering the question.

## Gate 1 — Claim decomposition

Break each important conclusion into atomic claims that can be tested separately.

For each claim, record:

| Field | Required question |
|---|---|
| Claim ID | Can another analyst refer to this exact claim? |
| Wording | Is it specific, neutral and falsifiable? |
| Status | Observed, reported, corroborated, inferred, contradicted or unresolved? |
| Supporting evidence | What source directly supports it? |
| Counter-evidence | What could weaken or disprove it? |
| Dependencies | Does it rely on another unverified claim? |
| Time validity | When was it true, observed or reported? |
| Confidence rationale | Why does the evidence justify this level of confidence? |

Do not let a claim inherit the confidence of a parent claim without checking its own evidence.

## Gate 2 — Source provenance and independence

For each source, capture the canonical URL, publisher or issuing body, title, publication date, event date (if different), access date, archived URL where lawful and available, language, source type, and the exact claim it supports.

Assess independence by tracing origin, not by counting URLs.

Ask:
1. Is this a primary record, first-hand statement, secondary report, or aggregator?
2. Does the source link to, quote, or appear to copy another source?
3. Do the sources rely on the same unnamed official, dataset, press release or original post?
4. Can the relevant passage or record be inspected directly?
5. Is there a reason to expect selective reporting, incentives or a conflict of interest?

Five copies of one report are one evidence lineage, not five independent confirmations.

## Gate 3 — Entity resolution and relationship discipline

Before linking two people, companies, accounts, vessels, domains, applications or events, compare stable identifiers and temporal context.

Prefer, where relevant:
- official identifiers and registry numbers;
- exact legal names plus jurisdiction;
- dated role or ownership records;
- cryptographic hashes or technical fingerprints;
- documented name, flag, manager or ownership changes;
- primary records with explicit relationship language.

Name similarity, shared location, common technology, overlapping IP space, similar job history or temporal proximity are leads—not proof of identity or coordination.

Represent a relationship as:

**Entity A — [precise relationship] → Entity B | valid during [time] | supported by [evidence IDs]**

If the relationship is only inferred, label it as such. If a candidate is a false match, preserve the exclusion rationale so it is not rediscovered as a fresh lead.

## Gate 4 — Temporal integrity

Normalize timestamps to UTC when practical while preserving the original timezone and source wording.

Separate:
- event time;
- publication time;
- discovery/access time;
- first-observed and last-observed time for technical indicators;
- validity period of a role, registration or relationship.

Never use a later record to prove an earlier state without evidence of continuity. An IP address, domain, job title, corporate role or ownership relationship can change over time.

A timeline is a set of dated claims, not proof of causation.

## Gate 5 — Falsification and alternative explanations

For every leading hypothesis, write at least one plausible alternative explanation and the evidence that would distinguish them.

Use a challenge table:

| Hypothesis | Evidence that supports it | Evidence against it | Discriminating test | Current status |
|---|---|---|---|---|
| H1 | E… | E… | What observation would separate H1 from alternatives? | Open / supported / rejected |
| H2 | E… | E… | What observation would separate H2 from alternatives? | Open / supported / rejected |

Ask:
- What would I expect to see if this hypothesis were false?
- What evidence is missing because I searched only where I expected to find it?
- What would a competent skeptic argue?
- Is the conclusion driven by one source, one identifier, or a chain of assumptions?
- What finding would cause me to downgrade or withdraw the conclusion?

A hypothesis that survives scrutiny is better supported—not automatically proven.

## Gate 6 — AI-assisted research controls

AI may assist with query expansion, translation, classification, summarization, code drafting and lead generation. For every material AI-generated lead:

1. identify the underlying source;
2. inspect the source directly;
3. verify the relevant claim independently;
4. check dates, names, units and jurisdiction;
5. search for disconfirming evidence;
6. record unresolved ambiguity.

An AI answer, generated summary, model confidence statement or repeated AI output is not an independent source. Never cite a source that was not actually opened or inspected. Mark unavailable tools, inaccessible pages and failed retrievals explicitly.

## Gate 7 — Confidence language

Use qualitative confidence with a written rationale:

- **Confirmed within scope:** directly established by authoritative evidence or multiple independent, convergent lines of evidence; meaningful contradictions addressed.
- **Strongly supported:** several good lines of evidence support the claim, but a material gap remains.
- **Plausible / unverified:** consistent with available evidence but not adequately distinguished from alternatives.
- **Disputed:** material sources or evidence conflict.
- **Insufficient evidence:** available material does not support a defensible conclusion.
- **Contradicted / rejected:** stronger evidence is inconsistent with the claim or a required premise fails.

These labels are not legal findings and should not be presented as statistical probabilities. State what would change the assessment.

## Gate 8 — Privacy and harm review

Before publication, check whether the report includes information that is unnecessary to answer the research question.

- Remove secrets, tokens, session data, private messages and nonessential personal identifiers.
- Defang indicators when appropriate and explain how readers can validate them safely.
- Avoid publishing sensitive payloads when a hash, redacted excerpt or mechanism description is sufficient.
- Do not expose private individuals through speculative identity matching.
- Consider whether a detail creates a meaningful risk of harassment, retaliation or unauthorized access.
- Separate public-interest findings from curiosity-driven personal detail.

Public availability does not automatically make every detail necessary or ethical to republish.

## Gate 9 — Reproducibility and reporting

A second analyst should be able to understand how the finding was reached without trusting the author's reputation.

Record:
- exact query or search path where material;
- source URL, access date and archive reference if available;
- evidence and claim IDs;
- transformations, parsing assumptions and tool versions where relevant;
- exclusions and false-positive decisions;
- known access, language, jurisdiction and collection limitations;
- what another analyst should do to reproduce or challenge the result.

Do not claim exhaustive global coverage unless the scope and collection process justify it.

## Final release checklist

- [ ] The question and scope are explicit.
- [ ] Material claims are atomic and traceable to evidence.
- [ ] Source origin and dependence are assessed.
- [ ] Dates and entity identifiers are checked.
- [ ] Alternative hypotheses and contradictions are visible.
- [ ] AI-generated leads are independently verified.
- [ ] Confidence language matches the evidence.
- [ ] Limits and inaccessible sources are disclosed.
- [ ] Privacy and harm risks are reviewed.
- [ ] Another analyst can reproduce the central reasoning.

## Release rule

**If a material claim cannot be traced, challenged and bounded, it is not ready to be presented as a finding.**

The objective is not maximum certainty or maximum volume. It is a defensible, revisable conclusion with a visible evidence trail.
