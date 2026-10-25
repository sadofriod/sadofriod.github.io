#!/usr/bin/env node
/**
 * End-to-end check of the Worker's photo + podcast routes without Cloudflare and
 * without a database server: the real router modules from lib/ run against
 *   - an in-memory R2 stand-in, and
 *   - an in-process SQLite (node:sqlite) wrapped in the D1 API shape.
 *
 * It exercises what a browser actually hits: multipart upload, listing, preview,
 * original download, delete, RSS, and the "database not configured" degradation.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { webcrypto as crypto } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// --- load the real modules as ESM (package.json is CJS, lib/ is ESM) ---------
const libWork = path.join(root, '.wrangler', 'route-test-lib');
await rm(libWork, { recursive: true, force: true });
await mkdir(libWork, { recursive: true });

for (const file of (await readdir(path.join(root, 'lib'))).filter((name) => name.endsWith('.js'))) {
  const source = await readFile(path.join(root, 'lib', file), 'utf8');
  const rewritten = source.replace(/from '\.\/([A-Za-z0-9_.-]+)\.js'/g, "from './$1.mjs'");
  await writeFile(path.join(libWork, file.replace(/\.js$/, '.mjs')), rewritten);
}

const photoRouter = await import(path.join(libWork, 'photoRouter.mjs'));
const podcastRouter = await import(path.join(libWork, 'podcastRouter.mjs'));
const workerSource = (await readFile(path.join(root, 'worker.js'), 'utf8'))
  .replace("import slugRedirects from './lib/generated/slug-redirects.json';", 'const slugRedirects = {};')
  .replace(/from '\.\/lib\/([A-Za-z0-9_.-]+)\.js'/g, "from './$1.mjs'");
await writeFile(path.join(libWork, 'worker.mjs'), workerSource);
const worker = (await import(path.join(libWork, 'worker.mjs'))).default;

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
        const names = {
          contentType: 'content-type',
          cacheControl: 'cache-control',
          contentDisposition: 'content-disposition',
          contentEncoding: 'content-encoding',
          contentLanguage: 'content-language',
        };
        for (const [key2, value] of Object.entries(entry.httpMetadata)) {
          if (typeof value === 'string') headers.set(names[key2] ?? key2.toLowerCase(), value);
        }
      },
    };
  }

  async head(key) {
    const entry = this.objects.get(key);
    if (!entry) return null;
    return { key, size: entry.bytes.byteLength, httpMetadata: entry.httpMetadata ?? {} };
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

/** node:sqlite → the subset of the D1 API the Worker uses. */
function createD1(schema) {
  const sqlite = new DatabaseSync(':memory:');
  if (schema) sqlite.exec(schema);

  const wrap = (statement) => ({
    bind: (...params) => ({
      all: async () => ({ results: statement.all(...params) }),
      first: async () => statement.get(...params) ?? null,
      run: async () => ({ success: true, meta: statement.run(...params) }),
    }),
    all: async () => ({ results: statement.all() }),
    first: async () => statement.get() ?? null,
    run: async () => ({ success: true, meta: statement.run() }),
  });

  return { prepare: (sql) => wrap(sqlite.prepare(sql)), sqlite };
}

async function loadSchema() {
  const dir = path.join(root, 'migrations');
  const files = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort();
  const parts = await Promise.all(files.map((name) => readFile(path.join(dir, name), 'utf8')));
  return parts.join('\n');
}

const schema = await loadSchema();
const DB = createD1(schema);

const UPLOAD_KEY = 'test-upload-key';
const photos = new FakeBucket();
const podcasts = new FakeBucket();
const env = { PHOTOS: photos, PODCASTS: podcasts, UPLOAD_AUTH_KEY: UPLOAD_KEY, DB };

const failures = [];
const check = (label, condition, detail = '') => {
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures.push(label);
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const call = (router, url, init) => router(new Request(`https://blog.ashesborn.cloud${url}`, init), env);

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);

