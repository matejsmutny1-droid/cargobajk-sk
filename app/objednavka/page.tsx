import {OrderStatus} from '@/components/ShopCart';
export const metadata={title:'Stav objednávky',robots:{index:false,follow:false,googleBot:{index:false,follow:false}}};
export default function Page(){return <main id="main" className="section shop-main"><h1 className="shop-title">Vaša objednávka.</h1><OrderStatus/></main>;}
