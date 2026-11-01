// This is the public site identifier, not an account credential.
export const webAnalyticsToken = '793c69d2de944d30910d6e606e932f15';

/** Measure public production pages; never load the beacon on private offer flows. */
export function webAnalyticsEnabled(url: URL) {
 return url.protocol === 'https:' && url.hostname === 'cargobajk.sk'
  && !/^\/(?:en\/)?(?:api|sprava-ponuky|potvrdenie-ponuky|nezavazna-ponuka)(?:\/|$)/.test(url.pathname);
}
