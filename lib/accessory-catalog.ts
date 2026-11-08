import {accessories} from './accessories';

export type AccessoryCategory = 'weather' | 'safety' | 'comfort' | 'lighting' | 'care';
export const accessoryCategories: {id: AccessoryCategory; sk: string; en: string}[] = [
  {id:'weather',sk:'Striešky a kryty',en:'Canopies and covers'},
  {id:'safety',sk:'Zabezpečenie a zrkadlá',en:'Security and mirrors'},
  {id:'comfort',sk:'Pohodlie v boxe',en:'Cargo box comfort'},
  {id:'lighting',sk:'Svetlá',en:'Lights'},
  {id:'care',sk:'Starostlivosť',en:'Bike care'},
];
type Presentation = {id:string;category:AccessoryCategory;image:string;frame?:string;sk:string;en:string};
const presentation: Presentation[] = [
  {id:'canopy',category:'weather',image:'canopy-premium.jpg',frame:'canopy-frame.jpg',sk:'Strieška na rodinné cesty s nosnou konštrukciou v balíku.',en:'A canopy for family journeys, with its support frame included.'},
  {id:'1577-1',category:'safety',image:'1577-1.webp',sk:'Spätné zrkadlo na riadidlá pre lepší prehľad za bicyklom.',en:'A handlebar mirror to help you keep an eye on traffic behind.'},
  {id:'lock',category:'safety',image:'1537-23.webp',sk:'Rámový zámok na zabezpečenie bicykla pri parkovaní.',en:'A frame lock for securing your bike when parked.'},
  {id:'canopy-high',category:'weather',image:'canopy-high.jpg',frame:'canopy-high-frame.jpg',sk:'Zvýšené vyhotovenie striešky vrátane zodpovedajúcej konštrukcie.',en:'A raised canopy with the matching support frame included.'},
  {id:'1521-30',category:'comfort',image:'1521-30.webp',sk:'Polstrovanie zadnej lavice aj opierky pre príjemnejšie sedenie.',en:'Padding for the rear bench and backrest for a more comfortable seat.'},
  {id:'1521-37',category:'weather',image:'cargo-cover.jpg',sk:'Kryt nákladového priestoru pre zodpovedajúci box Flex alebo Delight.',en:'A cargo-area cover for the matching Flex or Delight box.'},
  {id:'cover',category:'weather',image:'1521-20.webp',sk:'Ochranný obal na bicykel, keď práve nejazdíte.',en:'A protective bike cover for when you are not riding.'},
  {id:'canopy-kindergarten',category:'weather',image:'canopy-kindergarten.jpg',frame:'canopy-kindergarten-frame.jpg',sk:'Strieška a konštrukcia určená pre modely Kindergarten.',en:'A canopy and support frame for Kindergarten models.'},
  {id:'1537-7',category:'safety',image:'1537-7.webp',sk:'Reťazový zámok s dĺžkou 150 cm na zamknutie bicykla.',en:'A 150 cm chain lock for securing your bike.'},
  {id:'1621',category:'safety',image:'1621.webp',sk:'Doplnkový alarm ovládaný diaľkovým ovládačom.',en:'An additional bike alarm operated by remote control.'},
  {id:'1521-23',category:'comfort',image:'1521-23.webp',sk:'Mäkké sedenie do boxu. Vhodnosť pre pasažiera a model overíme.',en:'Soft seating for the cargo box. We will check suitability for the passenger and model.'},
  {id:'1633',category:'comfort',image:'1633.webp',sk:'Podložka na dno zodpovedajúceho nákladového boxu.',en:'A mat for the floor of the matching cargo box.'},
  {id:'1592-1',category:'care',image:'1592-1.webp',sk:'Súprava na pravidelnú starostlivosť o bicykel.',en:'A kit for regular bike care.'},
];
export const accessoryCatalog = presentation.map(item => {
  const product = accessories.find(accessory => accessory.id === item.id);
  if(!product) throw new Error(`Unknown accessory in public catalogue: ${item.id}`);
  return {id:item.id,name:product.sk,nameEn:product.en,priceEur:product.priceEur as number|null,
    models:product.models,category:item.category,image:'/media/accessories/'+item.image,
    frame:item.frame?'/media/accessories/'+item.frame:undefined,description:item.sk,descriptionEn:item.en};
}).concat([
  {id:'1529-171',name:'Predné nabíjateľné svetlo Libra',nameEn:'Libra rechargeable front light',priceEur:null,models:[],category:'lighting',image:'/media/accessories/1529-171.webp',frame:undefined,description:'Predné nabíjateľné svetlo. Cenu, vyhotovenie a vhodnosť montáže potvrdíme.',descriptionEn:'A rechargeable front light. Price, version and mounting suitability will be confirmed.'},
  {id:'1529-17',name:'Zadné nabíjateľné svetlo Gemini',nameEn:'Gemini rechargeable rear light',priceEur:null,models:[],category:'lighting',image:'/media/accessories/1529-17.webp',frame:undefined,description:'Zadné nabíjateľné svetlo. Cenu, vyhotovenie a vhodnosť montáže potvrdíme.',descriptionEn:'A rechargeable rear light. Price, version and mounting suitability will be confirmed.'},
]);
export type CatalogAccessory = typeof accessoryCatalog[number];

export function filterAccessories(category='all',model='') {
  return accessoryCatalog.filter(item=>(category==='all'||item.category===category)&&(!model||!item.models.length||item.models.includes(model)));
}
