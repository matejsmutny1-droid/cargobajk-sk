import { accessories } from './accessories.ts';
import { bikes } from './catalog.ts';
export const quoteOptions = [...accessories,
 {id:'battery',sk:'Doplnková batéria – overiť verziu a cenu',en:'Additional battery — confirm version and price',priceEur:null,models:bikes.map(b=>b.slug),group:'advice'},
 {id:'advice',sk:'Poradiť s ďalšou výbavou',en:'Help choosing other equipment',priceEur:null,models:bikes.map(b=>b.slug),group:'advice'},
];
export const optionsForModel=(slug:string)=>quoteOptions.filter(o=>o.models.includes(slug));
export const quoteAccessoriesTotal=(q:Quote)=>q.accessories.reduce((sum,id)=>sum+Math.round((quoteOptions.find(o=>o.id===id)?.priceEur??0)*100),0)/100;
export const quoteSubtotal=(q:Quote)=>Math.round((q.priceEur+quoteAccessoriesTotal(q))*100)/100;
export const colourOptions=[{id:'standard',sk:'Podľa špecifikácie výrobcu',en:'As specified by the manufacturer'}] as const;
export type Quote = {modelSlug:string;modelName:string;priceEur:number;colour:string;accessories:string[];city:string;postalCode:string;phone:string};
const clean=(v:unknown)=>typeof v==='string'?v.trim():'';
export function parseQuote(value:unknown):Quote|null {
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const v=value as Record<string,unknown>;const bike=bikes.find(b=>b.slug===v.modelSlug);
 if(!bike||!bike.priceEur||!colourOptions.some(c=>c.id===v.colour)||!Array.isArray(v.accessories)||v.accessories.length>quoteOptions.length||!v.accessories.every(a=>optionsForModel(bike.slug).some(o=>o.id===a))||new Set(v.accessories).size!==v.accessories.length)return null;
 if((v.accessories as string[]).filter(id=>id.startsWith('canopy')).length>1)return null;
 const city=clean(v.city),postalCode=clean(v.postalCode).replace(/\s/g,''),phone=clean(v.phone);
 if(city.length<2||city.length>100||/[\x00-\x1f]/.test(city)||!/^\d{5}$/.test(postalCode)||phone.length>30||(phone&&!/^[+\d ()-]{6,30}$/.test(phone)))return null;
 return {modelSlug:bike.slug,modelName:bike.name,priceEur:bike.priceEur,colour:v.colour as string,accessories:v.accessories as string[],city,postalCode,phone};
}
export const quoteMoney=(value:number,english=false)=>new Intl.NumberFormat(english?'en-IE':'sk-SK',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);
export function quoteSummary(q:Quote,english=false){
 const colour=colourOptions.find(o=>o.id===q.colour)!;
 return [{label:english?'Model':'Model',value:q.modelName},{label:english?'Bike price':'Cena bicykla',value:quoteMoney(q.priceEur,english)},{label:english?'Finish':'Vyhotovenie',value:english?colour.en:colour.sk},...q.accessories.map(id=>{const o=quoteOptions.find(o=>o.id===id)!;return {label:english?o.en:o.sk,value:o.priceEur===null?(english?'To be quoted individually':'Na individuálne nacenenie'):quoteMoney(o.priceEur,english)}}),{label:english?'Bike and priced accessories':'Bicykel a nacenené príslušenstvo',value:quoteMoney(quoteSubtotal(q),english)},{label:english?'Shipping':'Doprava',value:english?'To be confirmed for your address':'Potvrdíme podľa miesta dodania'}];
}
export const quoteDisclaimer=(english=false)=>english?'This is an automatic, non-binding estimate for the bike and selected priced accessories, excluding shipping and unpriced requests. Compatibility, availability and the final total will be confirmed personally. This request is not an order and no payment is due.':'Toto je automatická nezáväzná kalkulácia bicykla a zvoleného naceneného príslušenstva, bez dopravy a nenacenených požiadaviek. Kompatibilitu, dostupnosť aj konečnú sumu potvrdíme osobne. Odoslanie žiadosti nie je objednávka a nič teraz neplatíte.';
