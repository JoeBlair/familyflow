-- Custom "every N days" frequency. Adds an interval column and widens the
-- frequency check constraint. Run in Supabase → SQL Editor.

alter table public.chores add column if not exists interval_days int;

alter table public.chores drop constraint if exists chores_frequency_check;
alter table public.chores
  add constraint chores_frequency_check
  check (frequency in ('once', 'daily', 'weekly', 'monthly', 'yearly', 'custom'));
