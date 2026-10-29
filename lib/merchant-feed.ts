import {bikes} from './catalog.ts';
import {activeAvailability,commerceBlockers} from './checkout.ts';
import type {CommerceSettings} from './commerce-settings.ts';
const site='https://cargobajk.sk';
export const xmlEscape=(value:string)=>value.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]!));
export function merchantFeed(settings:CommerceSettings, now=Date.now()):string|null {
 if(commerceBlockers(settings).length)return null;
 const products=bikes.filter(b=>b.priceEur!==undefined&&activeAvailability(settings.products[b.slug],now));
 if(!products.length)return null;
 const items=products.map(b=>{
  const p=settings.products[b.slug];
  const fields:Record<string,string>={id:'cargobajk-'+b.sku,title:'Cargobike of Sweden '+b.name+' — elektrický cargo bicykel',description:b.description,link:site+'/bicykle/'+b.slug,image_link:site+'/media/'+b.image+'.webp',price:b.priceEur!.toFixed(2)+' EUR',availability:p.availability,condition:'new',brand:'Cargobike of Sweden',product_type:'Bicykle > Elektrické cargo bicykle'};
  // Manufacturer identifiers are added only when verified; internal SKUs are not guessed as MPNs.
  if(p.gtin)fields.gtin=p.gtin;
  if(p.mpn)fields.mpn=p.mpn;
  if(p.availability==='backorder')fields.availability_date=p.availabilityDate!;
  return '<item>'+Object.entries(fields).map(([key,value])=>`<g:${key}>${xmlEscape(value)}</g:${key}>`).join('')+`<g:shipping><g:country>SK</g:country><g:service>Doručenie na Slovensku</g:service><g:price>${settings.merchantShippingMaxEur!.toFixed(2)} EUR</g:price></g:shipping></item>`;
 });
 return '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:g="http://base.google.com/ns/1.0"><channel><title>cargobajk.sk — cargo bicykle</title><link>'+site+'</link><description>Cargobike of Sweden na Slovensku</description>'+items.join('')+'</channel></rss>';
}
