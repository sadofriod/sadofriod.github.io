/**
 * Postgres-backed storage for podcast episodes. Audio and cover bytes stay in
 * the PODCASTS R2 bucket; only metadata and object keys live in Postgres.
 * Every function takes the `sql` client so the same SQL can be exercised
 * against a throwaway Postgres (see scripts/test-db-stores.mjs).
 */

const SELECT = `select
    id,
    title,
    to_char(published_on, 'YYYY-MM-DD') as date,
    description,
    duration,
    audio_key as "audioKey",
    audio_size as "audioSize",
    audio_type as "audioType",
    cover_key as "coverKey",
    author,
    episode_number as "episodeNumber",
    season,
    keywords,
    explicit
  from podcast_episodes`;

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
      keywords: row.keywords ?? [],
      explicit: row.explicit ?? false,
    },
  };
}

export async function listPodcasts(sql) {
  const rows = await sql.unsafe(`${SELECT} order by published_on desc, created_at desc`);
  return rows.map(toRecord);
}

export async function getPodcastRow(sql, id) {
  const rows = await sql.unsafe(`${SELECT} where id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getPodcast(sql, id) {
  return toRecord(await getPodcastRow(sql, id));
}

export async function insertPodcast(sql, record) {
  const rows = await sql`
    insert into podcast_episodes (
      id, title, published_on, description, duration,
      audio_key, audio_size, audio_type, cover_key,
      author, episode_number, season, keywords, explicit
    ) values (
      ${record.id}, ${record.title}, ${record.date}::date, ${record.description}, ${record.duration},
      ${record.audioKey}, ${record.audioSize}, ${record.audioType}, ${record.coverKey ?? null},
      ${record.author ?? null}, ${record.episodeNumber ?? null}, ${record.season ?? null},
      ${record.keywords ?? []}, ${record.explicit ?? false}
    )
    returning id`;

  return getPodcast(sql, rows[0].id);
}

export async function updatePodcastRow(sql, id, patch) {
  const current = await getPodcastRow(sql, id);
  if (!current) return null;

  const next = { ...current, ...patch };

  await sql`
    update podcast_episodes set
      title = ${next.title},
      published_on = ${next.date}::date,
      description = ${next.description},
      duration = ${next.duration},
      audio_key = ${next.audioKey},
      audio_size = ${next.audioSize},
      audio_type = ${next.audioType},
      cover_key = ${next.coverKey ?? null},
      author = ${next.author ?? null},
      episode_number = ${next.episodeNumber ?? null},
      season = ${next.season ?? null},
      keywords = ${next.keywords ?? []},
      explicit = ${next.explicit ?? false},
      updated_at = now()
    where id = ${id}`;

  return getPodcast(sql, id);
}

/** Returns the R2 keys that became garbage after the delete. */
export async function removePodcast(sql, id) {
  const rows = await sql.unsafe(
    'delete from podcast_episodes where id = $1 returning audio_key as "audioKey", cover_key as "coverKey"',
    [id]
  );

  return rows[0] ?? null;
}
