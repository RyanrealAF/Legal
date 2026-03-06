export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); // strip leading /

    if (!key) {
      return new Response('Not found', { status: 404 });
    }

    const object = await env.DOCS_BUCKET.get(key);

    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=86400');

    // Force download for PDF requests
    if (key.endsWith('.pdf')) {
      headers.set('Content-Type', 'application/pdf');
      headers.set('Content-Disposition', `inline; filename="${key}"`);
    }

    return new Response(object.body, { headers });
  }
};
