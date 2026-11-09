import type {TaxSummary} from '../vat.ts';
export async function stripeSession(key:string,order:{id:string;totalCents:number;email:string;createdAt:number;lines:{name:string;quantity:number;priceCents:number}[];shipping:{name:string;cents:number};testOrigin?:string;tax?:TaxSummary;taxRateId?:string},fetcher:typeof fetch=fetch) {
 const returnOrigin=order.testOrigin&&/^(?:sk|rk)_test_/.test(key)&&/^https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev$/.test(order.testOrigin)?order.testOrigin:'https://cargobajk.sk';
 if(order.tax?.regime==='vat_payer'){
  if(!/^txr_[A-Za-z0-9]+$/.test(order.taxRateId||''))throw new Error('Platobnú stránku nemožno otvoriť bez overenej sadzby DPH.');
  const rateResponse=await fetcher('https://api.stripe.com/v1/tax_rates/'+order.taxRateId,{headers:{Authorization:'Bearer '+key,'Stripe-Version':'2026-10-28.endive'}});
  if(!rateResponse.ok)throw new Error('Platobnú sadzbu DPH sa nepodarilo overiť.');
  const rate=await rateResponse.json() as {id:string;active:boolean;inclusive:boolean;percentage:number;country:string;livemode:boolean};
  if(rate.id!==order.taxRateId||rate.active!==true||rate.inclusive!==true||rate.percentage!==order.tax.ratePercent||rate.country!=='SK'||rate.livemode!==/^(?:sk|rk)_live_/.test(key))throw new Error('Platobnú sadzbu DPH sa nepodarilo overiť.');
 }
 const body=new URLSearchParams({mode:'payment',locale:'sk',customer_email:order.email,client_reference_id:order.id,'metadata[order_id]':order.id,'allowed_payment_method_types[0]':'card',
  'branding_settings[display_name]':'cargobajk.sk',
  'branding_settings[background_color]':'#F6F2EC',
  'branding_settings[button_color]':'#6B0F1F',
  'branding_settings[logo][type]':'url',
  'branding_settings[logo][url]':'https://cargobajk.sk/brand/email-logo.png',
  'branding_settings[icon][type]':'url',
  'branding_settings[icon][url]':'https://cargobajk.sk/brand/icon-512-v2.png',
  'payment_intent_data[statement_descriptor_suffix]':'CARGOBAJK.SK',
  'payment_intent_data[description]':'cargobajk.sk — objednávka '+order.id.slice(0,8).toUpperCase(),
  'payment_intent_data[metadata][order_id]':order.id,
  'payment_intent_data[metadata][store]':'cargobajk.sk',
  'metadata[store]':'cargobajk.sk',
  success_url:returnOrigin+'/objednavka#'+order.id,cancel_url:returnOrigin+'/kosik?platba=zrusena',expires_at:String(Math.floor(order.createdAt/1000)+1800)});
 [...order.lines,{name:order.shipping.name,quantity:1,priceCents:order.shipping.cents}].filter(l=>l.priceCents>0).forEach((l,i)=>{
  if(order.tax?.regime==='vat_payer')body.set(`line_items[${i}][tax_rates][0]`,order.taxRateId!);
  body.set(`line_items[${i}][quantity]`,String(l.quantity));body.set(`line_items[${i}][price_data][currency]`,'eur');body.set(`line_items[${i}][price_data][unit_amount]`,String(l.priceCents));body.set(`line_items[${i}][price_data][product_data][name]`,l.name);
 });
 if(order.tax){body.set('metadata[tax_regime]',order.tax.regime);body.set('metadata[tax_rate_percent]',String(order.tax.ratePercent));body.set('payment_intent_data[metadata][tax_regime]',order.tax.regime);}
 const result=await fetcher('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':'checkout-'+order.id,'Stripe-Version':'2026-10-28.endive'},body});
 if(!result.ok)throw new Error('Platobnú stránku sa nepodarilo vytvoriť. Skúste to znova.');
 const value=await result.json() as {id:string;url:string;amount_total:number;currency:string;livemode:boolean;total_details?:{amount_tax:number}};
 if(!value.id?.startsWith('cs_')||typeof value.url!=='string'||new URL(value.url).hostname!=='checkout.stripe.com'||new URL(value.url).protocol!=='https:'||value.amount_total!==order.totalCents||value.currency!=='eur'||value.livemode!==/^(?:sk|rk)_live_/.test(key))throw new Error('Platobnú stránku sa nepodarilo overiť.');
 if(order.tax?.regime==='vat_payer'&&value.total_details?.amount_tax!==order.tax.vatCents)throw new Error('Platobnú DPH sa nepodarilo overiť.');
 return value;
}
export async function verifyStripeEvent(raw:string,signature:string,secret:string,now=Date.now()) {
 const parts=signature.split(',').map(p=>p.split('='));
 const timestamp=parts.find(p=>p[0]==='t')?.[1];
 if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300)throw new Error('Invalid signature');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 let valid=false;
 for(const [,hex] of parts.filter(p=>p[0]==='v1')) {
  if(!/^[a-f0-9]{64}$/.test(hex))continue;
  const bytes=new Uint8Array(hex.match(/../g)!.map(v=>parseInt(v,16)));
  if(await crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(timestamp+'.'+raw)))valid=true;
 }
 if(!valid)throw new Error('Invalid signature');
 return JSON.parse(raw);
}
