export default function BikePrice({price,english=false}:{price?:number;english?:boolean}) {
 return <span className="price">{price === undefined ? (english?'Price on request':'Cena na vyžiadanie') : new Intl.NumberFormat(english?'en-IE':'sk-SK',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(price)}</span>;
}
