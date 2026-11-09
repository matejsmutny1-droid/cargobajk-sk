import {vatConfig} from '../vat-config.ts';
import {vatRegistrationNote,retailTaxNote} from '../vat.ts';
/** Online-sale terms and privacy approved by the operator on 2026-11-09. */
export const shopPolicyVersion=vatConfig.enabled?'2027-01-01-vat':'2026-11-09';
export const shopTermsBlocks=[
 {
  "title": "Predávajúci a kontakt",
  "text": "Vivid Production s. r. o., IČO 57440603, DIČ 2122732480, IČ DPH SK2122732480; sídlo Javorová 3072/7, 010 07 Žilina. Obchodný register Okresného súdu Žilina, oddiel Sro, vložka 90123/L. Kontakt: hello@cargobajk.sk, +421 904 501 703. Osobný odber po dohode, vrátenie a reklamácie: Lúčna 350/5, 013 13 Rajecké Teplice. Registrácia pre DPH podľa § 7a nie je všeobecným platiteľstvom DPH podľa § 4; k uvedeným konečným cenám DPH nepripočítavame."
 },
 {
  "title": "Objednávka a uzavretie zmluvy",
  "text": "Vyberiete tovar a kompatibilné doplnky, zadáte kontaktné a adresné údaje a spôsob odovzdania. V súhrne pred platbou skontrolujete položky, množstvo, konečnú cenu vrátane dopravy a dodaciu lehotu. Údaje opravíte návratom na predchádzajúci krok. Tlačidlom „Objednávka s povinnosťou platby“ odošlete záväznú objednávku a prejdete na platbu. Kúpna zmluva v slovenskom jazyku vzniká úspešným zaplatením a prijatím platby predávajúcim. Potvrdenie objednávky a úplné podmienky dostanete e-mailom; uložte si ich. Samotné otvorenie platobnej stránky, neúspešná platba ani nezáväzný dopyt nie sú zaplatenou objednávkou. Zákaznícky účet nie je potrebný; zmluvné záznamy uchovávame a kópiu poskytneme na žiadosť po overení totožnosti."
 },
 {
  "title": "Cena a platba",
  "text": "Ceny v eurách sú konečné. Doprava je samostatná položka v súhrne; bez určenej konečnej ceny dopravy online platbu neumožníme. Platby kartou a podporovanými peňaženkami spracúva Stripe; Apple Pay alebo Google Pay závisia od zariadenia, banky a dostupnosti služby. Neúčtujeme platobný príplatok a čísla kariet na našom serveri neukladáme. Účtovný doklad dodá predávajúci; potvrdenie Stripe samo osebe nie je faktúrou."
 },
 {
  "title": "Dodanie a osobný odber",
  "text": "Bicykle sú na objednávku, nie deklarované ako skladové na Slovensku. Dodanie je do 21 kalendárnych dní od potvrdenia objednávky a platby. Termín konkrétnej objednávky a objednateľnosť produktov overujeme pred platbou. Osobný odber na Lúčnej 350/5 v Rajeckých Tepliciach je zadarmo, v dohodnutom termíne. Obsah balenia a vybavenie určuje popis vybraného modelu; doplnky sú zahrnuté iba vtedy, ak sú výslovne uvedené ako súčasť modelu alebo objednané osobitne. Rozsah prípadnej montáže a odovzdania dohodneme pred záväznou objednávkou; montáž ani výnos do bytu sa neúčtujú bez predchádzajúcej dohody. Ak dodanie v dohodnutej lehote nie je možné, bezodkladne vás informujeme; zákonné práva pri omeškaní zostávajú zachované."
 },
 {
  "title": "Doprava",
  "text": "Dopravu bicykla potvrdzujeme pred platbou podľa jednosmernej cestnej vzdialenosti zo Žiliny: do 100 km 150 €, nad 100 do 200 km 220 €, nad 200 do 300 km 290 €, nad 300 km v rámci SR 350 €. Doplnky v tej istej dodávke bicykla bez ďalšieho dopravného. Viac bicyklov a osobitná manipulácia vyžadujú individuálnu ponuku. Samostatné doplnky možno poslať kuriérom za 7,90 € alebo Packetou za 5,90 € iba po overení vhodnosti celého balenia a konkrétneho doručenia. Neoverenú dopravu a výdajné miesto online neponúkame; vyžiadajte si ponuku. Bez potvrdenej ceny sa platba nevytvorí a po zaplatení jednostranne nepridávame doplatok."
 },
 {
  "title": "Odstúpenie od zmluvy",
  "text": "Spotrebiteľ môže pri nákupe na diaľku odstúpiť bez uvedenia dôvodu do 14 dní od prevzatia tovaru, aj pred dodaním. Pri oddelene dodávaných položkách jednej objednávky lehota plynie od prevzatia poslednej položky. Jednoznačné oznámenie pošlite na hello@cargobajk.sk alebo Vivid Production s. r. o., Lúčna 350/5, 013 13 Rajecké Teplice; stačí ho odoslať v lehote. Predchádzajúci súhlas nevyžadujeme. Bežný výber modelu a kompatibilných doplnkov automaticky nepovažujeme za zákazkovú výrobu bez práva na odstúpenie. Toto právo sa vzťahuje na spotrebiteľov; nákup podnikateľa na podnikanie sa posudzuje podľa príslušných predpisov."
 },
 {
  "title": "Vrátenie tovaru a platieb",
  "text": "Tovar odošlite alebo odovzdajte na uvedenú kontaktnú adresu do 14 dní od odstúpenia; termín osobného odovzdania si dohodnite. Pri vrátení bez vady spravidla zabezpečujete a hradíte spätnú prepravu. Pri rozmernom tovare nevhodnom na bežné poštové vrátenie vám náklady alebo primeraný odhad oznámime pred nákupom. Ak si túto informačnú povinnosť nesplníme alebo sa zaviažeme prepravu uhradiť, jej náklady neznášate. Platby vrátane najlacnejšieho ponúkaného bežného dodania vrátime do 14 dní od doručenia oznámenia, pôvodným spôsobom bez poplatku, ak sa nedohodneme inak. Vrátenie môžeme zadržať do prevzatia tovaru alebo preukázania odoslania, podľa toho, čo nastane skôr, ak neponúkneme vyzdvihnutie. Zodpovedáte iba za zníženie hodnoty spôsobené zaobchádzaním nad rámec zistenia povahy, vlastností a funkčnosti tovaru; paušálny poplatok za vrátenie neúčtujeme. Pôvodný obal nie je podmienkou uplatnenia zákonných práv. Reklamácie vád sa riadia samostatnými zákonnými právami."
 },
 {
  "title": "Vzor odstúpenia — použitie je dobrovoľné",
  "text": "Adresát: Vivid Production s. r. o., Lúčna 350/5, 013 13 Rajecké Teplice, hello@cargobajk.sk. Týmto oznamujem, že odstupujem od zmluvy o kúpe tohto tovaru: … Číslo objednávky: … Dátum objednania / prevzatia: … Meno a priezvisko spotrebiteľa: … Adresa spotrebiteľa: … Dátum: … Podpis iba pri listinnom oznámení: … Vzor možno stiahnuť aj na https://cargobajk.sk/documents/odstupenie-od-zmluvy.txt. Stačí aj iné jednoznačné oznámenie."
 },
 {
  "title": "Vady a reklamácie",
  "text": "Vadu vytknite na service@cargobajk.sk alebo na kontaktnom mieste Lúčna 350/5, 013 13 Rajecké Teplice; uveďte tovar, objednávku a opis vady. Pri novom tovare predávajúci zodpovedá za vadu, ktorú mal pri dodaní a prejaví sa do dvoch rokov; vadu treba vytknúť do dvoch mesiacov od zistenia, najneskôr v zákonnej lehote. Poskytneme písomné potvrdenie a oznámime lehotu odstránenia vady. Lehota nesmie byť dlhšia ako 30 dní, ak dlhšiu lehotu neodôvodňuje objektívny dôvod, ktorý nevieme ovplyvniť. Podľa zákonných podmienok máte právo na opravu alebo výmenu, prípadne primeranú zľavu alebo odstúpenie. Odstránenie vady je bezplatné; nevyhnutné účelne vynaložené náklady sa nahrádzajú podľa zákona. Zákonné práva neobmedzujeme podmienkami výrobcu ani požiadavkou na pôvodný obal."
 },
 {
  "title": "Riešenie sporov a dohľad",
  "text": "So žiadosťou o nápravu sa obráťte na hello@cargobajk.sk. Ak ju zamietneme alebo neodpovieme do 30 dní, spotrebiteľ môže za zákonných podmienok podať návrh na alternatívne riešenie sporu Slovenskej obchodnej inšpekcii alebo inému príslušnému subjektu. Informácie: https://www.soi.sk/alternativne-riesenie-spotrebitelskych-sporov. Dohľad v príslušnom rozsahu vykonáva Slovenská obchodná inšpekcia, www.soi.sk. Právo obrátiť sa na súd zostáva zachované. Tieto podmienky neobmedzujú kogentné spotrebiteľské práva."
 }
];
if(vatConfig.enabled){shopTermsBlocks[0].text=shopTermsBlocks[0].text.replace('Registrácia pre DPH podľa § 7a nie je všeobecným platiteľstvom DPH podľa § 4; k uvedeným konečným cenám DPH nepripočítavame.',vatRegistrationNote()+' '+retailTaxNote());shopTermsBlocks[2].text=retailTaxNote()+' '+shopTermsBlocks[2].text;}
export const shopTermsText='cargobajk.sk — obchodné podmienky, verzia '+shopPolicyVersion+'\n\n'+shopTermsBlocks.map(b=>b.title+'\n'+b.text).join('\n\n');

