#!/usr/bin/env node
/**
 * Exercises the real store modules (lib/photoStore.js, lib/podcastStore.js)
 * against an in-process SQLite (node:sqlite) wrapped in the D1 API shape, so no
 * Cloudflare account and no database server are needed.
 *
 * The stores are ESM but the repo's package.json is CJS, so each module is copied
 * to a temp `.mjs` (with relative imports rewritten) before import — that keeps
 * this test on the actual SQL that ships.
 */
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const workdir = await mkdtemp(path.join(tmpdir(), 'blog-db-test-'));

const asModule = async (relative) => {
  const target = path.join(workdir, path.basename(relative).replace(/\.js$/, '.mjs'));
  const source = await readFile(path.join(root, relative), 'utf8');
  await writeFile(target, source.replace(/from '\.\/([A-Za-z0-9_.-]+)\.js'/g, "from './$1.mjs'"));
  return import(target);
};

/** node:sqlite → the subset of the D1 API the stores use. */
function createD1(schema) {
  const sqlite = new DatabaseSync(':memory:');
  if (schema) sqlite.exec(schema);

  const wrap = (statement) => {
    const self = {
      bind:
        (...params) =>
        ({
          all: async () => ({ results: statement.all(...params) }),
          first: async () => statement.get(...params) ?? null,
          run: async () => ({ success: true, meta: statement.run(...params) }),
        }),
      all: async () => ({ results: statement.all() }),
      first: async () => statement.get() ?? null,
      run: async () => ({ success: true, meta: statement.run() }),
    };
    return self;
  };

  return { prepare: (sql) => wrap(sqlite.prepare(sql)), sqlite };
}

await asModule('lib/db.js');
const photoStore = await asModule('lib/photoStore.js');
const podcastStore = await asModule('lib/podcastStore.js');

const schema = await readFile(path.join(root, 'migrations/0001_podcasts_and_photos.sql'), 'utf8');
const db = createD1(schema);
db.sqlite.exec(schema); // idempotency: every statement is IF NOT EXISTS

const failures = [];
const check = (label, condition, detail = '') => {
  if (condition) console.log(`  ok   ${label}`);
  else {
    failures.push(label);
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`);
  }
};

// ---- podcasts ----
console.log('\npodcast store');
const older = await podcastStore.insertPodcast(db, {
  id: 'ep-1',
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
check('insert returns the public record', older.id === 'ep-1');
check('audio url is a worker path', older.metadata.audioUrl === '/podcast-media/podcasts%2Faudio%2Fa%2Fep1.mp3', older.metadata.audioUrl);
check('keywords round-trip as an array', JSON.stringify(older.metadata.keywords) === '["graphrag","typescript"]', JSON.stringify(older.metadata.keywords));
check('episode number round-trips', older.metadata.episodeNumber === 1);
check('explicit is a boolean', older.metadata.explicit === false);

const newer = await podcastStore.insertPodcast(db, {
  id: 'ep-2',
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
check('empty keywords come back as []', Array.isArray(newer.metadata.keywords) && newer.metadata.keywords.length === 0);

const listed = await podcastStore.listPodcasts(db);
check('list orders by published_on desc', listed[0].id === 'ep-2', listed.map((row) => row.metadata.date).join(','));
check('list returns both rows', listed.length === 2);

const updated = await podcastStore.updatePodcastRow(db, 'ep-1', { title: 'Renamed episode', explicit: true });
check('update merges a partial patch', updated.metadata.title === 'Renamed episode' && updated.metadata.explicit === true);
check('update keeps untouched fields', updated.metadata.duration === '12:34' && updated.metadata.audioType === 'audio/mpeg');
check('update keeps keywords', JSON.stringify(updated.metadata.keywords) === '["graphrag","typescript"]');

const removed = await podcastStore.removePodcast(db, 'ep-2');
check('delete returns r2 keys for cleanup', removed.audioKey === 'podcasts/audio/b/ep2.mp3' && removed.coverKey === 'podcasts/covers/b/cover.jpg');
check('delete removes the row', (await podcastStore.getPodcast(db, 'ep-2')) === null);

// ---- photos ----
console.log('\nphoto store');
const photoA = await photoStore.insertPhoto(db, {
  id: 'photo-a',
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
check('preview url shape', photoA.preview === '/photos/p/photo-a');
check('aspect computed', photoA.aspect === 1.3333, String(photoA.aspect));
check('tags come back as an array', JSON.stringify(photoA.tags) === '["fog"]');

await photoStore.insertPhoto(db, {
  id: 'photo-b',
  title: 'Window',
  description: null,
  collection: 'interior',
  takenOn: '2026-02-03',
  width: 3000,
  height: 4000,
  originalKey: 'photos/originals/b/window.avif',
  originalSize: 2_000_000,
  previewKey: null,
  previewSize: 0,
  contentType: 'image/avif',
  tags: [],
  published: false,
  sortOrder: 0,
});

const all = await photoStore.listPhotos(db);
check('unpublished photos are hidden by default', all.length === 1, `got ${all.length}`);

const withDrafts = await photoStore.listPhotos(db, { includeUnpublished: true });
check('includeUnpublished returns drafts', withDrafts.length === 2);

const street = await photoStore.listPhotos(db, { collection: 'street' });
check('collection filter works', street.length === 1 && street[0].id === 'photo-a');

const collections = await photoStore.listCollections(db);
check(
  'collections only count published',
  collections.length === 1 && collections[0].collection === 'street' && collections[0].count === 1,
  JSON.stringify(collections)
);

const gone = await photoStore.removePhoto(db, 'photo-a');
check('photo delete returns r2 key', gone.originalKey === 'photos/originals/a/fog.jpg');
check('photo delete also returns the preview key', gone.previewKey === 'photos/previews/a.webp');

const tables = db.sqlite.prepare("select name from sqlite_master where type = 'table' order by name").all();
console.log('\ntables:', tables.map((row) => row.name).join(', '));

if (failures.length > 0) {
  console.error(`\n${failures.length} check(s) failed`);
  process.exit(1);
}

console.log('\nall store checks passed');
