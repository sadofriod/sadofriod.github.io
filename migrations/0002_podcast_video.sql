-- Video companion for a podcast episode (audio stays required).
-- Objects already sitting in the bucket (e.g. S01E01.mp4) are referenced by key.

alter table podcast_episodes add column video_key text;
alter table podcast_episodes add column video_size integer not null default 0;
alter table podcast_episodes add column video_type text;
