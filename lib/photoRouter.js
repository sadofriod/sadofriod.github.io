import { databaseMissing, getDb, isDatabaseConfigured } from './db.js';
import { getPhoto, insertPhoto, listCollections, listPhotos, removePhoto } from './photoStore.js';
import { photoOriginal, photoPreview } from './photoMedia.js';
import { authenticate, fieldValue, isFile, json } from './podcastValidation.js';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_BYTES = 30 * 1024 * 1024;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toList = (value) =>
  typeof value === 'string' && value.trim()
    ? value.split(',').map((entry) => entry.trim()).filter(Boolean)
    : [];

async function createPhoto(request, env, db) {
  const form = await request.formData();
  const authError = await authenticate(form, null, env);
  if (authError) return authError;

  const file = form.get('file');
  if (!isFile(file) || file.size === 0) return json({ error: 'file is required' }, 400);
  if (file.size > MAX_BYTES) return json({ error: 'file exceeds the 30 MB limit' }, 400);

  const contentType = (file.type || 'image/jpeg').toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) return json({ error: 'Unsupported image type' }, 400);

  const id = crypto.randomUUID();
  const safeName = (file.name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
  const key = `photos/originals/${id}/${safeName}`;

  await env.PHOTOS.put(key, file.stream(), {
    httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' },
  });

  // The upload page renders a downscaled WebP in the browser; storing it means
  // the gallery serves a small file without needing Image Resizing/Images.
  const previewFile = form.get('preview');
  let previewKey = null;
  if (isFile(previewFile) && previewFile.size > 0) {
    previewKey = `photos/previews/${id}.webp`;
    await env.PHOTOS.put(previewKey, previewFile.stream(), {
      httpMetadata: { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' },
    });
  }

  try {
    const photo = await insertPhoto(db, {
      id,
      title: fieldValue(form, null, 'title') || safeName.replace(/\.[^.]+$/, ''),
      description: fieldValue(form, null, 'description') || null,
      collection: fieldValue(form, null, 'collection') || 'uncategorized',
      takenOn: fieldValue(form, null, 'takenOn') || null,
      width: toNumber(fieldValue(form, null, 'width')) ?? 0,
      height: toNumber(fieldValue(form, null, 'height')) ?? 0,
      originalKey: key,
      originalSize: file.size,
      previewKey,
      previewSize: previewKey ? previewFile.size : 0,
      contentType,
      tags: toList(fieldValue(form, null, 'tags')),
      published: true,
      sortOrder: toNumber(fieldValue(form, null, 'sortOrder')) ?? 0,
    });

    return json({ success: true, photo }, 201);
  } catch (error) {
    await env.PHOTOS.delete([key, previewKey].filter(Boolean));
    throw error;
  }
}

/**
 * Worker entry for the photography surface:
 *   GET    /api/photos?collection=…   list published photos
 *   POST   /api/photos                multipart upload (authKey)
 *   GET    /api/photos/:id            one photo
 *   DELETE /api/photos/:id            delete row + R2 objects (authKey)
 *   GET    /api/photo-collections     collections with counts
 *   GET    /photos/p/:id?w=…          preview (stored WebP, else original)
 *   GET    /photos/o/:id              original (attachment)
 */
export async function handlePhotoRequest(request, env) {
  const url = new URL(request.url);
  const { pathname } = url;

  const isPhotoPath =
    pathname === '/api/photos' ||
    pathname.startsWith('/api/photos/') ||
    pathname === '/api/photo-collections' ||
    pathname.startsWith('/photos/');

  if (!isPhotoPath) return null;
  if (!env.PHOTOS) return json({ error: 'R2 bucket is not configured' }, 503);
  if (!isDatabaseConfigured(env)) return databaseMissing();

  const db = getDb(env);

  try {
    if (pathname === '/api/photos' && request.method === 'GET') {
      return json(await listPhotos(db, { collection: url.searchParams.get('collection') || undefined }));
    }

    if (pathname === '/api/photos' && request.method === 'POST') {
      return await createPhoto(request, env, db);
    }

    if (pathname === '/api/photo-collections' && request.method === 'GET') {
      return json(await listCollections(db));
    }

    if (pathname.startsWith('/photos/p/')) {
      const id = decodeURIComponent(pathname.slice('/photos/p/'.length));
      if (!id) return new Response('Not found', { status: 404 });
      return await photoPreview(request, env, id, url, db);
    }

    if (pathname.startsWith('/photos/o/')) {
      const id = decodeURIComponent(pathname.slice('/photos/o/'.length));
      if (!id) return new Response('Not found', { status: 404 });
      return await photoOriginal(request, env, id, db);
    }

    if (pathname.startsWith('/api/photos/')) {
      const id = decodeURIComponent(pathname.slice('/api/photos/'.length));
      if (!id) return json({ error: 'Photo not found' }, 404);

      if (request.method === 'GET') {
        const photo = await getPhoto(db, id);
        return photo ? json(photo) : json({ error: 'Photo not found' }, 404);
      }

      if (request.method === 'DELETE') {
        const body = await request.json();
        const authError = await authenticate(null, body, env);
        if (authError) return authError;

        const removed = await removePhoto(db, id);
        if (!removed) return json({ error: 'Photo not found' }, 404);
        await env.PHOTOS.delete([removed.originalKey, removed.previewKey].filter(Boolean));

        return json({ success: true });
      }
    }
  } catch (error) {
    console.error('Photo Worker request failed:', error);
    return json({ error: 'Photo request failed' }, 500);
  }

  return json({ error: 'Method not allowed' }, 405);
}
