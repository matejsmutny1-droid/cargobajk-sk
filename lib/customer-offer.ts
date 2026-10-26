import type {ReviewDraft,FinalTerms} from './offer-review.ts';
export type CustomerOffer={version:1;expiresAt:number;draft:ReviewDraft;terms:FinalTerms};
const enc=new TextEncoder();
async function key(secret:string){return crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',enc.encode('customer-offer-v1\0'+secret)),{name:'AES-GCM'},false,['encrypt','decrypt'])}
export async function customerToken(draft:ReviewDraft,terms:FinalTerms,secret:string,now=Date.now()){
 const payload:CustomerOffer={version:1,expiresAt:Math.min(draft.expiresAt,Math.floor(now/86400000)*86400000+terms.validityDays*86400000),draft,terms};
 const plain=enc.encode(JSON.stringify(payload));const hmac=await crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',enc.encode('customer-offer-nonce-v1\0'+secret)),{name:'HMAC',hash:'SHA-256'},false,['sign']);const iv=new Uint8Array(await crypto.subtle.sign('HMAC',hmac,plain)).slice(0,12);
 const bytes=new Uint8Array([...iv,...new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(secret),plain))]);return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
}
export async function openCustomerToken(token:string,secret:string,now=Date.now()):Promise<CustomerOffer>{
 if(!/^[A-Za-z0-9_-]{50,18000}$/.test(token))throw Error('invalid');const b=Uint8Array.from(atob(token.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));const p=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12)},await key(secret),b.slice(12)))) as CustomerOffer;
 if(p.version!==1||p.expiresAt<now||!p.draft.customer.email)throw Error('expired');return p;
}
export function parseCustomerDetails(value:unknown){if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;const fields=['name','street','city','postalCode','phone','company','companyId','billingAddress'] as const;const d=Object.fromEntries(fields.map(k=>[k,typeof v[k]==='string'?v[k].trim():''])) as Record<typeof fields[number],string>;
 if(v.confirmed!==true||d.name.length<2||d.street.length<3||d.city.length<2||!/^\d{3}\s?\d{2}$/.test(d.postalCode)||!/^\+?[\d ()-]{7,30}$/.test(d.phone)||Object.values(d).some(x=>x.length>500||/[\x00-\x1f]/.test(x))||(d.company&&!/^\d{8}$/.test(d.companyId)))return null;return d;
}
