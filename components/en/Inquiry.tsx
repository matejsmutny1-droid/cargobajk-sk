'use client';
import Link from '@/components/en/PageLink';
const topicLabel = (t: string) => t.startsWith('Záujem o model ') ? 'Enquiry about ' + t.slice(15) : ({ 'Záujem o bicykel': 'Bike enquiry', 'Testovacia jazda': 'Test ride', 'Servis': 'Service', 'Firemná spolupráca': 'Business partnership' }[t] ?? t);
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
  return <form id="dopyt" className="inquiry" aria-busy={state === 'sending'} onSubmit={async event => {
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
      const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId: submission.current.id }), signal: AbortSignal.timeout(30_000) });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || result.ok !== true) { setState(response.status === 503 ? 'unavailable' : 'error'); setMessage(typeof result.error === 'string' ? 'Please check your details and try again, or email us directly.' : 'We could not send your enquiry. Please try again.'); return; }
      setState('sent'); setMessage('Thank you. Your enquiry has been submitted. We will get back to you by email.');
      form.reset(); submission.current = { fingerprint: '', id: '' };
    } catch { setState('error'); setMessage('We could not confirm submission. Please try again or email us. Your details are still in the form.'); }
    finally { inFlight.current = false; }
  }}>
    <p className="form-note">{unavailable ? 'The form is currently unavailable. Please contact us directly by email.' : 'A no-obligation enquiry. Tell us what you are interested in and we will reply by email.'} <a href="mailto:hello@vividproduction.sk">hello@vividproduction.sk</a></p>
    <fieldset disabled={state === 'sending' || state === 'sent'} className="inquiry-fields">
      <div className="form-row"><label>Your name<input required name="name" autoComplete="name" placeholder="Full name" minLength={2} maxLength={120} /></label><label>Email<input required type="email" name="email" autoComplete="email" placeholder="you@example.com" maxLength={254} /></label></div>
      <label>What are you interested in?<select name="topic" value={selectedTopic} onChange={event => setSelectedTopic(event.target.value)}>{Array.from(new Set([topic, 'Záujem o bicykel', 'Testovacia jazda', 'Servis', 'Firemná spolupráca'])).map(t => <option key={t} value={t}>{topicLabel(t)}</option>)}</select></label>
      <label>Your message<textarea name="message" required rows={4} minLength={10} placeholder="Tell us how a cargo bike could fit into your life." maxLength={4000} /></label>
      <div className="form-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
      <p className="form-note">We will use your details to respond to your enquiry. <Link href="/sukromie">Privacy information</Link>.</p>
      <button className="button dark" disabled={state === 'loading' || unavailable} type="submit">{state === 'loading' ? 'Loading form…' : state === 'sending' ? 'Sending…' : state === 'sent' ? 'Enquiry sent' : unavailable ? 'Sending is not available' : 'Send your enquiry'} <span aria-hidden="true">↗</span></button>
    </fieldset>
    {message && <p role={state === 'sent' ? 'status' : 'alert'} className={state === 'sent' ? 'success' : 'form-error'}>{message}</p>}
    {state === 'sent' && <button className="text-link another-inquiry" type="button" onClick={() => { setState('ready'); setMessage(''); }}>Send another enquiry <span aria-hidden="true">↗</span></button>}
  </form>;
}
