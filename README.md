# OSINT Command Center

**An evidence-first OSINT investigation workspace built around a deliberate second opinion.**

OSINT Command Center is a browser-local intelligence workbench for organizing investigations without allowing the interface to silently turn assumptions into facts.

## What makes it different

The core workflow is not just collection. It is:

**Evidence → provenance → contradiction → shadow investigation → temporal check → decision gate → institutional memory.**

The **Analyst Challenge Layer** deliberately looks for reasoning drift, source dependency, unsupported confidence and falsification gaps. The **Institutional Memory** layer extracts reusable patterns and turns them into pre-investigation checks for the next case.

This is designed as an analyst tool, not an automated truth machine.

## Use it

1. Open the GitHub Pages deployment.
2. Create a case and define its objective.
3. Add evidence and source locators.
4. Add entities and relationships when a connection needs to be tested.
5. Create competing hypotheses and define falsifiers.
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
- `src/core/store.js` — browser-local persistence and audit events.
- `src/core/engine.js` — metrics and contradiction triage.
- `src/core/drift.js` — adversarial/shadow investigation.
- `src/core/decision.js` — decision integrity gate and transitions.
- `src/core/memory.js` — institutional memory and reusable patterns.
- `src/core/temporal.js` — timeline and temporal anomaly analysis.
- `src/core/privacy.js` — privacy audit and export sanitization.
- `src/core/report.js` — professional report generation.
- `src/core/validation.js` — state integrity validation.
- `server/index.mjs` — deliberately minimal fail-closed backend boundary.

## Quality gate

Every main-branch change is intended to pass JavaScript syntax checks, behavioral tests and required-file checks before the Pages deployment workflow publishes the validated revision.

The deployment workflow is chained to the successful Quality Gate, preventing a failed validation run from being published through the normal path.

## Security model

Read `SECURITY.md` before using the project with sensitive investigations. Read `ARCHITECTURE.md` and `ENTERPRISE_READINESS.md` before treating the prototype as an enterprise system.

The project does **not** pretend that a static GitHub Pages client is an enterprise-secure backend. Production use requires authenticated identity, server-side authorization, durable storage, key management, audit controls and an explicit threat model.

## Status

**Operational browser prototype.** The local investigation workflow, analytical guardrails, privacy checks, reporting and GitHub Pages deployment are implemented. Enterprise backend capabilities remain intentionally fail-closed until their security prerequisites exist.

## License

See the repository for the applicable project terms.
