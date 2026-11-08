import Link from '@/components/PageLink';
import Arrow from '@/components/Arrow';
import {accessoryCatalog} from '@/lib/accessory-catalog';
export default function AccessoriesTeaser({english=false}:{english?:boolean}){
 const t=(sk:string,en:string)=>english?en:sk,path=(english?'/en':'')+'/doplnky';
 return <section className="section accessories-teaser"><div className="section-heading"><div><span className="eyebrow">{t('VÝBAVA PRE VÁŠ KAŽDÝ DEŇ','EQUIPMENT FOR YOUR EVERYDAY')}</span><h2>{t('Váš cargobajk.','Your cargo bike.')}<br/><em>{t('Do posledného detailu.','Down to the last detail.')}</em></h2></div><Link className="text-link" href={path}>{t('Pozrieť všetky doplnky','Explore all accessories')} <Arrow/></Link></div><div className="accessories-teaser-grid">{['canopy','1577-1','1529-171','1521-30'].map(id=>{const item=accessoryCatalog.find(a=>a.id===id)!;return <Link href={path+'#doplnok-'+id} className="accessory-teaser-card" key={id}><div><img src={item.image} alt={english?item.nameEn:item.name} width="500" height="400" loading="lazy"/></div><h3>{english?item.nameEn:item.name}</h3><span>{t('Pozrieť doplnok','View accessory')} <Arrow/></span></Link>;})}</div></section>;
}
