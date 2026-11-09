import {readBody} from '../inquiry-server.ts';
import {priceCart} from './catalog.ts';
import {shippingPrice,type ShippingMethod,type VerifiedRoute} from './shipping.ts';
import {parseOrderCustomer} from '../checkout.ts';
import {stripeSession,verifyStripeEvent} from './stripe.ts';

export type ShopEnv = {
 SHOP_DB?:D1Database; SHOP_MODE?:string; STRIPE_SECRET_KEY?:string; STRIPE_WEBHOOK_SECRET?:string;
 SHOP_POLICIES_VERSION?:string; SHOP_PRODUCTS_JSON?:string; SHOP_ROUTES_JSON?:string; SHOP_PARCEL_IDS_JSON?:string; SHOP_TEST_EMAILS_JSON?:string;
 RESEND_API_KEY?:string; INQUIRY_FROM?:string;
};
type Order = {id:string;request_key:string;fingerprint:string;total_cents:number;mode:string;status:string;payload:string;stripe_session:string|null;checkout_url:string|null;created_at:number};
type Snapshot={cart:ReturnType<typeof priceCart>;shipping:{name:string;cents:number};customer:NonNullable<ReturnType<typeof parseOrderCustomer>>;termsVersion:string;deliveryDays:number};
const response=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':"default-src 'none'",'X-Content-Type-Options':'nosniff'}});
const jsonArray=(s:string|undefined):string[]=>{try{const v=JSON.parse(s||'[]');return Array.isArray(v)&&v.every(x=>typeof x==='string')?v:[];}catch{return [];}};
export function shopReady(env:ShopEnv) {
 const mode=env.SHOP_MODE;
 return (mode==='test'||mode==='live')&&!!env.SHOP_DB&&!!env.STRIPE_WEBHOOK_SECRET&&!!env.RESEND_API_KEY?.startsWith('re_')&&/^[^\r\n]+@(?:[a-z0-9-]+\.)*vividproduction\.sk>?$/i.test(env.INQUIRY_FROM||'')&&!!env.SHOP_POLICIES_VERSION&&
 new RegExp('^(?:sk|rk)_'+mode+'_').test(env.STRIPE_SECRET_KEY||'')&&
 (mode!=='test'||jsonArray(env.SHOP_TEST_EMAILS_JSON).length>0);
}
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');}
function routeFor(env:ShopEnv,postalCode:string,city:string):VerifiedRoute|undefined {
 try{return (JSON.parse(env.SHOP_ROUTES_JSON||'[]') as VerifiedRoute[]).find(r=>r.postalCode===postalCode&&r.city.toLocaleLowerCase('sk')===city.toLocaleLowerCase('sk'));}catch{return undefined;}
}
function deliveryDaysFor(env:ShopEnv,items:ReturnType<typeof priceCart>['lines']) {
 try{
  const data=JSON.parse(env.SHOP_PRODUCTS_JSON||'{}');
  const checked=items.map(l=>data[l.id]);
  if(checked.some(p=>!p||typeof p.verifiedUntil!=='string'||!(Date.parse(p.verifiedUntil)>Date.now())||!Number.isInteger(p.deliveryDays)||p.deliveryDays<1||p.deliveryDays>180))return null;
  return Math.max(...checked.map(p=>p.deliveryDays as number));
 }catch{return null;}
}
export async function handleShop(request:Request,env:ShopEnv,fetcher:typeof fetch=fetch):Promise<Response> {
 const path=new URL(request.url).pathname;
 if(path==='/api/shop/config')return response({ready:shopReady(env),mode:env.SHOP_MODE==='test'?'test':'live',termsVersion:env.SHOP_POLICIES_VERSION||''});
 if(path==='/api/shop/webhook')return webhook(request,env,fetcher);
 if(request.method!=='POST')return response({error:'Method not allowed'},405);
 const origin=request.headers.get('Origin');
 const target=new URL(request.url);
 if(origin!==target.origin||(!['cargobajk.sk','localhost','127.0.0.1'].includes(target.hostname)))return response({error:'Nepovolený pôvod požiadavky.'},403);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return response({error:'Vyžaduje sa JSON.'},415);
 if(!shopReady(env))return response({error:'Online platby zatiaľ nie sú aktivované. Napíšte nám pre dokončenie objednávky.'},503);
 try{
  const ip=request.headers.get('CF-Connecting-IP');
  if(ip){
   const window=Math.floor(Date.now()/600000);
   const bucket=await hash(env.STRIPE_WEBHOOK_SECRET!+':'+window+':'+ip);
   const count=await env.SHOP_DB!.prepare('INSERT INTO shop_rate(bucket,hits,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1 RETURNING hits').bind(bucket,Date.now()+3600000).first<{hits:number}>();
   if(!count||count.hits>60)return response({error:'Príliš veľa požiadaviek. Skúste to neskôr.'},429);
   await env.SHOP_DB!.prepare('DELETE FROM shop_rate WHERE expires_at < ?').bind(Date.now()).run();
  }
  const input=await readBody(request) as Record<string,unknown>;
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Neplatný obsah požiadavky.');
  if(path==='/api/shop/status'){
   if(!/^[a-f0-9-]{36}$/.test(String(input.orderId||'')))return response({error:'Objednávku sa nepodarilo nájsť.'},404);
   const order=await env.SHOP_DB!.prepare('SELECT status, total_cents, mode FROM shop_orders WHERE id = ?').bind(String(input.orderId)).first<{status:string;total_cents:number;mode:string}>();
   if(!order||order.mode!==env.SHOP_MODE)return response({error:'Objednávku sa nepodarilo nájsť.'},404);
   return response({status:order.status,totalCents:order.total_cents});
  }
  if(!['/api/shop/quote','/api/shop/checkout'].includes(path))return response({error:'Not found'},404);
  const cart=priceCart(input.cart);
  const customer=parseOrderCustomer(input.customer);
  if(!customer)throw new Error('Skontrolujte kontaktné a adresné údaje.');
  if(env.SHOP_MODE==='test'&&!jsonArray(env.SHOP_TEST_EMAILS_JSON).some(email=>email.toLowerCase()===customer.email.toLowerCase()))throw new Error('Objednávku v testovacom režime možno vytvoriť iba s povolenou testovacou e-mailovou adresou.');
  const deliveryDays=deliveryDaysFor(env,cart.lines);
  if(!deliveryDays)throw new Error('Dostupnosť vybraných produktov musíme pred platbou znovu potvrdiť.');
  const shipping=shippingPrice(cart,input.shipping as ShippingMethod,customer,routeFor(env,customer.postalCode,customer.city),jsonArray(env.SHOP_PARCEL_IDS_JSON));
  const totalCents=cart.subtotalCents+shipping.cents;
  if(path==='/api/shop/quote')return response({cart,shipping,totalCents,deliveryDays,termsVersion:env.SHOP_POLICIES_VERSION});
  if(input.acceptedTerms!==env.SHOP_POLICIES_VERSION)throw new Error('Potvrďte aktuálne obchodné podmienky.');
  if(!/^[a-f0-9-]{36}$/.test(String(input.requestKey||'')))throw new Error('Obnovte formulár a skúste to znova.');
  const snapshot:Snapshot={cart,shipping,customer,deliveryDays,termsVersion:env.SHOP_POLICIES_VERSION!};
  const payload=JSON.stringify(snapshot),fingerprint=await hash(payload);
  await env.SHOP_DB!.prepare('INSERT INTO shop_orders(id,request_key,fingerprint,total_cents,mode,payload,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(request_key) DO NOTHING').bind(crypto.randomUUID(),String(input.requestKey),fingerprint,totalCents,env.SHOP_MODE!,payload,Date.now()).run();
  const order=await env.SHOP_DB!.prepare('SELECT * FROM shop_orders WHERE request_key = ?').bind(String(input.requestKey)).first<Order>();
  if(!order)throw new Error('Objednávku sa nepodarilo uložiť.');
  if(order.fingerprint!==fingerprint||order.mode!==env.SHOP_MODE)return response({error:'Obsah objednávky sa zmenil. Obnovte súhrn pred zaplatením.'},409);
  if(order.status!=='pending'||Date.now()-order.created_at>25*60*1000)return response({error:'Platnosť platobnej požiadavky skončila alebo už bola zaplatená. Skontrolujte stav objednávky.'},409);
  if(order.checkout_url)return response({url:order.checkout_url,orderId:order.id});
  const session=await stripeSession(env.STRIPE_SECRET_KEY!,{id:order.id,totalCents,email:customer.email,lines:cart.lines,shipping,createdAt:order.created_at},fetcher);
  await env.SHOP_DB!.prepare('UPDATE shop_orders SET stripe_session=?,checkout_url=? WHERE id=? AND status=\'pending\'').bind(session.id,session.url,order.id).run();
  return response({url:session.url,orderId:order.id});
 }catch(error){
  // Do not send provider errors, SQL details, keys or personal payloads to clients.
  const message=error instanceof Error?error.message:'';
  const allowed=/^(Vyberte|Neplatný|Produkt|Dopravu|Doplnky|Rozmery|Výber|Skontrolujte|Dostupnosť|Potvrďte|Obnovte|Objednávku|Platobnú|Chýba|Príliš)/.test(message);
  return response({error:allowed?message:'Objednávku sa nepodarilo spracovať. Skúste to znova.'},400);
 }
}
async function rawWebhook(request:Request) {
 if(Number(request.headers.get('content-length'))>100000)throw new Error('Too large');
 if(!request.body)throw new Error('No body');
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>100000){await reader.cancel();throw new Error('Too large');}chunks.push(value);}}
 finally{reader.releaseLock();}
 const raw=new Uint8Array(size);let offset=0;for(const chunk of chunks){raw.set(chunk,offset);offset+=chunk.byteLength;}return new TextDecoder().decode(raw);
}
async function webhook(request:Request,env:ShopEnv,fetcher:typeof fetch) {
 if(request.method!=='POST')return response({},405);
 if(!shopReady(env))return response({},503);
 let event;
 try{event=await verifyStripeEvent(await rawWebhook(request),request.headers.get('stripe-signature')||'',env.STRIPE_WEBHOOK_SECRET!);}catch{return response({},400);}
 if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type))return response({received:true});
 const session=event.data?.object;
 if(event.livemode!==(env.SHOP_MODE==='live')||session?.livemode!==event.livemode)return response({},400);
 const order=await env.SHOP_DB!.prepare('SELECT * FROM shop_orders WHERE id = ?').bind(session?.metadata?.order_id||'').first<Order>();
 if(!order||order.stripe_session!==session.id)return response({},503);
 if(order.mode!==env.SHOP_MODE||session.currency!=='eur'||session.amount_total!==order.total_cents||session.client_reference_id!==order.id||session.mode!=='payment')return response({},400);
 if(event.type==='checkout.session.expired'){
  await env.SHOP_DB!.prepare("UPDATE shop_orders SET status='expired' WHERE id=? AND status='pending'").bind(order.id).run();return response({received:true});
 }
 if(session.payment_status!=='paid')return response({received:true});
 try{
  await env.SHOP_DB!.batch([
   env.SHOP_DB!.prepare("UPDATE shop_orders SET status='paid',paid_at=COALESCE(paid_at,?) WHERE id=?").bind(Date.now(),order.id),
   ...['customer','seller'].map(recipient=>env.SHOP_DB!.prepare('INSERT OR IGNORE INTO shop_mail(order_id,recipient) VALUES (?,?)').bind(order.id,recipient))
  ]);
  await sendReceipts(env,order,fetcher);
  return response({received:true});
 }catch{return response({},503);}
}
async function sendReceipts(env:ShopEnv,order:Order,fetcher:typeof fetch) {
 const snapshot=JSON.parse(order.payload) as Snapshot;
 const money=(n:number)=>new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR'}).format(n/100);
 const short=order.id.slice(0,8).toUpperCase();
 const text=[`Platba za objednávku ${short} bola prijatá.`,...snapshot.cart.lines.map(l=>`${l.quantity} × ${l.name} (${l.model}): ${money(l.priceCents*l.quantity)}`),`${snapshot.shipping.name}: ${money(snapshot.shipping.cents)}`,`Spolu: ${money(order.total_cents)}`,'',`Zákazník: ${snapshot.customer.name}`,`Email: ${snapshot.customer.email}`,`Telefón: ${snapshot.customer.phone}`,`Adresa: ${snapshot.customer.street}, ${snapshot.customer.postalCode} ${snapshot.customer.city}`,snapshot.customer.company?`Firma: ${snapshot.customer.company}, IČO ${snapshot.customer.companyId}`:'',snapshot.customer.billingAddress?`Fakturačná adresa: ${snapshot.customer.billingAddress}`:'',`Dodanie tovaru do ${snapshot.deliveryDays} kalendárnych dní od potvrdenia objednávky a platby. Podrobnosti odovzdania s vami dohodneme.`,`Obchodné podmienky: https://cargobajk.sk/obchodne-informacie (verzia ${snapshot.termsVersion})`,'Podmienky vrátenia: https://cargobajk.sk/obchodne-informacie#vratenie-tovaru','Kontakt: hello@cargobajk.sk, +421 904 501 703'].filter(Boolean).join('\n');
 for(const recipient of ['customer','seller']){
  const mail=await env.SHOP_DB!.prepare('SELECT sent_at FROM shop_mail WHERE order_id=? AND recipient=?').bind(order.id,recipient).first<{sent_at:number|null}>();
  if(mail?.sent_at)continue;
  const result=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':`order-${order.id}-${recipient}`},body:JSON.stringify({from:env.INQUIRY_FROM,to:[recipient==='customer'?snapshot.customer.email:'hello@cargobajk.sk'],subject:`${order.mode==='test'?'TEST — ':''}Zaplatená objednávka ${short} — cargobajk.sk`,text:recipient==='seller'&&snapshot.customer.note?text+'\nPoznámka: '+snapshot.customer.note:text})});
  if(!result.ok)throw new Error('Receipt delivery failed');
  await env.SHOP_DB!.prepare('UPDATE shop_mail SET sent_at=? WHERE order_id=? AND recipient=?').bind(Date.now(),order.id,recipient).run();
 }
}
