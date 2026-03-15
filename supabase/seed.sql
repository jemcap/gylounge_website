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
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    current_date + 1,
    time '09:00',
    time '10:00',
    10
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    current_date + 1,
    time '10:00',
    time '11:00',
    6
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '11111111-1111-1111-1111-111111111111',
    current_date + 2,
    time '14:00',
    time '15:00',
    4
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '22222222-2222-2222-2222-222222222222',
    current_date + 2,
    time '09:00',
    time '10:00',
    8
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    current_date + 4,
    time '14:00',
    time '15:00',
    7
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3',
    '22222222-2222-2222-2222-222222222222',
    current_date + 4,
    time '16:00',
    time '17:00',
    3
  )
on conflict (id) do update
set
  location_id = excluded.location_id,
  date = excluded.date,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  available_spots = excluded.available_spots;

commit;
