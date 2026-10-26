# Cargobajk.sk

Node.js 22.13+. Lokálne: npm ci, npm run dev.

Cloudflare Workers: branch main, build npm run build, deploy npx wrangler deploy.
V Settings → Variables and Secrets nastaviť tajný RESEND_API_KEY.
Príjemca dopytov a Reply-To potvrdení: hello@cargobajk.sk (ImprovMX). Overený transportný odosielateľ ostáva hello@vividproduction.sk do overenia cargobajk.sk v Resend.
Po nasadení pridať Custom Domains cargobajk.sk a www.cargobajk.sk.
Návrh zatiaľ používa noindex a ceny na vyžiadanie.

## Správa cenových ponúk
Nové dopyty s konfiguráciou obsahujú súkromný odkaz `/sprava-ponuky#...`. Obsah je šifrovaný a autentifikovaný AES-GCM pomocou účelovo odvodených kľúčov z produkčného tajomstva; odkaz platí 14 dní a nepatrí zákazníkovi. Fragment sa neposiela pri načítaní stránky; API ho prijíma až v POST tele. Panel vyžaduje kontrolu dostupnosti, DPH a podmienok pred odoslaním finálnej ponuky. Zmena Resend kľúča zneplatní existujúce odkazy.
Štandardy (iba doprava, termín, platnosť a daňová poznámka) sa voliteľne ukladajú lokálne v prehliadači obsluhy. Evidencia dopytov a odoslaných ponúk je aktuálne v e-mailoch; neexistuje centrálne CRM ani zdieľaná história stavov. Rovnaká ponuka používa stabilný idempotency key pri opakovaní odoslania cez Resend. Platba ani objednávka u výrobcu sa nespúšťa automaticky.
