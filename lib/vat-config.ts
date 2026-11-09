/** Operator-confirmed §4 registration starts 2027-01-01, Europe/Bratislava.
 * Deliberately NOT activated. Use scripts/prepare-vat-activation.mjs on/after that date. */
export const vatConfig = {
 enabled: false,
 effectiveFrom: '2027-01-01T00:00:00+01:00',
 ratePercent: 23,
 pricesIncludeVat: true,
} as const;
