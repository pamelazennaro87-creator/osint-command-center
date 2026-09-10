import test from 'node:test';
import assert from 'node:assert/strict';
import { parseUrl, extractSignals, usernamePermutations, dmsToDecimal, decimalToDms, geoDistanceBearing, normalizeTimestamp, textDiff, evidenceStrength } from '../src/tools/lab.js';

test('URL parser normalizes and removes fragment',()=>{const r=parseUrl('Example.COM/a?x=1#secret');assert.equal(r.normalized,'https://example.com/a?x=1');assert.equal(r.hostname,'example.com');assert.equal(r.registrableDomain,'example.com');});
test('signal radar extracts common IOCs',()=>{const r=extractSignals('mail a@b.com https://example.org 8.8.8.8 deadbeefdeadbeefdeadbeefdeadbeef 2026-09-10 @arty');assert.ok(r.emails.includes('a@b.com'));assert.ok(r.urls.includes('https://example.org'));assert.ok(r.ipv4.includes('8.8.8.8'));assert.ok(r.dates.includes('2026-09-10'));assert.ok(r.mentions.includes('@arty'));});
test('username pivots are deterministic and unique',()=>{const r=usernamePermutations('Jane.Doe');assert.ok(r.includes('janedoe'));assert.equal(new Set(r).size,r.length);});
test('geo conversion and distance are deterministic',()=>{assert.equal(dmsToDecimal(45,0,0,'N'),45);assert.deepEqual(decimalToDms(-45.5,'lat'),{degrees:45,minutes:30,seconds:0,hemisphere:'S'});const r=geoDistanceBearing(45,0,45,1);assert.ok(r.distanceKm>70&&r.distanceKm<80);assert.ok(r.bearing>80&&r.bearing<100);});
test('timestamp normalizer returns canonical representation',()=>{const r=normalizeTimestamp('2026-09-10T17:30:00Z');assert.equal(r.iso,'2026-09-10T17:30:00.000Z');assert.equal(typeof r.epochMs,'number');});
test('text diff reports changed lines only',()=>{assert.deepEqual(textDiff('a\nb','a\nc'),[{line:2,before:'b',after:'c'}]);});
test('evidence heuristic is bounded and banded',()=>{const r=evidenceStrength({sourceReliability:1,corroboration:1,provenance:1,humanVerified:true});assert.equal(r.score,100);assert.equal(r.band,'STRONG');});
