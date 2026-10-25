alter table photos add column location_label text;
alter table photos add column city text;
alter table photos add column region text;
alter table photos add column country text;
alter table photos add column latitude real;
alter table photos add column longitude real;
alter table photos add column altitude real;
alter table photos add column camera_make text;
alter table photos add column camera_model text;
alter table photos add column lens text;
alter table photos add column f_number real;
alter table photos add column exposure_time text;
alter table photos add column iso integer;
alter table photos add column focal_length real;
alter table photos add column metadata_source text;

create table if not exists photo_geocodes (
  cache_key text primary key,
  label text,
  city text,
  region text,
  country text,
  provider text,
  created_at text not null default (datetime('now'))
);

create index if not exists photos_place_idx on photos (country, region, city);
