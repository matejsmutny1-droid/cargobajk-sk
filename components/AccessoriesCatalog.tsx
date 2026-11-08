'use client';
import {useRef, useState} from 'react';
import Link from '@/components/PageLink';
import Arrow from '@/components/Arrow';
import {bikes} from '@/lib/catalog';
import {filterAccessories,accessoryCategories,type CatalogAccessory} from '@/lib/accessory-catalog';
import {quoteMoney} from '@/lib/quote';

export default function AccessoriesCatalog({english=false}:{english?:boolean}) {
  const [category,setCategory]=useState('all'),[model,setModel]=useState('');
  const [photo,setPhoto]=useState<CatalogAccessory>();
  const dialog=useRef<HTMLDialogElement>(null);
  const t=(sk:string,en:string)=>english?en:sk;
  const items=filterAccessories(category,model);
  const name=(item:CatalogAccessory)=>english?item.nameEn:item.name;
  return <>
    <div className="accessories-controls"><div className="accessories-filters" role="group" aria-label={t('Kategória doplnkov','Accessory category')}>
      {[{id:'all',sk:'Všetky doplnky',en:'All accessories'},...accessoryCategories].map(group=><button type="button" key={group.id} aria-pressed={category===group.id} className={category===group.id?'active':''} onClick={()=>setCategory(group.id)}>{english?group.en:group.sk}</button>)}
    </div><label className="accessories-model">{t('Vyberte svoj bicykel','Choose your bike')}<select value={model} onChange={event=>setModel(event.target.value)}><option value="">{t('Všetky modely','All models')}</option>{bikes.map(bike=><option key={bike.slug} value={bike.slug}>{bike.name}</option>)}</select></label></div>
    <p className="accessories-count" role="status">{t('Počet doplnkov','Accessories shown')}: {items.length}</p>
    <div className="accessories-grid">{items.map(item=><article className="accessory-card" key={item.id} id={'doplnok-'+item.id}>
      <button type="button" className="accessory-catalog-photo" aria-label={t('Zväčšiť fotografie: ','Enlarge photos: ')+name(item)} onClick={()=>{setPhoto(item);dialog.current?.showModal();}}>
        <img src={item.image} alt={name(item)} width="800" height="650" loading="lazy"/><span aria-hidden="true">＋</span>
      </button>
      <div className="accessory-card-copy"><span className="eyebrow">{english?accessoryCategories.find(group=>group.id===item.category)?.en:accessoryCategories.find(group=>group.id===item.category)?.sk}</span><h2>{name(item)}</h2><p>{english?item.descriptionEn:item.description}</p>
      <strong className="accessory-catalog-price">{item.priceEur===null?t('Cena na dopyt','Price on request'):quoteMoney(item.priceEur,english)}</strong>
      <details className="accessory-fit"><summary>{t('Pre ktoré bicykle?','Which bikes does it fit?')}</summary><p>{item.models.length?item.models.map(slug=>bikes.find(bike=>bike.slug===slug)?.name).join(', '):t('Vhodné vyhotovenie vyberieme podľa konkrétneho bicykla.','We will select a suitable version for your specific bike.')}</p><p>{t('Kompatibilitu s ročníkom a verziou potvrdíme pred objednaním.','We confirm compatibility with the model year and version before ordering.')}</p></details>
      <Link className="text-link" href={(english?'/en':'')+'/kontakt?doplnok='+encodeURIComponent(item.id)+'#dopyt'}>{t('Mám záujem','Enquire about this')} <Arrow/></Link></div>
    </article>)}</div>
    {!items.length&&<div className="accessories-empty"><h2>{t('S touto výbavou vám poradíme osobne.','We can help you choose equipment personally.')}</h2><p>{t('Pre zvolený model tu zatiaľ nemáme potvrdený doplnok z tejto kategórie. Napíšte nám, čo potrebujete.','We do not yet list confirmed accessories in this category for your chosen model. Tell us what you need.')}</p><Link href={(english?'/en':'')+'/kontakt#dopyt'} className="button dark">{t('Poradiť s doplnkami','Ask about accessories')} <Arrow/></Link></div>}
    <dialog ref={dialog} className="accessory-dialog" aria-label={photo?name(photo):t('Fotografie doplnku','Accessory photos')} onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
      <div className="accessory-dialog-head"><h2>{photo&&name(photo)}</h2><button type="button" onClick={()=>dialog.current?.close()}>{t('Zavrieť','Close')} ×</button></div>
      {photo&&<div className={photo.frame?'accessory-dialog-images with-frame':'accessory-dialog-images'}><figure><img src={photo.image} alt={name(photo)}/><figcaption>{t('Oficiálna produktová fotografia výrobcu. Bicykel na ilustračnej fotografii nie je súčasťou ceny doplnku.','Official manufacturer product photo. A bike shown for illustration is not included in the accessory price.')}</figcaption></figure>{photo.frame&&<figure><img src={photo.frame} alt={t('Konštrukcia striešky zahrnutá v balíku','Canopy support frame included in the bundle')}/><figcaption>{t('Zodpovedajúca konštrukcia je súčasťou uvedeného balíka.','The matching support frame is included in the listed bundle.')}</figcaption></figure>}</div>}
    </dialog>
  </>;
}
