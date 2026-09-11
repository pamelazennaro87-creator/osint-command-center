/**
 * graph-ui.js — compatibility layer
 * Entity inspection is handled exclusively by src/entity-inspector.js
 * to avoid duplicate panels and competing click/keydown handlers.
 * This file remains loaded for any future graph-specific UI helpers.
 */

// Intentionally empty of inspector logic.
// visual-engine.js creates nodes with classes: entity-node living-node
// entity-inspector.js listens for .living-node[data-entity-id]
