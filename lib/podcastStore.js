/**
 * Podcast episodes in D1 (SQLite). Audio and cover bytes stay in the PODCASTS R2
 * bucket; only metadata and object keys live here.
 */
import { parseJsonArray, toJsonArray } from './db.js';

const COLUMNS = `id, title, published_on as date, description, duration,
  audio_key as audioKey, audio_size as audioSize, audio_type as audioType,
  cover_key as coverKey, author, episode_number as episodeNumber, season,
  keywords, explicit`;

const mediaUrl = (key) => (key ? `/podcast-media/${encodeURIComponent(key)}` : '');

/** Shape a row into the API record the client pages already consume. */
export function toRecord(row) {
  if (!row) return null;

  return {
    id: row.id,
    metadata: {
      title: row.title,
      date: row.date,
      description: row.description,
      duration: row.duration,
      audioUrl: mediaUrl(row.audioKey),
      audioSize: Number(row.audioSize ?? 0),
      audioType: row.audioType || 'audio/mpeg',
      image: mediaUrl(row.coverKey) || undefined,
      author: row.author ?? undefined,
      episodeNumber: row.episodeNumber ?? undefined,
      season: row.season ?? undefined,
      keywords: parseJsonArray(row.keywords),
      explicit: Boolean(row.explicit),
    },
  };
}

export async function listPodcasts(db) {
  const { results } = await db
    .prepare(`select ${COLUMNS} from podcast_episodes order by published_on desc, created_at desc`)
    .all();

  return (results ?? []).map(toRecord);
}

export async function getPodcastRow(db, id) {
  return (await db.prepare(`select ${COLUMNS} from podcast_episodes where id = ?`).bind(id).first()) ?? null;
}

export async function getPodcast(db, id) {
  return toRecord(await getPodcastRow(db, id));
}

export async function insertPodcast(db, record) {
  await db
    .prepare(
      `insert into podcast_episodes (
        id, title, published_on, description, duration,
        audio_key, audio_size, audio_type, cover_key,
        author, episode_number, season, keywords, explicit
      ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      record.id,
      record.title,
      record.date,
      record.description,
      record.duration,
      record.audioKey,
      record.audioSize ?? 0,
      record.audioType ?? 'audio/mpeg',
      record.coverKey ?? null,
      record.author ?? null,
      record.episodeNumber ?? null,
      record.season ?? null,
      toJsonArray(record.keywords),
      record.explicit ? 1 : 0
    )
    .run();

  return getPodcast(db, record.id);
}

export async function updatePodcastRow(db, id, patch) {
  const current = await getPodcastRow(db, id);
  if (!current) return null;

  const next = { ...current, ...patch };
  // current.keywords is the raw JSON text column; patch.keywords is an array.
  // Normalise here or the second write double-encodes it.
  const keywords = patch.keywords !== undefined ? patch.keywords : parseJsonArray(current.keywords);

  await db
    .prepare(
      `update podcast_episodes set
        title = ?, published_on = ?, description = ?, duration = ?,
        audio_key = ?, audio_size = ?, audio_type = ?, cover_key = ?,
        author = ?, episode_number = ?, season = ?, keywords = ?, explicit = ?,
        updated_at = datetime('now')
      where id = ?`
    )
    .bind(
      next.title,
      next.date,
      next.description,
      next.duration,
      next.audioKey,
      next.audioSize ?? 0,
      next.audioType ?? 'audio/mpeg',
      next.coverKey ?? null,
      next.author ?? null,
      next.episodeNumber ?? null,
      next.season ?? null,
      toJsonArray(keywords),
      next.explicit ? 1 : 0,
      id
    )
    .run();

  return getPodcast(db, id);
}

/** Returns the R2 keys that became garbage after the delete. */
export async function removePodcast(db, id) {
  const row = await db
    .prepare('delete from podcast_episodes where id = ? returning audio_key as audioKey, cover_key as coverKey')
    .bind(id)
    .first();

  return row ?? null;
}
