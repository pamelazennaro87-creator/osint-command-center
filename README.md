# OSINT Command Center

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Quality Gate](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/quality.yml/badge.svg)](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/quality.yml)
[![Deploy](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/pages.yml/badge.svg)](https://github.com/pamelazennaro87-creator/osint-command-center/actions/workflows/pages.yml)

**An evidence-first OSINT investigation workspace built around a deliberate second opinion.**

OSINT Command Center is a browser-local intelligence workbench for organizing investigations without allowing the interface to silently turn assumptions into facts.

## Live demo

Open the GitHub Pages deployment (or open `index.html` locally):

→ **https://pamelazennaro87-creator.github.io/osint-command-center/**

## What makes it different

The core workflow is not just collection. It is:

**Evidence → provenance → contradiction → shadow investigation → temporal check → decision gate → institutional memory.**

### Unique differentiators (v1)

- **Bias & Independence Radar** — live structural score of mono-culture sources, confidence inflation, untested falsifiers, AI risk and unsupported links.
- **Red Team Mode** — one-click cognitive friction layer that aggressively surfaces every gap and forces the analyst to confront it before deciding.
- **Focus Case** — the entire cockpit filters to the active investigation.
- **Proper forms** instead of browser prompts for evidence, entities, hypotheses and relationships.
- **Improved live graph** with supported vs unsupported edge styling and degree-based node size.

The **Analyst Challenge Layer** deliberately looks for reasoning drift, source dependency, unsupported confidence and falsification gaps. The **Institutional Memory** layer extracts reusable patterns and turns them into pre-investigation checks for the next case.

This is designed as an analyst tool, not an automated truth machine.

## Quick start

1. Open the [live demo](https://pamelazennaro87-creator.github.io/osint-command-center/) or clone the repo and open `index.html` in a modern browser.
2. Create a case and define its objective (or use the seeded demo).
3. Use **Focus case** so all lists and metrics stay scoped.
4. Add evidence, entities, relationships and competing hypotheses with explicit falsifiers.
5. Watch the **Bias Radar** and optionally activate **Red Team Mode**.
6. Run contradiction triage and the shadow investigation.
7. Review temporal findings and the Decision Integrity Gate.
8. Export a privacy-sanitized case package or generate the professional report.

The current browser client stores the workspace locally in the browser. No login is required for the local prototype.

## Privacy boundary

The project is intentionally **local-first**. It does not claim magical or absolute anonymity: browser local storage is not an encrypted vault and a compromised device can expose local data.

Privacy controls currently:

- anonymous per-installation local storage namespace;
- export sanitization for common secret and direct-identity field names;
- export blocking when secret-bearing fields are detected;
- restrictive server security headers;
- no camera, microphone or geolocation permissions requested by the server;
- the server fails closed for intelligence routes until authentication, authorization and server-side persistence are configured.

**Operational rule:** do not place passwords, API keys, tokens, authentication cookies or unnecessary personal identifiers into case data.

## Architecture

| Path | Role |
|------|------|
| `index.html` | Deployable browser interface |
| `src/app.js` | Application orchestration and UI actions |
| `src/core/model.js` | Domain records |
| `src/core/store.js` | Browser-local persistence, active case focus, red-team flag and audit events |
| `src/core/engine.js` | Metrics and contradiction triage |
| `src/core/drift.js` | Adversarial / shadow investigation |
| `src/core/decision.js` | Decision integrity gate and transitions |
| `src/core/memory.js` | Institutional memory and reusable patterns |
| `src/core/temporal.js` | Timeline and temporal anomaly analysis |
| `src/core/privacy.js` | Privacy audit and export sanitization |
| `src/core/report.js` | Professional report generation |
| `src/core/validation.js` | State integrity validation |
| `src/core/bias-radar.js` | Bias & Independence Radar + Red Team pressure board |
| `server/index.mjs` | Deliberately minimal fail-closed backend boundary |

## Development & quality

```bash
npm run check          # JavaScript syntax validation
npm test               # Behavioral tests
npm run test:security  # Server security boundary tests
npm run verify         # Full quality gate (check + test + security)
npm run verify:full    # + UI runtime tests
```

Every main-branch change is intended to pass the quality gate before the Pages deployment workflow publishes the validated revision.

## Security model

Read [`SECURITY.md`](SECURITY.md) before using the project with sensitive investigations.  
Read [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`ENTERPRISE_READINESS.md`](ENTERPRISE_READINESS.md) before treating the prototype as an enterprise system.

The project does **not** pretend that a static GitHub Pages client is an enterprise-secure backend. Production use requires authenticated identity, server-side authorization, durable storage, key management, audit controls and an explicit threat model.

## Status

**Operational browser prototype (v1.3.4).**  
Local investigation workflow, analytical guardrails, Bias Radar, Red Team Mode, focus case, privacy checks, reporting and GitHub Pages deployment are implemented. Enterprise backend capabilities remain intentionally fail-closed until their security prerequisites exist.

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 pamelazennaro87-creator

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```
