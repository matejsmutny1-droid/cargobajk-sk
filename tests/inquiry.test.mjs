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
