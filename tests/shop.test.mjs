import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';
await build({entryPoints:['lib/shop/server.ts','lib/shop/shipping.ts','lib/shop/catalog.ts','lib/shop/stripe.ts'],bundle:true,platform:'node',format:'esm',outdir:'/tmp/cargobajk-shop-tests',logLevel:'silent'});
const {handleShop,shopReady}=await import('/tmp/cargobajk-shop-tests/server.js');
const {priceCart}=await import('/tmp/cargobajk-shop-tests/catalog.js');
const {bikeDeliveryCents,shippingPrice}=await import('/tmp/cargobajk-shop-tests/shipping.js');
const {stripeSession,verifyStripeEvent}=await import('/tmp/cargobajk-shop-tests/stripe.js');
function database(){const db=new DatabaseSync(':memory:');db.exec(readFileSync('migrations/0001_shop.sql','utf8'));return {db,prepare(sql){const statement=db.prepare(sql);return {bind(...args){return {first:async()=>statement.get(...args)||null,run:async()=>statement.run(...args),sql,args};}};},async batch(statements){db.exec('BEGIN');try{const results=statements.map(s=>db.prepare(s.sql).run(...s.args));db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}}};}
const customer={name:'Test Customer',email:'customer@example.test',street:'Testovacia 1',city:'Žilina',postalCode:'01001',phone:'+421900000000'};
const cart=[{id:'bike:flex',quantity:1},{id:'accessory:1577-1',quantity:1,model:'flex'}];
function setup(){const store=database();const env={SHOP_DB:store,SHOP_MODE:'test',SHOP_TEST_EMAILS_JSON:'["customer@example.test"]',STRIPE_SECRET_KEY:'sk_test_mock',STRIPE_WEBHOOK_SECRET:'whsec_mock',SHOP_POLICIES_VERSION:'test-terms',SHOP_PRODUCTS_JSON:JSON.stringify(Object.fromEntries(cart.map(l=>[l.id,{verifiedUntil:'2099-01-01',deliveryDays:21}]))),RESEND_API_KEY:'re_mock',INQUIRY_FROM:'test@vividproduction.sk'};let stripeCalls=0,mailCalls=0;const mock=async(url,options)=>{if(String(url).includes('stripe.com')){stripeCalls++;const p=new URLSearchParams(options.body);assert.equal(p.get('mode'),'payment');assert.equal(p.get('line_items[0][price_data][unit_amount]'),'384900');return Response.json({id:'cs_test_mock',url:'https://checkout.stripe.com/c/pay/cs_test_mock',currency:'eur',amount_total:387100,livemode:false});}mailCalls++;return Response.json({id:'mock-mail'});};return {store,env,mock,counts:()=>({stripeCalls,mailCalls})};}
const request=(path,input)=>new Request('https://cargobajk.sk/api/shop/'+path,{method:'POST',headers:{Origin:'https://cargobajk.sk','Content-Type':'application/json'},body:JSON.stringify(input)});
const input=()=>({cart,customer,shipping:'pickup',acceptedTerms:'test-terms',requestKey:crypto.randomUUID()});
async function signature(raw,secret='whsec_mock',timestamp=Math.floor(Date.now()/1000)){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const bytes=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(timestamp+'.'+raw));return `t=${timestamp},v1=${Buffer.from(bytes).toString('hex')}`;}
async function eventRequest(orderId,overrides={},type='checkout.session.completed'){const body=JSON.stringify({id:'evt_mock',type,livemode:false,data:{object:{id:'cs_test_mock',metadata:{order_id:orderId,store:'cargobajk.sk'},client_reference_id:orderId,mode:'payment',livemode:false,currency:'eur',amount_total:387100,payment_status:'paid',...overrides}}});return new Request('https://cargobajk.sk/api/shop/webhook',{method:'POST',headers:{'stripe-signature':await signature(body)},body});}
test('approved shipping boundaries and invalid distances',()=>{for(const [km,cents] of [[0,15000],[100,15000],[100.01,22000],[200,22000],[200.01,29000],[300,29000],[301,35000]])assert.equal(bikeDeliveryCents(km),cents);for(const km of [-1,NaN,Infinity])assert.throws(()=>bikeDeliveryCents(km));});
test('catalogue owns prices; unknown, incompatible and duplicate products fail',()=>{assert.equal(priceCart(cart.map(l=>({...l,priceCents:1}))).subtotalCents,387100);assert.throws(()=>priceCart([{id:'accessory:1529-17',quantity:1}]));assert.throws(()=>priceCart([...cart,cart[0]]));assert.throws(()=>priceCart([{id:'bike:flex',quantity:1},{id:'accessory:canopy',model:'delight',quantity:1}]));assert.throws(()=>priceCart([{id:'bike:flex',quantity:2}]));});
test('no delivery fallback to free; route must match exact town and be current',()=>{const c=priceCart(cart);assert.throws(()=>shippingPrice(c,'bike-delivery',customer));assert.throws(()=>shippingPrice(c,'courier',customer));assert.throws(()=>shippingPrice(c,'bike-delivery',customer,{postalCode:'01001',city:'Bratislava',km:10,expiresAt:Date.now()+10000}));assert.equal(shippingPrice(c,'bike-delivery',customer,{postalCode:'01001',city:'Žilina',km:101,expiresAt:Date.now()+10000}).cents,22000);});
test('unverified and combined parcels cannot be sold as small parcels',()=>{const c=priceCart([{id:'accessory:1577-1',quantity:2,model:'flex'}]);assert.throws(()=>shippingPrice(c,'courier',customer,undefined,['accessory:1577-1']));});
test('disabled integration fails closed and foreign origins cannot create orders',async()=>{const {env,mock}=setup();assert.equal(shopReady({...env,SHOP_MODE:'off'}),false);assert.equal((await handleShop(request('checkout',input()),{...env,SHOP_DB:undefined},mock)).status,503);const r=request('checkout',input());r.headers.set('Origin','https://evil.test');assert.equal((await handleShop(r,env,mock)).status,403);});
test('checkout stores before Stripe, repeated submission reuses the same session',async()=>{const {store,env,mock,counts}=setup(),i=input();const a=await (await handleShop(request('checkout',i),env,mock)).json();const b=await (await handleShop(request('checkout',i),env,mock)).json();assert.equal(a.orderId,b.orderId);assert.equal(counts().stripeCalls,1);assert.equal(store.db.prepare('SELECT status FROM shop_orders').get().status,'pending');assert.equal((await handleShop(request('checkout',{...i,customer:{...customer,name:'Changed'}}),env,mock)).status,409);});
test('a return URL or unsigned callback cannot mark an order paid',async()=>{const {store,env,mock}=setup();const order=await (await handleShop(request('checkout',input()),env,mock)).json();await handleShop(request('status',{orderId:order.orderId,status:'paid'}),env,mock);assert.equal(store.db.prepare('SELECT status FROM shop_orders').get().status,'pending');assert.equal((await handleShop(new Request('https://cargobajk.sk/api/shop/webhook',{method:'POST',body:'{}'}),env,mock)).status,400);});
test('wrong amount, currency and test/live mode fail; verified payment sends two receipts once',async()=>{const {store,env,mock,counts}=setup();const order=await (await handleShop(request('checkout',input()),env,mock)).json();for(const fields of [{amount_total:1},{currency:'usd'},{livemode:true}])assert.equal((await handleShop(await eventRequest(order.orderId,fields),env,mock)).status,400);assert.equal((await handleShop(await eventRequest(order.orderId,{payment_status:'unpaid'}),env,mock)).status,200);assert.equal(store.db.prepare('SELECT status FROM shop_orders').get().status,'pending');assert.equal((await handleShop(await eventRequest(order.orderId),env,mock)).status,200);assert.equal(store.db.prepare('SELECT status FROM shop_orders').get().status,'paid');await handleShop(await eventRequest(order.orderId),env,mock);assert.equal(counts().mailCalls,2);await handleShop(await eventRequest(order.orderId,{},'checkout.session.expired'),env,mock);assert.equal(store.db.prepare('SELECT status FROM shop_orders').get().status,'paid');});
test('receipt failure is retried without losing paid order or repeating accepted mail',async()=>{const {env,mock,store,counts}=setup();const order=await (await handleShop(request('checkout',input()),env,mock)).json();let first=true;const flaky=async(url,options)=>{if(String(url).includes('resend')&&first){first=false;return new Response('',{status:500});}return mock(url,options);};assert.equal((await handleShop(await eventRequest(order.orderId),env,flaky)).status,503);assert.equal(store.db.prepare('SELECT status FROM shop_orders').get().status,'paid');assert.equal((await handleShop(await eventRequest(order.orderId),env,flaky)).status,200);assert.equal(counts().mailCalls,2);});
test('old or modified webhook signatures fail',async()=>{const raw='{"ok":true}';const old=await signature(raw,'whsec_mock',Math.floor(Date.now()/1000)-301);await assert.rejects(()=>verifyStripeEvent(raw,old,'whsec_mock'));const good=await signature(raw);await assert.rejects(()=>verifyStripeEvent(raw+' ',good,'whsec_mock'));assert.deepEqual(await verifyStripeEvent(raw,good,'whsec_mock'),{ok:true});});

