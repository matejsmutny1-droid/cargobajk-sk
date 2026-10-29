import {bikes} from '@/lib/catalog';
import {SITE_URL, publicPagePaths, localizedPaths} from '@/lib/seo';
export function GET() {
 const bilingual = [...publicPagePaths, ...bikes.map(b => `/bicykle/${b.slug}`)];
 const entries = bilingual.flatMap(path => {
  const {sk, en} = localizedPaths(path);
  return [sk, en].map(current => `<url><loc>${SITE_URL}${current}</loc><xhtml:link rel="alternate" hreflang="sk-SK" href="${SITE_URL}${sk}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${sk}"/></url>`);
 });
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>`, {headers: {'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600'}});
}
