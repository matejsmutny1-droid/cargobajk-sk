import {handleShop,type ShopEnv} from '../lib/shop/server';

// Dedicated test Worker: no production assets, domains, records or customer mail.
export default {
 async fetch(request:Request,env:ShopEnv) {
  if(env.SHOP_MODE!=='test'||env.SHOP_TEST_DISABLE_EMAILS!=='true')return new Response('Test environment unavailable',{status:503});
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/shop/'))return handleShop(request,env);
  if(url.pathname==='/robots.txt')return new Response('User-agent: *\nDisallow: /\n');
  if(!['/','/kosik','/objednavka'].includes(url.pathname))return new Response('Not found',{status:404});
  const nonce=crypto.randomUUID();
  const html=`<!doctype html><html lang="sk"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>cargobajk.sk — test checkoutu</title><style nonce="${nonce}">body{font:17px system-ui;background:#F6F2EC;color:#6B0F1F;max-width:680px;margin:60px auto;padding:24px}section{background:white;border-radius:18px;padding:30px}h1{font-size:32px}label,input,button{display:block;margin:16px 0}input{font:inherit;padding:12px;max-width:90%;width:380px}button{font:inherit;background:#6B0F1F;color:white;padding:14px 24px;border:0;border-radius:8px;cursor:pointer}button:disabled{opacity:.5}pre{white-space:pre-wrap;line-height:1.7}small{line-height:1.7;display:block}</style><section><strong>IBA TEST — bez skutočnej objednávky a platby</strong><h1>cargobajk.sk</h1><p>Flex + zrkadlo SpyMaxi · osobný odber · testovacia databáza</p><label>Schválený testovací e-mail<input type="email" id="email" value="smutny@cargobajk.sk"></label><button id="quote" disabled>Overiť testovací súhrn</button><button id="pay" disabled>Otvoriť testovací Stripe Checkout</button><pre id="status" role="status">Kontrolujem konfiguráciu…</pre><small>Tento test neposiela zákaznícke e-maily. Používajte iba testovacie údaje a testovaciu kartu Stripe. Nenakupujete tovar.</small></section><script nonce="${nonce}">
 const status=document.querySelector('#status'),quote=document.querySelector('#quote'),pay=document.querySelector('#pay');
 const key=crypto.randomUUID();let terms='',order='';
 const data=()=>({cart:[{id:'bike:flex',quantity:1},{id:'accessory:1577-1',quantity:1,model:'flex'}],customer:{name:'Test cargobajk.sk',email:document.querySelector('#email').value,street:'Lúčna 350/5',city:'Rajecké Teplice',postalCode:'01313',phone:'+421904501703'},shipping:'pickup',requestKey:key,acceptedTerms:terms});
 async function post(path,body){const r=await fetch('/api/shop/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw new Error(j.error||'Test sa nepodaril.');return j;}
 quote.onclick=async()=>{pay.disabled=true;try{const q=await post('quote',data());terms=q.termsVersion;status.textContent='TEST: '+new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR'}).format(q.totalCents/100)+' · osobný odber\\nPodmienky: '+terms+'\\nNejde o skutočný nákup.';pay.disabled=false;}catch(e){status.textContent=e.message;}};
 pay.onclick=async()=>{pay.disabled=true;try{const s=await post('checkout',data());order=s.orderId;sessionStorage.setItem('test-order',order);location.assign(s.url);}catch(e){status.textContent=e.message;pay.disabled=false;}};
 async function poll(id,n=0){try{const s=await post('status',{orderId:id});status.textContent='TESTOVACIA objednávka '+id+'\\nStav: '+s.status+'\\nSuma: '+new Intl.NumberFormat('sk-SK',{style:'currency',currency:'EUR'}).format(s.totalCents/100);if(s.status==='pending'&&n<30)setTimeout(()=>poll(id,n+1),2000);}catch(e){status.textContent=e.message;}}
 fetch('/api/shop/config').then(r=>r.json()).then(c=>{if(!c.ready||c.mode!=='test')throw new Error('Testovacie prostredie ešte nie je aktivované.');terms=c.termsVersion;quote.disabled=false;status.textContent='Pripravené na test. Žiadne ostré platby.';const id=location.hash.slice(1);if(/^[a-f0-9-]{36}$/.test(id))poll(id);}).catch(e=>status.textContent=e.message);
 </script></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Content-Security-Policy':`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'`,'Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'}});
 }
};
