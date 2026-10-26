'use client';
import BikePrice from '@/components/BikePrice';

import { useState } from 'react';
import Link from '@/components/PageLink';
import BrandImage from '@/components/BrandImage';
import { bikes, featuredSlugs } from '@/lib/catalog';
import { Arrow } from './Site';

export default function Catalog({ full = false, exclude }: { full?: boolean; exclude?: string }) {
  const [filter, setFilter] = useState('Všetky');
  const [family, setFamily] = useState('Všetky rady');
  const [query, setQuery] = useState('');
  const base = full ? bikes : bikes.filter(b => featuredSlugs.includes(b.slug) && b.slug !== exclude);
  const shown = base.filter(b => (filter === 'Všetky' || b.use === filter) &&
    (family === 'Všetky rady' || b.family === family) &&
    `${b.name} ${b.sku}`.toLocaleLowerCase('sk').includes(query.trim().toLocaleLowerCase('sk')));
  const categories = full ? ['Všetky', 'Rodina', 'So psom', 'Pre škôlky', 'Náklad a podnikanie', 'Mesto'] : ['Všetky', 'Rodina', 'So psom', 'Mesto'];
  return <>
    <div className="filters" role="group" aria-label="Použitie bicykla">
      {categories.map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f === 'Pre škôlky' ? 'Pre škôlky · až 6 detí' : f}</button>)}
    </div>
    {full && <div className="catalog-tools">
      <label className="catalog-search"><span>Hľadať model</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Napr. Kindergarten, Flex, 1163…" /></label>
      <label><span>Modelový rad</span><select value={family} onChange={e => setFamily(e.target.value)}>{['Všetky rady', ...new Set(bikes.map(b => b.family))].map(f => <option key={f}>{f}</option>)}</select></label>
      <span className="result-count" role="status">{shown.length} / {base.length} modelov</span>
    </div>}
    <div className="bike-grid">
      {shown.map(b => <Link className="bike-card" href={'/bicykle/' + b.slug} key={b.slug}>
        <div className="bike-picture"><span className="bike-label">{b.children === 6 ? 'Až 6 detí · Kindergarten' : b.use}</span><BrandImage src={'/media/' + b.image + '.webp'} alt={'Cargobike of Sweden ' + b.name} loading="lazy" /><span className="round-arrow"><Arrow /></span></div>
        <div className="bike-card-title"><h3>{b.name}</h3><span>Elektrický cargo bicykel</span></div>
        <p>{b.description}</p><BikePrice price={b.priceEur}/>
      </Link>)}
    </div>
    {shown.length === 0 && <div className="empty-catalog"><h3>Skúsme iný výber.</h3><p>Pre túto kombináciu sme nenašli model.</p><button className="button dark" onClick={() => { setFilter('Všetky'); setFamily('Všetky rady'); setQuery(''); }}>Zobraziť všetky modely <Arrow /></button></div>}
    {full && <div className="more-models"><span className="eyebrow">VŠETKY MODELY NA JEDNOM MIESTE</span><h2>Každý deň je iný.<br />Rovnako aj vaše možnosti.</h2><div>{bikes.map(b => <Link href={'/bicykle/' + b.slug} key={b.slug}>{b.name} <Arrow /></Link>)}</div><p>Každý model má vlastný detail a fotografiu z knižnice výrobcu. Slovenskú konfiguráciu, cenu a dostupnosť potvrdíme pri dopyte.</p></div>}
  </>;
}
