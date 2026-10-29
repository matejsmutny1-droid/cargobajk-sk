import {pageMetadata} from '@/lib/seo';
import QuotePage from '@/components/QuotePage';
import { notFound } from 'next/navigation';
import Home from '@/components/en/Home';
import Catalog from '@/components/en/CatalogPage';
import Product, { generateMetadata as productMetadata } from '@/components/en/ProductPage';
import Content from '@/components/en/ContentPage';
import { pages } from '@/lib/en/pages';
type Props = { params: Promise<{ path?: string[] }>; searchParams: Promise<{ model?: string }> };
export async function generateMetadata({params}: Props) {
  const {path = []} = await params;
  if(path[0] === 'bicykle' && path.length === 2) return productMetadata({params: Promise.resolve({slug:path[1]})});
  const route = '/en' + (path.length ? '/' + path.join('/') : '');
  if(path[0] === 'nezavazna-ponuka') return {...pageMetadata(route, 'Request a non-binding quote', 'Choose your cargo bike and equipment. Request a personalised quote.'), robots:{index:false,follow:false}};
  const title = path.length === 0 ? 'Cargo bikes in Slovakia — Cargobike of Sweden' : path[0] === 'bicykle' ? 'Electric cargo bikes for sale in Slovakia' : pages[path[0]]?.title;
  if (!title) notFound();
  const description = path.length === 0 || path[0] === 'bicykle' ? 'Explore 14 Cargobike of Sweden electric cargo bikes, prices and equipment. Personal advice and delivery to order in Slovakia.' : pages[path[0]]?.intro ?? '';
  return {...pageMetadata(route, title, description), ...(path[0] === 'sukromie' ? {robots:{index:false,follow:false}} : {})};
}
export default async function EnglishPage({params,searchParams}: Props) {
  const {path = []} = await params;
  if(path.length === 0) return <Home />;
  if(path.length === 1 && path[0] === 'nezavazna-ponuka') return <QuotePage model={(await searchParams).model} english/>;
  if(path[0] === 'bicykle' && path.length === 1) return <Catalog />;
  if(path[0] === 'bicykle' && path.length === 2) return <Product params={Promise.resolve({slug:path[1]})} />;
  if(path.length === 1 && pages[path[0]]) return <Content params={Promise.resolve({page:path[0]})} searchParams={searchParams} />;
  notFound();
}
