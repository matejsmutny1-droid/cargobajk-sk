/** Server-side form handling. Never import this module into a client component. */
export const INQUIRY_RECIPIENT = 'hello@vividproduction.sk';
export type MailConfig = { apiKey?: string; from?: string; allowedOrigins: string[]; topics: string[] };
export type Inquiry = { name: string; email: string; topic: string; message: string; website: string; requestId: string };
export type ProviderMail = { from: string; to: string[]; reply_to: string; subject: string; text: string; html?: string };
export type MailSender = (mail: ProviderMail, key: string, config: MailConfig) => Promise<boolean>;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export function inquiryEmail(input: Inquiry, customer = false) {
  const title = customer ? 'Ďakujeme za váš dopyt.' : 'Nový dopyt. Nová cesta.';
  const description = customer ? 'Vašu správu sme prijali. Pozrieme sa na ňu a ozveme sa vám e-mailom. Toto je automatické potvrdenie prijatia dopytu.' : 'Niekto chce viac života a menej auta. Tu sú podrobnosti z kontaktného formulára.';
  // Customer receipts intentionally contain no visitor-supplied message or links.
  const detail = customer ? `<p style="line-height:1.7">Téma: ${escapeHtml(input.topic)}</p>` : `<p style="line-height:1.8"><strong>${escapeHtml(input.name)}</strong><br>${escapeHtml(input.email)}<br>${escapeHtml(input.topic)}</p><div style="padding:24px;background:#f3f1e9;line-height:1.8;white-space:pre-wrap">${escapeHtml(input.message)}</div>`;
  return `<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f3f1e9;color:#253c32;font-family:Arial,Helvetica,sans-serif"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdf7"><tr><td style="padding:28px 32px;background:#253c32;color:#e8edb4;font-size:23px;font-weight:bold">cargobajk.sk<span style="display:block;margin-top:9px;font-size:10px;letter-spacing:2px;font-weight:normal">CARGO BICYKLE · SLOVENSKO</span></td></tr><tr><td style="padding:36px 32px"><h1 style="margin:0 0 20px;font-size:34px;line-height:1.15;font-weight:500">${title}</h1><p style="line-height:1.7;color:#59685e">${description}</p>${detail}<p style="margin-top:28px;font-size:11px;color:#738078">Číslo dopytu: ${escapeHtml(input.requestId)}</p><p style="line-height:1.7;font-size:13px">${customer ? 'Ak chcete niečo doplniť, odpovedzte na tento e-mail.' : 'Odpoveď na tento e-mail bude smerovať zákazníkovi.'}</p></td></tr><tr><td style="padding:24px 32px;border-top:1px solid #e4e7db;font-size:12px;line-height:1.7">Viac života. Menej auta.<br><a href="https://cargobajk.sk" style="color:#253c32">cargobajk.sk</a> · Vivid Production s.r.o.</td></tr></table></td></tr></table></body></html>`;
}
const emailPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const recipientDomain = /^(?:[^<>\r\n]+ <)?[^\s<>@]+@(?:[a-z0-9-]+\.)*vividproduction\.sk>?$/i;
const requestIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maxBodyBytes = 20_000;
const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' };
const json = (body: object, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(body), { status, headers: { ...headers, ...extra } });
const clean = (v: unknown) => typeof v === 'string' ? v.trim() : '';
export function mailReady(config: MailConfig) {
  return Boolean(config.apiKey?.startsWith('re_') && config.from && recipientDomain.test(config.from));
}
export function parseInquiry(value: unknown, topics: string[]): Inquiry | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const input = { name: clean(v.name), email: clean(v.email), topic: clean(v.topic), message: clean(v.message), website: clean(v.website), requestId: clean(v.requestId) };
  if (input.name.length < 2 || input.name.length > 120 || /[\r\n\x00-\x1f]/.test(input.name) ||
    input.email.length > 254 || !emailPattern.test(input.email) || /[\r\n\x00-\x1f]/.test(input.email) ||
    !topics.includes(input.topic) || input.message.length < 10 || input.message.length > 4000 || input.message.includes('\0') ||
    input.website.length > 200 || !requestIdPattern.test(input.requestId)) return null;
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
async function readBody(request: Request) {
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
    if (!mailReady(settings)) return json({ error: 'Odosielanie formulára ešte pripravujeme. Napíšte nám na hello@vividproduction.sk.' }, 503);
    let value: unknown;
    try { value = await readBody(request); } catch { return json({ error: 'Skontrolujte údaje a dĺžku správy.' }, 400); }
    const input = parseInquiry(value, settings.topics);
    if (!input) return json({ error: 'Skontrolujte meno, e-mail, tému a správu (10 až 4 000 znakov).' }, 400);
    if (input.website) return json({ error: 'Formulár sa nepodarilo overiť. Napíšte nám priamo e-mail.' }, 400);
    const now = Date.now();
    // Do not keep raw email addresses or request bodies in rate-limit state.
    const emailHash = await digest(input.email.toLowerCase());
    if (!limiter.take('site', 30, now) || !limiter.take(emailHash, 3, now)) return json({ error: 'Odoslali ste viacero dopytov. Skúste to o 10 minút alebo nám napíšte e-mail.' }, 429, { 'Retry-After': '600' });
    const text = `Nový nezáväzný dopyt — cargobajk.sk\n\nMeno: ${input.name}\nE-mail: ${input.email}\nTéma / model: ${input.topic}\n\nSpráva:\n${input.message}\n\nIdentifikátor dopytu: ${input.requestId}\n\nOdpoveď na tento e-mail bude smerovať zákazníkovi.`;
    const key = 'inquiry/' + await digest(JSON.stringify(input));
    try {
      const accepted = await sender({ from: settings.from!, to: [INQUIRY_RECIPIENT], reply_to: input.email, subject: `Cargobajk — ${input.topic}`, text, html: inquiryEmail(input) }, key, settings);
      if (!accepted) return json({ error: 'Správu sa nepodarilo odoslať. Skúste to znova alebo nám napíšte priamo na hello@vividproduction.sk.' }, 502);
      let confirmationSent = false;
      try {
        confirmationSent = await sender({ from: settings.from!, to: [input.email], reply_to: INQUIRY_RECIPIENT, subject: 'Ďakujeme za váš dopyt — Cargobajk.sk', text: `Ďakujeme za váš dopyt. Vašu správu sme prijali a ozveme sa vám e-mailom.\n\nTéma: ${input.topic}\nČíslo dopytu: ${input.requestId}\n\nCargobajk.sk · Viac života. Menej auta.`, html: inquiryEmail(input, true) }, key + '/receipt', settings);
      } catch { /* A receipt failure must not turn an accepted inquiry into a retry. */ }
      return json({ ok: true, confirmationSent, message: 'Ďakujeme. Váš dopyt bol odovzdaný na odoslanie. Ozveme sa vám e-mailom.' });
    } catch {
      // Do not log personal data, provider response bodies or API credentials.
      return json({ error: 'Odoslanie sa nepodarilo potvrdiť. Skúste to znova; údaje zostali vo formulári.' }, 502);
    }
  };
}
