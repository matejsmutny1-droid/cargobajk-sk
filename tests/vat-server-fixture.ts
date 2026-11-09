// Separate bundled graph; evaluate the future policies AFTER changing this test-only setting.
import {vatConfig} from '../lib/vat-config.ts';
(vatConfig as {enabled:boolean}).enabled=true;
const future=await import('../lib/shop/server.ts');
export const handleShop=future.handleShop;
export const shopReady=future.shopReady;
