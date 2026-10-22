-- D1 (SQLite) schema for podcast episodes + the photography catalog.
-- Media bytes live in R2; these tables hold metadata and object keys.
-- Applied with `wrangler d1 migrations apply` (or `pnpm db:migrate`).

create table if not exists podcast_episodes (
  id             text primary key,
  title          text    not null,
  published_on   text    not null,                     -- YYYY-MM-DD
  description    text    not null default '',
  duration       text    not null default '',
  audio_key      text    not null,
  audio_size     integer not null default 0,
  audio_type     text    not null default 'audio/mpeg',
  cover_key      text,
  author         text,
  episode_number integer,
  season         integer,
  keywords       text    not null default '[]',        -- JSON array of strings
  explicit       integer not null default 0,
  created_at     text    not null default (datetime('now')),
  updated_at     text    not null default (datetime('now'))
);

create index if not exists podcast_episodes_published_idx
  on podcast_episodes (published_on desc, created_at desc);

create table if not exists photos (
  id            text    primary key,
  title         text    not null default '',
  description   text,
  collection    text    not null default 'uncategorized',
  taken_on      text,
  width         integer not null default 0,
  height        integer not null default 0,
  original_key  text    not null,
  original_size integer not null default 0,
  preview_key   text,
  preview_size  integer not null default 0,
  content_type  text    not null default 'image/jpeg',
  tags          text    not null default '[]',         -- JSON array of strings
  published     integer not null default 1,
  sort_order    integer not null default 0,
  created_at    text    not null default (datetime('now'))
);

create index if not exists photos_collection_idx
  on photos (collection, taken_on desc, created_at desc);

create index if not exists photos_published_idx
  on photos (published, sort_order, created_at desc);