// ---- photography ----
console.log('\nphoto routes');
const uploadForm = new FormData();
uploadForm.set('file', new File([png], 'fog.png', { type: 'image/png' }));
uploadForm.set('preview', new File([new Uint8Array([1, 2, 3, 4, 5])], 'preview.webp', { type: 'image/webp' }));
uploadForm.set('title', 'Fog');
uploadForm.set('collection', '2024-05');
uploadForm.set('takenOn', '2026-02-02');
uploadForm.set('width', '1600');
uploadForm.set('height', '1000');
uploadForm.set('tags', 'film, 35mm');
uploadForm.set('location', 'Hangzhou, Zhejiang, China');
uploadForm.set('city', 'Hangzhou');
uploadForm.set('region', 'Zhejiang');
uploadForm.set('country', 'China');
uploadForm.set('latitude', '30.2741');
uploadForm.set('longitude', '120.1551');
uploadForm.set('cameraMake', 'NIKON');
uploadForm.set('cameraModel', 'NIKON Z 6');
uploadForm.set('lens', 'NIKKOR Z 24-70mm f/2.8 S');
uploadForm.set('fNumber', '2.8');
uploadForm.set('exposureTime', '1/250');
uploadForm.set('iso', '400');
uploadForm.set('focalLength', '35');
uploadForm.set('metadataSource', 'exif');
uploadForm.set('authKey', UPLOAD_KEY);

const created = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'POST', body: uploadForm });
const createdBody = await created.json();
check('POST /api/photos → 201', created.status === 201, String(created.status));
const photo = createdBody.photo ?? {};
check('upload returns preview + original urls', photo.preview === `/photos/p/${photo.id}` && photo.original === `/photos/o/${photo.id}`);
check('tags parsed from the comma list', JSON.stringify(photo.tags) === '["film","35mm"]', JSON.stringify(photo.tags));
check('upload includes nested location and camera metadata', photo.location?.label === 'Hangzhou, Zhejiang, China' && photo.location?.latitude === 30.2741 && photo.camera?.model === 'NIKON Z 6');
check('original stored in R2', [...photos.objects.keys()].some((key) => key.startsWith(`photos/originals/${photo.id}/`)));
check('preview stored in R2', photos.objects.has(`photos/previews/${photo.id}.webp`));

const unauthorized = new FormData();
unauthorized.set('file', new File([png], 'x.png', { type: 'image/png' }));
const rejected = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'POST', body: unauthorized });
check('upload without authKey → 401', rejected.status === 401, String(rejected.status));

const listed = await (await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'GET' })).json();
check('GET /api/photos lists it', listed.length === 1 && listed[0].id === photo.id);
check('list does not leak R2 keys', !('originalKey' in listed[0]));
check('list keeps tags an array', Array.isArray(listed[0].tags) && listed[0].tags.length === 2);
check('list preserves nested photo metadata', listed[0].location?.label === photo.location.label && listed[0].camera?.model === photo.camera.model);
check('GET /api/photos round-trips month collection and full metadata', listed[0].collection === '2024-05' && listed[0].takenOn === '2026-02-02' && listed[0].width === 1600 && listed[0].height === 1000 && listed[0].tags.join(',') === 'film,35mm' && listed[0].metadataSource === 'exif' && listed[0].location?.label === 'Hangzhou, Zhejiang, China' && listed[0].location?.city === 'Hangzhou' && listed[0].location?.region === 'Zhejiang' && listed[0].location?.country === 'China' && listed[0].location?.latitude === 30.2741 && listed[0].location?.longitude === 120.1551 && listed[0].camera?.make === 'NIKON' && listed[0].camera?.model === 'NIKON Z 6' && listed[0].camera?.lens === 'NIKKOR Z 24-70mm f/2.8 S' && listed[0].camera?.fNumber === 2.8 && listed[0].camera?.exposureTime === '1/250' && listed[0].camera?.iso === 400 && listed[0].camera?.focalLength === 35);
const directPhoto = await (await call(photoRouter.handlePhotoRequest, `/api/photos/${photo.id}`, { method: 'GET' })).json();
check('GET /api/photos/:id returns nested metadata', directPhoto.location?.label === photo.location.label && directPhoto.camera?.model === photo.camera.model);

