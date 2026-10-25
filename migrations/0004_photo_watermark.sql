alter table photos add column watermark_id text;
create index if not exists photos_watermark_idx on photos (watermark_id);
