# OSINT Command Center — Product Brief

## Positioning

OSINT Command Center is an evidence-first investigation workspace designed to improve analytical integrity.

It is not a replacement for large data-collection or link-analysis platforms.  
Its value sits in the layer between raw research and an accountable investigative conclusion.

**Core promise:** make it harder to turn a plausible connection into an unsupported conclusion.

---

## The Investigation Loop

1. Define the case and investigative question
2. Capture evidence with provenance
3. Separate observations, claims, hypotheses, and decisions
4. Map entities and relationships
5. Record contradictions instead of hiding them
6. Challenge the leading hypothesis (Red Team)
7. Check temporal consistency and source independence
8. Pass conclusions through a Decision Integrity Gate
9. Produce a traceable report
10. Preserve institutional memory for later review

---

## Differentiator

The product treats analytical error as a first-class object.

- A connection can exist in the graph while remaining unproven
- A hypothesis can be useful while remaining falsifiable
- AI-assisted discovery can accelerate research without automatically becoming factual evidence

This creates a practical **Analytical Integrity Layer** around OSINT work.

---

## Target Users

- Independent OSINT researchers
- Investigative journalists and research desks
- Corporate investigation and due-diligence teams
- Threat-intelligence analysts
- Risk and compliance teams
- NGOs and human-rights research teams
- Small intelligence and security units

---

## Product Ladder

| Tier | Description |
|------|-------------|
| **Community** | Local-first browser workspace for individual researchers. Suitable for evaluation and non-sensitive demonstrations |
| **Analyst** | Full case management, evidence chains, entity/relationship analysis, contradiction tracking, hypothesis challenge, decision gates, professional reporting |
| **Team** | Shared cases, role-based access, controlled collaboration, centralized audit trails, organizational administration |
| **Enterprise / On-premise** | Private deployment, enterprise identity, encryption/key management, granular authorization, retention controls, audit export, integrations, security review support |

Pricing should be validated through customer discovery rather than fixed in advance.

---

## MVP Acceptance Criteria

The commercial MVP is ready for pilot when an analyst can:

- Open a case and understand its state immediately
- Add and classify evidence with provenance
- Create entities and relationships
- Inspect an interactive relationship graph that distinguishes supported from unsupported edges
- Connect claims and hypotheses to supporting and contradicting evidence
- Run a structured challenge / second-opinion pass
- See temporal inconsistencies
- Make a documented decision with rationale
- Export a professional, traceable report
- Understand exactly what is stored locally and what is not transmitted

---

## Security Boundary

The current browser prototype is local-first.  
It does not claim absolute anonymity or enterprise-grade multi-user security.

Browser storage is not equivalent to encrypted enterprise storage.  
A public GitHub Pages deployment contains public application code.

Enterprise claims require a server-side security architecture with authentication, authorization, encrypted persistence, tenant isolation, secret management, logging, and independent security testing.

---

## Go-to-Market Thesis

Lead with the problem of **analytical integrity**, not with a generic claim of being another OSINT graph tool.

A strong pilot demonstration takes one investigation from evidence intake to final decision and shows where the system prevents an analyst from confusing:

**observed → reported → inferred → hypothesized → decided**

That distinction is the product story.

---

## Alignment with Laboratory Doctrine

This tool operationalizes the same principles used in the OSINT Signal Lab:

- Evidence before narrative
- Independence is proven, never assumed
- Time is a first-class variable
- Negative space is evidence
- AI is a discovery instrument, never a verdict engine
- UNRESOLVED is a professional result
