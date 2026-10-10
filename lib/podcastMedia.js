export async function podcastMedia(request, bucket, encodedKey) {
  let key;
  try {
    key = decodeURIComponent(encodedKey);
  } catch {
    return new Response('Not found', { status: 404 });
  }
  if (!key.startsWith('podcasts/audio/') && !key.startsWith('podcasts/covers/')) return new Response('Not found', { status: 404 });
  const object = await bucket.get(key, { range: request.headers, onlyIf: request.headers });
  if (!object) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  if (!('body' in object)) return new Response(null, { status: 304, headers });
  if (object.range) {
    const start = object.range.offset ?? Math.max(0, object.size - object.range.suffix);
    const length = object.range.length ?? object.range.suffix;
    headers.set('content-range', `bytes ${start}-${start + length - 1}/${object.size}`);
    headers.set('content-length', String(length));
  }
  return new Response(request.method === 'HEAD' ? null : object.body, { status: object.range ? 206 : 200, headers });
}