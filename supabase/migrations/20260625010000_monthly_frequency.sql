-- Add a 'monthly' chore frequency (between weekly and yearly). Widen the
-- frequency check constraint. Run in Supabase → SQL Editor.

alter table public.chores drop constraint if exists chores_frequency_check;
alter table public.chores
  add constraint chores_frequency_check
  check (frequency in ('daily', 'weekly', 'monthly', 'yearly'));