const withoutMetadata = new FormData();
withoutMetadata.set('file', new File([png], 'plain.png', { type: 'image/png' }));
withoutMetadata.set('title', 'Plain');
withoutMetadata.set('authKey', UPLOAD_KEY);
const plainCreated = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'POST', body: withoutMetadata });
const plainPhoto = (await plainCreated.json()).photo;
check('photo without metadata has no optional nested objects', !('location' in plainPhoto) && !('camera' in plainPhoto), JSON.stringify(plainPhoto));
await call(photoRouter.handlePhotoRequest, `/api/photos/${plainPhoto.id}`, {
  method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ authKey: UPLOAD_KEY }),
});

const emptyTitleForm = new FormData();
emptyTitleForm.set('file', new File([png], 'filename-must-not-be-title.png', { type: 'image/png' }));
emptyTitleForm.set('title', '');
emptyTitleForm.set('collection', '2024-05');
emptyTitleForm.set('authKey', UPLOAD_KEY);
const emptyTitleResponse = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'POST', body: emptyTitleForm });
const emptyTitlePhoto = (await emptyTitleResponse.json()).photo;
check('explicitly empty title stays empty', emptyTitleResponse.status === 201 && emptyTitlePhoto.title === '', JSON.stringify(emptyTitlePhoto));

const legacyTitleForm = new FormData();
legacyTitleForm.set('file', new File([png], 'legacy-photo.png', { type: 'image/png' }));
legacyTitleForm.set('authKey', UPLOAD_KEY);
const legacyTitleResponse = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'POST', body: legacyTitleForm });
const legacyTitlePhoto = (await legacyTitleResponse.json()).photo;
check('missing title keeps the filename stem fallback', legacyTitleResponse.status === 201 && legacyTitlePhoto.title === 'legacy-photo', JSON.stringify(legacyTitlePhoto));
const uploadedTitles = await (await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'GET' })).json();
check('GET /api/photos retains an explicitly empty title', uploadedTitles.some((entry) => entry.id === emptyTitlePhoto.id && entry.title === ''));
for (const entry of [emptyTitlePhoto, legacyTitlePhoto]) {
  await call(photoRouter.handlePhotoRequest, `/api/photos/${entry.id}`, {
    method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ authKey: UPLOAD_KEY }),
  });
}

const missingGeocode = await call(photoRouter.handlePhotoRequest, '/api/photo-geocode', { method: 'GET' });
check('GET /api/photo-geocode without params → 400', missingGeocode.status === 400);
const geocodeOffEnv = { ...env, GEOCODE_PROVIDER: 'off' };
const geocodeOff = await photoRouter.handlePhotoRequest(new Request('https://blog.ashesborn.cloud/api/photo-geocode?lat=30&lon=120'), geocodeOffEnv);
const geocodeOffBody = await geocodeOff.json();
check('GEOCODE_PROVIDER=off → 200 + null label', geocodeOff.status === 200 && geocodeOffBody.label === null);

let geocodeCalls = 0;
const geocodeFetch = async () => {
  geocodeCalls += 1;
  return Response.json({ address: { city: 'Hangzhou', state: 'Zhejiang', country: 'China' } });
};
const { reverseGeocode } = await import(path.join(libWork, 'photoGeocode.mjs'));
const geocodeEnv = { GEOCODE_PROVIDER: 'nominatim' };
const geocodeFirst = await reverseGeocode(30.2741, 120.1551, { env: geocodeEnv, db: DB, lang: 'en', fetchImpl: geocodeFetch });
const geocodeSecond = await reverseGeocode(30.2741, 120.1551, { env: geocodeEnv, db: DB, lang: 'en', fetchImpl: geocodeFetch });
check('geocode cache returns the label and avoids a second request', geocodeFirst.label === 'Hangzhou, Zhejiang, China' && geocodeSecond.label === geocodeFirst.label && geocodeCalls === 1, `calls ${geocodeCalls}`);

