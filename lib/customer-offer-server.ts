import {openCustomerToken,parseCustomerDetails} from './customer-offer.ts';
import {finalTotal} from './offer-review.ts';
import {mailReady,readBody,InquiryLimiter,sendViaResend,INQUIRY_RECIPIENT,type MailConfig,type MailSender} from './inquiry-server.ts';
export function createCustomerOfferHandler(config:()=>MailConfig,sender:MailSender=sendViaResend){const limiter=new InquiryLimiter();return async(req:Request)=>{
 const json=(v:object,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});const c=config();
 if(!mailReady(c))return json({error:'Odosielanie je dočasne nedostupné.'},503);
 if(!req.headers.get('origin')||![new URL(req.url).origin,...c.allowedOrigins].includes(req.headers.get('origin')!)||req.headers.get('sec-fetch-site')==='cross-site')return json({error:'Neplatný pôvod požiadavky.'},403);
 if(req.headers.get('content-type')?.split(';')[0]!=='application/json')return json({error:'Neplatný formát.'},415);
 let b;try{b=await readBody(req)}catch{return json({error:'Neplatná požiadavka.'},400)}
 if(!b||typeof b!=='object')return json({error:'Neplatná požiadavka.'},400);const body=b as Record<string,unknown>;
 let offer;try{offer=await openCustomerToken(String(body.token??''),c.apiKey!)}catch{return json({error:'Platnosť odkazu vypršala alebo je odkaz neplatný. Kontaktujte hello@cargobajk.sk.'},403)}
 const {draft:d,terms:t}=offer;if(!limiter.take(d.reference,20,Date.now()))return json({error:'Skúste neskôr.'},429);
 const total=finalTotal(d,t);if(body.action==='preview')return json({reference:d.reference,language:d.language,name:d.customer.name,city:d.customer.city,postalCode:d.customer.postalCode,phone:d.customer.phone,lines:d.lines,terms:t,total,expiresAt:offer.expiresAt});
 if(body.action!=='submit')return json({error:'Neplatná operácia.'},400);const details=parseCustomerDetails(body.details);if(!details)return json({error:'Skontrolujte adresu, telefón a potvrdenie údajov.'},400);
 const detailText=Object.entries(details).filter(([,v])=>v).map(([k,v])=>k+': '+v).join('\n');const sum=d.lines.map(l=>l.name+': '+l.amount+' EUR').join('\n')+'\nDoprava: '+t.shipping+' EUR\nCelkom: '+total+' EUR\n'+t.taxNote;
 // Stable per offer: retries and double clicks cannot create another notification within provider's idempotency window.
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(body.token)))),v=>v.toString(16).padStart(2,'0')).join('');
 try{const ok=await sender({from:c.from!,to:[INQUIRY_RECIPIENT],reply_to:d.customer.email,subject:`Žiadosť o objednávku — ${d.modelName} — ${d.reference}`,text:`Zákazník požiadal o potvrdenie objednávky. Overte dostupnosť a pošlite potvrdenie s platobnými podkladmi.\n\nReferencia: ${d.reference}\nE-mail: ${d.customer.email}\n${detailText}\n\n${sum}\n\nPlatba: bankovým prevodom po potvrdení.\nPoznámka k ponuke: ${t.note}`},'customer-order/'+hash,c);if(!ok)return json({error:'Odoslanie sa nepodarilo. Skúste znova.'},502);
 let receipt=false;try{receipt=await sender({from:c.from!,to:[d.customer.email],reply_to:INQUIRY_RECIPIENT,subject:'Prijali sme vašu žiadosť o objednávku | cargobajk.sk',text:`Ďakujeme. Prijali sme vašu žiadosť o objednávku ${d.modelName}.\nReferencia: ${d.reference}\n\n${sum}\n\nTeraz nič neplatíte. Potvrdíme dostupnosť a pošleme potvrdenie objednávky s dokumentmi a údajmi na bankový prevod. Odoslaním tejto žiadosti nevznikla povinnosť zaplatiť.\n\nhello@cargobajk.sk`},'customer-order/'+hash+'/receipt',c)}catch{}return json({ok:true,receipt,reference:d.reference});}catch{return json({error:'Odoslanie sa nepodarilo potvrdiť. Skúste znova.'},502)}
}}
