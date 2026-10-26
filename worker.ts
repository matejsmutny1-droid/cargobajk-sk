import handler from "vinext/server/fetch-handler";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    if (url.hostname === 'www.cargobajk.sk' || (url.hostname === 'cargobajk.sk' && url.protocol === 'http:')) {
      url.hostname = 'cargobajk.sk'; url.protocol = 'https:';
      return Response.redirect(url.toString(), 308);
    }
    if (url.pathname === '/testovacie-jazdy' || url.pathname === '/en/testovacie-jazdy') {
      url.pathname = url.pathname.replace('/testovacie-jazdy', '/vyber-bicykla');
      return Response.redirect(url.toString(), 308);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-site-language', /^\/en(?:\/|$)/.test(new URL(request.url).pathname) ? 'en' : 'sk');
    const response = await handler.fetch(new Request(request, {headers: requestHeaders}), env, ctx);
    if (!(response.headers.get('content-type') ?? '').includes('text/html')) return response;
    const headers = new Headers(response.headers);
    // Revalidate documents so an older page cannot retain a broken router build.
    headers.set('Cache-Control', 'no-store');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
