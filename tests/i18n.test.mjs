import test from 'node:test';
import assert from 'node:assert/strict';
import { SUPPORTED_LOCALES, translate } from '../src/core/i18n.js';
import { createCase, createEvidence } from '../src/core/model.js';

test('multilingual registry defaults to English and includes priority locales',()=>{
 assert.ok(SUPPORTED_LOCALES.en); assert.ok(SUPPORTED_LOCALES.de); assert.ok(SUPPORTED_LOCALES.it); assert.ok(SUPPORTED_LOCALES.fr); assert.ok(SUPPORTED_LOCALES.es);
 assert.equal(translate('Cases','en'),'Cases'); assert.equal(translate('Cases','de'),'Fälle'); assert.equal(translate('Cases','it'),'Casi');
});
test('unknown translation safely falls back to source text',()=>assert.equal(translate('Uncatalogued label','de'),'Uncatalogued label'));
test('case stores investigation, search and report languages',()=>{
 const c=createCase({title:'x',investigationLanguage:'de',searchLanguages:['de','en','it'],reportLanguage:'en'});
 assert.equal(c.investigationLanguage,'de'); assert.deepEqual(c.searchLanguages,['de','en','it']); assert.equal(c.reportLanguage,'en');
});
test('evidence preserves original language and translation provenance',()=>{
 const e=createEvidence({claim:'Original',originalText:'Original text',originalLanguage:'de',translations:[{language:'it',text:'Traduzione',method:'machine'}]});
 assert.equal(e.originalLanguage,'de'); assert.equal(e.originalText,'Original text'); assert.equal(e.translationStatus,'NOT_TRANSLATED'); assert.equal(e.translations[0].text,'Traduzione');
});
