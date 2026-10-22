#!/usr/bin/env node
/**
 * End-to-end check of the Worker's photo + podcast routes without Cloudflare and
 * without a database server: the real router modules from lib/ run against
 *   - an in-memory R2 stand-in, and
 *   - PGlite (in-process Postgres) injected through the db() test seam.
 *
 * It exercises what a browser actually hits: multipart upload, listing, preview,
 * original download, delete, RSS, and the "database not configured" degradation.
 */
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- load the real modules as ESM (package.json is CJS, lib/ is ESM) ---------
// The temp dir lives inside the repo so bare imports ("postgres") still resolve.
const libWork = path.join(root, '.wrangler', 'route-test-lib');
await rm(libWork, { recursive: true, force: true });
await mkdir(libWork, { recursive: true });

const libFiles = (await readdir(path.join(root, 'lib'))).filter((file) => file.endsWith('.js'));
for (const file of libFiles) {
  const source = await readFile(path.join(root, 'lib', file), 'utf8');
  const rewritten = source.replace(/from '\.\/([A-Za-z0-9_.-]+)\.js'/g, "from './$1.mjs'");
  await writeFile(path.join(libWork, file.replace(/\.js$/, '.mjs')), rewritten);
}

const photoRouter = await import(path.join(libWork, 'photoRouter.mjs'));
const podcastRouter = await import(path.join(libWork, 'podcastRouter.mjs'));

// --- in-memory R2 ------------------------------------------------------------
class FakeBucket {
  constructor() {
    this.objects = new Map();
  }

  async put(key, value, options = {}) {
    const bytes = new Uint8Array(await new Response(value).arrayBuffer());
    this.objects.set(key, { bytes, httpMetadata: options.httpMetadata ?? {} });
    return { key, size: bytes.byteLength };
  }

  async get(key) {
    const entry = this.objects.get(key);
    if (!entry) return null;

    return {
      key,
      size: entry.bytes.byteLength,
      etag: 'etag',
      httpEtag: '"etag"',
      body: new Response(entry.bytes).body,
      async json() {
        return JSON.parse(new TextDecoder().decode(entry.bytes));
      },
      async text() {
        return new TextDecoder().decode(entry.bytes);
      },
      // R2 maps camelCase metadata onto real HTTP headers; mirror that here so a
      // missing content-type in a test means a real bug, not a harness gap.
      writeHttpMetadata(headers) {
        const names = { contentType: 'content-type', cacheControl: 'cache-control', contentDisposition: 'content-disposition', contentEncoding: 'content-encoding', contentLanguage: 'content-language' };
        for (const [key, value] of Object.entries(entry.httpMetadata)) {
          if (typeof value === 'string') headers.set(names[key] ?? key.toLowerCase(), value);
        }
      },
    };
  }

  async delete(keys) {
    for (const key of Array.isArray(keys) ? keys : [keys]) this.objects.delete(key);
  }

  async list({ prefix = '' } = {}) {
    return {
      objects: [...this.objects.keys()].filter((key) => key.startsWith(prefix)).map((key) => ({ key })),
    };
  }
}

// --- PGlite as the Hyperdrive stand-in --------------------------------------
const pg = new PGlite();
const sql = (strings, ...values) => {
  const text = strings.reduce((acc, chunk, index) => `${acc}${chunk}${index < values.length ? `$${index + 1}` : ''}`, '');
  return pg.query(text, values).then((result) => result.rows);
};
sql.unsafe = (text, params = []) => pg.query(text, params).then((result) => result.rows);

await pg.exec(await readFile(path.join(root, 'migrations/0001_podcasts_and_photos.sql'), 'utf8'));

const UPLOAD_KEY = 'test-upload-key';
const photos = new FakeBucket();
const podcasts = new FakeBucket();
const env = {
  PHOTOS: photos,
  PODCASTS: podcasts,
  UPLOAD_AUTH_KEY: UPLOAD_KEY,
  HYPERDRIVE: { sql },
};

const failures = [];
const check = (label, condition, detail = '') => {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const call = async (router, url, init) => {
  const request = new Request(`https://blog.ashesborn.cloud${url}`, init);
  const response = await router(request, env);
  return response;
};

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

// ---- photography ----
console.log('\nphoto routes');
const uploadForm = new FormData();
uploadForm.set('file', new File([png], 'fog.png', { type: 'image/png' }));
uploadForm.set('preview', new File([new Uint8Array([1, 2, 3, 4, 5])], 'preview.webp', { type: 'image/webp' }));
uploadForm.set('title', 'Fog');
uploadForm.set('collection', 'street');
uploadForm.set('takenOn', '2026-02-02');
uploadForm.set('width', '1600');
uploadForm.set('height', '1000');
uploadForm.set('tags', 'film, 35mm');
uploadForm.set('authKey', UPLOAD_KEY);

const created = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'POST', body: uploadForm });
const createdBody = await created.json();
check('POST /api/photos → 201', created.status === 201, String(created.status));
const photo = createdBody.photo ?? {};
check('upload returns preview + original urls', photo.preview === `/photos/p/${photo.id}` && photo.original === `/photos/o/${photo.id}`);
check('tags parsed from comma list', JSON.stringify(photo.tags) === '["film","35mm"]');
check('original stored in R2', [...photos.objects.keys()].some((key) => key.startsWith(`photos/originals/${photo.id}/`)));
check('preview stored in R2', photos.objects.has(`photos/previews/${photo.id}.webp`));

const unauthorized = new FormData();
unauthorized.set('file', new File([png], 'x.png', { type: 'image/png' }));
const rejected = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'POST', body: unauthorized });
check('upload without authKey → 401', rejected.status === 401, String(rejected.status));

