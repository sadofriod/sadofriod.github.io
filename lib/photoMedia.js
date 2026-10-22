import { getPhotoRow } from './photoStore.js';

/** Preview widths the UI actually asks for. */
const PREVIEW_WIDTHS = new Set([400, 800, 1200, 1600, 2000]);
const DEFAULT_WIDTH = 1200;

const notFound = () => new Response('Not found', { status: 404 });

function safeFilename(title, contentType) {
  const extension = (contentType || 'image/jpeg').split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const base = (title || 'photo')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return `${base || 'photo'}.${extension}`;
}

/**
 * Preview bytes for a photo.
 *
 * The upload page already produced a 1600 px WebP, so normally this is a plain
 * object read. If a Cloudflare Images binding is ever attached (`env.IMAGES`),
 * arbitrary widths are transformed at the edge instead.
 */
export async function photoPreview(request, env, id, url, db) {
  const row = await getPhotoRow(db, id);
  if (!row || !row.published) return notFound();

  const requested = Number(url.searchParams.get('w') ?? 0);
  const width = PREVIEW_WIDTHS.has(requested) ? requested : DEFAULT_WIDTH;

  if (row.previewKey) {
    const preview = await env.PHOTOS.get(row.previewKey);
    if (preview) {
      const headers = new Headers();
      preview.writeHttpMetadata(headers);
      headers.set('cache-control', 'public, max-age=31536000, immutable');
      headers.set('x-photo-source', 'stored-preview');
      return new Response(request.method === 'HEAD' ? null : preview.body, { headers });
    }
  }

  const object = await env.PHOTOS.get(row.originalKey);
  if (!object) return notFound();

  if (env.IMAGES) {
    try {
      const result = await env.IMAGES.input(object.body)
        .transform({ width, fit: 'scale-down' })
        .output({ format: 'image/webp', quality: 82 });
      const contentType = typeof result.contentType === 'function' ? result.contentType() : 'image/webp';

      return new Response(result.response().body, {
        headers: {
          'content-type': contentType,
          'cache-control': 'public, max-age=31536000, immutable',
          'x-photo-source': 'images-binding',
        },
      });
    } catch (error) {
      console.error('Image transform failed; serving the original instead:', error);
    }
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  headers.set('x-photo-source', 'original');

  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}

/**
 * Original bytes as a download. Served from the Worker so the browser never
 * needs R2 CORS: `fetch()` + Blob on the client side just works.
 */
export async function photoOriginal(request, env, id, db) {
  const row = await getPhotoRow(db, id);
  if (!row || !row.published) return notFound();

  const object = await env.PHOTOS.get(row.originalKey);
  if (!object) return notFound();

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'private, max-age=3600');
  headers.set('content-disposition', `attachment; filename="${safeFilename(row.title, row.contentType)}"`);

  return new Response(request.method === 'HEAD' ? null : object.body, { headers });
}
