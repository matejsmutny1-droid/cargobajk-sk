import {seller} from './seller';
import {coverImage, listedBikes, pageImagePaths, productImagePaths} from './search-images';
import type { Metadata } from 'next';
import type { Bike } from './catalog';
export const SITE_URL = 'https://cargobajk.sk';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const publicPagePaths = ['/', '/bicykle', '/preco-cargobike', '/o-nas', '/servis', '/vyber-bicykla', '/kontakt', '/faq', '/obchodne-informacie', '/ako-vybrat-cargo-bicykel'];
export const contentSeo: Record<string, {title: string; description: string}> = {
 'o-nas': {title: 'O nás — skúsenosť s cargo bicyklami zo Švédska', description: 'S cargobikom sme žili v Malmö. Dnes na cargobajk.sk pomáhame s výberom a predajom cargo bicyklov Cargobike of Sweden na Slovensku.'},
 'preco-cargobike': {title: 'Cargo bicykel pre deti, psa aj každodenný nákup', description: 'Čo je cargo bicykel a ako ho využiť? Spoznajte nákladné elektrobicykle pre rodiny s deťmi, prepravu psov, nákupy a podnikanie.'},
 'servis': {title: 'Servis a podpora pre cargo bicykle', description: 'Potrebujete poradiť s údržbou alebo dielmi na cargo bicykel? Kontaktujte cargobajk.sk. Možnosti servisu a ďalší postup potvrdíme individuálne.'},
 'vyber-bicykla': {title: 'Pomoc s výberom cargo bicykla a výbavy', description: 'Vyberáte nákladný elektrobicykel pre rodinu, psa alebo firmu? Pomôžeme s modelom, výbavou, cenou a dodaním na Slovensku.'},
 'kontakt': {title: 'Kontakt — predaj cargo bicyklov na Slovensku', description: 'Kontaktujte cargobajk.sk: hello@cargobajk.sk. Poradíme s výberom cargo bicykla Cargobike of Sweden a pripravíme nezáväznú ponuku.'},
 'faq': {title: 'Cargo bicykle: cena, objednávka a dodanie — otázky', description: 'Odpovede pred nákupom cargo bicykla: ako vybrať model, objednať bicykel, overiť kapacitu, cenu, dopravu a servis na Slovensku.'},
 'obchodne-informacie': {title: 'Objednávka, ceny a dodanie cargo bicyklov', description: 'Ako prebieha nákup cargo bicykla cez cargobajk.sk. Individuálna ponuka, konfigurácia, platba, doprava a podpora pred objednaním.'},
};
export function localizedPaths(path: string) {
 const sk = path.replace(/^\/en(?=\/|$)/, '') || '/';
 return {sk, en: sk === '/' ? '/en' : `/en${sk}`};
}
export function pageMetadata(path: string, title: string, description: string, image?: string, translated = true): Metadata {
 const english = /^\/en(?:\/|$)/.test(path);
 const languages = localizedPaths(path);
 const images = image ? [image] : pageImagePaths(path).slice(0, 4);
 if (!images.length) images.push('/media/hero.webp');
 return {
  title, description,
  alternates: {canonical: SITE_URL + path, ...(translated ? {languages: {'sk-SK': SITE_URL + languages.sk, 'en': SITE_URL + languages.en, 'x-default': SITE_URL + languages.sk}} : {})},
  openGraph: {type: 'website', title, description, url: SITE_URL + path, siteName: 'cargobajk.sk', locale: english ? 'en_GB' : 'sk_SK', images: images.map(path => ({url: SITE_URL + path, alt: title}))},
  twitter: {card: 'summary_large_image', title, description, images: images.map(path => SITE_URL + path)},
 };
}
export const organization = {
 '@type': 'Organization', '@id': ORGANIZATION_ID, name: 'cargobajk.sk', legalName: 'Vivid Production s.r.o.',
 url: SITE_URL, logo: `${SITE_URL}/brand/icon-192-v2.png`, email: 'hello@cargobajk.sk',
 telephone: seller.phoneLink, address: {'@type':'PostalAddress',streetAddress:'Javorová 3072/7',postalCode:'010 07',addressLocality:'Žilina',addressCountry:'SK'},
 areaServed: {'@type': 'Country', name: 'Slovensko'},
 contactPoint: {'@type': 'ContactPoint', contactType: 'customer service', email: 'hello@cargobajk.sk', availableLanguage: ['sk', 'en']},
 sameAs: ['https://www.instagram.com/cargobajk.sk/'],
};
export function breadcrumbSchema(items: {name: string; path: string}[]) {
 return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({'@type': 'ListItem', position: i + 1, name: item.name, item: SITE_URL + item.path}))};
}
export function productSchema(bike: Bike, english = false) {
 const path = `${english ? '/en' : ''}/bicykle/${bike.slug}`;
 return {'@context': 'https://schema.org', '@type': 'Product', '@id': SITE_URL + path + '#product',
  name: `Cargobike of Sweden ${bike.name}`, description: bike.description, sku: bike.sku,
  url: SITE_URL + path, mainEntityOfPage: SITE_URL + path, image: productImagePaths(bike).map(image => SITE_URL + image), brand: {'@type': 'Brand', name: 'Cargobike of Sweden'},
  category: english ? 'Electric cargo bike' : 'Elektrický nákladný bicykel',
  additionalProperty: bike.specs.map(([name, value]) => ({'@type': 'PropertyValue', name, value})),
  ...(bike.priceEur === undefined ? {} : {offers: {'@type': 'Offer', url: SITE_URL + path, priceCurrency: 'EUR', price: bike.priceEur,
   itemCondition: 'https://schema.org/NewCondition', seller: {'@id': ORGANIZATION_ID},
   description: english ? 'Supplied to order. Specification, availability and delivery confirmed in an individual quote.' : 'Dodanie na objednávku. Výbavu, dostupnosť a dopravu potvrdíme v individuálnej ponuke.'}}),
 };
}
/** Describe the visible list without pretending a category page is a single Product. */
export function collectionSchema(path: string, name: string, english = false) {
 const models = listedBikes(path);
 const images = models.map(bike => {
  const cover = coverImage(bike);
  return {'@type': 'ImageObject', url: SITE_URL + cover.path, contentUrl: SITE_URL + cover.path,
   caption: 'Cargobike of Sweden ' + bike.name, ...(cover.width ? {width: cover.width, height: cover.height} : {})};
 });
 return {'@context': 'https://schema.org', '@type': /\/bicykle$/.test(path) ? 'CollectionPage' : 'WebPage',
  '@id': SITE_URL + path + '#webpage', url: SITE_URL + path, name, inLanguage: english ? 'en' : 'sk-SK',
  isPartOf: {'@id': SITE_URL + (english ? '/en' : '/') + '#website'},
  primaryImageOfPage: images[0], image: images,
  mainEntity: {'@type': 'ItemList', numberOfItems: models.length, itemListElement: models.map((bike, i) => ({
   '@type': 'ListItem', position: i + 1, item: {'@type': 'Thing', name: 'Cargobike of Sweden ' + bike.name,
    url: SITE_URL + (english ? '/en' : '') + '/bicykle/' + bike.slug, image: SITE_URL + '/media/' + bike.image + '.webp'},
  }))},
 };
}
export function serializeJsonLd(data: unknown) { return JSON.stringify(data).replace(/</g, String.raw`\u003c`); }
