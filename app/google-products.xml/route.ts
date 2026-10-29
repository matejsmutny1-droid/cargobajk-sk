import {commerceSettings} from '@/lib/commerce-settings';
import {merchantFeed} from '@/lib/merchant-feed';
export const dynamic='force-dynamic';
export function GET(){
 const feed=merchantFeed(commerceSettings);
 if(!feed)return new Response('Produktový export čaká na nastavenie dopravy a dokončenie online objednávania.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
 return new Response(feed,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
}
