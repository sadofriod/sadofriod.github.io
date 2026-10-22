/**
 * Photography catalog in D1 (SQLite). Image bytes live in the PHOTOS R2 bucket
 * (`photos/originals/...`, `photos/previews/...`); this module only stores
 * metadata and object keys.
 */
import { parseJsonArray, toJsonArray } from './db.js';

const COLUMNS = `id, title, description, collection,
  taken_on as takenOn, width, height,
  original_key as originalKey, original_size as originalSize,
  preview_key as previewKey, preview_size as previewSize,
  content_type as contentType, tags, published, sort_order as sortOrder`;

/** Public API shape — never leaks R2 keys. */
export function toPublicPhoto(row) {
  if (!row) return null;

  const width = row.width ?? 0;
  const height = row.height ?? 0;
  const aspect = width > 0 && height > 0 ? Number((width / height).toFixed(4)) : 0;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    collection: row.collection,
    takenOn: row.takenOn ?? undefined,
    width,
    height,
    aspect,
    preview: `/photos/p/${row.id}`,
    original: `/photos/o/${row.id}`,
    tags: parseJsonArray(row.tags),
  };
}

export async function listPhotos(db, { collection, includeUnpublished = false } = {}) {
  const where = [];
  const params = [];

  if (!includeUnpublished) where.push('published = 1');
  if (collection) {
    where.push('collection = ?');
    params.push(collection);
  }

  const filter = where.length > 0 ? ` where ${where.join(' and ')}` : '';
  const statement = db.prepare(
    `select ${COLUMNS} from photos${filter} order by sort_order asc, taken_on desc, created_at desc`
  );
  const { results } = await (params.length > 0 ? statement.bind(...params) : statement).all();

  return (results ?? []).map(toPublicPhoto);
}

export async function getPhotoRow(db, id) {
  return (await db.prepare(`select ${COLUMNS} from photos where id = ?`).bind(id).first()) ?? null;
}

export async function getPhoto(db, id) {
  return toPublicPhoto(await getPhotoRow(db, id));
}

export async function listCollections(db) {
  const { results } = await db
    .prepare(
      'select collection, count(*) as count from photos where published = 1 group by collection order by count desc, collection asc'
    )
    .all();

  return results ?? [];
}

export async function insertPhoto(db, photo) {
  await db
    .prepare(
      `insert into photos (
        id, title, description, collection, taken_on,
        width, height, original_key, original_size, preview_key, preview_size,
        content_type, tags, published, sort_order
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      photo.id,
      photo.title,
      photo.description ?? null,
      photo.collection,
      photo.takenOn ?? null,
      photo.width ?? 0,
      photo.height ?? 0,
      photo.originalKey,
      photo.originalSize ?? 0,
      photo.previewKey ?? null,
      photo.previewSize ?? 0,
      photo.contentType,
      toJsonArray(photo.tags),
      photo.published === false ? 0 : 1,
      photo.sortOrder ?? 0
    )
    .run();

  return getPhoto(db, photo.id);
}

/** Returns the R2 keys that became garbage after the delete. */
export async function removePhoto(db, id) {
  const row = await db
    .prepare('delete from photos where id = ? returning original_key as originalKey, preview_key as previewKey')
    .bind(id)
    .first();

  return row ?? null;
}
