import {createCustomerOfferHandler} from '@/lib/customer-offer-server';
export const dynamic='force-dynamic';
export const POST=createCustomerOfferHandler(()=>({apiKey:process.env.RESEND_API_KEY,from:process.env.INQUIRY_FROM,allowedOrigins:(process.env.INQUIRY_ALLOWED_ORIGINS??'').split(',').filter(Boolean),topics:[]}));
