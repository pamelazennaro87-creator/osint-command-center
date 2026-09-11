import test from 'node:test';
import assert from 'node:assert/strict';
import { graphStatus, edgeLabel, GRAPH_STATUS } from '../src/graph-behavior.js';

test('graph relationship status is explicit', () => {
  assert.equal(graphStatus({ status: 'supported' }), GRAPH_STATUS.SUPPORTED);
  assert.equal(graphStatus({ status: 'inferred' }), GRAPH_STATUS.INFERRED);
  assert.equal(graphStatus({ status: 'unknown' }), GRAPH_STATUS.UNSUPPORTED);
});

test('graph edge labels never imply unsupported certainty', () => {
  assert.equal(edgeLabel({ relation: 'owns', status: 'supported' }), 'owns · supported');
  assert.equal(edgeLabel({ relation: 'knows', status: 'inferred' }), 'knows · inferred');
  assert.equal(edgeLabel({ relation: 'linked', status: 'unknown' }), 'linked · unsupported');
});
