-- FamilyFlow feature migration: calendar scheduling + weekly check-in ratings.
-- Run this in Supabase → SQL Editor after the initial schema.

-- ── Calendar: where a task sits on the weekly grid ──
-- Daily tasks use only cal_slot (shown every day). Weekly/yearly use cal_day + cal_slot.
alter table public.chores add column if not exists cal_day  text
  check (cal_day in ('mon','tue','wed','thu','fri','sat','sun'));
alter table public.chores add column if not exists cal_slot text
  check (cal_slot in ('morning','afternoon'));

-- ── Check-in: one star rating per task, per rater, per week ──
create table if not exists public.ratings (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  week_key    text not null,
  chore_id    uuid references public.chores(id) on delete set null,
  chore_title text,
  rater_id    uuid references public.members(id) on delete set null,
  ratee_id    uuid references public.members(id) on delete set null,
  stars       int not null check (stars between 1 and 5),
  created_at  timestamptz not null default now(),
  unique (family_id, week_key, chore_id, rater_id)
);
create index if not exists ratings_family_week_idx on public.ratings(family_id, week_key);

alter table public.ratings enable row level security;
create policy "ratings_select" on public.ratings for select using (family_id = public.current_family_id());
create policy "ratings_insert" on public.ratings for insert with check (family_id = public.current_family_id());
create policy "ratings_update" on public.ratings for update using (family_id = public.current_family_id());
create policy "ratings_delete" on public.ratings for delete using (family_id = public.current_family_id());

-- realtime
do $$ begin
  begin
    alter publication supabase_realtime add table public.ratings;
  exception when duplicate_object then null; when undefined_object then null; end;
end $$;
