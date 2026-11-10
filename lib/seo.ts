import {businessLocation, seller} from './seller';
import {salesTerms} from './sales-terms';
import {returnPolicy} from './return-policy';
import {coverImage, listedBikes, pageImagePaths, productImagePaths} from './search-images';
import type { Metadata } from 'next';
import type { Bike } from './catalog';
export const SITE_URL = 'https://cargobajk.sk';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const publicPagePaths = ['/', '/bicykle', '/doplnky', '/preco-cargobike', '/o-nas', '/servis', '/vyber-bicykla', '/kontakt', '/faq', '/obchodne-informacie', '/ako-vybrat-cargo-bicykel', '/pre-hotely-a-firmy'];
export const contentSeo: Record<string, {title: string; description: string}> = {
 'pre-hotely-a-firmy': {title:'Cargo bicykle pre hotely, požičovne a firmy', description:'Cargo bicykle Cargobike of Sweden pre hotely, rezorty, požičovne, škôlky a pracovný náklad. Individuálny výber, kalkulácia a skúšobná jazda po dohode.'},
 'o-nas': {title: 'O nás — skúsenosť s cargo bicyklami zo Švédska', description: 'S cargobikom sme žili v Malmö. Dnes na cargobajk.sk pomáhame s výberom a predajom cargo bicyklov Cargobike of Sweden na Slovensku.'},
 'preco-cargobike': {title: 'Cargo bicykel pre deti, psa aj každodenný nákup', description: 'Čo je cargo bicykel a ako ho využiť? Spoznajte nákladné elektrobicykle pre rodiny s deťmi, prepravu psov, nákupy a podnikanie.'},
 'servis': {title: 'Servis a podpora pre cargo bicykle', description: 'Potrebujete poradiť s údržbou alebo dielmi na cargo bicykel? Kontaktujte cargobajk.sk. Možnosti servisu a ďalší postup potvrdíme individuálne.'},
 'vyber-bicykla': {title: 'Pomoc s výberom cargo bicykla a výbavy', description: 'Vyberáte nákladný elektrobicykel pre rodinu, psa alebo firmu? Pomôžeme s modelom, výbavou, cenou a dodaním na Slovensku.'},
 'kontakt': {title: 'Kontakt — cargo bicykle v Rajeckých Tepliciach', description: 'cargobajk.sk: Lúčna 350/5, Rajecké Teplice. Osobné stretnutia po dohode, predaj cargo bicyklov, vrátenie tovaru a reklamácie. +421 904 501 703.'},
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
 telephone: seller.phoneLink, address: {'@type':'PostalAddress',...businessLocation},
 areaServed: {'@type': 'Country', name: 'Slovensko'},
 hasMerchantReturnPolicy: {
  '@type': 'MerchantReturnPolicy', '@id': returnPolicy.id,
  applicableCountry: 'SK', returnPolicyCountry: 'SK',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: returnPolicy.days,
  returnMethod: ['https://schema.org/ReturnByMail', 'https://schema.org/ReturnInStore'],
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  merchantReturnLink: returnPolicy.id,
 },
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
   // Orderable from the manufacturer; this does not claim local warehouse stock.
   ...(salesTerms.allModelsOrderable ? {availability: 'https://schema.org/BackOrder'} : {}),
   hasMerchantReturnPolicy: {'@id': returnPolicy.id},
   itemCondition: 'https://schema.org/NewCondition', seller: {'@id': ORGANIZATION_ID},
   description: english
    ? `Available to order. Delivery within ${salesTerms.deliveryDays} calendar days from order confirmation and the agreed payment. Shipping quoted individually before ordering.`
    : `Na objednávku. Dodanie do ${salesTerms.deliveryDays} kalendárnych dní od potvrdenia objednávky a dohodnutej platby. Dopravu naceníme individuálne pred objednaním.`}}),
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
