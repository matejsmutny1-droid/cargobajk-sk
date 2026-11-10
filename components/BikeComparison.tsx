import {bikes} from '@/lib/catalog';
import {bikes as englishBikes} from '@/lib/en/catalog';
import Link from '@/components/PageLink';
import BikePrice from './BikePrice';

export default function BikeComparison({english = false}: {english?: boolean}) {
  const t = (sk: string, en: string) => english ? en : sk;
  const prefix = english ? '/en' : '';
  const slugs = ['classic', 'flex', 'delight', 'flex-dog'];
  const models = slugs.map(slug => (english ? englishBikes : bikes).find(b => b.slug === slug)!);
  const rows = [['Motor', 'Motor'], ['Batéria', 'Battery'], ['Nosnosť', 'Load capacity'], ['Prevody', 'Gears'], ['Rozmery boxu', 'Box dimensions']];
  const purposes = [t('Rodina a bežné presuny', 'Family and everyday journeys'), t('Rodina a každodenné nákupy', 'Family and everyday shopping'), t('Rodina, stredový motor a väčšia batéria', 'Family, mid-drive motor and larger battery'), t('Preprava psa v prednom boxe', 'Carrying a dog in the front box')];
  return <section className="section bike-comparison" id="porovnanie" aria-labelledby="comparison-title">
    <span className="eyebrow">{t('ROZDIELY NA JEDNOM MIESTE', 'THE DIFFERENCES AT A GLANCE')}</span><h2 id="comparison-title">{t('Ktorý cargobajk vám sadne?', 'Which cargo bike fits your life?')}</h2>
    <p>{t('Porovnajte rodinné modely Classic, Flex a Delight aj Flex Dog pre psa. Delight pridáva stredový motor Ananda a väčšiu batériu.', 'Compare the Classic, Flex and Delight family models and Flex Dog for your dog. Delight adds an Ananda mid-drive motor and a larger battery.')}</p>
    <p className="comparison-swipe">{t('Tabuľku posuňte do strany →', 'Scroll sideways to compare →')}</p><div className="comparison-scroll" role="region" aria-label={t('Porovnanie štyroch modelov; na mobile posuňte tabuľku do strany', 'Four-model comparison; scroll horizontally on mobile')} tabIndex={0}>
      <table><caption>{t('Porovnanie Classic, Flex, Delight a Flex Dog', 'Comparing Classic, Flex, Delight and Flex Dog')}</caption><thead><tr><th scope="col">{t('Model', 'Model')}</th>{models.map(b => <th scope="col" key={b.slug}><Link href={prefix + '/bicykle/' + b.slug}>{b.name} ↗</Link></th>)}</tr></thead><tbody>
        <tr><th scope="row">{t('Cena bicykla', 'Bike price')}</th>{models.map(b => <td key={b.slug}><BikePrice price={b.priceEur} english={english}/></td>)}</tr>
        <tr><th scope="row">{t('Pre koho', 'Best suited to')}</th>{models.map((b, i) => <td key={b.slug}>{purposes[i]}</td>)}</tr>
        {rows.map(([sk, en]) => <tr key={sk}><th scope="row">{t(sk, en)}</th>{models.map(b => <td key={b.slug}>{b.specs.find(([key]) => key === t(sk, en))?.[1] || t('Potvrdíme podľa konfigurácie', 'Confirmed for your configuration')}</td>)}</tr>)}
      </tbody></table>
    </div><p className="comparison-note">{t('Údaje zodpovedajú parametrom uvedeným pri modeloch. Nosnosť boxu a jazdca sa posudzuje samostatne; vybavenie a vhodnosť pre deti potvrdíme podľa konkrétnej verzie. Cena dopravy a voliteľných doplnkov nie je zahrnutá.', 'These figures match the model specifications. Cargo and rider limits apply separately; equipment and suitability for children are confirmed for the specific version. Shipping and optional accessories are extra.')}</p>
  <p className="comparison-note"><Link className="text-link" href={prefix + '/bicykle/longtail'}>{t('Hľadáte bicykel bez predného boxu? Pozrite Longtail Varia', 'Prefer a bike without a front box? Explore Longtail Varia')} →</Link></p></section>;
}
