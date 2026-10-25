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
  content_type as contentType, tags, published, sort_order as sortOrder,
  location_label as locationLabel, city, region, country, latitude, longitude, altitude,
  camera_make as cameraMake, camera_model as cameraModel, lens, f_number as fNumber,
  exposure_time as exposureTime, iso, focal_length as focalLength, metadata_source as metadataSource,
  watermark_id as watermarkId`;

const optional = (value) => value === null || value === undefined || value === '' ? undefined : value;

/** Public API shape — never leaks R2 keys. */
export function toPublicPhoto(row) {
  if (!row) return null;

  const width = row.width ?? 0;
  const height = row.height ?? 0;
  const aspect = width > 0 && height > 0 ? Number((width / height).toFixed(4)) : 0;

  const location = Object.fromEntries(Object.entries({
    label: optional(row.locationLabel), city: optional(row.city), region: optional(row.region),
    country: optional(row.country), latitude: optional(row.latitude), longitude: optional(row.longitude),
    altitude: optional(row.altitude),
  }).filter(([, value]) => value !== undefined));
  const camera = Object.fromEntries(Object.entries({
    make: optional(row.cameraMake), model: optional(row.cameraModel), lens: optional(row.lens),
    fNumber: optional(row.fNumber), exposureTime: optional(row.exposureTime), iso: optional(row.iso),
    focalLength: optional(row.focalLength),
  }).filter(([, value]) => value !== undefined));

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
    ...(Object.keys(location).length ? { location } : {}),
    ...(Object.keys(camera).length ? { camera } : {}),
    ...(row.metadataSource === 'exif' || row.metadataSource === 'manual' ? { metadataSource: row.metadataSource } : {}),
    ...(row.watermarkId ? { watermarkId: row.watermarkId } : {}),
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

export async function findPhotoByWatermark(db, watermarkId, collection) {
  const collectionFilter = collection ? ' and collection = ?' : '';
  const statement = db.prepare(`select ${COLUMNS} from photos where watermark_id = ? and published = 1${collectionFilter}`);
  const row = await (collection ? statement.bind(watermarkId, collection) : statement.bind(watermarkId)).first();
  return toPublicPhoto(row);
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
        content_type, tags, published, sort_order,
        location_label, city, region, country, latitude, longitude, altitude,
        camera_make, camera_model, lens, f_number, exposure_time, iso, focal_length, metadata_source, watermark_id
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      photo.sortOrder ?? 0,
      photo.locationLabel ?? null,
      photo.city ?? null,
      photo.region ?? null,
      photo.country ?? null,
      photo.latitude ?? null,
      photo.longitude ?? null,
      photo.altitude ?? null,
      photo.cameraMake ?? null,
      photo.cameraModel ?? null,
      photo.lens ?? null,
      photo.fNumber ?? null,
      photo.exposureTime ?? null,
      photo.iso ?? null,
      photo.focalLength ?? null,
      photo.metadataSource ?? null,
      photo.watermarkId ?? null
    )
    .run();

  return getPhoto(db, photo.id);
}

export async function getGeocodeCache(db, key) {
  return (await db.prepare(
    'select cache_key as cacheKey, label, city, region, country, provider, created_at as createdAt from photo_geocodes where cache_key = ?'
  ).bind(key).first()) ?? null;
}

export async function putGeocodeCache(db, key, record) {
  await db.prepare(`insert into photo_geocodes (cache_key, label, city, region, country, provider, created_at)
    values (?, ?, ?, ?, ?, ?, ?)
    on conflict(cache_key) do update set label = excluded.label, city = excluded.city,
      region = excluded.region, country = excluded.country, provider = excluded.provider, created_at = excluded.created_at`)
    .bind(key, record.label ?? null, record.city ?? null, record.region ?? null, record.country ?? null,
      record.provider ?? null, record.createdAt ?? new Date().toISOString()).run();
}

/** Returns the R2 keys that became garbage after the delete. */
export async function removePhoto(db, id) {
  const row = await db
    .prepare('delete from photos where id = ? returning original_key as originalKey, preview_key as previewKey')
    .bind(id)
    .first();

  return row ?? null;
}
