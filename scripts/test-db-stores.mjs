#!/usr/bin/env node
/**
 * Exercises the real store modules (lib/podcastStore.js, lib/photoStore.js)
 * against an in-process Postgres (PGlite): applies migrations/0001, then runs
 * insert / list / filter / update / delete for both tables.
 *
 * The stores are plain ESM with no imports, but the repo's package.json is CJS,
 * so each module is copied to a temp `.mjs` file before import — that keeps this
 * test on the actual source instead of a copy of the SQL.
 */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const workdir = await mkdtemp(path.join(tmpdir(), 'blog-db-test-'));
const asModule = async (relative) => {
  const target = path.join(workdir, path.basename(relative).replace(/\.js$/, '.mjs'));
  const source = await readFile(path.join(root, relative), 'utf8');
  // relative .js imports must become .mjs imports in the copied module
  await writeFile(target, source.replace(/from '\.\/([A-Za-z0-9_.-]+)\.js'/g, "from './$1.mjs'"));
  return import(target);
};

await asModule('lib/pgTypes.js'); // shared helper the stores import
const podcastStore = await asModule('lib/podcastStore.js');
const photoStore = await asModule('lib/photoStore.js');

const pg = new PGlite();

/** Minimal postgres.js-compatible tagged template over PGlite. */
const sql = (strings, ...values) => {
  const text = strings.reduce((acc, chunk, index) => `${acc}${chunk}${index < values.length ? `$${index + 1}` : ''}`, '');
  return pg.query(text, values).then((result) => result.rows);
};
sql.unsafe = (text, params = []) => pg.query(text, params).then((result) => result.rows);

const failures = [];
const check = (label, condition, detail = '') => {
  if (condition) {
    console.log(`  ok   ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

const schema = await readFile(path.join(root, 'migrations/0001_podcasts_and_photos.sql'), 'utf8');
// pg.exec runs the file through the simple query protocol, so several
// statements per file are fine (pg.query would prepare them as one statement).
await pg.exec(schema);
await pg.exec(schema); // idempotency: every statement is IF NOT EXISTS
console.log('schema applied twice (idempotent)');

// ---- podcasts ----
console.log('\npodcast store');
const older = await podcastStore.insertPodcast(sql, {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Older episode',
  date: '2026-01-05',
  description: 'first',
  duration: '12:34',
  audioKey: 'podcasts/audio/a/ep1.mp3',
  audioSize: 1234,
  audioType: 'audio/mpeg',
  coverKey: null,
  author: 'Ashes Space',
  episodeNumber: 1,
  season: 1,
  keywords: ['graphrag', 'typescript'],
  explicit: false,
});
check('insert returns public record', older.id === '11111111-1111-4111-8111-111111111111');
check('audio url is a worker path', older.metadata.audioUrl === '/podcast-media/podcasts%2Faudio%2Fa%2Fep1.mp3', older.metadata.audioUrl);
check('keywords round-trip as text[]', JSON.stringify(older.metadata.keywords) === '["graphrag","typescript"]');
check('episode number round-trips', older.metadata.episodeNumber === 1);

const newer = await podcastStore.insertPodcast(sql, {
  id: '22222222-2222-4222-8222-222222222222',
  title: 'Newer episode',
  date: '2026-03-09',
  description: 'second',
  duration: '45:00',
  audioKey: 'podcasts/audio/b/ep2.mp3',
  audioSize: 9999,
  audioType: 'audio/mpeg',
  coverKey: 'podcasts/covers/b/cover.jpg',
  author: null,
  episodeNumber: null,
  season: null,
  keywords: [],
  explicit: true,
});
check('null cover/keywords accepted', newer.metadata.image === '/podcast-media/podcasts%2Fcovers%2Fb%2Fcover.jpg');

const listed = await podcastStore.listPodcasts(sql);
check('list orders by published_on desc', listed.map((row) => row.id)[0] === newer.id, JSON.stringify(listed.map((r) => r.metadata.date)));
check('list returns both rows', listed.length === 2);

const updated = await podcastStore.updatePodcastRow(sql, older.id, { title: 'Renamed episode', explicit: true });
check('update merges partial patch', updated.metadata.title === 'Renamed episode' && updated.metadata.explicit === true);
check('update keeps untouched fields', updated.metadata.duration === '12:34' && updated.metadata.audioType === 'audio/mpeg');

const removed = await podcastStore.removePodcast(sql, newer.id);
check('delete returns r2 keys for cleanup', removed.audioKey === 'podcasts/audio/b/ep2.mp3' && removed.coverKey === 'podcasts/covers/b/cover.jpg');
check('delete removes the row', (await podcastStore.getPodcast(sql, newer.id)) === null);

// ---- photos ----
console.log('\nphoto store');
const photoA = await photoStore.insertPhoto(sql, {
  id: '33333333-3333-4333-8333-333333333333',
  title: 'Fog',
  description: 'morning',
  collection: 'street',
  takenOn: '2026-02-02',
  width: 4000,
  height: 3000,
  originalKey: 'photos/originals/a/fog.jpg',
  originalSize: 5_000_000,
  previewKey: 'photos/previews/a.webp',
  previewSize: 180_000,
  contentType: 'image/jpeg',
  tags: ['fog'],
  published: true,
  sortOrder: 1,
});
check('photo record has no r2 key', !('originalKey' in photoA), JSON.stringify(Object.keys(photoA)));
check('preview url shape', photoA.preview === '/photos/p/33333333-3333-4333-8333-333333333333');
check('aspect computed', photoA.aspect === 1.3333, String(photoA.aspect));

await photoStore.insertPhoto(sql, {
  id: '44444444-4444-4444-8444-444444444444',
  title: 'Window',
  description: null,
  collection: 'interior',
  takenOn: '2026-02-03',
  width: 3000,
  height: 4000,
  originalKey: 'photos/originals/b/window.avif',
  originalSize: 2_000_000,
  contentType: 'image/avif',
  tags: [],
  published: false,
  sortOrder: 0,
});

const all = await photoStore.listPhotos(sql);
check('unpublished photos are hidden by default', all.length === 1, `got ${all.length}`);

const withDrafts = await photoStore.listPhotos(sql, { includeUnpublished: true });
check('includeUnpublished returns drafts', withDrafts.length === 2);

const street = await photoStore.listPhotos(sql, { collection: 'street' });
check('collection filter works', street.length === 1 && street[0].id === photoA.id);

const collections = await photoStore.listCollections(sql);
check('collections only count published', collections.length === 1 && collections[0].collection === 'street' && collections[0].count === 1, JSON.stringify(collections));

const gone = await photoStore.removePhoto(sql, photoA.id);
check('photo delete returns r2 key', gone.originalKey === 'photos/originals/a/fog.jpg');
check('photo delete also returns the preview key', gone.previewKey === 'photos/previews/a.webp');

const tables = await sql.unsafe("select table_name from information_schema.tables where table_schema = 'public' order by 1");
console.log('\ntables:', tables.map((row) => row.table_name).join(', '));

await pg.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log('\nall store checks passed');
