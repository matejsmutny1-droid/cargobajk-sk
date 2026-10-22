'use client';
import { useState } from 'react';
import Link from '@/components/en/PageLink';
import BrandImage from '@/components/BrandImage';
import { bikes, featuredSlugs } from '@/lib/en/catalog';
import { Arrow } from './Site';

export default function Catalog({ full = false, exclude }: { full?: boolean; exclude?: string }) {
  const [filter, setFilter] = useState('All');
  const [family, setFamily] = useState('All ranges');
  const [query, setQuery] = useState('');
  const base = full ? bikes : bikes.filter(b => featuredSlugs.includes(b.slug) && b.slug !== exclude);
  const shown = base.filter(b => (filter === 'All' || b.use === filter) &&
    (family === 'All ranges' || b.family === family) &&
    `${b.name} ${b.sku}`.toLocaleLowerCase('sk').includes(query.trim().toLocaleLowerCase('sk')));
  const categories = full ? ['All', 'Family', 'With a dog', 'For nurseries', 'Cargo and business', 'City'] : ['All', 'Family', 'With a dog', 'City'];
  return <>
    <div className="filters" role="group" aria-label="Bike use">
      {categories.map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>{f === 'For nurseries' ? 'For nurseries · up to 6 children' : f}</button>)}
    </div>
    {full && <div className="catalog-tools">
      <label className="catalog-search"><span>Find a model</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="E.g. Kindergarten, Flex, 1163…" /></label>
      <label><span>Model range</span><select value={family} onChange={e => setFamily(e.target.value)}>{['All ranges', ...new Set(bikes.map(b => b.family))].map(f => <option key={f}>{f}</option>)}</select></label>
      <span className="result-count" role="status">{shown.length} / {base.length} models</span>
    </div>}
    <div className="bike-grid">
      {shown.map(b => <Link className="bike-card" href={'/bicykle/' + b.slug} key={b.slug}>
        <div className="bike-picture"><span className="bike-label">{b.children === 6 ? 'Up to 6 children · Kindergarten' : b.use}</span><BrandImage src={'/media/' + b.image + '.webp'} alt={'Cargobike of Sweden ' + b.name} loading="lazy" /><span className="round-arrow"><Arrow /></span></div>
        <div className="bike-card-title"><h3>{b.name}</h3><span>Electric cargo bike</span></div>
        <p>{b.description}</p><span className="price">Price on request</span>
      </Link>)}
    </div>
    {shown.length === 0 && <div className="empty-catalog"><h3>Let us try a different selection.</h3><p>No models match this combination.</p><button className="button dark" onClick={() => { setFilter('All'); setFamily('All ranges'); setQuery(''); }}>Show all models <Arrow /></button></div>}
    {full && <div className="more-models"><span className="eyebrow">EVERY MODEL IN ONE PLACE</span><h2>Every day is different.<br />So are your possibilities.</h2><div>{bikes.map(b => <Link href={'/bicykle/' + b.slug} key={b.slug}>{b.name} <Arrow /></Link>)}</div><p>Explore the details and official manufacturer photos for each model. We will confirm the Slovak specification, price and availability when you enquire.</p></div>}
  </>;
}
