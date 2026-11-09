'use client';
import {useEffect, useId, useState, useRef} from 'react';

type Postcodes = Record<string, string[]>;
let postcodes: Promise<Postcodes> | undefined;
function loadPostcodes() {
  return postcodes ??= fetch('/data/postcodes-sk.json').then(response => {
    if (!response.ok) throw new Error('Postcodes unavailable');
    return response.json() as Promise<Postcodes>;
  }).catch(error => {postcodes = undefined; throw error;});
}

export default function DeliveryLocation({english = false, initialPostalCode = '', initialCity = ''}: {english?: boolean; initialPostalCode?: string; initialCity?: string}) {
  const id = useId();
  const t = (sk: string, en: string) => english ? en : sk;
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [city, setCity] = useState(initialCity);
  const [places, setPlaces] = useState<string[]>([]);
  const [manual, setManual] = useState(false);
  const [status, setStatus] = useState('');
  const code = postalCode.replace(/\s/g, '');
  const previousCode = useRef(code);

  useEffect(() => {
    let current = true;
    setPlaces([]); setManual(false); setStatus('');
    if (!/^\d{5}$/.test(code)) return;
    if (previousCode.current !== code) {setCity(''); previousCode.current = code;}
    setStatus(t('Hľadám mesto…', 'Looking up town…'));
    loadPostcodes().then(data => {
      if (!current) return;
      const found = data[code] ?? [];
      setPlaces(found);
      if (found.length === 1) {
        setCity(found[0]);
        setStatus(t('Mesto sme doplnili. Môžete ho upraviť.', 'Town filled in. You can edit it.'));
      } else if (found.length > 1) {
        setCity(previous => found.includes(previous) ? previous : '');
        setStatus(t('Toto PSČ používa viac obcí. Vyberte tú svoju.', 'Several towns share this postcode. Choose yours.'));
      } else {
        setStatus(t('Mesto sa nepodarilo nájsť. Zadajte ho ručne.', 'Town not found. Please enter it manually.'));
      }
    }).catch(() => {
      if (current) setStatus(t('Mesto môžete zadať ručne.', 'You can enter the town manually.'));
    });
    return () => {current = false;};
  // Re-run only when the postcode or display language changes.
  }, [code, english]);

  return <div className="delivery-location">
    <div className="form-row">
      <label htmlFor={`${id}-postcode`}>{t('PSČ dodania', 'Delivery postcode')}
        <input id={`${id}-postcode`} name="postalCode" required autoComplete="postal-code"
          inputMode="numeric" pattern="[0-9]{3} ?[0-9]{2}" maxLength={6} placeholder="013 13"
          value={postalCode} aria-describedby={`${id}-hint`}
          onChange={event => setPostalCode(event.target.value.replace(/[^0-9 ]/g, ''))}
          onBlur={() => {if (/^\d{5}$/.test(code)) setPostalCode(code.slice(0, 3) + ' ' + code.slice(3));}}/>
      </label>
      <label htmlFor={`${id}-city`}>{t('Mesto alebo obec dodania na Slovensku', 'Delivery town in Slovakia')}
        {places.length > 1 && !manual ?
          <select id={`${id}-city`} name="city" required autoComplete="address-level2" value={city}
            aria-describedby={`${id}-hint`} onChange={event => {
              if (event.target.value === '__manual__') {setManual(true); setCity('');}
              else setCity(event.target.value);
            }}>
            <option value="">{t('Vyberte obec', 'Choose town')}</option>
            {places.map(place => <option key={place} value={place}>{place}</option>)}
            <option value="__manual__">{t('Iná obec — zadať ručne', 'Other town — enter manually')}</option>
          </select> :
          <input id={`${id}-city`} name="city" required autoComplete="address-level2"
            minLength={2} maxLength={100} value={city} onChange={event => setCity(event.target.value)}
            aria-describedby={`${id}-hint`} placeholder={t('Doplní sa podľa PSČ', 'Suggested from postcode')}/>}
      </label>
    </div>
    <p className="form-note" id={`${id}-hint`} role="status">{status || t('Zadajte PSČ a pomôžeme vám doplniť mesto.', 'Enter your postcode for town suggestions.')}</p>
    <p className="postcode-source">{t('Návrhy obcí:', 'Town suggestions:')} <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p>
  </div>;
}
