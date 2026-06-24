-- Stop auto-seeding 28 chores into every new family. New families now pick their
-- own chores from a suggested list in the app (ChoreSetupScreen). This redefines
-- create_family to drop the seed_default_chores call; everything else is unchanged.
-- (seed_default_chores is left in place but no longer called.)
-- Run in Supabase → SQL Editor.

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
  return v_family_id;
end; $$;
