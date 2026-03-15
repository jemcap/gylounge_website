begin;

alter table public.members
  drop constraint if exists members_birthday_check;

alter table public.members
  add constraint members_birthday_check
    check (
      birthday ~ '^\d{4}-\d{2}-\d{2}$'
      and to_char(to_date(birthday, 'YYYY-MM-DD'), 'YYYY-MM-DD') = birthday
      and to_date(birthday, 'YYYY-MM-DD') <= coalesce((created_at at time zone 'UTC')::date, to_date(birthday, 'YYYY-MM-DD'))
    ) not valid;

comment on constraint members_birthday_check on public.members is
  'Birthday is stored as an ISO YYYY-MM-DD string and must not be later than the row creation date (UTC).';

commit;
