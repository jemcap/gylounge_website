create table if not exists public.booking_requests (
  idempotency_key text primary key,
  booking_id uuid null references public.bookings(id) on delete set null,
  member_id uuid not null references public.members(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  slot_id uuid not null references public.slots(id) on delete cascade,
  status text not null default 'in_progress',
  created_at timestamptz not null default timezone('utc'::text, now()),
  constraint booking_requests_status_check
    check (status in ('in_progress', 'completed'))
);

create index if not exists booking_requests_member_slot_idx
  on public.booking_requests(member_id, slot_id);

create index if not exists booking_requests_status_idx
  on public.booking_requests(status);

comment on table public.booking_requests is
  'Tracks public booking idempotency keys so retried submissions do not repeat slot-capacity or email side effects.';
