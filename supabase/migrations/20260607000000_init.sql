-- FamilyFlow schema: families, members, profiles, chores, battles.
-- Multi-tenant via RLS keyed on the caller's family. Create/join go through
-- SECURITY DEFINER RPCs so an invite code can be redeemed before you're a member.

create extension if not exists pgcrypto;

-- ───────────────────────────── tables ─────────────────────────────
create table if not exists public.families (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  invite_code  text not null unique,
  weekly_stake jsonb,
  created_at   timestamptz not null default now()
);

create table if not exists public.members (
  id         uuid primary key default gen_random_uuid(),
  family_id  uuid not null references public.families(id) on delete cascade,
  name       text not null,
  color      text not null default '#6E668F',
  emoji      text not null default '🙂',
  work_pct   int  not null default 50,
  user_id    uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- one row per auth user: which family they belong to + which member they act as
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  family_id        uuid references public.families(id) on delete set null,
  active_member_id uuid references public.members(id) on delete set null,
  created_at       timestamptz not null default now()
);

create table if not exists public.chores (
  id                   uuid primary key default gen_random_uuid(),
  family_id            uuid not null references public.families(id) on delete cascade,
  title                text not null,
  frequency            text not null check (frequency in ('daily','weekly','yearly')),
  domain               text not null check (domain in ('household','baby','admin','social')),
  assignee_id          uuid references public.members(id) on delete set null,
  is_custom            boolean not null default false,
  last_completed_period text,
  completed_by         uuid references public.members(id) on delete set null,
  created_at           timestamptz not null default now()
);

