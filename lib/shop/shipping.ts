import type {PricedCart} from './catalog.ts';
/** Final customer prices approved by the seller in chat on 2026-11-08. */
export const shippingTariff = {version:'2026-11-08',pickup:0,packeta:590,courier:790,bikeBands:[{maxKm:100,cents:15000},{maxKm:200,cents:22000},{maxKm:300,cents:29000},{maxKm:Infinity,cents:35000}]} as const;
export function bikeDeliveryCents(oneWayRoadKm:number) {
 if(!Number.isFinite(oneWayRoadKm)||oneWayRoadKm<0)throw new Error('Chýba overená cestná vzdialenosť.');
 return shippingTariff.bikeBands.find(b=>oneWayRoadKm<=b.maxKm)!.cents;
}
export type ShippingMethod='pickup'|'bike-delivery'|'packeta'|'courier';
/** This value is created by the SERVER's routing adapter, never from request kilometres. */
export type VerifiedRoute={postalCode:string;city:string;km:number;expiresAt:number};
export function shippingPrice(cart:PricedCart,method:ShippingMethod,destination:{postalCode:string;city:string},route?:VerifiedRoute,parcelEligibleIds:string[]=[],now=Date.now()) {
 if(method==='pickup')return {cents:0,name:'Osobný odber — Rajecké Teplice, po dohode'};
 if(method==='bike-delivery'&&cart.hasBike){
  if(!route||route.postalCode!==destination.postalCode||route.city.toLocaleLowerCase('sk')!==destination.city.toLocaleLowerCase('sk')||(!Number.isFinite(route.expiresAt)||route.expiresAt<=now))throw new Error('Dopravu na túto adresu najprv potvrdíme podľa cestnej vzdialenosti.');
  return {cents:bikeDeliveryCents(route.km),name:'Doprava bicykla a doplnkov'};
 }
 if(cart.hasBike||!['packeta','courier'].includes(method))throw new Error('Vyberte dostupný spôsob dopravy.');
 // Packaging limits apply to the entire order. A verified parcel quote is needed
 // for multiple items; an eligibility flag on each item cannot prove combined fit.
 if(cart.lines.length!==1||cart.lines[0].quantity!==1||!parcelEligibleIds.includes(cart.lines[0].id))throw new Error('Rozmery balenia a cenu zásielky najprv potvrdíme.');
 if(method==='packeta')throw new Error('Výber výdajného miesta ešte nie je aktivovaný. Zvoľte iný spôsob dopravy.');
 return {cents:shippingTariff.courier,name:'Kuriér na adresu'};
}
