alter table public.bookings
  add column if not exists guest_count integer not null default 1;

comment on column public.bookings.guest_count is
  'Number of guests included with the booking. Defaults to 1 for historical rows.';
