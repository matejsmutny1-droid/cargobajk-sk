import {publicReference,mailPreheader} from './mail-presentation.ts';
import {createReviewToken} from './offer-review.ts';
import {parseQuote, quoteSummary, quoteDisclaimer, type Quote} from './quote.ts';
import { referralSources, referralLabel } from './referral.ts';
/** Server-side form handling. Never import this module into a client component. */
export const INQUIRY_RECIPIENT = 'hello@cargobajk.sk';
export type MailConfig = { apiKey?: string; from?: string; allowedOrigins: string[]; topics: string[] };
export type Inquiry = { name: string; email: string; topic: string; message: string; website: string; requestId: string; referralSource?: string; referralDetail?: string; quote?: Quote; language?: string; submittedAt?: number };
export type ProviderMail = { from: string; to: string[]; reply_to: string; subject: string; text: string; html?: string };
export type MailSender = (mail: ProviderMail, key: string, config: MailConfig) => Promise<boolean>;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export function inquiryEmail(input: Inquiry, customer = false, reviewLink?: string) {
  const english = Boolean(input.quote && input.language === 'en');
  const title = input.quote && customer ? (english?'Your non-binding bike estimate.':'Vaša nezáväzná kalkulácia.') : customer ? 'Ďakujeme za váš dopyt.' : 'Nový dopyt. Nová cesta.';
  const description = input.quote && customer ? (english?'Thank you. Here is the estimate for your selected bike and equipment. We will confirm the complete quote personally.':'Ďakujeme za váš záujem. Tu je kalkulácia vybraného bicykla a výbavy. Kompletnú ponuku vám potvrdíme osobne.') : customer ? 'Vašu správu sme prijali. Pozrieme sa na ňu a ozveme sa vám e-mailom. Toto je automatické potvrdenie prijatia dopytu.' : 'Niekto chce viac života a menej auta. Tu sú podrobnosti z kontaktného formulára.';
  // Customer receipts intentionally contain no visitor-supplied message or links.
  const quoteDetail = input.quote ? `<table role="presentation" width="100%" style="border-collapse:collapse">${[...quoteSummary(input.quote,english),...(!customer?[{label:'Miesto dodania',value:input.quote.city+' '+input.quote.postalCode},{label:'Telefón',value:input.quote.phone||'Neuvedené'}]:[])].map(row=>`<tr><td style="padding:12px 0;border-bottom:1px solid #DED0C8;font-size:13px;color:#766A68;vertical-align:top">${escapeHtml(row.label)}</td><td style="padding:12px 0 12px 15px;border-bottom:1px solid #DED0C8;text-align:right;line-height:1.6">${escapeHtml(row.value)}</td></tr>`).join('')}</table><p style="padding:18px;background:#F6F2EC;font-size:13px;line-height:1.8">${quoteDisclaimer(english)}</p>` : '';
  const detail = quoteDetail + (customer && input.quote ? '' : customer ? `<p style="line-height:1.7">Téma: ${escapeHtml(input.topic)}</p>` : `<p style="line-height:1.8"><strong>${escapeHtml(input.name)}</strong><br>${escapeHtml(input.email)}<br>${escapeHtml(input.topic)}</p><p style="line-height:1.8"><strong>Odkiaľ sa o nás dozvedeli:</strong> ${escapeHtml(referralLabel(input.referralSource))}${input.referralDetail ? `<br>${escapeHtml(input.referralDetail)}` : ''}</p><div style="padding:24px;background:#F6F2EC;line-height:1.8;white-space:pre-wrap">${escapeHtml(input.message)}</div>`);
  return `<!doctype html><html lang="${english?'en':'sk'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#F6F2EC;color:#6B0F1F;font-family:Arial,Helvetica,sans-serif">${mailPreheader(customer?(english?'Your request is received. Here is what happens next.':'Váš dopyt sme prijali. Pozrite si zhrnutie a ďalší postup.'):'Nový zákaznícky dopyt je pripravený na vybavenie.')}<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFBF6"><tr><td style="padding:28px 32px;background:#6B0F1F;color:#F6F2EC;font-size:23px;font-weight:bold"><a href="https://cargobajk.sk" style="text-decoration:none"><img src="https://cargobajk.sk/brand/email-logo.png" width="300" height="64" alt="cargobajk.sk" style="display:block;max-width:100%;height:auto;border:0;color:#F6F2EC"></a><span style="display:block;margin-top:9px;font-size:10px;letter-spacing:2px;font-weight:normal">CARGO BICYKLE · SLOVENSKO</span></td></tr><tr><td style="padding:36px 32px"><h1 style="margin:0 0 20px;font-size:34px;line-height:1.15;font-weight:500">${title}</h1><p style="line-height:1.7;color:#766A68">${description}</p>${detail}${!customer&&reviewLink?`<p style="margin:28px 0"><a href="${escapeHtml(reviewLink)}" style="display:inline-block;background:#6B0F1F;color:#F6F2EC;padding:16px 22px;border-radius:30px;text-decoration:none;font-weight:bold">Skontrolovať a odoslať ponuku →</a></p><p style="font-size:11px;line-height:1.7;color:#766A68">Súkromný odkaz pre obsluhu dopytu. Neposielajte ho zákazníkovi. Platnosť 14 dní.</p>`:''}<p style="margin-top:28px;font-size:11px;color:#766A68">Číslo dopytu: ${escapeHtml(publicReference(input.requestId))}</p><p style="line-height:1.7;font-size:13px">${customer ? (english?'Reply to this email if you would like to add anything.':'Ak chcete niečo doplniť, odpovedzte na tento e-mail.') : 'Odpoveď na tento e-mail bude smerovať zákazníkovi.'}</p></td></tr><tr><td style="padding:24px 32px;border-top:1px solid #DED0C8;font-size:12px;line-height:1.7">Viac života. Menej auta.<br><a href="https://cargobajk.sk" style="color:#6B0F1F">cargobajk.sk</a> · Vivid Production s.r.o.</td></tr></table></td></tr></table></body></html>`;
}
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const senderDomain = /^(?:[^<>\r\n]+ <)?[^\s<>@]+@(?:[a-z0-9-]+\.)*vividproduction\.sk>?$/i;
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxBodyBytes = 20_000;
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
const json = (body: object, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
const clean = (v: unknown) => typeof v === 'string' ? v.trim() : '';
export function mailReady(config: MailConfig) {
  return Boolean(config.apiKey?.startsWith('re_') && config.from && senderDomain.test(config.from));
}
export function parseInquiry(value: unknown, topics: string[]): Inquiry | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const input: Inquiry = { name: clean(v.name), email: clean(v.email), topic: clean(v.topic), message: clean(v.message), website: clean(v.website), requestId: clean(v.requestId), referralSource: clean(v.referralSource), referralDetail: clean(v.referralDetail), language: v.language === 'en' ? 'en' : 'sk', submittedAt: typeof v.submittedAt==='number'&&Number.isSafeInteger(v.submittedAt)?v.submittedAt:undefined };
  if (input.name.length < 2 || input.name.length > 120 || /[\r\n\x00-\x1f]/.test(input.name) ||
    input.email.length > 254 || !emailPattern.test(input.email) || /[\r\n\x00-\x1f]/.test(input.email) ||
    !topics.includes(input.topic) || input.message.length < 10 || input.message.length > 4000 || input.message.includes('\0') ||
    (input.referralSource !== '' && !referralSources.some(source => source.value === input.referralSource)) ||
    (input.referralDetail ?? '').length > 200 || /[\r\n\x00-\x1f]/.test(input.referralDetail ?? '') ||
    input.website.length > 200 || !requestIdPattern.test(input.requestId)) return null;
  if(v.quote !== undefined){const quote=parseQuote(v.quote);if(!quote||input.topic!=='Záujem o model '+quote.modelName)return null;input.quote=quote;}
  return input;
}

