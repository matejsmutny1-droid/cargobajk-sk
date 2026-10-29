import {bikes} from './catalog.ts';
import {optionsForModel} from './quote.ts';
import type {CommerceSettings, ProductAvailability} from './commerce-settings.ts';
export const checkoutMoney = (amount: number) => new Intl.NumberFormat('sk-SK', {style:'currency',currency:'EUR'}).format(amount);
const cents = (amount:number) => Math.round(amount*100);
export function commerceBlockers(settings: CommerceSettings): string[] {
 const issues: string[] = [];
 if (!settings.enabled) issues.push('Objednávanie ešte nie je aktivované.');
 if (!settings.seller.name || !/^\d{8}$/.test(settings.seller.companyId) || !settings.seller.address || !settings.seller.phone || !settings.seller.returnAddress) issues.push('Chýbajú potvrdené údaje predajcu a adresa na vrátenie.');
 if (!settings.taxNote) issues.push('Chýba potvrdená informácia o DPH a konečnej cene.');
 if (settings.merchantShippingMaxEur === null || !Number.isFinite(settings.merchantShippingMaxEur) || settings.merchantShippingMaxEur<0 || Math.abs(cents(settings.merchantShippingMaxEur)-settings.merchantShippingMaxEur*100)>1e-6) issues.push('Chýba potvrdený maximálny náklad na dopravu pre Google Merchant Center.');
 if (!settings.termsVersion || !settings.termsApproved || !settings.privacyApproved || !settings.returnsApproved) issues.push('Obchodné informácie, súkromie a podmienky vrátenia čakajú na schválenie.');
 return issues;
}
export function activeAvailability(value: ProductAvailability | undefined, now=Date.now()): value is ProductAvailability {
 if (!value || !['in_stock','backorder'].includes(value.availability) || !Number.isInteger(value.deliveryDays) || value.deliveryDays<1 || value.deliveryDays>180) return false;
 const expiry=Date.parse(value.verifiedUntil);
 if (!Number.isFinite(expiry) || expiry<=now) return false;
 if(value.availability==='backorder' && (!value.availabilityDate || !Number.isFinite(Date.parse(value.availabilityDate)) || Date.parse(value.availabilityDate)<=now)) return false;
 return true;
}
export type CheckoutSelection = {modelSlug:string;accessories:string[];postalCode:string};
/** Supplied by a trusted server-side carrier adapter or an authenticated seller, never by the browser. */
export type FreightQuote = {modelSlug:string;destinationPostalCode:string;priceEur:number;carrier:string;expiresAt:number};
export type CheckoutCart = {modelSlug:string;modelName:string;lines:{id:string;name:string;quantity:1;unitPrice:number}[];shipping:number;total:number;taxNote:string;deliveryDays:number;termsVersion:string};
/** Prices, compatible equipment, delivery and tax text come only from server-owned data. */
export function calculateCheckout(value:unknown, settings:CommerceSettings, now=Date.now(), freight?:FreightQuote):CheckoutCart|null {
 if(commerceBlockers(settings).length || !value || typeof value!=='object' || Array.isArray(value))return null;
 const v=value as Record<string,unknown>, bike=bikes.find(b=>b.slug===v.modelSlug), extras=v.accessories;
 if(!bike || !bike.priceEur || !activeAvailability(settings.products[bike.slug],now) || !Array.isArray(extras) || extras.length>20 || new Set(extras).size!==extras.length)return null;
 const available=optionsForModel(bike.slug);
 const selected=extras.map(id=>available.find(a=>a.id===id));
 if(selected.some(o=>!o || o.priceEur===null) || extras.filter(id=>typeof id==='string'&&id.startsWith('canopy')).length>1)return null;
 const lines:CheckoutCart['lines']=[{id:bike.slug,name:bike.name,quantity:1,unitPrice:bike.priceEur},...selected.map(o=>({id:o!.id,name:o!.sk,quantity:1 as const,unitPrice:o!.priceEur!}))];
 if(!freight || freight.modelSlug!==bike.slug || freight.destinationPostalCode!==String(v.postalCode??'').replace(/\s/g,'') || !/^\d{5}$/.test(freight.destinationPostalCode) || !freight.carrier.trim() || !Number.isFinite(freight.expiresAt) || freight.expiresAt<=now || !Number.isFinite(freight.priceEur) || freight.priceEur<0 || Math.abs(cents(freight.priceEur)-freight.priceEur*100)>1e-6 || freight.priceEur>settings.merchantShippingMaxEur!)return null;
 const shipping=freight.priceEur;
 return {modelSlug:bike.slug,modelName:bike.name,lines,shipping,total:(lines.reduce((n,l)=>n+cents(l.unitPrice),0)+cents(shipping))/100,taxNote:settings.taxNote,deliveryDays:settings.products[bike.slug].deliveryDays,termsVersion:settings.termsVersion};
}
const clean=(value:unknown,max:number)=>typeof value==='string' && value.trim().length<=max && !/[\x00-\x1f]/.test(value) ? value.trim() : '';
export function parseOrderCustomer(value:unknown) {
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const v=value as Record<string,unknown>;
 const data={name:clean(v.name,120),email:clean(v.email,254),street:clean(v.street,200),city:clean(v.city,100),postalCode:clean(v.postalCode,6).replace(/\s/g,''),phone:clean(v.phone,30),country:'SK' as const,company:clean(v.company,200),companyId:clean(v.companyId,8),billingAddress:clean(v.billingAddress,500),note:clean(v.note,1500)};
 if(data.name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)||data.street.length<3||data.city.length<2||!/^\d{5}$/.test(data.postalCode)||!/^\+?[\d ()-]{7,30}$/.test(data.phone)||(v.country!==undefined&&v.country!=='SK')||(data.company&&!/^\d{8}$/.test(data.companyId)))return null;
 return data;
}
