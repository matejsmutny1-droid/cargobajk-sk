import type {Metadata} from 'next';import './globals.css';import {Header,Footer} from '@/components/Site';
export const metadata:Metadata={title:{default:'Cargobike of Sweden Slovensko — Viac života. Menej auta.',template:'%s | Cargobike of Sweden Slovensko'},description:'Objavte švédske elektrické cargo bicykle pre rodinu, psov aj každodenné cesty. Pripravujeme Cargobike of Sweden na Slovensku.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="sk"><body><Header/>{children}<Footer/></body></html>}
