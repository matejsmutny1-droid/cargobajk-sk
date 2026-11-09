import {vatConfig} from './vat-config.ts';
export type VatSettings={enabled:boolean;effectiveFrom:string;ratePercent:number;pricesIncludeVat:boolean};
export type TaxSummary={regime:'section7a'|'vat_payer';ratePercent:number;grossCents:number;netCents:number;vatCents:number;note:string;effectiveFrom:string};
export const vatRegistrationNote=(english=false,settings:VatSettings=vatConfig)=>settings.enabled
 ? (english?'VAT payer under §4 of the Slovak VAT Act.':'Platiteľ DPH podľa §4 zákona o DPH.')
 : (english?'Registered under §7a of the Slovak VAT Act; not a full VAT payer.':'Registrácia pre DPH podľa §7a zákona o DPH.');
export const retailTaxNote=(english=false,settings:VatSettings=vatConfig)=>settings.enabled
 ? (english?`Final prices include ${settings.ratePercent}% VAT.`:`Konečné ceny zahŕňajú ${settings.ratePercent} % DPH.`)
 : (english?'Prices are final; no VAT is added.':'Ceny sú konečné. DPH sa k nim nepripočítava.');
/** Round each complete order line once; this matches Stripe's manual inclusive tax calculation. */
export function taxSummary(lines:{priceCents:number;quantity:number}[],shippingCents:number,settings:VatSettings=vatConfig):TaxSummary {
 if(!Number.isInteger(settings.ratePercent)||settings.ratePercent<1||settings.ratePercent>100||!settings.pricesIncludeVat)throw new Error('Neplatný režim DPH.');
 const amounts=[...lines.map(l=>{if(!Number.isSafeInteger(l.priceCents)||l.priceCents<0||!Number.isSafeInteger(l.quantity)||l.quantity<1)throw new Error('Neplatná cena.');return l.priceCents*l.quantity;}),shippingCents];
 if(amounts.some(n=>!Number.isSafeInteger(n)||n<0))throw new Error('Neplatná cena.');
 const grossCents=amounts.reduce((a,b)=>a+b,0);
 const vatCents=settings.enabled?amounts.reduce((sum,gross)=>sum+Math.round(gross*settings.ratePercent/(100+settings.ratePercent)),0):0;
 return {regime:settings.enabled?'vat_payer':'section7a',ratePercent:settings.enabled?settings.ratePercent:0,grossCents,netCents:grossCents-vatCents,vatCents,note:retailTaxNote(false,settings),effectiveFrom:settings.effectiveFrom};
}
/** Keep 30-minute Stripe sessions away from the registration boundary. Webhooks remain enabled. */
export function checkoutTaxWindow(now=Date.now(),settings:VatSettings=vatConfig) {
 const start=Date.parse(settings.effectiveFrom);
 if(!Number.isFinite(start))return false;
 return settings.enabled ? now>=start : now<start-31*60*1000;
}
