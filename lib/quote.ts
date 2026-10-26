import { bikes } from './catalog.ts';
export const quoteOptions = [
 {id:'canopy',sk:'Strieška a konštrukcia',en:'Canopy and frame'},
 {id:'cover',sk:'Ochranný obal na bicykel',en:'Bike cover'},
 {id:'lock',sk:'Zámok',en:'Lock'},
 {id:'seating',sk:'Sedenie a pohodlie pasažierov',en:'Passenger seating and comfort'},
 {id:'battery',sk:'Doplnková batéria',en:'Additional battery'},
 {id:'advice',sk:'Poradiť s vhodnou výbavou',en:'Help choosing accessories'},
] as const;
export const colourOptions=[{id:'standard',sk:'Vyhotovenie podľa výrobcu',en:'Manufacturer standard finish'},{id:'black',sk:'Preferujem čiernu',en:'Black preferred'},{id:'discuss',sk:'Farbu chcem dohodnúť',en:'Discuss colour options'}] as const;
export type Quote = {modelSlug:string;modelName:string;priceEur:number;colour:string;accessories:string[];city:string;postalCode:string;phone:string};
const clean=(v:unknown)=>typeof v==='string'?v.trim():'';
export function parseQuote(value:unknown):Quote|null {
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const v=value as Record<string,unknown>;const bike=bikes.find(b=>b.slug===v.modelSlug);
 if(!bike||!bike.priceEur||!colourOptions.some(c=>c.id===v.colour)||!Array.isArray(v.accessories)||v.accessories.length>quoteOptions.length||!v.accessories.every(a=>quoteOptions.some(o=>o.id===a))||new Set(v.accessories).size!==v.accessories.length)return null;
 const city=clean(v.city),postalCode=clean(v.postalCode).replace(/\s/g,''),phone=clean(v.phone);
 if(city.length<2||city.length>100||/[\x00-\x1f]/.test(city)||!/^\d{5}$/.test(postalCode)||phone.length>30||(phone&&!/^[+\d ()-]{6,30}$/.test(phone)))return null;
 return {modelSlug:bike.slug,modelName:bike.name,priceEur:bike.priceEur,colour:v.colour as string,accessories:v.accessories as string[],city,postalCode,phone};
}
export const quoteMoney=(value:number,english=false)=>new Intl.NumberFormat(english?'en-IE':'sk-SK',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(value);
export function quoteSummary(q:Quote,english=false){
 const colour=colourOptions.find(o=>o.id===q.colour)!;const accessories=q.accessories.map(id=>{const o=quoteOptions.find(o=>o.id===id)!;return english?o.en:o.sk});
 return [{label:english?'Model':'Model',value:q.modelName},{label:english?'Bike price':'Cena bicykla',value:quoteMoney(q.priceEur,english)},{label:english?'Colour preference':'Preferované vyhotovenie',value:english?colour.en:colour.sk},{label:english?'Requested accessories':'Požadované príslušenstvo',value:accessories.join(', ')||(english?'No additional items selected':'Bez zvolených doplnkov')},{label:english?'Accessories and shipping':'Príslušenstvo a doprava',value:english?'To be quoted individually':'Cenu potvrdíme individuálne'}];
}
export const quoteDisclaimer=(english=false)=>english?'This is an automatic, non-binding estimate for the bike. Accessories, compatibility, shipping, availability and the final total will be confirmed personally. This request is not an order and no payment is due.':'Toto je automatická nezáväzná kalkulácia ceny bicykla. Príslušenstvo, kompatibilitu, dopravu, dostupnosť aj konečnú sumu potvrdíme osobne. Odoslanie žiadosti nie je objednávka a nič teraz neplatíte.';