const preview = await call(photoRouter.handlePhotoRequest, `/photos/p/${photo.id}?w=800`, { method: 'GET' });
check('preview serves the stored WebP', preview.headers.get('x-photo-source') === 'stored-preview', String(preview.headers.get('x-photo-source')));
check('preview content-type is webp', preview.headers.get('content-type') === 'image/webp', String(preview.headers.get('content-type')));

const original = await call(photoRouter.handlePhotoRequest, `/photos/o/${photo.id}`, { method: 'GET' });
check('original downloads as an attachment', (original.headers.get('content-disposition') ?? '').startsWith('attachment;'), String(original.headers.get('content-disposition')));

const collections = await (await call(photoRouter.handlePhotoRequest, '/api/photo-collections', { method: 'GET' })).json();
check('collections counted', collections[0]?.collection === '2024-05' && collections[0]?.count === 1, JSON.stringify(collections));

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
await podcasts.put('S01E01.mp4', new Uint8Array([0, 0, 0, 32, 102, 116, 121, 112]), {
  httpMetadata: { contentType: 'video/mp4' },
});

const episodeForm = new FormData();
episodeForm.set('audio', new File([new Uint8Array([9, 9, 9])], 'ep1.mp3', { type: 'audio/mpeg' }));
episodeForm.set('title', 'Episode one');
episodeForm.set('description', 'First episode');
episodeForm.set('duration', '12:34');
episodeForm.set('explicit', 'false');
episodeForm.set('keywords', 'graphrag, typescript');
episodeForm.set('videoKey', 'S01E01.mp4');
episodeForm.set('authKey', UPLOAD_KEY);

const episodeResponse = await call(podcastRouter.handlePodcastRequest, '/api/podcasts', { method: 'POST', body: episodeForm });
const episodeBody = await episodeResponse.json();
check('POST /api/podcasts → 201', episodeResponse.status === 201, String(episodeResponse.status));
const episode = episodeBody.podcast ?? {};
check('episode audio url is a worker path', (episode.metadata?.audioUrl ?? '').startsWith('/podcast-media/'));
check('episode keywords parsed', JSON.stringify(episode.metadata?.keywords) === '["graphrag","typescript"]');
check('video key becomes a media url', episode.metadata?.videoUrl === '/podcast-media/S01E01.mp4', String(episode.metadata?.videoUrl));
check('video type recorded from R2 head', episode.metadata?.videoType === 'video/mp4', String(episode.metadata?.videoType));

const badVideo = new FormData();
badVideo.set('audio', new File([new Uint8Array([1])], 'e.mp3', { type: 'audio/mpeg' }));
badVideo.set('title', 'x');
badVideo.set('description', 'x');
badVideo.set('duration', '1:00');
badVideo.set('videoKey', 'missing.mp4');
badVideo.set('authKey', UPLOAD_KEY);
const rejectedVideo = await call(podcastRouter.handlePodcastRequest, '/api/podcasts', { method: 'POST', body: badVideo });
check('video key that is not in R2 → 400', rejectedVideo.status === 400, String(rejectedVideo.status));

const episodes = await (await call(podcastRouter.handlePodcastRequest, '/api/podcasts', { method: 'GET' })).json();
check('GET /api/podcasts lists the episode', episodes.length === 1 && episodes[0].id === episode.id);

const media = await call(podcastRouter.handlePodcastRequest, episode.metadata.audioUrl, { method: 'GET' });
check('audio streams from R2', media.status === 200 && media.headers.get('content-type') === 'audio/mpeg', String(media.status));

