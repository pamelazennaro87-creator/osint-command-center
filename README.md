# OSINT Command Center

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Quality Gate](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/quality.yml/badge.svg)](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/quality.yml)
[![Deploy](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/pages.yml/badge.svg)](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/pages.yml)

**An evidence-first investigation workspace built around a deliberate second opinion.**

> Do not ask only “What supports this hypothesis?”  
> Ask “What would prove it wrong?”

OSINT Command Center is a browser-local intelligence workbench.  
It exists to make it harder for an analyst to turn a plausible connection into an unsupported conclusion.

It is not a data-collection platform.  
It is an **Analytical Integrity Layer** around the investigation process.

---

## Live Demo

→ **https://pamelazennaro87-creator.github.io/osint-command-center/**

---

## Core Loop

```
Evidence
  → Provenance
    → Contradiction
      → Shadow Investigation
        → Temporal Check
          → Decision Gate
            → Institutional Memory
```

The interface is designed so that assumptions cannot silently become facts.

---

## What Makes It Different

| Feature | Purpose |
|---------|---------|
| **Bias & Independence Radar** | Live structural score of mono-culture sources, confidence inflation, untested falsifiers, AI risk, and unsupported links |
| **Red Team Mode** | One-click cognitive friction layer that surfaces every gap and forces confrontation before decision |
| **Focus Case** | Entire cockpit filters to the active investigation |
| **Decision Integrity Gate** | Explicit transition from analysis to conclusion with recorded rationale |
| **Institutional Memory** | Extracts reusable patterns and converts them into pre-investigation checks |
| **Supported vs Unsupported Edges** | Graph styling that refuses to treat every link as proven |

This is an analyst tool, not an automated truth machine.

---

## Research Signature

Every investigation should make it possible to:

- inspect the full evidence trail
- identify dependent (non-independent) sources
- test temporal consistency
- preserve contradictions instead of resolving them prematurely
- leave unresolved claims unresolved

AI may accelerate discovery and structuring. It does not replace source verification.

Before publication, run the [Investigation Quality Gate](docs/INVESTIGATION-QUALITY-GATE.md). It checks claim traceability, source independence, temporal integrity, alternative hypotheses, AI-assisted leads, privacy risks, and reproducibility.

---

## Portfolio Context

This repository is the tooling component of an evidence-first OSINT system:

| Component | Role |
|-----------|------|
| **[OSINT Signal Lab](https://github.com/pamelazennaro87-creator/osint-signal-lab-)** | Investigations, methodology, case architecture |
| **OSINT Command Center** | Investigation workspace with adversarial pressure and decision gates |
| **[PixelLeak OSINT](https://github.com/pamelazennaro87-creator/pixelleak-osint-public)** | Public evidence of AI-agent data exposure mechanisms |

**Analytical chain used across the portfolio:**

```
Question → Claims → Sources → Verification → Corroboration → Contradictions → Analysis → Confidence → Limitations
```

---

## Quick Start

1. Open the [live demo](https://pamelazennaro87-creator.github.io/osint-command-center/) or open `index.html` locally.
2. Create a case and define its objective (or load the seeded demo).
3. Activate **Focus Case** so all views stay scoped.
4. Add evidence, entities, relationships and competing hypotheses with explicit falsifiers.
5. Monitor the **Bias Radar**. Optionally activate **Red Team Mode**.
6. Run contradiction triage and the shadow investigation.
7. Review temporal findings and pass through the Decision Integrity Gate.
8. Export a privacy-sanitized package or generate the professional report.

The browser client stores the workspace locally. No login is required for the local prototype.

---

## Privacy Boundary

The project is intentionally **local-first**.

It does not claim absolute anonymity. Browser local storage is not an encrypted vault. A compromised device can expose local data.

Current controls:

- Anonymous per-installation local storage namespace
- Export sanitization for common secret and direct-identity fields
- Export blocking when secret-bearing fields are detected
- Restrictive server security headers
- No camera, microphone or geolocation permissions requested
- Server fails closed for intelligence routes until authentication and server-side persistence are configured

**Operational rule:** Do not place passwords, API keys, tokens, authentication cookies or unnecessary personal identifiers into case data.

---

## Architecture

| Path | Role |
|------|------|
| `index.html` | Deployable browser interface |
| `src/app.js` | Application orchestration |
| `src/core/model.js` | Domain records |
| `src/core/store.js` | Local persistence, focus, red-team flag, audit events |
| `src/core/engine.js` | Metrics and contradiction triage |
| `src/core/drift.js` | Adversarial / shadow investigation |
| `src/core/decision.js` | Decision integrity gate |
| `src/core/memory.js` | Institutional memory |
| `src/core/temporal.js` | Timeline and temporal anomaly analysis |
| `src/core/privacy.js` | Privacy audit and export sanitization |
| `src/core/report.js` | Professional report generation |
| `src/core/bias-radar.js` | Bias & Independence Radar + Red Team pressure |
| `server/index.mjs` | Minimal fail-closed backend boundary |

---

## Development & Quality

```bash
npm run check          # JavaScript syntax validation
npm test               # Behavioral tests
npm run test:security  # Server security boundary tests
npm run verify         # Full quality gate
npm run verify:full    # + UI runtime tests
```

Main-branch changes are expected to pass the quality gate before Pages deployment.

---

## Security Model

Read [`SECURITY.md`](SECURITY.md) before using the project with sensitive investigations.  
Read [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`ENTERPRISE_READINESS.md`](ENTERPRISE_READINESS.md) before treating the prototype as an enterprise system.

A static GitHub Pages client is not an enterprise-secure backend. Production use requires authenticated identity, server-side authorization, durable storage, key management, audit controls, and an explicit threat model.

---

## Status

**Operational browser prototype (v1.3.4)**

Local investigation workflow, analytical guardrails, Bias Radar, Red Team Mode, focus case, privacy checks, reporting, and GitHub Pages deployment are implemented.  
Enterprise backend capabilities remain deliberately fail-closed until their security prerequisites exist.

---

## Principle

> The conclusion must never be stronger than the evidence that supports it.

## License

MIT — see [LICENSE](LICENSE).
