import {pageImagePaths} from '@/lib/search-images';
import {bikes} from '@/lib/catalog';
import {SITE_URL, publicPagePaths, localizedPaths} from '@/lib/seo';
export function GET() {
 const bilingual = [...publicPagePaths, ...bikes.map(b => `/bicykle/${b.slug}`)];
 const entries = bilingual.flatMap(path => {
  const {sk, en} = localizedPaths(path);
  return [sk, en].map(current => {
   const images = pageImagePaths(current).map(image => `<image:image><image:loc>${SITE_URL}${image}</image:loc></image:image>`).join('');
   return `<url><loc>${SITE_URL}${current}</loc><xhtml:link rel="alternate" hreflang="sk-SK" href="${SITE_URL}${sk}"/><xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${sk}"/>${images}</url>`;
  });
 });
 return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('')}</urlset>`, {headers: {'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600'}});
}
