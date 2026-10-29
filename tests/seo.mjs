import assert from 'node:assert/strict';
import {test} from 'node:test';
const origin = process.env.SEO_BASE_URL || 'http://localhost:5173';
const canonicalOrigin = 'https://cargobajk.sk';
const get = path => fetch(origin + path, {redirect:'manual'});
const jsonLd = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const tag = (html, name) => html.match(new RegExp(`<meta\\b[^>]*name="${name}"[^>]*content="([^"]*)"`,'i'))?.[1];
const canonical = html => html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
let sitemapPaths = [];
test('crawler access and valid public sitemap', async () => {
 const robots = await get('/robots.txt'); assert.equal(robots.status,200);
 const text = await robots.text(); assert.match(text,/Allow: \/(?:\r?\n|$)/); assert.doesNotMatch(text,/Disallow: \/(?:\r?\n|$)/);
 assert.match(text,/Sitemap: https:\/\/cargobajk.sk\/sitemap.xml/);
 const sitemap = await get('/sitemap.xml'); assert.equal(sitemap.status,200); assert.match(sitemap.headers.get('content-type'),/xml/);
 const xml = await sitemap.text();
 const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(urls.length,48); assert.equal(new Set(urls).size,48);
 assert.ok(urls.every(url=>url.startsWith(canonicalOrigin+'/')));
 assert.ok(urls.every(url=>!/(?:sprava-ponuky|potvrdenie-ponuky|nezavazna-ponuka|sukromie|api)/.test(url)));
 assert.match(xml,/hreflang="sk-SK"/); assert.match(xml,/hreflang="en"/);
 sitemapPaths = urls.map(url=>url.slice(canonicalOrigin.length));
});
test('all sitemap pages render indexable, canonical server HTML and valid JSON-LD', async () => {
 const xml = await (await get('/sitemap.xml')).text();
 sitemapPaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].slice(canonicalOrigin.length));
 assert.equal(sitemapPaths.length,48);
 const titles = new Set();
 for (const path of sitemapPaths) {
  const response = await get(path); assert.equal(response.status,200,path);
  const html = await response.text();
  assert.doesNotMatch(tag(html,'robots') || '', /noindex|nofollow/,path);
  assert.doesNotMatch(tag(html,'googlebot') || '', /noindex|nofollow/,path);
  assert.equal(new URL(canonical(html)).href,new URL(canonicalOrigin+path).href,path);
  assert.match(html, path.startsWith('/en') ? /<html[^>]*lang="en"/ : /<html[^>]*lang="sk"/,path);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]; assert.ok(title,path); assert.ok(!titles.has(title),'duplicate title '+title); titles.add(title);
  assert.ok(tag(html,'description')?.length > 40,path);
  {
   assert.match(html,/hrefLang="sk-SK"|hreflang="sk-SK"/,path);
   assert.match(html,/hrefLang="en"|hreflang="en"/,path);
  }
  const schemas = jsonLd(html); assert.ok(schemas.some(s=>s['@type']==='Organization'),path);
  if (/\/bicykle\//.test(path)) {
   const product = schemas.find(s=>s['@type']==='Product'); assert.ok(product,path);
   assert.equal(product.url,canonicalOrigin+path,path);
   assert.equal(product.offers.priceCurrency,'EUR',path); assert.ok(product.offers.price>0,path);
   assert.ok(!product.aggregateRating && !product.review,path);
   assert.ok(!product.offers.availability,'unconfirmed stock must not be invented');
   assert.equal((await fetch(origin+new URL(product.image[0]).pathname)).status,200,path+' image');
  }
 }
 console.log(`Verified ${titles.size} public pages, unique titles, canonicals and server-rendered content.`);
});
test('private offers and forms remain noindex, including Googlebot',async()=>{
 for(const path of ['/sprava-ponuky','/potvrdenie-ponuky','/nezavazna-ponuka','/en/nezavazna-ponuka','/sukromie','/en/sukromie']){
  const response=await get(path);const html=await response.text();assert.equal(response.status,200,path);
  assert.match(tag(html,'robots')||'',/noindex/,path);
  assert.doesNotMatch(tag(html,'googlebot')||'',/(?<!no)index(?=,|$)/,path);
  assert.match(response.headers.get('x-robots-tag')||'',/noindex/,path);
 }
});
test('missing products and pages return actual HTTP 404',async()=>{
 for(const path of ['/tato-stranka-neexistuje','/bicykle/neexistujuci-model','/en/bicykle/neexistujuci-model']) assert.equal((await get(path)).status,404,path);
});
test('guide internal links are real destinations',async()=>{
 const html=await (await get('/ako-vybrat-cargo-bicykel')).text();
 const links=[...new Set([...html.matchAll(/<a\b[^>]*href="(\/[^"?#]*)"/g)].map(m=>m[1]))];
 for(const path of links) assert.equal((await get(path)).status,200,path);
});
