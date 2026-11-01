/** Customer-facing location confirmed by the operator on 2026-11-01. */
export const businessLocation = {
 streetAddress: 'Lúčna 350/5', postalCode: '013 13', addressLocality: 'Rajecké Teplice', addressCountry: 'SK',
};
export const businessAddress = `${businessLocation.streetAddress}, ${businessLocation.postalCode} ${businessLocation.addressLocality}`;
export const seller = {
 name: 'Vivid Production s. r. o.', companyId: '57440603', taxId: '2122732480', vatId: 'SK2122732480',
 vatRegistration: 'Registrácia pre DPH podľa §7a zákona o DPH.',
 address: 'Javorová 3072/7, 010 07 Žilina', phone: '+421 904 501 703', phoneLink: '+421904501703',
 contactAddress: businessAddress, returnAddress: businessAddress,
 email: 'hello@cargobajk.sk',
};
