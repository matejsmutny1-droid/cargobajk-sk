import assert from 'node:assert/strict';
import {test} from 'node:test';
const origin = process.env.SEO_BASE_URL || 'http://localhost:5173';
const canonicalOrigin = 'https://cargobajk.sk';
const get = path => fetch(origin + path, {redirect:'manual'});
const jsonLd = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const head = html => html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
const tag = (html, name) => head(html).match(new RegExp(`<meta\\b[^>]*name="${name}"[^>]*content="([^"]*)"`,'i'))?.[1];
const canonical = html => head(html).match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
let sitemapPaths = [];
const renderedPages = new Map();
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
  renderedPages.set(path,html);
  assert.doesNotMatch(tag(html,'robots') || '', /noindex|nofollow/,path);
  assert.doesNotMatch(tag(html,'googlebot') || '', /noindex|nofollow/,path);
  assert.equal(new URL(canonical(html)).href,new URL(canonicalOrigin+path).href,path);
  assert.match(html, path.startsWith('/en') ? /<html[^>]*lang="en"/ : /<html[^>]*lang="sk"/,path);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,path);
  const title = head(html).match(/<title>(.*?)<\/title>/)?.[1]; assert.ok(title,path); assert.ok(!titles.has(title),'duplicate title '+title); titles.add(title);
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

test('image sitemap exposes real visible product photos and crawlable image responses',async()=>{
 const xml=await (await get('/sitemap.xml')).text();
 assert.match(xml,/xmlns:image="http:\/\/www.google.com\/schemas\/sitemap-image\/1.1"/);
 const entries=[...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m=>({
  path:new URL(m[1].match(/<loc>([^<]+)<\/loc>/)[1]).pathname,
  images:[...m[1].matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map(m=>m[1]),
 }));
 const illustrated=entries.filter(e=>e.images.length);
 assert.equal(illustrated.length,32,'SK/EN home, catalog and 28 product pages');
 const uniqueImages=new Set();
 for(const entry of illustrated){
  const html=renderedPages.get(entry.path)??await (await get(entry.path)).text();
  const visible=new Set([...html.matchAll(/<img\b[^>]*src="([^"?#]+)"/g)].map(m=>new URL(m[1],canonicalOrigin).href));
  assert.equal(new Set(entry.images).size,entry.images.length,entry.path+' duplicate image');
  for(const image of entry.images){assert.ok(visible.has(image),entry.path+' image missing from rendered HTML: '+image);uniqueImages.add(image)}
  assert.match(tag(html,'googlebot')||'',/max-image-preview:large/,entry.path);
  if(['/', '/en', '/bicykle', '/en/bicykle'].includes(entry.path)){
   const page=jsonLd(html).find(s=>s.mainEntity?.['@type']==='ItemList');
   assert.ok(page,entry.path+' list metadata');
   assert.ok(visible.has(page.primaryImageOfPage.url),entry.path+' preferred image');
   assert.match(head(html),/<meta[^>]*property="og:image"[^>]*content="https:\/\/cargobajk.sk\/media\/(?!hero)/,entry.path);
   assert.equal(page.mainEntity.numberOfItems,entry.path.endsWith('/bicykle')?14:4);
  }else{
   const product=jsonLd(html).find(s=>s['@type']==='Product');
   assert.deepEqual(product.image,entry.images,entry.path+' gallery metadata matches sitemap');
  }
 }
 const images=[...uniqueImages];let cursor=0;
 await Promise.all(Array.from({length:6},async()=>{
  while(cursor<images.length){const image=images[cursor++];const response=await fetch(origin+new URL(image).pathname,{method:'HEAD'});
   assert.equal(response.status,200,image);assert.match(response.headers.get('content-type')||'',/^image\//,image);
   assert.doesNotMatch(response.headers.get('x-robots-tag')||'',/noindex|noimageindex/,image);
  }
 }));
 console.log(`Verified ${images.length} distinct crawlable photos on ${illustrated.length} image sitemap pages.`);
});

test('Googlebot receives canonical and product preview metadata in the initial head',async()=>{
 for(const path of ['/', '/bicykle', '/bicykle/flex', '/en/bicykle']){
  const response=await fetch(origin+path,{headers:{'User-Agent':'Googlebot'}});assert.equal(response.status,200,path);
  const html=await response.text();assert.equal(new URL(canonical(html)).href,new URL(canonicalOrigin+path).href,path);
  assert.match(head(html),/<meta[^>]*property="og:image"[^>]*content="https:\/\/cargobajk.sk\/media\/(?!hero)/,path);
  assert.match(tag(html,'googlebot')||'',/max-image-preview:large/,path);
 }
});