export const shopPrivacyBlocks=[
 {
  "title": "Prevádzkovateľ a kontakt",
  "text": "Prevádzkovateľom je Vivid Production s. r. o., IČO 57440603, sídlo Javorová 3072/7, 010 07 Žilina; kontaktné miesto Lúčna 350/5, 013 13 Rajecké Teplice. Otázky a uplatnenie práv: gdpr@cargobajk.sk, +421 904 501 703."
 },
 {
  "title": "Aké údaje a prečo spracúvame",
  "text": "Pri dopyte a nákupe spracúvame meno, e-mail, telefón, obsah požiadavky, vybrané produkty, doručovacie a prípadne fakturačné údaje, firmu a IČO, dobrovoľnú poznámku a identifikátory objednávky a platby. Dopyty a plnenie objednávok sú predzmluvné opatrenia a plnenie zmluvy podľa čl. 6 ods. 1 písm. b GDPR; účtovné a spotrebiteľské povinnosti plníme podľa písm. c. Ochrana pred zneužitím, zabezpečenie prevádzky a obrana právnych nárokov sú naším oprávneným záujmom podľa písm. f. Povinné údaje sú potrebné na vybavenie objednávky. Dobrovoľnú poznámku nevyplňujte citlivými údajmi. Nákup ani dopyt vás automaticky neprihlasuje na marketing; nepoužívame automatizované rozhodovanie s právnymi účinkami ani profilovanie."
 },
 {
  "title": "Poskytovatelia a príjemcovia",
  "text": "Cloudflare poskytuje hosting a databázu objednávok, Resend odosielanie transakčných e-mailov a Stripe platobnú službu. Údaje sprístupňujeme iba v rozsahu potrebnom na príslušnú službu, ďalej poverenému účtovníkovi, dohodnutému dopravcovi pri doručení a orgánom, ak to vyžaduje zákon. Čísla platobných kariet nezískavame; zadávate ich priamo Stripe. Stripe spracúva niektoré údaje aj na vlastné zákonné účely, vrátane prevencie podvodov; jeho informácie sú na https://stripe.com/privacy."
 },
 {
  "title": "Spracúvanie mimo EHP",
  "text": "Cloudflare, Stripe a Resend môžu zapojiť spoločnosti a subdodávateľov mimo Európskeho hospodárskeho priestoru. Pri takýchto prenosoch sa uplatňujú záruky podľa GDPR vrátane príslušných štandardných zmluvných doložiek. Dokumentácia poskytovateľov: https://www.cloudflare.com/cloudflare-customer-dpa/, https://stripe.com/legal/dpa a https://resend.com/legal/dpa. Databázu objednávok máme v jurisdikcii EÚ; to neznamená, že všetky operácie všetkých poskytovateľov prebiehajú výhradne v EÚ. Podrobnosti o zárukách a spôsobe získania ich kópie poskytneme na gdpr@cargobajk.sk."
 },
 {
  "title": "Ako dlho údaje uchovávame",
  "text": "Nezaplatené objednávky v databáze automaticky odstraňujeme po 31 dňoch od vytvorenia. Záznamy zaplatených objednávok a podmienky uchovávame ako zmluvné a účtovné podklady desať rokov nasledujúcich po roku platby. Súvisiace účtovné doklady uchovávame v zákonnej lehote. Bežné nezrealizované dopyty v komunikácii posudzujeme najneskôr po 12 mesiacoch od jej ukončenia a mažeme alebo anonymizujeme, ak už nie sú potrebné; prebiehajúce reklamácie a spory môžu odôvodňovať dlhšie uchovanie príslušných podkladov. Technický limit požiadaviek používa krátkodobý odtlačok IP adresy, ktorý mažeme po uplynutí hodinovej platnosti; neslúži na reklamu. Údaje poskytovateľov platobných a e-mailových služieb podliehajú aj ich vlastným zákonným povinnostiam a retenčným pravidlám."
 },
 {
  "title": "Košík, cookies a meranie",
  "text": "V localStorage prehliadača ukladáme iba zvolené produkty, modely a množstvá košíka; v sessionStorage náhodný identifikátor objednávky a obsah košíka potrebný po návrate z platby. Obsah košíka odstránite jeho vyprázdnením alebo vymazaním úložiska webu. Osobné údaje formulára ani údaje platobnej karty do tohto úložiska neukladáme. Cloudflare Web Analytics meria súhrnnú návštevnosť a výkon verejných stránok bez analytických cookies a bez sledovania naprieč webmi. Košík, stav objednávky a súkromné ponuky analytike neodosielame; reklamné pixely nepoužívame. Stripe na svojej platobnej stránke používa technológie potrebné na platbu a prevenciu podvodov podľa svojich pravidiel. Písma sú uložené na našom webe."
 },
 {
  "title": "Vaše práva",
  "text": "Za podmienok GDPR máte právo na prístup, opravu, výmaz, obmedzenie spracúvania a prenosnosť; proti spracúvaniu na oprávnenom záujme môžete namietať. Ak sa spracúvanie zakladá na súhlase, možno ho odvolať bez vplyvu na zákonnosť dovtedajšieho spracúvania. Zákonné uchovávanie účtovných dokladov tým nie je zrušené. Kontaktujte gdpr@cargobajk.sk; odpovieme v zákonnej lehote, spravidla do jedného mesiaca. Sťažnosť môžete podať Úradu na ochranu osobných údajov SR, https://dataprotection.gov.sk/."
 }
];