/** Best-effort per-instance limits. Production edge limits should supplement this on a public site. */
export class InquiryLimiter {
  private entries = new Map<string, { count: number; until: number }>();
  take(key: string, limit: number, now: number) {
    for (const [k, v] of this.entries) if (v.until <= now) this.entries.delete(k);
    const entry = this.entries.get(key);
    if (entry) { if (entry.count >= limit) return false; entry.count++; return true; }
    if (this.entries.size >= 2000) return false;
    this.entries.set(key, { count: 1, until: now + 10 * 60_000 });
    return true;
  }
}
async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}
export async function readBody(request: Request) {
  const length = Number(request.headers.get('content-length'));
  if (length > maxBodyBytes) throw new Error('body-too-large');
  if (!request.body) return null;
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBodyBytes) { await reader.cancel(); throw new Error('body-too-large'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
    return JSON.parse(new TextDecoder().decode(bytes));
  } finally { reader.releaseLock(); }
}
export const sendViaResend: MailSender = async (mail, key, config) => {
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(mail),
    signal: AbortSignal.timeout(12_000),
  });
  if (!result.ok) return false;
  const data = await result.json() as { id?: unknown };
  return typeof data.id === 'string' && data.id.length > 0;
};
export function createInquiryHandler(config: () => MailConfig, sender: MailSender = sendViaResend, limiter = new InquiryLimiter()) {
  return async (request: Request): Promise<Response> => {
    const settings = config();
    if (request.method === 'GET') return json({ ready: mailReady(settings) });
    if (request.method !== 'POST') return json({ error: 'Nepodporovaná požiadavka.' }, 405, { Allow: 'GET, POST' });
    const origin = request.headers.get('origin');
    if (!origin || ![new URL(request.url).origin, ...settings.allowedOrigins].includes(origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
      return json({ error: 'Odošlite formulár priamo z našej stránky.' }, 403);
    }
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return json({ error: 'Nepodporovaný formát požiadavky.' }, 415);
    if (!mailReady(settings)) return json({ error: 'Odosielanie formulára ešte pripravujeme. Napíšte nám na hello@cargobajk.sk.' }, 503);
    let value: unknown;
    try { value = await readBody(request); } catch { return json({ error: 'Skontrolujte údaje a dĺžku správy.' }, 400); }
    const input = parseInquiry(value, settings.topics);
    if (!input) return json({ error: 'Skontrolujte meno, e-mail, tému a správu (10 až 4 000 znakov).' }, 400);
    if (input.website) return json({ error: 'Formulár sa nepodarilo overiť. Napíšte nám priamo e-mail.' }, 400);
    const now = Date.now();
    // Do not keep raw email addresses or request bodies in rate-limit state.
    const emailHash = await digest(input.email.toLowerCase());
    if (!limiter.take('site', 30, now) || !limiter.take(emailHash, 3, now)) return json({ error: 'Odoslali ste viacero dopytov. Skúste to o 10 minút alebo nám napíšte e-mail.' }, 429, { 'Retry-After': '600' });
    let reviewLink: string|undefined;
    if(input.quote){try{reviewLink='https://cargobajk.sk/sprava-ponuky#'+await createReviewToken(input,settings.apiKey!)}catch{return json({error:'Ponuku sa nepodarilo pripraviť. Skúste znova.'},502)}}
    const quoteText = input.quote ? quoteSummary(input.quote,input.language==='en').map(r=>r.label+': '+r.value).join('\n')+'\n'+quoteDisclaimer(input.language==='en')+'\nMesto / PSČ: '+input.quote.city+' '+input.quote.postalCode+'\nTelefón: '+(input.quote.phone||'Neuvedené')+'\n\n' : '';
    const text = (reviewLink?'Správa ponuky (súkromné): '+reviewLink+'\n\n':'') + quoteText + `Nový nezáväzný dopyt — cargobajk.sk\n\nMeno: ${input.name}\nE-mail: ${input.email}\nTéma / model: ${input.topic}\nOdkiaľ sa o nás dozvedeli: ${referralLabel(input.referralSource)}${input.referralDetail ? ` — ${input.referralDetail}` : ''}\n\nSpráva:\n${input.message}\n\nIdentifikátor dopytu: ${publicReference(input.requestId)}\n\nOdpoveď na tento e-mail bude smerovať zákazníkovi.`;
    const key = 'inquiry/' + await digest(JSON.stringify(input));
    try {
      const accepted = await sender({ from: settings.from!, to: [INQUIRY_RECIPIENT], reply_to: input.email, subject: `Cargobajk — ${input.topic}`, text, html: inquiryEmail(input,false,reviewLink) }, key, settings);
      if (!accepted) return json({ error: 'Správu sa nepodarilo odoslať. Skúste to znova alebo nám napíšte priamo na hello@cargobajk.sk.' }, 502);
      let confirmationSent = false;
      try {
        confirmationSent = await sender({ from: settings.from!, to: [input.email], reply_to: INQUIRY_RECIPIENT, subject: input.quote ? (input.language==='en'?'Your bike estimate — cargobajk.sk':'Vaša nezáväzná kalkulácia — cargobajk.sk') : 'Ďakujeme za váš dopyt — Cargobajk.sk', text: input.quote ? quoteSummary(input.quote,input.language==='en').map(r=>r.label+': '+r.value).join('\n')+'\n\n'+quoteDisclaimer(input.language==='en')+'\n\nReferencia: '+publicReference(input.requestId) : `Ďakujeme za váš dopyt. Vašu správu sme prijali a ozveme sa vám e-mailom.\n\nTéma: ${input.topic}\nČíslo dopytu: ${publicReference(input.requestId)}\n\nCargobajk.sk · Viac života. Menej auta.`, html: inquiryEmail(input, true) }, key + '/receipt', settings);
      } catch { /* A receipt failure must not turn an accepted inquiry into a retry. */ }
      return json({ ok: true, confirmationSent, message: 'Ďakujeme. Váš dopyt bol odovzdaný na odoslanie. Ozveme sa vám e-mailom.' });
    } catch {
      // Do not log personal data, provider response bodies or API credentials.
      return json({ error: 'Odoslanie sa nepodarilo potvrdiť. Skúste to znova; údaje zostali vo formulári.' }, 502);
    }
  };
}