test('durable rate limit rejects repeated requests before creating Stripe sessions',async()=>{
 const {env,mock,counts}=setup();
 for(let n=0;n<60;n++){const r=request('quote',input());r.headers.set('CF-Connecting-IP','192.0.2.1');assert.equal((await handleShop(r,env,mock)).status,200);}
 const r=request('checkout',input());r.headers.set('CF-Connecting-IP','192.0.2.1');assert.equal((await handleShop(r,env,mock)).status,429);assert.equal(counts().stripeCalls,0);
});
test('failed durable save never starts a payment; unknown paths and malformed JSON fail',async()=>{
 const {env,mock,counts}=setup();
 const broken={...env,SHOP_DB:{prepare(){throw new Error('private SQL details');}}};
 const failed=await handleShop(request('checkout',input()),broken,mock);assert.equal(failed.status,400);assert.doesNotMatch(await failed.text(),/private SQL/);assert.equal(counts().stripeCalls,0);
 assert.equal((await handleShop(request('unknown',{}),env,mock)).status,404);
 assert.equal((await handleShop(new Request('https://cargobajk.sk/api/shop/checkout',{method:'POST',headers:{Origin:'https://cargobajk.sk','Content-Type':'application/json'},body:'{broken'}),env,mock)).status,400);
});

