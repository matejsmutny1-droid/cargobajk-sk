'use client';
import { bikes } from '@/lib/catalog';
import { referralSources } from '@/lib/referral';
import Link from '@/components/PageLink';
import { useEffect, useRef, useState } from 'react';


type State = 'loading' | 'ready' | 'unavailable' | 'sending' | 'sent' | 'error';
type InquiryProps = {topic?: string; defaultMessage?: string; defaultName?: string; defaultEmail?: string; trialLocation?: string};
export function Inquiry({ topic = 'Záujem o bicykel', defaultMessage = '', ...defaults }: InquiryProps) {
  return <InquiryForm key={topic+defaultMessage} topic={topic} defaultMessage={defaultMessage} {...defaults} />;
}
function InquiryForm({ topic, defaultMessage, defaultName = '', defaultEmail = '', trialLocation = 'rajecke' }: InquiryProps & {topic: string; defaultMessage: string}) {
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
    const trial = selectedTopic === 'Skúšobná jazda';
    const trialDetails = trial ? `Miesto: ${values.get('trialLocation')}\nModel: ${values.get('trialModel')}\nPreferovaný termín: ${values.get('trialDate') || 'Po dohode'}\nTelefón: ${values.get('trialPhone') || 'Neuvedené'}\n\n` : '';
    const data = { name: values.get('name'), email: values.get('email'), topic: values.get('topic'), message: trialDetails + String(values.get('message') || (trial ? 'Prosím, kontaktujte ma ohľadom skúšobnej jazdy.' : '')), referralSource: values.get('referralSource'), referralDetail: values.get('referralDetail'), website: values.get('website') };
    const fingerprint = JSON.stringify(data);
    if (submission.current.fingerprint !== fingerprint) submission.current = { fingerprint, id: crypto.randomUUID() };
    inFlight.current = true;
    setState('sending'); setMessage('');
    try {
      const response = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId: submission.current.id }), signal: AbortSignal.timeout(30_000) });
      const result = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || result.ok !== true) { setState(response.status === 503 ? 'unavailable' : 'error'); setMessage(typeof result.error === 'string' ? result.error : 'Odoslanie sa nepodarilo. Skúste to znova.'); return; }
      setState('sent'); setMessage('Ďakujeme. Váš dopyt bol odovzdaný na odoslanie. Ozveme sa vám e-mailom.');
      form.reset(); submission.current = { fingerprint: '', id: '' };
    } catch { setState('error'); setMessage('Odoslanie sa nepodarilo potvrdiť. Skúste to znova alebo nám napíšte e-mail. Vaše údaje zostali vo formulári.'); }
    finally { inFlight.current = false; }
  }}>
    <p className="form-note">{unavailable ? 'Odosielanie formulára ešte pripravujeme. Zatiaľ nás kontaktujte priamo e-mailom.' : 'Nezáväzný dopyt. Napíšte nám, čo vás zaujíma, a odpovieme vám e-mailom.'} <a href="mailto:hello@cargobajk.sk">hello@cargobajk.sk</a></p>
    <fieldset disabled={state === 'sending' || state === 'sent'} className="inquiry-fields">
      <div className="form-row"><label>Vaše meno<input required name="name" defaultValue={defaultName} autoComplete="name" placeholder="Meno a priezvisko" minLength={2} maxLength={120} /></label><label>E-mail<input required type="email" name="email" defaultValue={defaultEmail} autoComplete="email" placeholder="vas@email.sk" maxLength={254} /></label></div>
      <label>Čo vás zaujíma?<select name="topic" value={selectedTopic} onChange={event => setSelectedTopic(event.target.value)}>{Array.from(new Set([topic, 'Záujem o bicykel', 'Výber bicykla', 'Záujem o doplnky', 'Skúšobná jazda', 'Servis', 'Firemná spolupráca'])).map(t => <option key={t}>{t}</option>)}</select></label>
      {selectedTopic==='Skúšobná jazda' && <>
        <label>Kde si chcete bicykel vyskúšať?<select name="trialLocation" defaultValue={trialLocation==='bratislava'?'Bratislava — záujem o budúcu ukážku':'Rajecké Teplice — návšteva po dohode'}><option>Rajecké Teplice — návšteva po dohode</option><option>Bratislava — záujem o budúcu ukážku</option></select></label>
        <p className="form-note">V Rajeckých Tepliciach si môžete po dohode vyskúšať Flex so strieškou. Ostatné modely vo výbere vyjadrujú váš záujem, nie ich dostupnosť na skúšku. Pri Bratislave zatiaľ zbierame záujem; miesto ani dátum ukážky nie sú určené. Odoslanie nie je potvrdená rezervácia.</p>
        <label>Ktorý model vás zaujíma?<select name="trialModel"><option>Nechám si poradiť</option>{bikes.map(b=><option key={b.slug}>{b.name}</option>)}</select></label>
        <div className="form-row"><label>Preferovaný termín (nepovinné)<input type="date" name="trialDate"/></label><label>Telefón (nepovinné)<input type="tel" name="trialPhone" autoComplete="tel" maxLength={40}/></label></div>
      </>}
      <label>{selectedTopic==='Skúšobná jazda'?'Čo chcete vyskúšať alebo sa opýtať? (nepovinné)':'Vaša správa'}<textarea name="message" defaultValue={defaultMessage} required={selectedTopic!=='Skúšobná jazda'} rows={4} minLength={selectedTopic==='Skúšobná jazda'?undefined:10} placeholder={selectedTopic==='Skúšobná jazda'?'Ktorý model vás zaujíma a kedy by vám vyhovovalo prísť? Termín vám ešte potvrdíme.':'Povedzte nám, ako by mal cargobike zapadnúť do vášho života.'} maxLength={selectedTopic==='Skúšobná jazda'?3500:4000} /></label>
      <label>Odkiaľ ste sa o nás dozvedeli?<select name="referralSource" defaultValue="" aria-describedby="referral-note"><option value="">Vyberte možnosť</option>{referralSources.map(source => <option key={source.value} value={source.value}>{source.sk}</option>)}</select></label>
      <p id="referral-note" className="form-note">Nepovinné — pomôže nám to zistiť, ako ste nás našli.</p>
      <label>Chcete nám to spresniť? (nepovinné)<input name="referralDetail" maxLength={200} placeholder="Napríklad názov profilu, príspevok alebo podujatie" /></label>
      <div className="form-honeypot" aria-hidden="true"><label>Webová stránka<input name="website" tabIndex={-1} autoComplete="off" maxLength={200} /></label></div>
      <p className="form-note">Údaje použijeme na vybavenie vášho dopytu. <Link href="/sukromie">Informácie o súkromí</Link>.</p>
      <button className="button dark" disabled={state === 'loading' || unavailable} type="submit">{state === 'loading' ? 'Načítavam formulár…' : state === 'sending' ? 'Odosielam…' : state === 'sent' ? 'Dopyt odoslaný' : unavailable ? 'Odosielanie sa pripravuje' : selectedTopic==='Skúšobná jazda' ? 'Požiadať o skúšobnú jazdu' : 'Odoslať nezáväzný dopyt'} <span aria-hidden="true">↗︎</span></button>
    </fieldset>
    {message && <p role={state === 'sent' ? 'status' : 'alert'} className={state === 'sent' ? 'success' : 'form-error'}>{message}</p>}
    {state === 'sent' && <button className="text-link another-inquiry" type="button" onClick={() => { setState('ready'); setMessage(''); }}>Napísať ďalší dopyt <span aria-hidden="true">↗︎</span></button>}
  </form>;
}
