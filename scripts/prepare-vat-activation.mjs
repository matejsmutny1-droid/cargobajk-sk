/** Local preparation only: never deploys, calls Stripe, or accesses secrets. */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const args=process.argv.slice(2);
const rate=args.find(a=>a.startsWith('--tax-rate='))?.slice(11);
const dry=args.includes('--dry-run');
const effective=Date.parse('2027-01-01T00:00:00+01:00');
if(!/^txr_[A-Za-z0-9]+$/.test(rate||''))throw new Error('Zadajte --tax-rate=txr_... pre overenú ostrú slovenskú sadzbu 23 %, inclusive. Nie API kľúč.');
if(Date.now()<effective&&!dry)throw new Error('Režim §4 možno aktivovať až od 1. 1. 2027 v časovom pásme Europe/Bratislava. Teraz použite --dry-run.');
const configPath=new URL('lib/vat-config.ts',root),workerPath=new URL('wrangler.jsonc',root);
const config=readFileSync(configPath,'utf8').replace('enabled: false','enabled: true');
const worker=JSON.parse(readFileSync(workerPath,'utf8'));
worker.vars.SHOP_POLICIES_VERSION='2027-01-01-vat';
worker.vars.SHOP_VAT_TAX_RATE_ID=rate;
if(!dry){writeFileSync(configPath,config);writeFileSync(workerPath,JSON.stringify(worker,null,2)+'\n');}
console.log(JSON.stringify({dryRun:dry,enabledAfterDeployment:true,effectiveFrom:'2027-01-01T00:00:00+01:00',vatPercent:23,customerPrices:'unchanged, VAT included',taxRateId:rate,files:[fileURLToPath(configPath),fileURLToPath(workerPath)],deployed:false},null,2));
