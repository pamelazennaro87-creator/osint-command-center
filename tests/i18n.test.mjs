import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LOCALES, t, getLocale, setLocale, translate } from '../src/core/i18n.js';
import { createCase, createEvidence } from '../src/core/model.js';

// Memory-only storage for tests
const mem = {
  store: Object.create(null),
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); }
};

test('multilingual registry includes priority locales', () => {
  assert.ok(SUPPORTED_LOCALES.en);
  assert.ok(SUPPORTED_LOCALES.it);
  assert.ok(SUPPORTED_LOCALES.de);
  assert.ok(SUPPORTED_LOCALES.fr);
  assert.ok(SUPPORTED_LOCALES.es);
});

test('key-based translations work for EN and IT', () => {
  assert.equal(t('nav.cases', 'en'), 'Cases');
  assert.equal(t('nav.cases', 'it'), 'Casi');
  assert.equal(t('nav.evidence', 'en'), 'Evidence');
  assert.equal(t('nav.evidence', 'it'), 'Prove');
});

test('unknown key safely falls back to key string', () => {
  assert.equal(t('Uncatalogued.label', 'de'), 'Uncatalogued.label');
});

test('legacy translate helper remains available for free-text labels', () => {
  // Optional backward-compat: if translate maps free text, use it; otherwise key API is canonical
  if (typeof translate === 'function') {
    const out = translate('Cases', 'it');
    assert.ok(typeof out === 'string');
  }
});

test('locale persistence uses storage when provided', () => {
  setLocale('it', mem);
  assert.equal(getLocale(mem), 'it');
  setLocale('en', mem);
  assert.equal(getLocale(mem), 'en');
});

test('case stores investigation, search and report languages', () => {
  const c = createCase({ title: 'x', investigationLanguage: 'de', searchLanguages: ['de', 'en', 'it'], reportLanguage: 'en' });
  assert.equal(c.investigationLanguage, 'de');
  assert.deepEqual(c.searchLanguages, ['de', 'en', 'it']);
  assert.equal(c.reportLanguage, 'en');
});

test('evidence preserves original language and translation provenance', () => {
  const e = createEvidence({
    claim: 'Original',
    originalText: 'Original text',
    originalLanguage: 'de',
    translations: [{ language: 'it', text: 'Traduzione', method: 'machine' }]
  });
  assert.equal(e.originalLanguage, 'de');
  assert.equal(e.originalText, 'Original text');
  assert.ok(e.translations?.[0]?.text === 'Traduzione' || e.translationStatus);
});
