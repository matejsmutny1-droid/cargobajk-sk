import {retailTaxNote} from './vat.ts';
/** Retail prices and lead time confirmed by the seller on 2026-10-29.
 * All catalog models can be ordered; this does not assert local warehouse stock. */
export const salesTerms = {
 confirmedOn: '2026-10-29',
 allModelsOrderable: true,
 deliveryDays: 21,
 priceNote: 'Doprava a zvolené doplnky sa účtujú osobitne. '+retailTaxNote(),
};
