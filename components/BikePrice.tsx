import {plannedNetPrice} from '@/lib/retail-display';
export default function BikePrice({price,english=false}:{price?:number;english?:boolean}) {
 const money=(n:number)=>new Intl.NumberFormat(english?'en-IE':'sk-SK',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
 return <span className="price-block"><span className="price">{price === undefined ? (english?'Price on request':'Cena na vyžiadanie') : money(price)}</span>{price!==undefined&&<small className="price-net">{money(plannedNetPrice(price))} {english?'excluding VAT · from 1 Jan 2027*':'bez DPH · od 1. 1. 2027*'}</small>}</span>;
}
