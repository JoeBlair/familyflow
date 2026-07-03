-- Custom recurrence: "every N days/weeks/months" or "on specific weekdays".
-- Stored as a small JSON object on the chore. Widen the frequency constraint.
-- Run in Supabase → SQL Editor.
--   { "every": 2, "unit": "week" }            -- every 2 weeks
--   { "weekdays": ["mon","wed","fri"] }        -- weekly on Mon/Wed/Fri

alter table public.chores add column if not exists recurrence jsonb;

alter table public.chores drop constraint if exists chores_frequency_check;
alter table public.chores
  add constraint chores_frequency_check
  check (frequency in ('once', 'daily', 'weekly', 'monthly', 'yearly', 'custom'));
