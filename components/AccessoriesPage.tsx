import Link from '@/components/PageLink';
import Arrow from '@/components/Arrow';
import AccessoriesCatalog from '@/components/AccessoriesCatalog';
import StructuredData from '@/components/StructuredData';
import {accessoryCatalog} from '@/lib/accessory-catalog';
import {SITE_URL} from '@/lib/seo';

export default function AccessoriesPage({english=false}:{english?:boolean}) {
  const t=(sk:string,en:string)=>english?en:sk;
  const path=english?'/en/doplnky':'/doplnky';
  return <main id="main"><StructuredData data={{'@context':'https://schema.org','@type':'CollectionPage',url:SITE_URL+path,name:t('Doplnky pre váš cargobajk','Accessories for your cargo bike'),mainEntity:{'@type':'ItemList',numberOfItems:accessoryCatalog.length,itemListElement:accessoryCatalog.map((item,index)=>({'@type':'ListItem',position:index+1,url:SITE_URL+path+'#doplnok-'+item.id,name:english?item.nameEn:item.name,image:SITE_URL+item.image}))}}}/>
    <section className="page-head section accessories-intro"><div className="breadcrumbs"><Link href={english?'/en':'/'}>{t('Domov','Home')}</Link><span>/</span><span>{t('Doplnky','Accessories')}</span></div><span className="eyebrow">{t('MALÉ DETAILY. LEPŠÍ KAŽDÝ DEŇ.','SMALL DETAILS. BETTER EVERYDAY RIDES.')}</span><h1>{t('Dolaďte si svoj','Make your')}<br/><em>{t('cargobajk.','cargo bike your own.')}</em></h1><p>{t('Strieška na cestu do škôlky, zrkadlo do mesta alebo pohodlnejšie sedenie. Vyberte si originálne doplnky Cargobike of Sweden podľa toho, ako jazdíte.','A canopy for the nursery run, a mirror for city streets or a more comfortable seat. Discover genuine Cargobike of Sweden accessories for the way you ride.')}</p></section>
    <section className="section accessories-section"><div className="accessories-advice"><span aria-hidden="true">＋</span><p>{t('Ceny sú nezáväzné, bez dopravy. Striešky v našej ponuke už obsahujú konštrukciu. Dostupnosť, presné vyhotovenie a kompatibilitu potvrdíme osobne pred objednaním.','Prices are non-binding and exclude shipping. Our canopy bundles include the support frame. Availability, exact version and compatibility will be confirmed personally before ordering.')}</p></div><AccessoriesCatalog english={english}/></section>
    <section className="accessories-help section"><div><span className="eyebrow">{t('NEMUSÍTE POZNAŤ KAŽDÝ DETAIL','YOU DO NOT NEED TO KNOW EVERY DETAIL')}</span><h2>{t('S výbavou vám','We can help you')}<br/><em>{t('radi poradíme.','choose equipment.')}</em></h2><p>{t('Napíšte nám model a ideálne aj rok výroby vášho bicykla. Pomôžeme vybrať vhodnú verziu doplnku.','Tell us your bike model and, if possible, its model year. We will help you choose the right accessory version.')}</p></div><Link className="button dark" href={(english?'/en':'')+'/kontakt#dopyt'}>{t('Poradiť s výberom','Help me choose')} <Arrow/></Link></section>
  </main>;
}
