begin;

alter table public.members
  drop constraint if exists members_birthday_check;

alter table public.members
  add constraint members_birthday_check
    check (birthday::date <= ((created_at at time zone 'UTC')::date)) not valid;

comment on constraint members_birthday_check on public.members is
  'Birthday must not be later than the row creation date (UTC), aligning DB writes with the app''s non-future birthday validation.';

commit;
