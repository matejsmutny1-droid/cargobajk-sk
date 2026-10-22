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
  return {title:path.length === 0 ? 'More life. Less car.' : path[0] === 'bicykle' ? 'Our cargo bikes' : pages[path[0]]?.title ?? 'Page not found'};
}
export default async function EnglishPage({params,searchParams}: Props) {
  const {path = []} = await params;
  if(path.length === 0) return <Home />;
  if(path[0] === 'bicykle' && path.length === 1) return <Catalog />;
  if(path[0] === 'bicykle' && path.length === 2) return <Product params={Promise.resolve({slug:path[1]})} />;
  if(path.length === 1 && pages[path[0]]) return <Content params={Promise.resolve({page:path[0]})} searchParams={searchParams} />;
  notFound();
}
