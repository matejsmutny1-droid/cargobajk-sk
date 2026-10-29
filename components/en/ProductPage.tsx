import StructuredData from '@/components/StructuredData';
import {pageMetadata, productSchema, breadcrumbSchema} from '@/lib/seo';
import BikePrice from '@/components/BikePrice';
import Link from '@/components/en/PageLink';
import { notFound } from 'next/navigation';
import { bikes } from '@/lib/en/catalog';
import { Arrow } from '@/components/en/Site';
import Catalog from '@/components/en/Catalog';
import ProductGallery from '@/components/en/ProductGallery';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = bikes.find(b => b.slug === slug);
  if (!b) notFound();
  return pageMetadata(`/en/bicykle/${slug}`, `Cargobike ${b.name} — electric cargo bike`, b.description, `/media/${b.image}.webp`);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = bikes.find(b => b.slug === slug);
  if (!b) notFound();
  const variants = bikes.filter(v => b.variants.includes(v.slug));
  return <main id="main">
    <StructuredData data={productSchema(b, true)}/>
    <StructuredData data={breadcrumbSchema([{name: 'Home', path: '/en'}, {name: 'Cargo bikes', path: '/en/bicykle'}, {name: b.name, path: `/en/bicykle/${b.slug}`}])}/>
    <div className="section" style={{ paddingBottom: 0, paddingTop: 30 }}><div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/bicykle">Bikes</Link><span>/</span><span>{b.name}</span></div></div>
    <section className="product section">
      <div><ProductGallery name={b.name} image={b.slug} /><p className="gallery-caption">Official manufacturer photos. Accessories shown may not be included in the standard specification.</p></div>
      <div className="product-info"><span className="eyebrow">CARGOBIKE OF SWEDEN · {b.use.toUpperCase()} · {b.sku}</span><h1>{b.name}</h1>
        {b.children && <span className="capacity-tag">{b.children === 2 ? 'Room for up to 2 children' : `Room for up to ${b.children} children`}</span>}
        <p>{b.description}</p><BikePrice price={b.priceEur} english/>
        <div><Link className="button dark" href={'/nezavazna-ponuka?model=' + encodeURIComponent(b.slug)}>Request a non-binding quote <Arrow /></Link></div>
        <small>No-obligation enquiry. We will confirm the specification, price in EUR, availability and delivery terms individually.</small>
        {variants.length > 1 && <div className="details"><h2 className="variant-heading">Choose your version of the {b.family}</h2><div className="variant-links">{variants.map(v => <Link href={'/bicykle/' + v.slug} key={v.slug} aria-current={v.slug === b.slug ? 'page' : undefined}>{v.name}</Link>)}</div></div>}
        <div className="details"><details open><summary>Technical specifications</summary>
          {b.specs.length ? <dl className="spec-table">{b.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p>We will confirm the exact specification of this version using the latest manufacturer data when you enquire.</p>}
          <p className="source-note">Based on manufacturer product data. Photos and specifications may vary by model year; we will confirm the supplied version before you order.{b.source && <> <a href={b.source} target="_blank" rel="noreferrer">View on the manufacturer website ↗︎</a></>}</p>
          {b.children === 6 && <p className="source-note">Seating for up to 6 children does not override the cargo weight limit. Always follow the box load limit, seat suitability and manufacturer instructions.</p>}
        </details><details><summary>Accessories and configuration</summary><p>We will help you choose a canopy, seats, lock and other accessories to suit the model and your needs. Compatibility and the contents of the delivery will be confirmed with your enquiry.</p></details><details><summary>Delivery and service</summary><p>We supply new bikes to order from Sweden. Delivery time, assembly, service arrangements and sales terms will be confirmed before you order.</p><Link href="/servis" className="text-link" style={{ marginTop: 15 }}>Service and support <Arrow /></Link></details></div>
        <Link className="text-link" href="/vyber-bicykla">Help me choose <Arrow /></Link>
      </div>
    </section>
    <section className="section related"><span className="eyebrow">KEEP EXPLORING</span><h2>Another day. More possibilities.</h2><Catalog exclude={b.slug} /><Link className="kindergarten-link" href="/bicykle">Explore all 14 models <Arrow /></Link></section>
  </main>;
}
