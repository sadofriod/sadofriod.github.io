// Serves the sample reports and their page crops straight out of R2 so the
// client bundle and the static asset set stay small. Keys mirror the URL path
// below /work/samples/.

const CONTENT_TYPES = {
  html: 'text/html; charset=utf-8',
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jsonl: 'application/json',
  json: 'application/json',
  zip: 'application/zip',
  txt: 'text/plain; charset=utf-8',
};

const PREFIX = '/work/samples';

function objectKey(pathname) {
  if (pathname === PREFIX || pathname === `${PREFIX}/`) return 'index.html';
  const key = pathname.slice(PREFIX.length + 1);
  return key.endsWith('/') ? `${key}index.html` : key;
}

function contentTypeFor(resolvedKey, object) {
  const stored = object.httpMetadata && object.httpMetadata.contentType;
  if (stored && stored !== 'application/octet-stream') return stored;
  const ext = key.split('.').pop().toLowerCase();
  return CONTENT_TYPES[ext] || 'application/octet-stream';
}

export async function handleWorkRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname !== PREFIX && !url.pathname.startsWith(`${PREFIX}/`)) return null;
  // The English index briefly lived at /work/samples/en/. It now sits at /work/samples/,
  // so anything still pointing there is redirected instead of 404ing.
  if (url.pathname === `${PREFIX}/en` || url.pathname.startsWith(`${PREFIX}/en/`)) {
    return Response.redirect(new URL(`${PREFIX}/`, url).toString(), 301);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
  }
  if (!env.WORK) return new Response('Sample bucket is not configured', { status: 503 });

  const key = objectKey(url.pathname);
  if (key.includes('..')) return new Response('Not found', { status: 404 });

  let object = await env.WORK.get(key);
  let resolvedKey = key;
  // Clean URLs: /work/samples/S1 resolves to S1.html, the same way the asset
  // handler used to do it before the reports moved to R2.
  if (!object && !key.split('/').pop().includes('.')) {
    resolvedKey = `${key}.html`;
    object = await env.WORK.get(resolvedKey);
  }
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers({
    'content-type': contentTypeFor(resolvedKey, object),
    'cache-control': 'public, max-age=300',
    etag: object.httpEtag,
  });
  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}
