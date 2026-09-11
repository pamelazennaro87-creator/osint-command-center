# Graph Behavior — Phase 1

## Scope
UI-only investigative graph behavior. This layer must not modify the analytical model, store, privacy, decision gate, security boundary, or CI logic.

## Required behavior
- Render a visible graph host when graph data exists.
- Show an explicit investigative legend for node/edge certainty.
- Selecting a node emphasizes it and its immediate neighbors.
- Unrelated nodes and edges are visually de-emphasized during focus.
- Relationship presentation distinguishes supported, inferred, and unsupported relationships without presenting inference as fact.
- Edge hover/focus exposes relationship context without browser alerts.
- Empty graph state gives a concrete next action instead of demo content.
- Preserve a single Entity Inspector interaction path.

## Verification gate
A UI change is not complete until syntax/tests pass and the exact commit is deployed to Pages. CI green alone is not a deployment claim.
