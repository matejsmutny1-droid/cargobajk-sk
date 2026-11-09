# Košík a Stripe — stav integrácie 8. 11. 2026

SEO oprava `04d534d` je už nasadená na produkcii.

Implementácia je na vetve `feat/stripe-checkout-2026-11-08`. Nie je nasadená na produkciu. Žiadna skutočná platba nebola vykonaná.

## Pripravené

- Bicykel + kompatibilné príslušenstvo, množstvá, serverové ceny v centoch, kontrola striešok.
- Košík, kontaktné/fakturačné údaje, PSČ s návrhom mesta, doprava, kontrola a presmerovanie na Stripe Checkout.
- D1 schéma: objednávky a evidencia odoslania potvrdení.
- Idempotentné Stripe sessions; potvrdenie platby až po overenom podpísanom webhooku, kontrole meny, sumy, session a test/live režimu.
- E-mail zákazníkovi aj obchodníkovi po platbe, opakovanie pri zlyhaní odoslania.
- Súkromné objednávkové stránky bez analytiky a indexovania.

## Schválená doprava

Bicykel: do 100 km 150 €, do 200 km 220 €, do 300 km 290 €, nad 300 km v SR 350 €. Vzdialenosť jedným smerom po ceste zo Žiliny. Spoločné doplnky bez príplatku. Osobný odber po dohode v Rajeckých Tepliciach zdarma. Viac bicyklov individuálne.

Samostatné doplnky: Packeta 5,90 €, kuriér 7,90 €. Konkrétny produkt a celé balenie musia spĺňať limity. Zatiaľ NIE sú automaticky schválené žiadne balenia. Výber pobočky Packety sa ešte musí napojiť; preto Packeta v objednávke nie je dostupná. Pri neoverenej zásielke sa platba nepovolí.

## Produkčné závislosti — NEOBCHÁDZAŤ

1. Hosting Cloudflare účtu `8e9cc22af924d22924d1432aa0cdffc4` bol dohľadaný v schválenom registračnom e-maile na vividproductionsro@gmail.com; prístup týmto účtom bol overený 9. 11. 2026; (matejsmutny1@gmail.com má iba samostatný účet pre analytiku). Bežné GitHub nasadenie do main funguje, ale nemôže samo vytvoriť D1 ani nastaviť tajné kľúče bez prístupu k hostingu.
2. V správnom účte vytvoriť D1, spustiť `migrations/0001_shop.sql`, pridať `SHOP_DB` binding do wrangler.jsonc. Žiadne osobné údaje sa nesmú ukladať do verejného repozitára.
3. Stripe existujúci účet Vivid Production s.r.o.: prihlásenie overené v Chrome. Nastaviť secret key bezpečne do Cloudflare secrets, nie do chatu/commitu. Pred aktiváciou overiť stav účtu a výplat, podporované peňaženky a obchodné údaje/doménu cargobajk.sk.
4. Stripe webhook `https://cargobajk.sk/api/shop/webhook`: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.expired. Webhook secret uložiť bezpečne do `STRIPE_WEBHOOK_SECRET`.
5. Doplniť a schváliť úplné obchodné podmienky a súkromie pre záväzné objednávky. Súčasný web opisuje nezáväzné dopyty. `SHOP_POLICIES_VERSION` sa nastaví až po zverejnení schváleného znenia.
6. Potvrdiť aktuálnu objednateľnosť konkrétnych produktov a presné vyhotovenie; `SHOP_PRODUCTS_JSON` je mapa produktového ID (`bike:flex`, `accessory:1577-1`) na objekt `{verifiedUntil: ISO dátum konca platnosti overenia, deliveryDays: potvrdená dodacia lehota}`. Žiadne údajné lokálne skladové zásoby.
7. Doprava bicykla: `SHOP_ROUTES_JSON` obsahuje serverom/obchodníkom overené `{postalCode,city,km,expiresAt}`. Klient nesmie určovať kilometre ani cenu. Automatický routing zatiaľ NIE je napojený. Bez overenej trasy funguje iba osobný odber / individuálna ponuka.
8. `SHOP_PARCEL_IDS_JSON`: iba ID produktov so skutočne overeným kuriérskym balením. Kombinované balíky a viac kusov vyžadujú ďalšie overenie.
9. `RESEND_API_KEY` a `INQUIRY_FROM`: serverové existujúce nastavenie pre e-maily. Testovať iba s mockom alebo testovacími adresami pod kontrolou predajcu.
10. `SHOP_TEST_EMAILS_JSON`: explicitný zoznam testovacích adries pod kontrolou obchodníka. Bez neho test checkout nie je pripravený; iné adresy sa odmietnu ešte pred uložením objednávky a Stripe požiadavkou. Najprv Stripe test režim a skutočný test webhooku. Až potom `SHOP_MODE=live`, zodpovedajúce live secrets a produkčné overenie. Bez platnej konfigurácie backend odmieta objednávky.

## Overenie

