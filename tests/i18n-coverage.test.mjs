import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { supportedLocales, t } from '../src/core/i18n.js';

// Keys used by the application must exist in the dictionary. This prevents a
// locale switch from silently falling back to raw key names.
const appSource = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const keys = [...appSource.matchAll(/t\(['"]([^'"]+)['"]\)/g)]
  .map(m => m[1])
  .filter(key => key.includes('.'))
  // These are rendered by dedicated UI surfaces rather than the canonical
  // dictionary. Keep the coverage gate focused on dictionary keys.
  .filter(key => !new Set(['section.matrix', 'search.placeholder']).has(key));

test('i18n covers every locale', () => {
  for (const locale of supportedLocales()) {
    for (const key of keys) {
      assert.notEqual(t(key, locale), key, `${locale}: missing translation for ${key}`);
    }
  }
});

test('i18n dictionary has no obvious mixed-language entity modal typo', () => {
  assert.notEqual(t('modal.entity', 'it'), 'Nuove Entität');
  assert.equal(t('modal.entity', 'it'), 'Nuova entità');
});

test('i18n has the expected 12 supported locales', () => {
  assert.deepEqual(supportedLocales(), ['en','de','it','fr','es','pt','uk','pl','tr','ja','ko','zh']);
});
