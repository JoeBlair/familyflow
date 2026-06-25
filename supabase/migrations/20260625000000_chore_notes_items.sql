-- Per-chore notes + a checklist (grocery-style items). Items are stored as JSON
-- on the chore so they sync over the existing chores realtime channel — no new
-- table or RLS needed. Run in Supabase → SQL Editor.

alter table public.chores
  add column if not exists notes text,
  add column if not exists items jsonb not null default '[]'::jsonb;
