begin;

-- Move location-level presentation fields off the old events table.
alter table public.locations
  add column if not exists description text;

alter table public.locations
  add column if not exists image_url text;

-- Introduce the new booking model columns.
alter table public.slots
  add column if not exists location_id uuid,
  add column if not exists date date;

alter table public.bookings
  add column if not exists location_id uuid;

-- Backfill location presentation fields from the most recent event per location.
do $$
begin
  if to_regclass('public.events') is not null then
    execute $sql$
      with ranked_events as (
        select
          e.location_id,
          e.description,
          e.image_url,
          row_number() over (
            partition by e.location_id
            order by e.created_at desc nulls last, e.date desc nulls last, e.id desc
          ) as row_num
        from public.events e
        where e.location_id is not null
      )
      update public.locations l
      set
        description = coalesce(l.description, ranked_events.description),
        image_url = coalesce(l.image_url, ranked_events.image_url)
      from ranked_events
      where ranked_events.row_num = 1
        and ranked_events.location_id = l.id
    $sql$;
  end if;
end
$$;

-- Backfill the new slot columns from the old event relationship.
do $$
declare
  has_events_table boolean := to_regclass('public.events') is not null;
  has_slots_event_id boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'slots'
      and column_name = 'event_id'
  )
  into has_slots_event_id;

  if has_events_table and has_slots_event_id then
    execute $sql$
      update public.slots s
      set
        location_id = coalesce(s.location_id, e.location_id),
        date = coalesce(s.date, e.date)
      from public.events e
      where s.event_id = e.id
    $sql$;
  end if;
end
$$;

-- Backfill booking.location_id from the migrated slots first.
update public.bookings b
set location_id = coalesce(b.location_id, s.location_id)
from public.slots s
where b.slot_id = s.id;

-- Fall back to the legacy event link if any bookings still need a location.
do $$
declare
  has_events_table boolean := to_regclass('public.events') is not null;
  has_bookings_event_id boolean;
begin
  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'bookings'
      and column_name = 'event_id'
  )
  into has_bookings_event_id;

  if has_events_table and has_bookings_event_id then
    execute $sql$
      update public.bookings b
      set location_id = coalesce(b.location_id, e.location_id)
      from public.events e
      where b.event_id = e.id
    $sql$;
  end if;
end
$$;

-- Standardize capacity around the new fixed size of 10 while preserving already-booked rows.
update public.slots
set available_spots = greatest(0, least(coalesce(available_spots, 10), 10))
where available_spots is distinct from greatest(0, least(coalesce(available_spots, 10), 10));

alter table public.slots
  alter column available_spots set default 10;

-- Hide legacy slots that do not match the new hourly-booking policy.
update public.slots
set available_spots = 0
where not (
  start_time::time >= time '08:00'
  and end_time::time <= time '22:00'
  and start_time::time < end_time::time
  and end_time::time = (start_time::time + interval '1 hour')::time
  and extract(minute from start_time::time) = 0
  and extract(second from start_time::time) = 0
  and extract(minute from end_time::time) = 0
  and extract(second from end_time::time) = 0
);

-- Abort before destructive changes if any rows could not be migrated cleanly.
do $$
begin
  if exists (
    select 1
    from public.slots
    where location_id is null
       or date is null
  ) then
    raise exception
      'Cannot finalize location-booking migration: some slots are missing location_id or date after backfill.';
  end if;

  if exists (
    select 1
    from public.bookings
    where location_id is null
  ) then
    raise exception
      'Cannot finalize location-booking migration: some bookings are missing location_id after backfill.';
  end if;
end
$$;

-- Replace old foreign keys with the new location-based relationships.
alter table public.bookings
  drop constraint if exists bookings_event_id_fkey,
  drop constraint if exists bookings_location_id_fkey;

alter table public.slots
  drop constraint if exists slots_event_id_fkey,
  drop constraint if exists slots_location_id_fkey;

alter table public.slots
  alter column location_id set not null,
  alter column date set not null;

alter table public.bookings
  alter column location_id set not null;

alter table public.bookings
  add constraint bookings_location_id_fkey
    foreign key (location_id) references public.locations(id) on delete cascade;

alter table public.slots
  add constraint slots_location_id_fkey
    foreign key (location_id) references public.locations(id) on delete cascade;

-- Enforce the new slot policy: hourly slots, 08:00 opening, 22:00 closing, capacity capped at 10.
alter table public.slots
  drop constraint if exists slots_available_spots_range,
  drop constraint if exists slots_hourly_window_check;

alter table public.slots
  add constraint slots_available_spots_range
    check (available_spots between 0 and 10),
  add constraint slots_hourly_window_check
    check (
      start_time::time >= time '08:00'
      and end_time::time <= time '22:00'
      and start_time::time < end_time::time
      and end_time::time = (start_time::time + interval '1 hour')::time
      and extract(minute from start_time::time) = 0
      and extract(second from start_time::time) = 0
      and extract(minute from end_time::time) = 0
      and extract(second from end_time::time) = 0
    ) not valid;

create index if not exists bookings_location_id_idx
  on public.bookings(location_id);

create index if not exists slots_location_date_idx
  on public.slots(location_id, date);

create unique index if not exists slots_location_date_start_time_key
  on public.slots(location_id, date, start_time);

-- Remove the legacy event-based schema once the new model is in place.
alter table public.bookings
  drop column if exists event_id;

alter table public.slots
  drop column if exists event_id;

drop table if exists public.events;

comment on table public.slots is
  'Location-based dated booking slots. Active model expects hourly availability between 08:00 and 22:00 with default capacity 10.';

commit;
