#!/usr/bin/env node
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const libWork = path.join(root, '.wrangler', 'photo-seo-test-lib');
await rm(libWork, { recursive: true, force: true });
await mkdir(libWork, { recursive: true });

for (const file of (await readdir(path.join(root, 'lib'))).filter((name) => name.endsWith('.js'))) {
  const source = await readFile(path.join(root, 'lib', file), 'utf8');
  const rewritten = source.replace(/from '\.\/([A-Za-z0-9_.-]+)\.js'/g, "from './$1.mjs'");
  await writeFile(path.join(libWork, file.replace(/\.js$/, '.mjs')), rewritten);
}
const workerSource = (await readFile(path.join(root, 'worker.js'), 'utf8'))
  .replace("import slugRedirects from './lib/generated/slug-redirects.json';", 'const slugRedirects = {};')
  .replace(/from '\.\/lib\/([A-Za-z0-9_.-]+)\.js'/g, "from './$1.mjs'");
await writeFile(path.join(libWork, 'worker.mjs'), workerSource);
const worker = (await import(path.join(libWork, 'worker.mjs'))).default;

const migrations = path.join(root, 'migrations');
const sqlite = new DatabaseSync(':memory:');
for (const file of (await readdir(migrations)).filter((name) => name.endsWith('.sql')).sort()) {
  sqlite.exec(await readFile(path.join(migrations, file), 'utf8'));
}
const db = {
  prepare(sql) {
    const statement = sqlite.prepare(sql);
    const wrap = (params = []) => ({
      all: async () => ({ results: statement.all(...params) }),
      first: async () => statement.get(...params) ?? null,
      run: async () => ({ success: true, meta: statement.run(...params) }),
    });
    return { ...wrap(), bind: (...params) => wrap(params) };
  },
};

