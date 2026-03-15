begin;

alter table public.members
  drop constraint if exists members_status_check;

alter table public.members
  add constraint members_status_check
    check (status is null or status in ('pending', 'active')) not valid;

comment on constraint members_status_check on public.members is
  'Member status must be null, pending, or active.';

commit;