`node --test tests/shop.test.mjs` (používa esbuild a Node sqlite; iba mock Stripe/Resend)
`npm run typecheck`
`npm run build`
`npm run test:forms`
`npm run test:commerce`

Osobné údaje zatiaľ klient udržiava len v pamäti formulára. localStorage obsahuje iba produkty; sessionStorage iba náhodný identifikátor objednávky pre kontrolu stavu. API na kontrolu stavu vracia iba stav a sumu, nie zákaznícke údaje.

## Overené 9. 11. 2026

- 13 checkout testov, 44 existujúcich testov formulárov/obchodu/analytiky, TypeScript a produkčný build prešli.
- 9 SEO testov overilo 50 stránok a 113 obrázkov v samostatnej produkčnej oprave.
- V Chrome manuálne overené: Flex + kompatibilné zrkadlo, košík 3 871 €, zadanie PSČ 01313 a výber Rajeckých Teplíc, kontrola objednávky. Bez zadania karty, skutočnej platby alebo externého testovacieho e-mailu.
- Ostrý Stripe kľúč nebol skopírovaný, vytvorený ani uložený. Produkčná D1 `cargobajk-orders` bola vytvorená v jurisdikcii EÚ: `96d6d5c1-ff9a-412e-80cb-deca2a7e20b2`. V konzole boli vytvorené a overené tabuľky `shop_orders`, `shop_mail`, `shop_rate`. Produkčný binding `SHOP_DB` bol v Cloudflare uložený a overený. Náhľady majú samostatnú EÚ databázu `cargobajk-orders-test` (`286406c3-7b40-46f3-bf75-1c4966596a3f`), tiež inicializovanú. Identifikátory sú doplnené aj do zdrojovej konfigurácie vývojovej vetvy.

## Najnovšia kontrola 9. 11. 2026

- Zmeny `c1ec4ba`: 13 shop testov prešlo. Opakovaná kontrola TypeScript sa zasekla na existujúcej zdieľanej závislostnej ceste a bola prerušená; nejde o úspešnú novú kontrolu typov.
- D1 produkcia a náhľady sú oddelené a uložené v Cloudflare. Checkout kód ani Stripe secrets zatiaľ nie sú nasadené; platby zostávajú vypnuté.

## Označenie cargobajk platieb

- Checkout session má samostatné `branding_settings`: cargobajk.sk, verejné logo a ikona, krémové pozadie a burgundové tlačidlo. Ide iba o platby vytvárané týmto obchodom, nie o globálny rebranding účtu.
- `payment_intent_data.statement_descriptor_suffix=CARGOBAJK.SK`; po používateľom schválenej zmene skráteného prefixu účtu na `VIVID` sa skladá `VIVID* CARGOBAJK.SK`. Skutočné zobrazenie závisí od banky. Základný descriptor pre existujúce platby zostal zachovaný.
- Doplnená identifikácia obchodu a objednávky do PaymentIntent metadata.
- 14 shop testov prešlo vrátane regresie týchto parametrov. Skutočná Stripe Checkout session so značkou sa ešte netestovala, zmena kódu ešte nie je nasadená.

## Oddelené testovanie (pripravené, zatiaľ nenasadené)

`wrangler.checkout-test.jsonc` definuje Worker `cargobajk-checkout-test` bez vlastných domén a bez produkčnej databázy. Viaže iba `cargobajk-orders-test`.

- Webový test v `tests/shop-staging-worker.ts` používa syntetickú objednávku a jedinú povolenú adresu obchodníka. Zobrazuje výslovné označenie TEST.
- `SHOP_TEST_DISABLE_EMAILS=true` vynechá odosielanie e-mailov iba pri `SHOP_MODE=test`; pri live režime sa bez Resend konfigurácie checkout neaktivuje.
- Po prvom nasadení nastaviť `SHOP_TEST_ORIGIN` na presnú získanú HTTPS workers.dev adresu. Iba v test režime je povolený tento pôvod a návrat zo Stripe na staging.
- Pri vytváraní Checkout session sa posiela `metadata.store=cargobajk.sk`; webhook ignoruje udalosti iných obchodov spoločného účtu.
- Produkčný Worker už bezpečne uchováva testovací Stripe kľúč ako šifrovaný `STRIPE_SECRET_KEY`. Do test Workeru sa má vložiť rovnakým UI prenosom až po jeho vytvorení. Žiadne secrets v zdrojových súboroch.
- Testovací webhook zatiaľ NIE je vytvorený. Pripravený formulár Stripe sa pred uložením musí nastaviť na skutočnú testovaciu workers.dev adresu. Udalosti: completed, async_payment_succeeded, expired; snapshot API 2026-10-28.endive.
- Wrangler zatiaľ nemá autorizáciu. Používateľ dostal konkrétnu otázku na OAuth rozsahy Workers:write + account/profile read a samostatne na testovací webhook.
- 19 shop testov prešlo. Samostatný testovací Worker sa úspešne zbalil ako ESM pre browser/Workers (53,7 kB). Skutočná Stripe platobná session a podpísaný externý callback ešte neboli overené.
