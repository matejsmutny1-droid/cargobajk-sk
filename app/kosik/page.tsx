import ShopCart from '@/components/ShopCart';
export const metadata={title:'Košík a objednávka',robots:{index:false,follow:false,googleBot:{index:false,follow:false}}};
export default function Page(){return <main id="main" className="section shop-main"><span className="eyebrow">OD VÝBERU K PRVEJ JAZDE</span><h1 className="shop-title">Váš košík.</h1><ShopCart/></main>;}
