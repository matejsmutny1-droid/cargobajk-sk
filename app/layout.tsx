import StructuredData from '@/components/StructuredData';
import {SITE_URL, organization} from '@/lib/seo';
import { headers } from 'next/headers';
import {Header as EnglishHeader, Footer as EnglishFooter} from '@/components/en/Site';
import type {Metadata} from 'next';import './globals.css';import {Header,Footer} from '@/components/Site';
export async function generateMetadata(): Promise<Metadata> {
 const english=(await headers()).get('x-site-language')==='en';
 return {metadataBase:new URL(SITE_URL),title:{default:english?'Cargo bikes in Slovakia | cargobajk.sk':'Cargo bicykle Slovensko — predaj | cargobajk.sk',template:english?'%s | cargobajk.sk':'%s | cargobajk.sk'},description:english?'Cargo bikes for families, dogs and everyday journeys. Explore the Cargobike of Sweden range at cargobajk.sk.':'Cargo bicykle pre rodinu, psov aj každodenné cesty. Spoznajte ponuku značky Cargobike of Sweden na cargobajk.sk.',icons:{icon:[{url:'/brand/icon-v2.svg',type:'image/svg+xml'},{url:'/brand/icon-32-v2.png',sizes:'32x32',type:'image/png'},{url:'/brand/icon-192-v2.png',sizes:'192x192',type:'image/png'}],shortcut:'/favicon.ico',apple:[{url:'/apple-touch-icon.png',sizes:'180x180',type:'image/png'}]},openGraph:{siteName:'cargobajk.sk',images:[{url:'https://cargobajk.sk/brand/cargobajk-profile.png',width:1254,height:1254,alt:'cargobajk.sk'}]},robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}}};
}

export default async function RootLayout({children}:{children:React.ReactNode}){const english=(await headers()).get('x-site-language')==='en';return <html lang={english?'en':'sk'}><body><StructuredData data={{'@context':'https://schema.org',...organization}}/>{english?<EnglishHeader/>:<Header/>}{children}{english?<EnglishFooter/>:<Footer/>}</body></html>}
