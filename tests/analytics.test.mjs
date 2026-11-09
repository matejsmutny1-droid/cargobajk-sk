import test from 'node:test';
import assert from 'node:assert/strict';
import {webAnalyticsEnabled} from '../lib/web-analytics.ts';

test('production catalogue, product and contact pages are measured in both languages',()=>{
 for(const path of ['/', '/bicykle','/bicykle/flex','/kontakt','/en','/en/bicykle','/en/bicykle/flex','/en/kontakt']) {
  assert.equal(webAnalyticsEnabled(new URL('https://cargobajk.sk'+path)),true,path);
 }
});
test('private offers, quote forms and API routes never load analytics, including query or fragment links',()=>{
 for(const path of ['/sprava-ponuky#private-offer','/potvrdenie-ponuky#customer-offer','/nezavazna-ponuka?model=flex','/kosik','/objednavka','/api/inquiry','/en/nezavazna-ponuka?model=flex','/en/potvrdenie-ponuky#customer-offer','/sprava-ponuky/']) {
  assert.equal(webAnalyticsEnabled(new URL('https://cargobajk.sk'+path)),false,path);
 }
});
test('development, preview and lookalike hosts cannot pollute production analytics',()=>{
 for(const origin of ['http://localhost:5173','http://127.0.0.1:5173','https://cargobajk-sk.workers.dev','https://preview.cargobajk.sk','https://cargobajk.sk.example.com','http://cargobajk.sk']) {
  assert.equal(webAnalyticsEnabled(new URL(origin+'/bicykle')),false,origin);
 }
});
