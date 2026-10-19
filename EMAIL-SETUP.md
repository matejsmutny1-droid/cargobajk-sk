# Aktivácia kontaktných formulárov

Formuláre pre bicykle, testovacie jazdy aj servis používajú serverový endpoint `/api/inquiry` a Resend. Príjemca je vždy `hello@vividproduction.sk`. Návštevník nemôže príjemcu zmeniť. Odpoveď v e-mailovom programe smeruje na zákazníkov overený vstupný e-mail cez Reply-To.

## 1. Resend a doména

1. Otvorte https://resend.com a prihláste sa alebo vytvorte účet.
2. V Domains pridajte `vividproduction.sk` (alebo vlastnú odosielaciu subdoménu).
3. U svojho správcu DNS vložte presné záznamy, ktoré vám ukáže Resend. Nenahrádzajte existujúce MX záznamy pre príjem pošty na vividproduction.sk. Existujúcu schránku hello musíte zachovať. Pri nejasnostiach nech záznamy doplní správca domény.
4. Počkajte, kým Resend potvrdí overenie. Nastavte odosielateľa z overenej domény, napríklad `Cargobike Slovensko <hello@vividproduction.sk>`. Kód akceptuje túto doménu a jej subdomény.
5. V API Keys vytvorte kľúč len na odosielanie, obmedzený na overenú doménu. Kľúč neposielajte do chatu ani ho nevkladajte do kódu.

Oficiálny postup: https://resend.com/docs/dashboard/domains/introduction

## 2. Lokálne vo VS Code

V koreňovom priečinku projektu vytvorte `.env.local` podľa `.env.example`:

```dotenv
RESEND_API_KEY=SEM_VLOZTE_VLASTNY_KLUC
INQUIRY_FROM="Cargobike Slovensko <hello@vividproduction.sk>"
INQUIRY_ALLOWED_ORIGINS=https://cargobike-slovensko-navrh.stablelake16.chatgpt.site
```

Súbor je ignorovaný Gitom. Žiadnu premennú nepomenúvajte NEXT_PUBLIC_RESEND_API_KEY. Po uložení reštartujte `npm run dev` (Ctrl+C a znova príkaz). Bez platného nastavenia formulár pravdivo oznámi, že odosielanie sa pripravuje, a ponúkne priamy mailto kontakt.

## 3. Online web

Lokálny `.env.local` sa na hosting nekopíruje. V produkčných runtime premenných Sites nastavte `RESEND_API_KEY` ako **secret**, `INQUIRY_FROM` a `INQUIRY_ALLOWED_ORIGINS`. Potom znovu nasaďte uloženú verziu webu. Pri inom hostingu nastavte tie isté serverové premenné v administrácii hostingu. Pri zmene domény upravte aj zoznam povolených originov.

## 4. Reálny test po aktivácii

Odošlite jeden dopyt s vlastným kontaktným e-mailom. Overte jeho prijatie v schránke hello, prípadne spam a stav v Resend. Skontrolujte názov modelu aj obsah a kliknite na Odpovedať: adresátom má byť e-mail použitý vo formulári. Kým tento test neprejde, doručenie do schránky nie je potvrdené. Zelená správa na webe znamená úspešné prijatie požiadavky službou Resend; nie potvrdené doručenie do inboxu.

## Ochrany a prevádzka

Server overuje pôvod požiadavky, formát a dĺžku údajov, povolené témy, skrytý honeypot a veľkosť tela. Príjemca je pevný, e-mail má iba textovú verziu, bez interpretácie používateľského HTML. API kľúč zostáva na serveri. Na nejasný výsledok či chybu formulár nehlási úspech a zachová údaje. Opakovanie rovnakej požiadavky používa rovnaký Resend Idempotency-Key.

Základný limit je 3 pokusy na e-mail a 30 celkovo za 10 minút v jednej bežiacej inštancii. Nie je to globálny limit naprieč všetkými Worker inštanciami. Pred verejnou reklamnou kampaňou doplňte na hostingu globálne rate limiting alebo Turnstile podľa návštevnosti a overte jeho nastavenie. Aplikácia nezapisuje správy, e-mailové adresy ani API odpovede do logov; prevádzkové logy a uchovávanie v Resend a hostingu spravujete v daných službách.

Informácie o súkromí na webe vysvetľujú účel dopytu a Resend. Úplnú identifikáciu prevádzkovateľa, právne základy, príjemcov, práva a doby uchovávania treba dokončiť podľa reálnej prevádzky. Formulár nezapína marketingový odber a neposiela automatickú kópiu návštevníkovi.

## Kontroly

`node --experimental-strip-types --test tests/inquiry.test.mjs`

Testy používajú simulované odpovede služby a neposielajú skutočné e-maily. Kontrolujú príjemcu, Reply-To, odmietnutie neplatných údajov, honeypot, limity, chyby poskytovateľa a stav bez konfigurácie.