test('test checkout only accepts explicitly controlled recipients',async()=>{
 const {env,mock,counts,store}=setup();
 assert.equal(shopReady({...env,SHOP_TEST_EMAILS_JSON:undefined}),false);
 const rejected=await handleShop(request('checkout',{...input(),customer:{...customer,email:'unrelated@example.test'}}),env,mock);
 assert.equal(rejected.status,400);
 assert.match((await rejected.json()).error,/testovacom režime/);
 assert.equal(counts().stripeCalls,0);
 assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM shop_orders').get().n,0);
});

test('cargobajk payments carry their own branding and statement suffix',async()=>{
 let sent;
 const order={id:crypto.randomUUID(),email:'customer@example.test',createdAt:Date.now(),totalCents:1000,lines:[{name:'Test',quantity:1,priceCents:1000}],shipping:{name:'Osobný odber',cents:0}};
 await stripeSession('sk_test_mock',order,async(url,options)=>{
  sent=new URLSearchParams(options.body);
  return Response.json({id:'cs_test_brand',url:'https://checkout.stripe.com/c/pay/cs_test_brand',currency:'eur',amount_total:1000,livemode:false});
 });
 assert.equal(sent.get('branding_settings[display_name]'),'cargobajk.sk');
 assert.equal(sent.get('branding_settings[logo][url]'),'https://cargobajk.sk/brand/email-logo.png');
 assert.equal(sent.get('branding_settings[button_color]'),'#6B0F1F');
 assert.equal(sent.get('payment_intent_data[statement_descriptor_suffix]'),'CARGOBAJK.SK');
 assert.equal(sent.get('payment_intent_data[metadata][store]'),'cargobajk.sk');
 assert.equal(sent.has('payment_intent_data[statement_descriptor]'),false);
});

