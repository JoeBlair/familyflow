# Connecting FamilyFlow to Supabase

FamilyFlow now uses Supabase for accounts and real-time, cross-device sync. You need a
free Supabase project. ~5 minutes.

## 1. Create the project
1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a name and a database password (save it). Wait for it to provision.

## 2. Create the database schema
1. In the project, open **SQL Editor** → **New query**.
2. Paste the entire contents of `supabase/migrations/20260607000000_init.sql` and **Run**.
   This creates the tables, security policies (RLS), the create/join functions, default-chore
   seeding, and enables Realtime.

   (CLI alternative, no Docker needed: `supabase link --project-ref <ref>` then
   `supabase db push`.)

## 3. Get your keys
**Project Settings → API**, copy:
- **Project URL** (e.g. `https://abcd1234.supabase.co`)
- **anon / public** key (a long JWT) — safe to ship in the app; security is enforced by RLS.

## 4. Put the keys in the app
Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
(or edit the fallbacks in `src/supabase/config.js` directly). Restart `npx expo start` so the
env vars load.

## 5. (For easy testing) turn off email confirmation
**Authentication → Providers → Email** → turn **Confirm email** OFF while testing, so signing up
logs you straight in. Turn it back on before going live.

## Feature migrations (run when new features need them)

When new features are added that need schema changes, run their migration the same way
(SQL Editor → paste → Run). Current ones:

- **Calendar + Check-in** — `supabase/migrations/20260608000000_calendar_checkin.sql`
  (adds `cal_day`/`cal_slot` to chores and a `ratings` table). Run before using the
  Calendar and Check-in tabs.
- **Check-in status** — `supabase/migrations/20260608010000_checkin_status.sql`
  (adds a `status` column to `ratings` and makes `stars` optional). Run before using the
  Done / Undone / Not completed statuses on the Check-in tab.

## Try it
- Sign up on one device → **Create family** → you're in, with the 28 starter chores seeded.
- On a second device, sign up with a different email → **Join family** with the invite code
  (shown on the **Family** tab). Changes now sync between the two in real time.
