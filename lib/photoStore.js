/**
 * Postgres-backed photography catalog. Image bytes live in the PHOTOS R2 bucket
 * (`photos/originals/...`); this module only stores metadata and object keys.
 */

const SELECT = `select
    id,
    title,
    description,
    collection,
    to_char(taken_on, 'YYYY-MM-DD') as "takenOn",
    width,
    height,
    original_key as "originalKey",
    original_size as "originalSize",
    content_type as "contentType",
    tags,
    published,
    sort_order as "sortOrder"
  from photos`;

/** Public API shape — never leaks R2 keys. */
export function toPublicPhoto(row) {
  if (!row) return null;

  const aspect = row.width > 0 && row.height > 0 ? Number((row.width / row.height).toFixed(4)) : 0;

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    collection: row.collection,
    takenOn: row.takenOn ?? undefined,
    width: row.width,
    height: row.height,
    aspect,
    preview: `/photos/p/${row.id}`,
    original: `/photos/o/${row.id}`,
    tags: row.tags ?? [],
  };
}

export async function listPhotos(sql, { collection, includeUnpublished = false } = {}) {
  const filters = [];
  const params = [];

  if (!includeUnpublished) filters.push('published = true');
  if (collection) {
    params.push(collection);
    filters.push(`collection = $${params.length}`);
  }

  const where = filters.length > 0 ? ` where ${filters.join(' and ')}` : '';
  const rows = await sql.unsafe(`${SELECT}${where} order by sort_order asc, taken_on desc nulls last, created_at desc`, params);

  return rows.map(toPublicPhoto);
}

export async function getPhotoRow(sql, id) {
  const rows = await sql.unsafe(`${SELECT} where id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getPhoto(sql, id) {
  return toPublicPhoto(await getPhotoRow(sql, id));
}

export async function listCollections(sql) {
  const rows = await sql.unsafe(
    'select collection, count(*)::int as count from photos where published = true group by collection order by count desc, collection asc'
  );

  return rows;
}

export async function insertPhoto(sql, photo) {
  const rows = await sql`
    insert into photos (
      id, title, description, collection, taken_on,
      width, height, original_key, original_size, content_type,
      tags, published, sort_order
    ) values (
      ${photo.id}, ${photo.title}, ${photo.description ?? null}, ${photo.collection}, ${photo.takenOn ?? null}::date,
      ${photo.width ?? 0}, ${photo.height ?? 0}, ${photo.originalKey}, ${photo.originalSize ?? 0}, ${photo.contentType},
      ${photo.tags ?? []}, ${photo.published ?? true}, ${photo.sortOrder ?? 0}
    )
    returning id`;

  return getPhoto(sql, rows[0].id);
}

/** Returns the R2 key that became garbage after the delete. */
export async function removePhoto(sql, id) {
  const rows = await sql.unsafe('delete from photos where id = $1 returning original_key as "originalKey"', [id]);
  return rows[0] ?? null;
}