test('shared-account events for other shops are acknowledged without processing',async()=>{
 const {env,mock,counts,store}=setup();
 const r=await handleShop(await eventRequest(crypto.randomUUID(),{metadata:{store:'merch'}}),env,mock);
 assert.equal(r.status,200); assert.equal(counts().mailCalls,0);
 assert.equal(store.db.prepare('SELECT COUNT(*) AS n FROM shop_orders').get().n,0);
});
test('test email bypass cannot activate a live shop without email configuration',async()=>{
 const {env}=setup();
 const testOnly={...env,RESEND_API_KEY:undefined,INQUIRY_FROM:undefined,SHOP_TEST_DISABLE_EMAILS:'true'};
 assert.equal(shopReady(testOnly),true);
 assert.equal(shopReady({...testOnly,SHOP_MODE:'live',STRIPE_SECRET_KEY:'sk_live_mock'}),false);
});
test('verified test payments can be exercised without sending emails',async()=>{
 const {env,mock,counts,store}=setup();env.SHOP_TEST_DISABLE_EMAILS='true';
 const order=await(await handleShop(request('checkout',input()),env,mock)).json();
 assert.equal((await handleShop(await eventRequest(order.orderId),env,mock)).status,200);
 assert.equal(store.db.prepare('SELECT status FROM shop_orders').get().status,'paid');
 assert.equal(counts().mailCalls,0);
});

test('staging API accepts only configured test origin and never extends live origins',async()=>{
 const {env,mock}=setup();
 const origin='https://cargobajk-checkout-test.example.workers.dev';
 const r=()=>new Request(origin+'/api/shop/quote',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(input())});
 assert.equal((await handleShop(r(),env,mock)).status,403);
 assert.equal((await handleShop(r(),{...env,SHOP_TEST_ORIGIN:origin},mock)).status,200);
 assert.equal((await handleShop(r(),{...env,SHOP_TEST_ORIGIN:origin,SHOP_MODE:'live',STRIPE_SECRET_KEY:'sk_live_mock'},mock)).status,403);
});
test('Stripe test return origin is restricted to workers.dev and ignored by live keys',async()=>{
 const base={id:crypto.randomUUID(),email:'customer@example.test',createdAt:Date.now(),totalCents:1000,lines:[{name:'Test',quantity:1,priceCents:1000}],shipping:{name:'Pickup',cents:0}};
 for(const [key,testOrigin,expected] of [
  ['sk_test_mock','https://cargobajk-checkout-test.example.workers.dev','https://cargobajk-checkout-test.example.workers.dev'],
  ['sk_test_mock','https://evil.example','https://cargobajk.sk'],
  ['sk_live_mock','https://cargobajk-checkout-test.example.workers.dev','https://cargobajk.sk']
 ]){
  let params;
  await stripeSession(key,{...base,testOrigin},async(url,options)=>{params=new URLSearchParams(options.body);return Response.json({id:'cs_test_return',url:'https://checkout.stripe.com/c/pay/cs_test_return',currency:'eur',amount_total:1000,livemode:key.startsWith('sk_live')});});
  assert.equal(params.get('success_url'),expected+'/objednavka#'+base.id);
  assert.equal(params.get('cancel_url'),expected+'/kosik?platba=zrusena');
 }
});
