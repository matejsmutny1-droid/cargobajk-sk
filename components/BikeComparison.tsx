'use client';
import {useState} from 'react';
import {bikes} from '@/lib/catalog';
import {bikes as englishBikes} from '@/lib/en/catalog';
import Link from '@/components/PageLink';
import BikePrice from './BikePrice';

export default function BikeComparison({english = false}: {english?: boolean}) {
  const t = (sk: string, en: string) => english ? en : sk;
  const prefix = english ? '/en' : '';
  const [category, setCategory] = useState('all');
  const categories = [
    {id:'all', use:'', sk:'Všetky modely', en:'All models'},
    {id:'family', use:'Rodina', sk:'Rodina', en:'Family'},
    {id:'kindergarten', use:'Pre škôlky', sk:'Kindergarten · až 6 detí', en:'Kindergarten · up to 6 children'},
    {id:'dog', use:'So psom', sk:'So psom', en:'With a dog'},
    {id:'cargo', use:'Náklad a podnikanie', sk:'Box · náklad a podnikanie', en:'Box · cargo and business'},
    {id:'city', use:'Mesto', sk:'Longtail · mesto', en:'Longtail · city'},
  ];
  const selectedCategory = categories.find(c => c.id === category)!;
  const selected = bikes.filter(b => !selectedCategory.use || b.use === selectedCategory.use);
  const models = selected.map(b => english ? englishBikes.find(v => v.slug === b.slug)! : b);
  const rows = [['Motor', 'Motor'], ['Batéria', 'Battery'], ['Nosnosť', 'Load capacity'], ['Prevody', 'Gears'], ['Rozmery boxu', 'Box dimensions']];
  const missing = <span aria-label={t('Údaj zatiaľ nemáme potvrdený', 'Specification not yet confirmed')}>—</span>;
  return <section className="section bike-comparison" id="porovnanie" aria-labelledby="comparison-title">
    <span className="eyebrow">{t('ROZDIELY NA JEDNOM MIESTE', 'THE DIFFERENCES AT A GLANCE')}</span><h2 id="comparison-title">{t('Ktorý cargobajk vám sadne?', 'Which cargo bike fits your life?')}</h2>
    <p>{t('Porovnajte všetkých 14 modelov vrátane Kindergarten, Dog, Box, Long Lite a Longtail Varia. Zúžte tabuľku podľa využitia alebo si nechajte zobraziť celú ponuku.', 'Compare all 14 models, including Kindergarten, Dog, Box, Long Lite and Longtail Varia. Filter by use or keep the complete range side by side.')}</p>
    <div className="filters comparison-filters" role="group" aria-label={t('Použitie porovnávaných bicyklov', 'Filter comparison by bike use')}>{categories.map(c => <button key={c.id} type="button" aria-pressed={category === c.id} className={category === c.id ? 'active' : ''} onClick={() => setCategory(c.id)}>{t(c.sk, c.en)}</button>)}</div>
    <p className="comparison-count" role="status">{t(`Porovnávate ${models.length} zo ${bikes.length} modelov.`, `Comparing ${models.length} of ${bikes.length} models.`)}</p>
    <p className="comparison-swipe">{t('Tabuľku posuňte do strany →', 'Scroll sideways to compare →')}</p><div className="comparison-scroll" role="region" aria-label={t('Porovnanie modelov; tabuľku môžete posúvať do strany', 'Model comparison; scroll the table horizontally')} tabIndex={0}>
      <table data-model-count={models.length} style={{minWidth:Math.max(720, 180 + models.length * 210)}}><caption>{t('Porovnanie cargo bicyklov', 'Cargo bike comparison')} · {t(selectedCategory.sk, selectedCategory.en)}</caption><thead><tr><th scope="col">{t('Model', 'Model')}</th>{models.map(b => <th scope="col" key={b.slug}><Link href={prefix + '/bicykle/' + b.slug}>{b.name} ↗</Link></th>)}</tr></thead><tbody>
        <tr><th scope="row">{t('Cena bicykla', 'Bike price')}</th>{models.map(b => <td key={b.slug}><BikePrice price={b.priceEur} english={english}/></td>)}</tr>
        <tr><th scope="row">{t('Pre koho', 'Best suited to')}</th>{models.map(b => <td key={b.slug}>{b.use}</td>)}</tr>
        <tr><th scope="row">{t('Miesta pre deti', 'Child capacity')}</th>{models.map(b => <td key={b.slug}>{b.children === null ? missing : t(`Až ${b.children} ${b.children < 5 ? 'deti' : 'detí'}`, `Up to ${b.children} children`)}</td>)}</tr>
        {rows.map(([sk, en]) => <tr key={sk}><th scope="row">{t(sk, en)}</th>{models.map(b => <td key={b.slug}>{b.specs.find(([key]) => key === t(sk, en))?.[1] || (sk === 'Rozmery boxu' && b.slug === 'longtail' ? t('Bez predného boxu', 'No front box') : missing)}</td>)}</tr>)}
      </tbody></table>
    </div><p className="comparison-note">{t('Údaje zodpovedajú parametrom uvedeným pri modeloch. Nosnosť boxu a jazdca sa posudzuje samostatne; vybavenie a vhodnosť pre deti potvrdíme podľa konkrétnej verzie. Cena dopravy a voliteľných doplnkov nie je zahrnutá. Pomlčka znamená, že údaj zatiaľ nemáme potvrdený; neznamená nulovú kapacitu ani chýbajúcu výbavu.', 'These figures match the model specifications. Cargo and rider limits apply separately; equipment and suitability for children are confirmed for the specific version. Shipping and optional accessories are extra. A dash means the specification is not yet confirmed; it does not mean zero capacity or missing equipment.')}</p>
  <p className="comparison-note"><Link className="text-link" href={prefix + '/bicykle/longtail'}>{t('Hľadáte bicykel bez predného boxu? Pozrite Longtail Varia', 'Prefer a bike without a front box? Explore Longtail Varia')} →</Link></p></section>;
}
