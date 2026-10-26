import { headers } from 'next/headers';
import {Header as EnglishHeader, Footer as EnglishFooter} from '@/components/en/Site';
import type {Metadata} from 'next';import './globals.css';import {Header,Footer} from '@/components/Site';
export async function generateMetadata(): Promise<Metadata> {
 const english=(await headers()).get('x-site-language')==='en';
 return {title:{default:english?'cargobajk.sk — More life. Less car.':'cargobajk.sk — Viac života. Menej auta.',template:english?'%s | cargobajk.sk':'%s | cargobajk.sk'},description:english?'Cargo bikes for families, dogs and everyday journeys. Explore the Cargobike of Sweden range at cargobajk.sk.':'Cargo bicykle pre rodinu, psov aj každodenné cesty. Spoznajte ponuku značky Cargobike of Sweden na cargobajk.sk.',icons:{icon:'/favicon.svg'},openGraph:{siteName:'cargobajk.sk',images:[{url:'https://cargobajk.sk/brand/cargobajk-profile.png',width:1254,height:1254,alt:'cargobajk.sk'}]},robots:{index:false,follow:false}};
}

export default async function RootLayout({children}:{children:React.ReactNode}){const english=(await headers()).get('x-site-language')==='en';return <html lang={english?'en':'sk'}><body>{english?<EnglishHeader/>:<Header/>}{children}{english?<EnglishFooter/>:<Footer/>}</body></html>}
