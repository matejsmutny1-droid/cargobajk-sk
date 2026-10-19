import { bikes } from '@/lib/catalog';
import { createInquiryHandler } from '@/lib/inquiry-server';
export const dynamic = 'force-dynamic';
const handler = createInquiryHandler(() => ({
  apiKey: process.env.RESEND_API_KEY,
  from: process.env.INQUIRY_FROM,
  allowedOrigins: (process.env.INQUIRY_ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean),
  topics: ['Záujem o bicykel', 'Testovacia jazda', 'Servis', 'Firemná spolupráca', ...bikes.map(b => `Záujem o model ${b.name}`)],
}));
export const GET = handler;
export const POST = handler;
