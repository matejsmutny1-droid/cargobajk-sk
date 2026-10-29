import StructuredData from '@/components/StructuredData';
import {pageMetadata, productSchema, breadcrumbSchema} from '@/lib/seo';
import BikePrice from '@/components/BikePrice';
import ProductSupply from '@/components/ProductSupply';
import Link from '@/components/PageLink';
import { notFound } from 'next/navigation';
import { bikes } from '@/lib/catalog';
import { Arrow } from '@/components/Site';
import Catalog from '@/components/Catalog';
import ProductGallery from '@/components/ProductGallery';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = bikes.find(b => b.slug === slug);
  if (!b) notFound();
  return pageMetadata(`/bicykle/${slug}`, `Cargobike ${b.name} — elektrický cargo bicykel`, b.description, `/media/${b.image}.webp`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = bikes.find(b => b.slug === slug);
  if (!b) notFound();
  const variants = bikes.filter(v => b.variants.includes(v.slug));
  return <main id="main">
    <StructuredData data={productSchema(b, false)}/>
    <StructuredData data={breadcrumbSchema([{name: 'Domov', path: '/'}, {name: 'Cargo bicykle', path: '/bicykle'}, {name: b.name, path: `/bicykle/${b.slug}`}])}/>
    <div className="section" style={{ paddingBottom: 0, paddingTop: 30 }}><div className="breadcrumbs"><Link href="/">Domov</Link><span>/</span><Link href="/bicykle">Bicykle</Link><span>/</span><span>{b.name}</span></div></div>
    <section className="product section">
      <div><ProductGallery name={b.name} image={b.slug} /><p className="gallery-caption">Oficiálne fotografie výrobcu. Zobrazené príslušenstvo nemusí byť súčasťou základnej konfigurácie.</p></div>
      <div className="product-info"><span className="eyebrow">CARGOBIKE OF SWEDEN · {b.use.toUpperCase()} · {b.sku}</span><h1>{b.name}</h1>
        {b.children && <span className="capacity-tag">{b.children === 2 ? 'Priestor až pre 2 deti' : `Priestor až pre ${b.children} detí`}</span>}
        <p>{b.description}</p><BikePrice price={b.priceEur}/><ProductSupply/>
        <div><Link className="button dark" href={'/nezavazna-ponuka?model=' + encodeURIComponent(b.slug)}>Vyžiadať nezáväznú ponuku <Arrow /></Link></div>
        <small>Nezáväzný dopyt. Konfiguráciu, cenu dopravy a celkovú sumu potvrdíme pred objednaním.</small>
        {variants.length > 1 && <div className="details"><h2 className="variant-heading">Vyberte si verziu radu {b.family}</h2><div className="variant-links">{variants.map(v => <Link href={'/bicykle/' + v.slug} key={v.slug} aria-current={v.slug === b.slug ? 'page' : undefined}>{v.name}</Link>)}</div></div>}
        <div className="details"><details open><summary>Technické údaje</summary>
          {b.specs.length ? <dl className="spec-table">{b.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p>Presnú špecifikáciu tejto verzie potvrdíme v aktuálnom technickom liste výrobcu pri dopyte.</p>}
          <p className="source-note">Údaje podľa produktových podkladov výrobcu. Fotografie a údaje sa môžu líšiť podľa modelového roku; dodávanú verziu potvrdíme pred objednávkou.{b.source && <> <a href={b.source} target="_blank" rel="noreferrer">Model na stránke výrobcu ↗︎</a></>}</p>
          {b.children === 6 && <p className="source-note">Kapacita až 6 detí nenahrádza limit hmotnosti nákladu. Vždy rešpektujte nosnosť boxu, vhodnosť sedadiel a pokyny výrobcu.</p>}
        </details><details><summary>Príslušenstvo a konfigurácia</summary><p>Strechu, sedadlá, zámok a ďalšie doplnky vyberieme podľa modelu a spôsobu používania. Konkrétnu kompatibilitu a obsah dodávky potvrdíme v dopyte.</p></details><details><summary>Dodanie a servis</summary><p>Všetky modely dodávame na objednávku zo Švédska do 21 kalendárnych dní od potvrdenia objednávky a dohodnutej platby. Cenu dopravy pre vašu adresu, montáž, servisné zabezpečenie a obchodné podmienky potvrdíme pred objednávkou.</p><Link href="/servis" className="text-link" style={{ marginTop: 15 }}>Servis a starostlivosť <Arrow /></Link></details></div>
        <Link className="text-link" href="/vyber-bicykla">Pomôžte mi s výberom <Arrow /></Link>
      </div>
    </section>
    <section className="section related"><span className="eyebrow">OBJAVUJTE ĎALEJ</span><h2>Iný deň. Iné možnosti.</h2><Catalog exclude={b.slug} /><Link className="kindergarten-link" href="/bicykle">Pozrieť všetkých 14 modelov <Arrow /></Link></section>
  </main>;
}