const listed = await (await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'GET' })).json();
check('GET /api/photos lists it', listed.length === 1 && listed[0].id === photo.id);
check('list does not leak R2 keys', !('originalKey' in listed[0]));

const preview = await call(photoRouter.handlePhotoRequest, `/photos/p/${photo.id}?w=800`, { method: 'GET' });
check('preview serves the stored WebP', preview.headers.get('x-photo-source') === 'stored-preview', String(preview.headers.get('x-photo-source')));
check('preview content-type is webp', preview.headers.get('content-type') === 'image/webp', String(preview.headers.get('content-type')));

const original = await call(photoRouter.handlePhotoRequest, `/photos/o/${photo.id}`, { method: 'GET' });
check('original downloads as an attachment', (original.headers.get('content-disposition') ?? '').startsWith('attachment;'), String(original.headers.get('content-disposition')));

const collections = await (await call(photoRouter.handlePhotoRequest, '/api/photo-collections', { method: 'GET' })).json();
check('collections counted', collections[0]?.collection === 'street' && collections[0]?.count === 1, JSON.stringify(collections));

const filtered = await (await call(photoRouter.handlePhotoRequest, '/api/photos?collection=interior', { method: 'GET' })).json();
check('collection filter excludes other collections', filtered.length === 0);

const deleted = await call(photoRouter.handlePhotoRequest, `/api/photos/${photo.id}`, {
  method: 'DELETE',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ authKey: UPLOAD_KEY }),
});
check('DELETE /api/photos/:id → 200', deleted.status === 200, String(deleted.status));
check('delete removed both R2 objects', photos.objects.size === 0, [...photos.objects.keys()].join(','));

// ---- podcasts ----
console.log('\npodcast routes');
const episodeForm = new FormData();
episodeForm.set('audio', new File([new Uint8Array([9, 9, 9])], 'ep1.mp3', { type: 'audio/mpeg' }));
episodeForm.set('title', 'Episode one');
episodeForm.set('description', 'First episode');
episodeForm.set('duration', '12:34');
episodeForm.set('explicit', 'false');
episodeForm.set('keywords', 'graphrag, typescript');
episodeForm.set('authKey', UPLOAD_KEY);

const episodeResponse = await call(podcastRouter.handlePodcastRequest, '/api/podcasts', { method: 'POST', body: episodeForm });
const episodeBody = await episodeResponse.json();
check('POST /api/podcasts → 201', episodeResponse.status === 201, String(episodeResponse.status));
const episode = episodeBody.podcast ?? {};
check('episode audio url is a worker path', (episode.metadata?.audioUrl ?? '').startsWith('/podcast-media/'));
check('episode keywords parsed', JSON.stringify(episode.metadata?.keywords) === '["graphrag","typescript"]');

const episodes = await (await call(podcastRouter.handlePodcastRequest, '/api/podcasts', { method: 'GET' })).json();
check('GET /api/podcasts lists the episode', episodes.length === 1 && episodes[0].id === episode.id);

const media = await call(podcastRouter.handlePodcastRequest, episode.metadata.audioUrl, { method: 'GET' });
check('audio streams from R2', media.status === 200 && media.headers.get('content-type') === 'audio/mpeg', String(media.status));

const rss = await (await call(podcastRouter.handlePodcastRequest, '/podcast/rss', { method: 'GET' })).text();
check('RSS contains the episode', rss.includes('Episode one') && rss.includes('<enclosure'), rss.slice(0, 120));

const patchedForm = new FormData();
patchedForm.set('title', 'Episode one (fixed)');
patchedForm.set('authKey', UPLOAD_KEY);
const patched = await call(podcastRouter.handlePodcastRequest, `/api/podcasts/${episode.id}`, { method: 'PATCH', body: patchedForm });
const patchedBody = await patched.json();
check('PATCH keeps the audio while renaming', patched.status === 200 && patchedBody.podcast?.metadata?.title === 'Episode one (fixed)');
check('PATCH kept the original audio key', patchedBody.podcast?.metadata?.audioUrl === episode.metadata.audioUrl);

const removed = await call(podcastRouter.handlePodcastRequest, `/api/podcasts/${episode.id}`, {
  method: 'DELETE',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ authKey: UPLOAD_KEY }),
});
check('DELETE /api/podcasts/:id → 200', removed.status === 200, String(removed.status));
check('delete removed the audio object', podcasts.objects.size === 0, [...podcasts.objects.keys()].join(','));

// ---- degradation ----
console.log('\nwithout a database');
const noDb = await photoRouter.handlePhotoRequest(
  new Request('https://blog.ashesborn.cloud/api/photos'),
  { PHOTOS: photos, UPLOAD_AUTH_KEY: UPLOAD_KEY }
);
check('photo API answers 503 without HYPERDRIVE', noDb.status === 503, String(noDb.status));
const noDbPodcast = await podcastRouter.handlePodcastRequest(
  new Request('https://blog.ashesborn.cloud/api/podcasts'),
  { PODCASTS: podcasts, UPLOAD_AUTH_KEY: UPLOAD_KEY }
);
check('podcast API answers 503 without HYPERDRIVE', noDbPodcast.status === 503, String(noDbPodcast.status));
check(
  'media still streams without a database',
  (await call(podcastRouter.handlePodcastRequest, '/podcast-media/podcasts%2Faudio%2Fx.mp3', { method: 'GET' })).status === 404
);

await pg.close();
await rm(libWork, { recursive: true, force: true });

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log('\nall route checks passed');
