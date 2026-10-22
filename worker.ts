import handler from "vinext/server/fetch-handler";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const response = await handler.fetch(request, env, ctx);
    if (!(response.headers.get('content-type') ?? '').includes('text/html')) return response;
    const headers = new Headers(response.headers);
    // Revalidate documents so an older page cannot retain a broken router build.
    headers.set('Cache-Control', 'no-store');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  },
};