const videoMedia = await call(podcastRouter.handlePodcastRequest, episode.metadata.videoUrl, { method: 'GET' });
check('video streams from R2', videoMedia.status === 200 && videoMedia.headers.get('content-type') === 'video/mp4', String(videoMedia.status));

const strayMedia = await call(podcastRouter.handlePodcastRequest, '/podcast-media/unreferenced.txt', { method: 'GET' });
check('objects no episode references are not exposed', strayMedia.status === 404, String(strayMedia.status));

const rss = await (await call(podcastRouter.handlePodcastRequest, '/podcast/rss', { method: 'GET' })).text();
check('RSS contains the episode', rss.includes('Episode one') && rss.includes('<enclosure'), rss.slice(0, 120));

const patchedForm = new FormData();
patchedForm.set('title', 'Episode one (fixed)');
patchedForm.set('authKey', UPLOAD_KEY);
const patched = await call(podcastRouter.handlePodcastRequest, `/api/podcasts/${episode.id}`, { method: 'PATCH', body: patchedForm });
const patchedBody = await patched.json();
check('PATCH keeps the audio while renaming', patched.status === 200 && patchedBody.podcast?.metadata?.title === 'Episode one (fixed)');
check('PATCH kept the original audio key', patchedBody.podcast?.metadata?.audioUrl === episode.metadata.audioUrl);
check('PATCH kept the keywords', JSON.stringify(patchedBody.podcast?.metadata?.keywords) === '["graphrag","typescript"]');

const removed = await call(podcastRouter.handlePodcastRequest, `/api/podcasts/${episode.id}`, {
  method: 'DELETE',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ authKey: UPLOAD_KEY }),
});
check('DELETE /api/podcasts/:id → 200', removed.status === 200, String(removed.status));
check('delete removed the audio object', podcasts.objects.size === 1 && podcasts.objects.has('S01E01.mp4'), [...podcasts.objects.keys()].join(','));

// ---- degradation ----
console.log('\nwithout a database binding');
const noDb = await photoRouter.handlePhotoRequest(new Request('https://blog.ashesborn.cloud/api/photos'), {
  PHOTOS: photos,
  UPLOAD_AUTH_KEY: UPLOAD_KEY,
});
check('photo API answers 503 without DB', noDb.status === 503, String(noDb.status));
const noDbPodcast = await podcastRouter.handlePodcastRequest(new Request('https://blog.ashesborn.cloud/api/podcasts'), {
  PODCASTS: podcasts,
  UPLOAD_AUTH_KEY: UPLOAD_KEY,
});
check('podcast API answers 503 without DB', noDbPodcast.status === 503, String(noDbPodcast.status));

// ---- admin alias + Cloudflare Access --------------------------------------
console.log('\nadmin alias and access gate');
const adminForm = new FormData();
adminForm.set('file', new File([png], 'admin.png', { type: 'image/png' }));
adminForm.set('title', 'Admin');
adminForm.set('collection', 'street');
adminForm.set('authKey', UPLOAD_KEY);
const viaAdmin = await call(photoRouter.handlePhotoRequest, '/api/admin/photos', { method: 'POST', body: adminForm });
check('POST /api/admin/photos works with the legacy key', viaAdmin.status === 201, String(viaAdmin.status));

const adminNoAuth = new FormData();
adminNoAuth.set('file', new File([png], 'nope.png', { type: 'image/png' }));
const adminRejected = await call(photoRouter.handlePhotoRequest, '/api/admin/photos', { method: 'POST', body: adminNoAuth });
check('POST /api/admin/photos without auth → 401', adminRejected.status === 401, String(adminRejected.status));

