import {createOfferReviewHandler} from '@/lib/offer-review-server';
export const dynamic='force-dynamic';
export const POST=createOfferReviewHandler(()=>({apiKey:process.env.RESEND_API_KEY,from:process.env.INQUIRY_FROM,allowedOrigins:(process.env.INQUIRY_ALLOWED_ORIGINS??'').split(',').filter(Boolean),topics:[]}));