const ids = {
  first: '11111111-1111-4111-8111-111111111111',
  second: '22222222-2222-4222-8222-222222222222',
  hidden: '33333333-3333-4333-8333-333333333333',
  unknown: '44444444-4444-4444-8444-444444444444',
};
const insert = sqlite.prepare(`insert into photos
  (id,title,description,collection,taken_on,width,height,original_key,preview_key,tags,published,sort_order,city,region,country,camera_make,camera_model,lens,f_number,exposure_time,iso,focal_length)
  values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
insert.run(ids.first, 'Harbor "Light" & Fog', 'A quiet harbor', 'travel', '2025-05-12', 2400, 1600, 'first.jpg', 'first.webp', '["fog","harbor"]', 1, 1, 'Hangzhou', 'Zhejiang', 'China', 'Nikon', 'Z 6', '24-70mm', 2.8, '1/250', 400, 35);
insert.run(ids.second, 'Mountain', null, 'travel', null, 1200, 800, 'second.jpg', 'second.webp', '[]', 1, 2, null, null, null, null, null, null, null, null, null, null);
insert.run(ids.hidden, 'Unpublished', null, 'private', null, 10, 10, 'hidden.jpg', null, '[]', 0, 3, null, null, null, null, null, null, null, null, null, null);

const assetCalls = [];
const assetHtml = '<html><head><link rel="stylesheet" href="/x.css"></head><body><p id="body-content">Gallery body stays here</p></body></html>';
const assets = {
  async fetch(request) {
    const url = new URL(request.url);
    assetCalls.push(url.pathname);
    if (url.pathname === '/404.html') return new Response('<h1>Site 404</h1>', { status: 200, headers: { 'content-type': 'text/html' } });
    if (url.pathname === '/photography') return new Response(assetHtml, { headers: { 'content-type': 'text/html; charset=utf-8', 'x-asset': 'original' } });
    return new Response(`asset:${url.pathname}`, { status: 200, headers: { 'content-type': 'text/plain', 'x-asset': 'original' } });
  },
};
const env = { DB: db, ASSETS: assets, NEXT_PUBLIC_SITE_URL: 'https://blog.ashesborn.cloud' };
const failures = [];
const check = (label, condition, detail = '') => {
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures.push(label);
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};
const call = (url) => worker.fetch(new Request(`https://blog.ashesborn.cloud${url}`), env, {});

console.log('\nphoto SEO pages');
const pageResponse = await call(`/photography/${ids.first}`);
const page = await pageResponse.text();
check('known photo page returns 200 HTML', pageResponse.status === 200 && pageResponse.headers.get('content-type')?.includes('text/html'));
check('page includes title and canonical', page.includes('Harbor &quot;Light&quot; &amp; Fog — Photography — Ashes Born') && page.includes(`<link rel="canonical" href="https://blog.ashesborn.cloud/photography/${ids.first}">`));
check('title attribute escapes quote and ampersand', page.includes('<meta property="og:title" content="Harbor &quot;Light&quot; &amp; Fog — Photography — Ashes Born">'));
check('page includes Open Graph image and preview URL', page.includes('<meta property="og:image" content="https://blog.ashesborn.cloud/photos/p/') && page.includes(`/photos/p/${ids.first}`));
check('page includes ImageObject JSON-LD', page.includes('"@type":"ImageObject"') && page.includes('"contentUrl":"https://blog.ashesborn.cloud/photos/o/'));
check('stylesheet is extracted into the page', page.includes('<link rel="stylesheet" href="/x.css">'));
check('width/height capped for Open Graph metadata', page.includes('<meta property="og:image:width" content="1600">') && page.includes('<meta property="og:image:height" content="1067">'));
check('photo page cache headers are set', pageResponse.headers.get('cache-control') === 'public, max-age=300, s-maxage=3600' && pageResponse.headers.get('x-photo-page') === 'worker');

const missing = await call(`/photography/${ids.unknown}`);
check('unknown UUID returns site 404 with 404 status', missing.status === 404 && (await missing.text()).includes('Site 404'));
const callsBeforeUpload = assetCalls.length;
const upload = await call('/photography/upload');
check('non-UUID upload path passes through untouched', upload.status === 200 && await upload.text() === 'asset:/photography/upload' && upload.headers.get('x-asset') === 'original' && assetCalls.slice(callsBeforeUpload).includes('/photography/upload'));
const verify = await call('/photography/verify');
check('non-UUID verify path passes through untouched', verify.status === 200 && await verify.text() === 'asset:/photography/verify' && verify.headers.get('x-asset') === 'original' && assetCalls.includes('/photography/verify'));

const galleryResponse = await call('/photography');
const gallery = await galleryResponse.text();
check('gallery body is retained with injected ImageGallery JSON-LD', gallery.includes('Gallery body stays here') && gallery.includes('"@type":"ImageGallery"'));
check('gallery ItemList uses ImageObject entries', gallery.includes('"itemListElement":[{"@type":"ImageObject"'));
check('gallery has canonical and preview Open Graph image', gallery.includes('<link rel="canonical" href="https://blog.ashesborn.cloud/photography">') && gallery.includes('<meta property="og:image" content="https://blog.ashesborn.cloud/photos/p/'));
check('gallery injection retains status and headers', galleryResponse.status === 200 && galleryResponse.headers.get('x-asset') === 'original');

const sitemapResponse = await call('/sitemap-photos.xml');
const sitemap = await sitemapResponse.text();
check('photo sitemap has image namespace and two published URLs', sitemapResponse.headers.get('content-type') === 'application/xml; charset=utf-8' && sitemap.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"') && (sitemap.match(/<url>/g) || []).length === 2);
check('photo sitemap includes published items and excludes unpublished', sitemap.includes(ids.first) && sitemap.includes(ids.second) && !sitemap.includes(ids.hidden));
check('sitemap includes photo location, title, and image URL', sitemap.includes('<image:geo_location>Hangzhou, Zhejiang, China</image:geo_location>') && sitemap.includes('<image:title>Harbor &quot;Light&quot; &amp; Fog</image:title>') && sitemap.includes(`/photos/p/${ids.first}`));

sqlite.prepare('delete from photos where published = 1').run();
const emptyGalleryResponse = await call('/photography');
check('empty gallery table returns original asset HTML unchanged', await emptyGalleryResponse.text() === assetHtml);

await rm(libWork, { recursive: true, force: true });
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log('\nall photo SEO checks passed');
