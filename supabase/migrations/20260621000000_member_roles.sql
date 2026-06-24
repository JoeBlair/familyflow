-- Member roles: family member (default), child, or home help (cleaner/nanny).
-- Children and home help can be assigned chores but are excluded from the
-- adult fairness charts; home help is also excluded from check-in & the forfeit.
-- Run in Supabase → SQL Editor.

alter table public.members
  add column if not exists role text not null default 'member'
  check (role in ('member', 'child', 'helper'));
