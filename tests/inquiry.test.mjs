import test from 'node:test';
import assert from 'node:assert/strict';
import { createInquiryHandler, InquiryLimiter, sendViaResend, INQUIRY_RECIPIENT, inquiryEmail } from '../lib/inquiry-server.ts';
const origin = 'https://cargobike.example';
const settings = { apiKey: 're_test_not_a_real_key', from: 'Cargobike <hello@vividproduction.sk>', allowedOrigins: [origin], topics: ['Servis', 'Záujem o model Flex Kindergarten'] };
const input = { name: 'Test Používateľ', email: 'customer@example.com', topic: 'Záujem o model Flex Kindergarten', message: 'Testovací dopyt na rodinný bicykel.', website: '', requestId: '7b18f332-685c-4814-812e-3a76a31fc5cf' };
const request = (body = input, extra = {}) => new Request(origin + '/api/inquiry', { method: 'POST', headers: { origin, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify(body) });

test('unconfigured form reports unavailable and never sends', async () => {
  let sent = false;
  const handler = createInquiryHandler(() => ({ ...settings, apiKey: undefined }), async () => { sent = true; return true; });
  const status = await handler(new Request(origin + '/api/inquiry'));
  assert.deepEqual(await status.json(), { ready: false });
  assert.equal((await handler(request())).status, 503);
  assert.equal(sent, false);
});
test('ready response exposes no secrets', async () => {
  const result = await createInquiryHandler(() => settings)(new Request(origin + '/api/inquiry'));
  assert.deepEqual(await result.json(), { ready: true });
  assert.equal(result.headers.get('cache-control'), 'no-store');
});
test('success uses fixed recipient, validated Reply-To, plain text and stable retry key', async () => {
  const calls = [];
  const handler = createInquiryHandler(() => settings, async (mail, key) => { calls.push({ mail, key }); return true; });
  assert.equal((await handler(request({ ...input, to: 'attacker@example.com' }))).status, 200);
  assert.equal((await handler(request())).status, 200);
  assert.deepEqual(calls[0].mail.to, [INQUIRY_RECIPIENT]);
  assert.equal(calls[0].mail.reply_to, input.email);
  assert.equal(calls[0].mail.from, settings.from);
  assert.ok(calls[0].mail.text.includes(input.topic));
  assert.equal(calls[0].key, calls[2].key);
  assert.ok(calls[0].mail.html.includes('Nový dopyt'));
  assert.deepEqual(calls[1].mail.to, [input.email]);
  assert.equal(calls[1].mail.reply_to, INQUIRY_RECIPIENT);
  assert.notEqual(calls[0].key, calls[1].key);
});
test('cross-origin and absent-origin requests never send', async () => {
  const handler = createInquiryHandler(() => settings, async () => { assert.fail('must not send'); });
  assert.equal((await handler(request(input, { origin: 'https://attacker.example' }))).status, 403);
  assert.equal((await handler(request(input, { 'sec-fetch-site': 'cross-site' }))).status, 403);
  assert.equal((await handler(new Request(origin + '/api/inquiry', { method: 'POST' }))).status, 403);
});
test('malformed email, header injection, invalid topics and invalid IDs are rejected', async () => {
  const handler = createInquiryHandler(() => settings, async () => { assert.fail('must not send'); });
  for (const patch of [{ email: 'not-an-email' }, { email: 'a,b@example.com' }, { email: 'a@example.com\r\nBcc:other@example.com' }, { name: 'Someone\nBcc: other' }, { topic: 'Arbitrary subject' }, { requestId: 'not-a-uuid' }, { message: 'short' }, { message: 'a'.repeat(4001) }]) {
    assert.equal((await handler(request({ ...input, ...patch }))).status, 400);
  }
});
test('honeypot submission never sends or claims success', async () => {
  const handler = createInquiryHandler(() => settings, async () => { assert.fail('must not send'); });
  assert.equal((await handler(request({ ...input, website: 'https://spam.example' }))).status, 400);
});
test('body size limit is enforced even without Content-Length', async () => {
  const handler = createInquiryHandler(() => settings, async () => { assert.fail('must not send'); });
  assert.equal((await handler(request({ ...input, message: 'a'.repeat(21_000) }))).status, 400);
});
test('invalid JSON and unsupported media types produce clear errors', async () => {
  const handler = createInquiryHandler(() => settings, async () => { assert.fail('must not send'); });
  assert.equal((await handler(request(input, { 'content-type': 'text/plain' }))).status, 415);
  assert.equal((await handler(new Request(origin + '/api/inquiry', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{' }))).status, 400);
});
test('provider rejection and network errors never produce success', async () => {
  for (const sender of [async () => false, async () => { throw new Error('private provider detail'); }]) {
    const result = await createInquiryHandler(() => settings, sender)(request());
    assert.equal(result.status, 502);
    const body = await result.text();
    assert.ok(!body.includes('private provider detail'));
    assert.ok(!body.includes(settings.apiKey));
  }
});
test('three requests per email per window, then retry-after limit', async () => {
  const handler = createInquiryHandler(() => settings, async () => true, new InquiryLimiter());
  for (let i = 0; i < 3; i++) assert.equal((await handler(request())).status, 200);
  const response = await handler(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('retry-after'), '600');
});
test('wrong sender domain disables sending', async () => {
  const handler = createInquiryHandler(() => ({ ...settings, from: 'test@other.example' }), async () => { assert.fail('must not send'); });
  assert.equal((await handler(request())).status, 503);
});
test('Resend transport uses API endpoint, auth, Reply-To and provider acceptance ID', async () => {
  const original = globalThis.fetch;
  let captured;
  try {
    globalThis.fetch = async (url, init) => { captured = { url, init }; return Response.json({ id: 'mock-email-id' }); };
    const mail = { from: settings.from, to: [INQUIRY_RECIPIENT], reply_to: input.email, subject: 'Servis', text: 'Test' };
    assert.equal(await sendViaResend(mail, 'inquiry/mock', settings), true);
    assert.equal(captured.url, 'https://api.resend.com/emails');
    assert.equal(captured.init.headers['Idempotency-Key'], 'inquiry/mock');
    assert.equal(JSON.parse(captured.init.body).reply_to, input.email);
    globalThis.fetch = async () => Response.json({ message: 'invalid' }, { status: 403 });
    assert.equal(await sendViaResend(mail, 'inquiry/mock', settings), false);
    globalThis.fetch = async () => Response.json({});
    assert.equal(await sendViaResend(mail, 'inquiry/mock', settings), false);
  } finally { globalThis.fetch = original; }
});

test('HTML escapes visitor content and receipt omits message', () => {
 const malicious = {...input, name: '<img src=x>', message: '<script>alert(1)</script>'};
 assert.ok(inquiryEmail(malicious).includes('&lt;script&gt;'));
 assert.ok(!inquiryEmail(malicious).includes('<script>'));
 assert.ok(!inquiryEmail(malicious, true).includes('alert(1)'));
 assert.ok(inquiryEmail(malicious, true).includes('https://cargobajk.sk/brand/email-logo.png'));
 assert.equal(INQUIRY_RECIPIENT, 'hello@cargobajk.sk');
});
test('receipt failure does not fail an accepted inquiry', async () => {
 let calls = 0;
 const response = await createInquiryHandler(() => settings, async () => { if (++calls === 2) throw Error('receipt failure'); return true; })(request());
 assert.equal(response.status, 200);
 assert.equal((await response.json()).confirmationSent, false);
});


test('optional referral survives into internal email but not customer receipt', async () => {
 const mails = [];
 const handler = createInquiryHandler(() => settings, async mail => { mails.push(mail); return true; });
 const response = await handler(request({...input, referralSource: 'instagram', referralDetail: 'Profil <cargobajk>'}));
 assert.equal(response.status, 200);
 assert.ok(mails[0].text.includes('Instagram — Profil <cargobajk>'));
 assert.ok(mails[0].html.includes('Profil &lt;cargobajk&gt;'));
 assert.ok(!mails[1].html.includes('Profil'));
 assert.ok(!mails[1].text.includes('Instagram'));
});
test('invalid referral data is rejected before sending', async () => {
 const handler = createInquiryHandler(() => settings, async () => assert.fail('must not send'));
 for (const patch of [{referralSource:'unrecognised'}, {referralDetail:'x'.repeat(201)}, {referralDetail:'line\nbreak'}]) {
  assert.equal((await handler(request({...input,...patch}))).status, 400);
 }
});


const quote = {modelSlug:'flex',colour:'standard',accessories:['canopy','lock'],city:'Žilina',postalCode:'010 01',phone:'+421 900 123 456'};
const quoteInput = {...input, topic:'Záujem o model Flex', quote};
const quoteSettings = {...settings, topics:[...settings.topics,'Záujem o model Flex']};
test('quote uses catalogue price despite forged client price and includes full owner details', async () => {
 const calls=[];
 const result = await createInquiryHandler(()=>quoteSettings,async mail=>{calls.push(mail);return true;})(request({...quoteInput,quote:{...quote,priceEur:1,modelName:'Forged'}}));
 assert.equal(result.status,200);
 assert.ok(calls[0].text.replace(/\s/g,'').includes('3849'));
 assert.ok(calls[0].html.includes('Žilina 01001'));
 assert.ok(calls[0].html.includes('+421 900 123 456'));
 assert.ok(calls[1].html.includes('Vaša nezáväzná kalkulácia'));
 assert.ok(calls[1].text.includes('nič teraz neplatíte'));
 assert.ok(!calls[1].html.includes('Forged'));
 assert.ok(!calls[1].html.includes('+421'));
 assert.equal(calls[1].reply_to,'hello@cargobajk.sk');
});
test('invalid quote configurations are rejected without sending',async()=>{
 const handler=createInquiryHandler(()=>quoteSettings,async()=>assert.fail('must not send'));
 for(const patch of [{modelSlug:'unknown'},{accessories:['invented']},{accessories:['lock','lock']},{city:'x'},{postalCode:'invalid'},{phone:'not a phone'},{colour:'unlisted'}])assert.equal((await handler(request({...quoteInput,quote:{...quote,...patch}}))).status,400);
 assert.equal((await handler(request({...quoteInput,topic:'Servis'}))).status,400);
});
test('English quote receipt is localised and does not echo private notes',async()=>{
 const calls=[];await createInquiryHandler(()=>quoteSettings,async mail=>{calls.push(mail);return true;})(request({...quoteInput,language:'en',message:'Private delivery instructions'}));
 assert.ok(calls[1].subject.includes('Your bike estimate'));
 assert.ok(calls[1].html.includes('lang="en"'));
 assert.ok(calls[1].text.includes('no payment is due'));
 assert.ok(!calls[1].html.includes('Private delivery'));
});

test('accessory subtotal uses MSRP and complete canopy frame bundle',async()=>{
 const {parseQuote,quoteAccessoriesTotal,quoteSubtotal}=await import('../lib/quote.ts');
 const q=parseQuote({...quote,priceEur:1,accessories:['canopy','lock']});
 assert.ok(q);assert.equal(q.priceEur,3849);assert.equal(quoteAccessoriesTotal(q),237);assert.equal(quoteSubtotal(q),4086);
 const k=parseQuote({...quote,modelSlug:'delight-kindergarten',accessories:['canopy-kindergarten']});assert.ok(k);assert.equal(quoteAccessoriesTotal(k),197.59);assert.equal(quoteSubtotal(k),5646.59);
});
test('incompatible accessories and competing canopy versions are rejected',async()=>{
 const {parseQuote}=await import('../lib/quote.ts');
 assert.equal(parseQuote({...quote,modelSlug:'classic',accessories:['canopy']}),null);
 assert.equal(parseQuote({...quote,accessories:['canopy','canopy-high']}),null);
 assert.equal(parseQuote({...quote,accessories:['canopy-kindergarten']}),null);
});
test('public accessory import covers all 30 source rows without wholesale fields',async()=>{
 const {accessories}=await import('../lib/accessories.ts');const rows=accessories.flatMap(a=>a.sourceRows).sort((a,b)=>a-b);
 assert.deepEqual(rows,Array.from({length:30},(_,i)=>i+10));
 assert.equal(new Set(accessories.map(a=>a.id)).size,accessories.length);
 assert.ok(accessories.every(a=>a.priceEur>0&&Number.isInteger(Math.round(a.priceEur*100))&&!('netPrice' in a)));
});

test('review tokens are encrypted, stable for retries, authenticated and expire',async()=>{
 const {createReviewToken,openReviewToken}=await import('../lib/offer-review.ts');const {parseQuote}=await import('../lib/quote.ts');const now=Date.now();const q={...quoteInput,quote:parseQuote(quote),submittedAt:now};
 const token=await createReviewToken(q,settings.apiKey,now);assert.equal(token,await createReviewToken(q,settings.apiKey,now+1000));assert.ok(!token.includes(input.email));assert.ok(!token.includes('Žilina'));const d=await openReviewToken(token,settings.apiKey,now);assert.equal(d.customer.email,input.email);assert.equal(d.lines.reduce((s,l)=>s+l.amount,0),4086);
 const altered=token.slice(0,25)+(token[25]==='A'?'B':'A')+token.slice(26);await assert.rejects(openReviewToken(altered,settings.apiKey,now));await assert.rejects(openReviewToken(token,'another_secret',now));await assert.rejects(openReviewToken(token,settings.apiKey,now+15*86400000));
});
test('private review link is only in owner notification',async()=>{
 const calls=[];await createInquiryHandler(()=>quoteSettings,async mail=>{calls.push(mail);return true;})(request({...quoteInput,submittedAt:Date.now()}));assert.ok(calls[0].html.includes('Skontrolovať a odoslať ponuku'));assert.ok(calls[0].text.includes('/sprava-ponuky#'));assert.ok(!calls[1].html.includes('/sprava-ponuky'));assert.ok(!calls[1].text.includes('/sprava-ponuky'));
});
const finalTerms={shipping:100,discount:0,additional:0,additionalDescription:'',deliveryDays:14,validityDays:7,taxNote:'Testovací daňový režim pre náhľad.',note:'',confirmed:true};
async function reviewFixture(){const {createReviewToken}=await import('../lib/offer-review.ts');const {parseQuote}=await import('../lib/quote.ts');return createReviewToken({...quoteInput,quote:parseQuote(quote),submittedAt:Date.now()},settings.apiKey)}
const reviewRequest=(token,action='preview',terms=finalTerms,originHeader=origin)=>new Request(origin+'/api/offer-review',{method:'POST',headers:{origin:originHeader,'Content-Type':'application/json'},body:JSON.stringify({token,action,terms,to:'attacker@example.com',total:1})});
test('review preview and email rendering never send',async()=>{
 const {createOfferReviewHandler}=await import('../lib/offer-review-server.ts');const h=createOfferReviewHandler(()=>settings,async()=>assert.fail('must not send'));const token=await reviewFixture();const r=await h(reviewRequest(token));assert.equal(r.status,200);assert.equal((await r.json()).subtotal,4086);const rendered=await h(reviewRequest(token,'render',{...finalTerms,confirmed:false}));assert.equal(rendered.status,200);const renderedData=await rendered.json();assert.equal(renderedData.total,4186);assert.ok(renderedData.html.includes('Vaša kompletná cenová ponuka'));
});
test('review endpoint blocks unauthorised requests and incomplete final terms',async()=>{
 const {createOfferReviewHandler}=await import('../lib/offer-review-server.ts');const h=createOfferReviewHandler(()=>settings,async()=>assert.fail('must not send'));const token=await reviewFixture();assert.equal((await h(reviewRequest('invalid'))).status,403);assert.equal((await h(reviewRequest(token,'send',finalTerms,'https://attacker.example'))).status,403);
 for(const patch of [{confirmed:false},{taxNote:''},{shipping:''},{shipping:-1},{shipping:1.234},{discount:99999},{deliveryDays:0},{validityDays:999}])assert.equal((await h(reviewRequest(token,'send',{...finalTerms,...patch}))).status,400);
 assert.equal((await h(new Request(origin+'/api/offer-review'))).status,405);
});
test('final offer uses authenticated recipient and server totals with stable retry keys',async()=>{
 const {createOfferReviewHandler}=await import('../lib/offer-review-server.ts');const calls=[];const h=createOfferReviewHandler(()=>settings,async(mail,key)=>{calls.push({mail,key});return true});const token=await reviewFixture();const r=await h(reviewRequest(token,'send'));assert.equal(r.status,200);assert.equal((await r.json()).total,4186);await h(reviewRequest(token,'send'));assert.deepEqual(calls[0].mail.to,[input.email]);assert.deepEqual(calls[1].mail.to,['hello@cargobajk.sk']);assert.equal(calls[0].key,calls[2].key);assert.ok(!calls[0].mail.html.includes('/sprava-ponuky'));assert.ok(calls[0].mail.text.includes('14 dní'));assert.ok(calls[0].mail.text.includes('dohodnutej platby'));
});
test('owner copy failure does not fail a sent final offer',async()=>{
 const {createOfferReviewHandler}=await import('../lib/offer-review-server.ts');let calls=0;const h=createOfferReviewHandler(()=>settings,async()=>{if(++calls===2)throw Error('copy failed');return true});const r=await h(reviewRequest(await reviewFixture(),'send'));assert.equal(r.status,200);assert.equal((await r.json()).ownerCopy,false);
});
test('unpriced requests need an explicit resolution before a final offer',async()=>{
 const {parseQuote}=await import('../lib/quote.ts');const {createReviewToken}=await import('../lib/offer-review.ts');const {createOfferReviewHandler}=await import('../lib/offer-review-server.ts');const h=createOfferReviewHandler(()=>settings,async()=>assert.fail('must not send'));const token=await createReviewToken({...quoteInput,quote:parseQuote({...quote,accessories:['battery']}),submittedAt:Date.now()},settings.apiKey);assert.equal((await h(reviewRequest(token,'send'))).status,400);
});

test('different recipients cannot share final-offer idempotency solely through a reused client reference',async()=>{
 const {createReviewToken}=await import('../lib/offer-review.ts');const {parseQuote}=await import('../lib/quote.ts');const {createOfferReviewHandler}=await import('../lib/offer-review-server.ts');const calls=[];const h=createOfferReviewHandler(()=>settings,async(mail,key)=>{calls.push({mail,key});return true});const now=Date.now();
 for(const email of ['first@example.com','second@example.com']){const token=await createReviewToken({...quoteInput,email,quote:parseQuote(quote),submittedAt:now},settings.apiKey);assert.equal((await h(reviewRequest(token,'send'))).status,200)}
 assert.notEqual(calls[0].key,calls[2].key);assert.deepEqual(calls[0].mail.to,['first@example.com']);assert.deepEqual(calls[2].mail.to,['second@example.com']);
});
