import {bikes} from '../catalog.ts';
import {accessoryCatalog} from '../accessory-catalog.ts';
export type CartInput = {id:string;quantity:number;model?:string}[];
export const shopProducts = [
 ...bikes.filter(b=>b.priceEur!==undefined).map(b=>({id:'bike:'+b.slug,name:b.name,priceCents:Math.round(b.priceEur!*100),kind:'bike' as const,models:[b.slug],image:'/media/'+b.image+'.webp'})),
 ...accessoryCatalog.filter(a=>a.priceEur!==null).map(a=>({id:'accessory:'+a.id,name:a.name,priceCents:Math.round(a.priceEur!*100),kind:'accessory' as const,models:a.models,image:a.image})),
];
export function priceCart(input:unknown) {
 if(!Array.isArray(input)||!input.length||input.length>30)throw new Error('Vyberte produkty do košíka.');
 const seen=new Set<string>();
 const lines=input.map(v=>{
  if(!v||typeof v!=='object'||typeof v.id!=='string'||seen.has(v.id)||!Number.isInteger(v.quantity)||v.quantity<1||v.quantity>10)throw new Error('Neplatný obsah košíka.');
  seen.add(v.id);
  const product=shopProducts.find(p=>p.id===v.id);
  if(!product)throw new Error('Produkt nemá potvrdenú cenu.');
  if(product.kind==='bike'&&v.quantity!==1)throw new Error('Dopravu viacerých bicyklov naceníme individuálne.');
  if(product.kind==='accessory'&&(!product.models.includes(v.model)))throw new Error('Vyberte kompatibilný model pri každom doplnku.');
  return {...product,quantity:v.quantity as number,model:product.kind==='bike'?product.models[0]:v.model as string};
 });
 if(lines.filter(l=>l.kind==='bike').length>1)throw new Error('Dopravu viacerých bicyklov naceníme individuálne.');
 const bike=lines.find(l=>l.kind==='bike');
 if(bike&&lines.some(l=>l.kind==='accessory'&&l.model!==bike.model))throw new Error('Doplnky v tejto objednávke musia byť vhodné pre zvolený bicykel.');
 if(lines.filter(l=>l.id.startsWith('accessory:canopy')).reduce((n,l)=>n+l.quantity,0)>1)throw new Error('Vyberte jednu striešku.');
 return {lines,subtotalCents:lines.reduce((n,l)=>n+l.quantity*l.priceCents,0),hasBike:!!bike};
}
export type PricedCart=ReturnType<typeof priceCart>;