create table if not exists public.battles (
  id                uuid primary key default gen_random_uuid(),
  family_id         uuid not null references public.families(id) on delete cascade,
  week_key          text,
  stake_chore_title text,
  winner_id         uuid references public.members(id) on delete set null,
  loser_id          uuid references public.members(id) on delete set null,
  scores            jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists chores_family_idx  on public.chores(family_id);
create index if not exists members_family_idx on public.members(family_id);
create index if not exists battles_family_idx on public.battles(family_id);

-- ──────────────────────── helper + seeding ────────────────────────
-- caller's family id (SECURITY DEFINER so it can read profiles under RLS)
create or replace function public.current_family_id()
returns uuid language sql stable security definer set search_path = public as $$
  select family_id from public.profiles where id = auth.uid();
$$;

create or replace function public.seed_default_chores(p_family_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.chores (family_id, title, frequency, domain) values
    (p_family_id,'Make the bed','daily','household'),
    (p_family_id,'Tidy living room','daily','household'),
    (p_family_id,'Wash dishes','daily','household'),
    (p_family_id,'Take out bins','daily','household'),
    (p_family_id,'Morning feed','daily','baby'),
    (p_family_id,'Nappy changes','daily','baby'),
    (p_family_id,'Bedtime routine','daily','baby'),
    (p_family_id,'Nap check','daily','baby'),
    (p_family_id,'Couple check-in','daily','social'),
    (p_family_id,'Vacuum and mop','weekly','household'),
    (p_family_id,'Bathroom clean','weekly','household'),
    (p_family_id,'Laundry','weekly','household'),
    (p_family_id,'Grocery shop','weekly','household'),
    (p_family_id,'Prep baby food','weekly','baby'),
    (p_family_id,'Wash baby clothes','weekly','baby'),
    (p_family_id,'Check bank account','weekly','admin'),
    (p_family_id,'Reply to messages','weekly','admin'),
    (p_family_id,'Family video call','weekly','social'),
    (p_family_id,'Date night plan','weekly','social'),
    (p_family_id,'Deep clean','yearly','household'),
    (p_family_id,'Service boiler','yearly','household'),
    (p_family_id,'Paediatrician visit','yearly','baby'),
    (p_family_id,'Vaccinations','yearly','baby'),
    (p_family_id,'Tax return','yearly','admin'),
    (p_family_id,'Insurance renewal','yearly','admin'),
    (p_family_id,'Renew documents','yearly','admin'),
    (p_family_id,'Holiday planning','yearly','social'),
    (p_family_id,'Birthday calendar','yearly','social');
end; $$;

-- ─────────────────────── create / join RPCs ───────────────────────
create or replace function public.create_family(
  p_family_name text, p_member_name text, p_color text, p_emoji text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_family_id uuid; v_member_id uuid; v_code text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  v_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  insert into public.families(name, invite_code) values (p_family_name, v_code)
    returning id into v_family_id;
  insert into public.members(family_id, name, color, emoji, user_id)
    values (v_family_id, p_member_name, coalesce(p_color,'#6E668F'), coalesce(p_emoji,'🙂'), auth.uid())
    returning id into v_member_id;
  insert into public.profiles(id, family_id, active_member_id)
    values (auth.uid(), v_family_id, v_member_id)
    on conflict (id) do update set family_id = excluded.family_id,
                                   active_member_id = excluded.active_member_id;
  perform public.seed_default_chores(v_family_id);
  return v_family_id;
end; $$;

create or replace function public.join_family(
  p_code text, p_member_name text, p_color text, p_emoji text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_family_id uuid; v_member_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into v_family_id from public.families where invite_code = upper(trim(p_code));
  if v_family_id is null then raise exception 'invalid invite code'; end if;
  insert into public.members(family_id, name, color, emoji, user_id)
    values (v_family_id, p_member_name, coalesce(p_color,'#6E668F'), coalesce(p_emoji,'🙂'), auth.uid())
    returning id into v_member_id;
  insert into public.profiles(id, family_id, active_member_id)
    values (auth.uid(), v_family_id, v_member_id)
    on conflict (id) do update set family_id = excluded.family_id,
                                   active_member_id = excluded.active_member_id;
  return v_family_id;
end; $$;

grant execute on function public.create_family(text,text,text,text) to authenticated;
grant execute on function public.join_family(text,text,text,text)  to authenticated;
grant execute on function public.current_family_id()                to authenticated;

-- ──────────────────────────── RLS ─────────────────────────────────
alter table public.families enable row level security;
alter table public.members  enable row level security;
alter table public.profiles enable row level security;
alter table public.chores   enable row level security;
alter table public.battles  enable row level security;

-- profiles: only your own row
create policy "profiles_self_select" on public.profiles for select using (id = auth.uid());
create policy "profiles_self_insert" on public.profiles for insert with check (id = auth.uid());
create policy "profiles_self_update" on public.profiles for update using (id = auth.uid());

-- families: only your family
create policy "families_select" on public.families for select using (id = public.current_family_id());
create policy "families_update" on public.families for update using (id = public.current_family_id());

-- members / chores / battles: scoped to your family for all ops
create policy "members_select" on public.members for select using (family_id = public.current_family_id());
create policy "members_insert" on public.members for insert with check (family_id = public.current_family_id());
create policy "members_update" on public.members for update using (family_id = public.current_family_id());
create policy "members_delete" on public.members for delete using (family_id = public.current_family_id());

create policy "chores_select" on public.chores for select using (family_id = public.current_family_id());
create policy "chores_insert" on public.chores for insert with check (family_id = public.current_family_id());
create policy "chores_update" on public.chores for update using (family_id = public.current_family_id());
create policy "chores_delete" on public.chores for delete using (family_id = public.current_family_id());

create policy "battles_select" on public.battles for select using (family_id = public.current_family_id());
create policy "battles_insert" on public.battles for insert with check (family_id = public.current_family_id());
create policy "battles_delete" on public.battles for delete using (family_id = public.current_family_id());

-- ─────────────────────────── realtime ─────────────────────────────
-- Add each table to the realtime publication, ignoring "already a member".
do $$
declare t text;
begin
  foreach t in array array['chores','members','battles','families'] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null; -- already published
      when undefined_object then null; -- publication missing (rare); skip
    end;
  end loop;
end $$;
