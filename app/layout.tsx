import { headers } from 'next/headers';
import {Header as EnglishHeader, Footer as EnglishFooter} from '@/components/en/Site';
import type {Metadata} from 'next';import './globals.css';import {Header,Footer} from '@/components/Site';
export async function generateMetadata(): Promise<Metadata> {
 const english=(await headers()).get('x-site-language')==='en';
 return {title:{default:english?'Cargobike of Sweden Slovakia — More life. Less car.':'Cargobike of Sweden Slovensko — Viac života. Menej auta.',template:english?'%s | Cargobike of Sweden Slovakia':'%s | Cargobike of Sweden Slovensko'},description:english?'Discover Swedish electric cargo bikes for families, dogs and everyday journeys. Cargobike of Sweden in Slovakia.':'Objavte švédske elektrické cargo bicykle pre rodinu, psov aj každodenné cesty. Pripravujeme Cargobike of Sweden na Slovensku.',robots:{index:false,follow:false}};
}

export default async function RootLayout({children}:{children:React.ReactNode}){const english=(await headers()).get('x-site-language')==='en';return <html lang={english?'en':'sk'}><body>{english?<EnglishHeader/>:<Header/>}{children}{english?<EnglishFooter/>:<Footer/>}</body></html>}
