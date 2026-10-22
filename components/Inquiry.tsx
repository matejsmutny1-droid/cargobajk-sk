'use client';
import Link from '@/components/PageLink';
import { useEffect, useRef, useState } from 'react';


type State = 'loading' | 'ready' | 'unavailable' | 'sending' | 'sent' | 'error';
export function Inquiry({ topic = 'Záujem o bicykel' }: { topic?: string }) {
  return <InquiryForm key={topic} topic={topic} />;
}
function InquiryForm({ topic }: { topic: string }) {
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(topic);
  const inFlight = useRef(false);
  const submission = useRef({ fingerprint: '', id: '' });
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/inquiry', { cache: 'no-store', signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]) })
      .then(async response => { if (!response.ok) throw new Error(); return response.json() as Promise<{ ready?: boolean }>; })
      .then(data => setState(data.ready === true ? 'ready' : 'unavailable'))
      .catch(() => { if (!controller.signal.aborted) setState('unavailable'); });
    return () => controller.abort();
  }, []);
  const unavailable = state === 'unavailable';
  return <form className="inquiry" aria-busy={state === 'sending'} onSubmit={async event => {
    event.preventDefault();
    if (inFlight.current || state === 'loading' || unavailable || state === 'sent') return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const data = { name: values.get('name'), email: values.get('email'), topic: values.get('topic'), message: values.get('message'), website: values.get('website') };
    const fingerprint = JSON.stringify(data);
    if (submission.current.fingerprint !== fingerprint) submission.current = { fingerprint, id: crypto.randomUUID() };
    inFlight.current = true;
    setState('sending'); setMessage('');
    try {
      const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId: submission.current.id }), signal: AbortSignal.timeout(20_000) });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || result.ok !== true) { setState(response.status === 503 ? 'unavailable' : 'error'); setMessage(typeof result.error === 'string' ? result.error : 'Odoslanie sa nepodarilo. Skúste to znova.'); return; }
      setState('sent'); setMessage('Ďakujeme. Váš dopyt bol odovzdaný na odoslanie. Ozveme sa vám e-mailom.');
      form.reset(); submission.current = { fingerprint: '', id: '' };
    } catch { setState('error'); setMessage('Odoslanie sa nepodarilo potvrdiť. Skúste to znova alebo nám napíšte e-mail. Vaše údaje zostali vo formulári.'); }
    finally { inFlight.current = false; }
  }}>
    <p className="form-note">{unavailable ? 'Odosielanie formulára ešte pripravujeme. Zatiaľ nás kontaktujte priamo e-mailom.' : 'Nezáväzný dopyt. Napíšte nám, čo vás zaujíma, a odpovieme vám e-mailom.'} <a href="mailto:hello@vividproduction.sk">hello@vividproduction.sk</a></p>
    <fieldset disabled={state === 'sending' || state === 'sent'} className="inquiry-fields">
      <div className="form-row"><label>Vaše meno<input required name="name" autoComplete="name" placeholder="Meno a priezvisko" minLength={2} maxLength={120} /></label><label>E-mail<input required type="email" name="email" autoComplete="email" placeholder="vas@email.sk" maxLength={254} /></label></div>
      <label>Čo vás zaujíma?<select name="topic" value={selectedTopic} onChange={event => setSelectedTopic(event.target.value)}>{Array.from(new Set([topic, 'Záujem o bicykel', 'Testovacia jazda', 'Servis', 'Firemná spolupráca'])).map(t => <option key={t}>{t}</option>)}</select></label>
      <label>Vaša správa<textarea name="message" required rows={4} minLength={10} placeholder="Povedzte nám, ako by mal cargobike zapadnúť do vášho života." maxLength={4000} /></label>
      <div className="form-honeypot" aria-hidden="true"><label>Webová stránka<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
      <p className="form-note">Údaje použijeme na vybavenie vášho dopytu. <Link href="/sukromie">Informácie o súkromí</Link>.</p>
      <button className="button dark" disabled={state === 'loading' || unavailable} type="submit">{state === 'loading' ? 'Načítavam formulár…' : state === 'sending' ? 'Odosielam…' : state === 'sent' ? 'Dopyt odoslaný' : unavailable ? 'Odosielanie sa pripravuje' : 'Odoslať nezáväzný dopyt'} <span aria-hidden="true">↗</span></button>
    </fieldset>
    {message && <p role={state === 'sent' ? 'status' : 'alert'} className={state === 'sent' ? 'success' : 'form-error'}>{message}</p>}
    {state === 'sent' && <button className="text-link another-inquiry" type="button" onClick={() => { setState('ready'); setMessage(''); }}>Napísať ďalší dopyt <span aria-hidden="true">↗</span></button>}
  </form>;
}
