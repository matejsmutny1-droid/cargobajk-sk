import type {Inquiry} from './inquiry-server.ts';
import {quoteOptions} from './quote.ts';
export type ReviewDraft={version:1;reference:string;expiresAt:number;language:'sk'|'en';modelName:string;customer:{name:string;email:string;phone:string;city:string;postalCode:string};lines:{name:string;nameEn:string;amount:number}[];pending:string[];notes:string};
export type FinalTerms={shipping:number;discount:number;additional:number;additionalDescription:string;deliveryDays:number;validityDays:number;taxNote:string;note:string;confirmed:boolean};
const enc=new TextEncoder(),dec=new TextDecoder();
async function keys(secret:string){const encryption=await crypto.subtle.digest('SHA-256',enc.encode('cargobajk/offer-review/encryption/v1\0'+secret));const nonce=await crypto.subtle.digest('SHA-256',enc.encode('cargobajk/offer-review/nonce/v1\0'+secret));return {encryption:await crypto.subtle.importKey('raw',encryption,{name:'AES-GCM'},false,['encrypt','decrypt']),nonce:await crypto.subtle.importKey('raw',nonce,{name:'HMAC',hash:'SHA-256'},false,['sign'])}}
const encode=(bytes:Uint8Array)=>btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
const decode=(value:string)=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export async function createReviewToken(input:Inquiry,secret:string,now=Date.now()){
 if(!input.quote)throw Error('quote-required');const q=input.quote;
 const created=Number.isSafeInteger(input.submittedAt)&&Math.abs(now-input.submittedAt!)<86400000?input.submittedAt!:Math.floor(now/86400000)*86400000;
 const draft:ReviewDraft={version:1,reference:input.requestId,expiresAt:created+14*86400000,language:input.language==='en'?'en':'sk',modelName:q.modelName,customer:{name:input.name,email:input.email,phone:q.phone,city:q.city,postalCode:q.postalCode},lines:[{name:q.modelName,nameEn:q.modelName,amount:q.priceEur},...q.accessories.flatMap(id=>{const o=quoteOptions.find(o=>o.id===id)!;return o.priceEur===null?[]:[{name:o.sk,nameEn:o.en,amount:o.priceEur}]})],pending:q.accessories.filter(id=>quoteOptions.find(o=>o.id===id)?.priceEur===null).map(id=>quoteOptions.find(o=>o.id===id)!.sk),notes:input.message.length>1000?input.message.slice(0,1000)+'… (celá správa je v pôvodnom e-maile)':input.message};
 const plain=enc.encode(JSON.stringify(draft));const key=await keys(secret);const iv=new Uint8Array(await crypto.subtle.sign('HMAC',key.nonce,plain)).slice(0,12);const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode('offer-review-v1')},key.encryption,plain);return encode(new Uint8Array([...iv,...new Uint8Array(encrypted)]));
}
export async function openReviewToken(token:string,secret:string,now=Date.now()):Promise<ReviewDraft>{
 if(!/^[A-Za-z0-9_-]{50,18000}$/.test(token))throw Error('invalid-token');const bytes=decode(token),key=await keys(secret);const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12),additionalData:enc.encode('offer-review-v1')},key.encryption,bytes.slice(12));const d=JSON.parse(dec.decode(plain)) as ReviewDraft;
 if(d.version!==1||!d.reference||!d.customer?.email||!Array.isArray(d.lines)||!d.lines.length||!Number.isSafeInteger(d.expiresAt)||d.expiresAt<now)throw Error('expired-token');return d;
}
export const reviewSubtotal=(d:ReviewDraft)=>d.lines.reduce((n,line)=>n+Math.round(line.amount*100),0)/100;
export const finalTotal=(d:ReviewDraft,t:FinalTerms)=>Math.round((reviewSubtotal(d)+t.shipping+t.additional-t.discount)*100)/100;
export function parseFinalTerms(value:unknown,d:ReviewDraft):FinalTerms|null{
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;if(!['number','string'].includes(typeof v.shipping))return null;const text=(x:unknown)=>typeof x==='string'?x.trim():'';
 const t:FinalTerms={shipping:Number(v.shipping),discount:Number(v.discount),additional:Number(v.additional),additionalDescription:text(v.additionalDescription),deliveryDays:Number(v.deliveryDays),validityDays:Number(v.validityDays),taxNote:text(v.taxNote),note:text(v.note),confirmed:v.confirmed===true};
 if(!t.confirmed||![t.shipping,t.discount,t.additional].every(n=>Number.isFinite(n)&&n>=0&&n<=50000&&Math.abs(n*100-Math.round(n*100))<1e-6)||(typeof v.shipping==='string'&&!v.shipping.trim())||v.shipping===null||v.shipping===undefined||!Number.isInteger(t.deliveryDays)||t.deliveryDays<1||t.deliveryDays>180||!Number.isInteger(t.validityDays)||t.validityDays<1||t.validityDays>30||t.taxNote.length<5||t.taxNote.length>300||/[\x00-\x1f]/.test(t.taxNote)||t.note.length>1500||t.additionalDescription.length>300||(t.additional>0&&!t.additionalDescription)||(d.pending.length&&!t.additionalDescription)||finalTotal(d,t)<=0)return null;return t;
}
