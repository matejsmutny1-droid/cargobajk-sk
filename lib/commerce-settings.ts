import {seller} from './seller.ts';
import {salesTerms} from './sales-terms.ts';
/** Values are deliberately unset until confirmed by the seller. No guessed stock or tax claims. */
export type ProductAvailability = {
 availability: 'in_stock' | 'backorder';
 deliveryDays: number;
 /** Seller rechecks the offer before this date; expired offers stop accepting orders. */
 verifiedUntil: string;
 availabilityDate?: string;
 gtin?: string;
 mpn?: string;
};
export type CommerceSettings = {
 enabled: boolean;
 seller: {name: string; companyId: string; taxId: string; address: string; phone: string; email: string; returnAddress: string};
 taxNote: string;
 /** Upper bound for Merchant Center; actual checkout freight is quoted per address. */
 merchantShippingMaxEur: number | null;
 shippingOriginPostalCode: string;
 termsVersion: string;
 termsApproved: boolean;
 privacyApproved: boolean;
 returnsApproved: boolean;
 products: Record<string, ProductAvailability>;
};
export const commerceSettings: CommerceSettings = {
 enabled: false,
 seller: {name: seller.name, companyId: seller.companyId, taxId: seller.taxId, address: seller.address, phone: seller.phone, email: seller.email, returnAddress: ''},
 taxNote: salesTerms.priceNote, merchantShippingMaxEur: null, shippingOriginPostalCode: '01007', termsVersion: '', termsApproved: false, privacyApproved: false, returnsApproved: false,
 products: {},
};
