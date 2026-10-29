# Commerce preparation — 29 October 2026

Merchant Center account: 5893089590 (cargobajk.sk), Slovakia. Website verified and claimed.

## Seller-confirmed data
- Public bike prices are final consumer prices; no VAT is added on top.
- All 14 catalog models can be ordered. Delivery: 21 calendar days from confirmed order and agreed payment.
- Seller contact data is in `lib/seller.ts`; §7a registration is stated precisely, without treating it as a §4 registration.
- Freight must be quoted from Žilina based on destination, dimensions, weight and a suitable heavy-goods carrier. No nationwide €100 default.

## Current live flow
The site accepts non-binding enquiries and individually reviewed offers. It does not yet accept binding online orders or payments. Blank shipping is rejected by the offer endpoint; it must never become a zero-cost delivery promise. Shipping is not inherited from a previous enquiry or stored browser defaults.

## Prepared, inactive modules
`lib/checkout.ts` calculates a cart from server-owned catalog prices and a trusted, valid freight quote for the selected model and destination postcode. This is a calculation module, not an order-processing endpoint. It does not create, persist or charge orders.

`lib/merchant-feed.ts` generates XML only with enabled commerce, confirmed seller/return details, policy approvals, a verified shipping upper bound and current product availability. `/google-products.xml` returns 503/no-store/noindex until then. It is not submitted to Google and is excluded from the sitemap. No stock, GTIN or MPN values have been invented. Local fixture shipping prices in tests must never be used as a real tariff.

## Remaining before Shopping product submission
1. Carrier-approved packed dimensions, weights, battery acceptance and a complete SK shipping tariff (including surcharges and return transport). Integrate a trusted freight calculation, or a seller quote for each destination. Confirm an honest upper bound for Merchant Center; this is not the flat fee charged to every customer.
2. Confirm return address and complete consumer sales, return and privacy information. No draft policy may be represented as approved.
3. Finish binding checkout, durable order storage, confirmations and the agreed payment method. The current enquiry flow does not satisfy direct-purchase requirements by itself.
4. Set and maintain real availability/dispatch data in `commerceSettings.products`, then enable/export and validate the feed against actual product pages and checkout. Delivery 21 days does not automatically mean warehouse stock.
5. Submit products for Google's review. Paid Shopping campaigns require a separate Google Ads spending budget; none has been set or launched.

Tests: `npm run test:forms`, `npm run test:commerce`, `npm run typecheck`, `npm run build`. Production SEO checks: `SEO_BASE_URL=https://cargobajk.sk npm run test:seo`.
