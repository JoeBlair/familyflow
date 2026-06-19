-- Check-in: add a 3-state status alongside the star rating.
-- Run in Supabase → SQL Editor after the calendar/check-in migration.

alter table public.ratings
  add column if not exists status text check (status in ('done', 'undone', 'not_completed'));

-- stars are now optional (a status can be set without a star rating)
alter table public.ratings alter column stars drop not null;