// With Access configured the shared key must stop being accepted: the only proof is the
// Cf-Access-Jwt-Assertion header, which Access injects after the visitor signs in.
const accessEnv = { ...env, ACCESS_TEAM_DOMAIN: 'ashesborn.cloudflareaccess.com', ACCESS_AUD: 'aud-tag' };
// The verifier fetches the team's signing keys; keep the test offline and deterministic.
const realFetch = globalThis.fetch;
globalThis.fetch = async (input) => {
  throw new Error(`unexpected network call in tests: ${String(input)}`);
};
const accessWithKey = new FormData();
accessWithKey.set('file', new File([png], 'key.png', { type: 'image/png' }));
accessWithKey.set('authKey', UPLOAD_KEY);
const keyIgnored = await photoRouter.handlePhotoRequest(
  new Request('https://blog.ashesborn.cloud/api/admin/photos', { method: 'POST', body: accessWithKey }),
  accessEnv
);
check('Access configured: the legacy key is no longer accepted', keyIgnored.status === 401, String(keyIgnored.status));

const accessBadJwt = new FormData();
accessBadJwt.set('file', new File([png], 'jwt.png', { type: 'image/png' }));
const jwtRejected = await photoRouter.handlePhotoRequest(
  new Request('https://blog.ashesborn.cloud/api/admin/photos', {
    method: 'POST',
    body: accessBadJwt,
    headers: { 'Cf-Access-Jwt-Assertion': 'header.payload.signature' },
  }),
  accessEnv
);
check('Access configured: a bogus JWT is rejected', jwtRejected.status === 401, String(jwtRejected.status));

const publicList = await call(photoRouter.handlePhotoRequest, '/api/photos', { method: 'GET' });
check('GET /api/photos stays public with Access configured', publicList.status === 200, String(publicList.status));

const encoder = new TextEncoder();
const b64url = (bytes) => Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const json64 = (value) => b64url(encoder.encode(JSON.stringify(value)));
const pair = await crypto.subtle.generateKey(
  { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
  true,
  ['sign', 'verify']
);
const publicJwk = { ...(await crypto.subtle.exportKey('jwk', pair.publicKey)), kid: 'route-test-key', alg: 'RS256', use: 'sig' };
const routeAud = accessEnv.ACCESS_AUD;
const now = Math.floor(Date.now() / 1000);
const jwtHeader = json64({ alg: 'RS256', kid: publicJwk.kid, typ: 'JWT' });
const jwtPayload = json64({ aud: routeAud, email: 'admin@example.com', sub: 'route-test-user', exp: now + 600 });
const unsignedJwt = `${jwtHeader}.${jwtPayload}`;
const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', pair.privateKey, encoder.encode(unsignedJwt));
const routeJwt = `${unsignedJwt}.${b64url(new Uint8Array(signature))}`;
globalThis.fetch = async (input) => {
  if (!String(input).endsWith('/cdn-cgi/access/certs')) throw new Error(`unexpected network call in tests: ${String(input)}`);
  return Response.json({ keys: [publicJwk] });
};
const sessionEnv = { ...accessEnv, ASSETS: { fetch: async () => new Response('not found', { status: 404 }) } };
for (const endpoint of ['/api/whoami', '/api/admin/session']) {
  const authenticated = await worker.fetch(
    new Request(`https://blog.ashesborn.cloud${endpoint}`, { headers: { cookie: `CF_Authorization=${routeJwt}` } }),
    sessionEnv,
    {}
  );
  const authenticatedBody = await authenticated.json();
  check(`GET ${endpoint} accepts cookie identity`, authenticated.status === 200 && authenticatedBody.authenticated === true && authenticatedBody.source === 'cookie' && authenticatedBody.email === 'admin@example.com', JSON.stringify(authenticatedBody));
  check(`GET ${endpoint} disables caching`, authenticated.headers.get('cache-control') === 'no-store');

  const anonymous = await worker.fetch(new Request(`https://blog.ashesborn.cloud${endpoint}`), sessionEnv, {});
  const anonymousBody = await anonymous.json();
  check(`GET ${endpoint} without credentials is anonymous`, anonymousBody.authenticated === false && anonymousBody.source === null);
}
globalThis.fetch = realFetch;

await rm(libWork, { recursive: true, force: true });

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log('\nall route checks passed');
