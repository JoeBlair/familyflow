-- Account deletion (App Store guideline 5.1.1(v): an app that creates accounts
-- must let users delete them in-app).
--
-- SECURITY DEFINER so it can remove the caller's auth.users row (and, via the
-- profiles FK, their profile). It also removes the member row(s) linked to this
-- login, and tears down the family entirely if no members remain — which
-- cascades that family's chores and battles.

create or replace function public.delete_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  v_uid    uuid := auth.uid();
  v_family uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;

  select family_id into v_family from public.profiles where id = v_uid;

  -- Remove the member row(s) this login owns.
  delete from public.members where user_id = v_uid;

  -- If that emptied the family, remove it (cascades chores + battles + members).
  if v_family is not null
     and not exists (select 1 from public.members where family_id = v_family) then
    delete from public.families where id = v_family;
  end if;

  -- Finally delete the auth user; the profiles row cascades from this.
  delete from auth.users where id = v_uid;
end; $$;

grant execute on function public.delete_account() to authenticated;
