# OSINT Command Center

**An evidence-first OSINT investigation workspace built around a deliberate second opinion.**

OSINT Command Center is a browser-local intelligence workbench for organizing investigations without allowing the interface to silently turn assumptions into facts.

## What makes it different

The core workflow is not just collection. It is:

**Evidence → provenance → contradiction → shadow investigation → temporal check → decision gate → institutional memory.**

### Unique differentiators (v1 optimize)

- **Bias & Independence Radar** — live structural score of mono-culture sources, confidence inflation, untested falsifiers, AI risk and unsupported links.
- **Red Team Mode** — one-click cognitive friction layer that aggressively surfaces every gap and forces the analyst to confront it before deciding.
- **Focus Case** — the entire cockpit filters to the active investigation.
- **Proper forms** instead of browser prompts for evidence, entities, hypotheses and relationships.
- **Improved live graph** with supported vs unsupported edge styling and degree-based node size.

The **Analyst Challenge Layer** deliberately looks for reasoning drift, source dependency, unsupported confidence and falsification gaps. The **Institutional Memory** layer extracts reusable patterns and turns them into pre-investigation checks for the next case.

This is designed as an analyst tool, not an automated truth machine.

## Use it

1. Open the GitHub Pages deployment (or open `index.html` locally).
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

- `index.html` — deployable browser interface.
- `src/app.js` — application orchestration and UI actions.
- `src/core/model.js` — domain records.
- `src/core/store.js` — browser-local persistence, active case focus, red-team flag and audit events.
- `src/core/engine.js` — metrics and contradiction triage.
- `src/core/drift.js` — adversarial/shadow investigation.
- `src/core/decision.js` — decision integrity gate and transitions.
- `src/core/memory.js` — institutional memory and reusable patterns.
- `src/core/temporal.js` — timeline and temporal anomaly analysis.
- `src/core/privacy.js` — privacy audit and export sanitization.
- `src/core/report.js` — professional report generation.
- `src/core/validation.js` — state integrity validation.
- `src/core/bias-radar.js` — **Bias & Independence Radar + Red Team pressure board**.
- `server/index.mjs` — deliberately minimal fail-closed backend boundary.

## Quality gate

Every main-branch change is intended to pass JavaScript syntax checks, behavioral tests and required-file checks before the Pages deployment workflow publishes the validated revision.

## Security model

Read `SECURITY.md` before using the project with sensitive investigations. Read `ARCHITECTURE.md` and `ENTERPRISE_READINESS.md` before treating the prototype as an enterprise system.

The project does **not** pretend that a static GitHub Pages client is an enterprise-secure backend. Production use requires authenticated identity, server-side authorization, durable storage, key management, audit controls and an explicit threat model.

## Status

**Operational browser prototype (optimize-structure-v1).**  
Local investigation workflow, analytical guardrails, Bias Radar, Red Team Mode, focus case, privacy checks, reporting and GitHub Pages deployment are implemented. Enterprise backend capabilities remain intentionally fail-closed until their security prerequisites exist.

## License

See the repository for the applicable project terms.
