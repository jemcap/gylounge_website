begin;

insert into public.locations (
  id,
  name,
  address,
  region,
  description,
  image_url
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Accra Community Center',
    '123 Independence Ave, Accra',
    'Greater Accra',
    'Demo location seeded for repeatable booking availability tests.',
    null
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Kumasi Senior Hub',
    '45 Prempeh Street, Kumasi',
    'Ashanti',
    'Demo location seeded for repeatable booking availability tests.',
    null
  )
on conflict (id) do update
set
  name = excluded.name,
  address = excluded.address,
  region = excluded.region,
  description = excluded.description,
  image_url = excluded.image_url;

insert into public.slots (
  id,
  location_id,
  date,
  start_time,
  end_time,
  available_spots
)
with seeded_locations as (
  select id
  from public.locations
  where id in (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222'
  )
),
seed_dates as (
  select (current_date + day_offset)::date as slot_date
  from generate_series(0, 14) as day_offset
),
seed_hours as (
  select make_time(hour_of_day, 0, 0) as slot_start
  from generate_series(8, 21) as hour_of_day
),
seed_rows as (
  select
    location.id as location_id,
    dates.slot_date as date,
    hours.slot_start as start_time,
    (hours.slot_start + interval '1 hour')::time as end_time,
    md5(
      location.id || '|' || dates.slot_date::text || '|' || hours.slot_start::text
    ) as slot_hash
  from seeded_locations as location
  cross join seed_dates as dates
  cross join seed_hours as hours
)
select
  (
    substr(slot_hash, 1, 8) || '-' ||
    substr(slot_hash, 9, 4) || '-' ||
    substr(slot_hash, 13, 4) || '-' ||
    substr(slot_hash, 17, 4) || '-' ||
    substr(slot_hash, 21, 12)
  )::uuid,
  location_id,
  date,
  start_time,
  end_time,
  10
from seed_rows
on conflict (id) do update
set
  location_id = excluded.location_id,
  date = excluded.date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  available_spots = excluded.available_spots;

commit;
