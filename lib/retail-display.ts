/** Existing final retail prices are preserved. The VAT split is a future price preview only. */
export const retailDisplay = { plannedVatDate: '1. 1. 2027', ratePercent: 23 } as const;
export function plannedNetPrice(grossEur:number) {
 return Math.round(Math.round(grossEur*100)/(1+retailDisplay.ratePercent/100))/100;
}
export const pricePreviewNote = (english=false) => english
 ? 'Final prices remain unchanged. Prices excluding VAT are a preview for the planned VAT registration from 1 January 2027, calculated at 23%. We do not charge VAT under §4 yet. Shipping and optional accessories are separate.'
 : 'Konečné ceny zostávajú nezmenené. Ceny bez DPH sú prepočtom pre plánovanú registráciu od 1. 1. 2027 pri sadzbe 23 %. DPH podľa §4 zatiaľ neúčtujeme. Doprava a voliteľné doplnky sa účtujú osobitne.';
