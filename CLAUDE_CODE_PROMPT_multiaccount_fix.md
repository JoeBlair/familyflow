# Claude Code Task: Fix Multi-Account Model (Ship Blocker)

## Context

FamilyFlow is a React Native / Expo app (SDK 56) backed by Supabase. The app lets
families share and balance chores. This task fixes the biggest ship blocker before
App Store submission.

## The Problem

Right now the app has one Supabase auth account that can represent an entire family.
A "Who are you?" chip in MembersScreen lets a single logged-in user manually switch
which family member they are acting as, stored as `active_member_id` in the
`profiles` table.

This breaks in real life: if Joe and Laura each install the app and sign in with the
same account, whoever last tapped their chip "wins" — the other person's view breaks.
If they have separate accounts (which is natural), they still have to remember to tap
their name every session.

## The Goal

Each family member should have their own Supabase auth account (email + password).
The app should automatically know who you are based on your login — no manual switcher.

## Current Schema (read-only, don't change existing tables)

```sql
-- profiles: one row per auth user
profiles (
  id               uuid  -- = auth.uid()
  family_id        uuid  -- which family this user belongs to
  active_member_id uuid  -- CURRENTLY: manually set; AFTER FIX: auto-set and kept in sync
  created_at       timestamptz
)

-- members: one row per family member
members (
  id         uuid
  family_id  uuid
  name       text
  color      text
  emoji      text
  work_pct   int
  user_id    uuid  -- nullable; links a member to an auth user
  created_at timestamptz
)
```

The schema already has `members.user_id`. The `create_family` and `join_family` RPCs
already set `user_id = auth.uid()` on the member they create, and they set
`active_member_id` in profiles to that member. This is correct — don't change the RPCs.

## What Needs to Change

### 1. AppContext (`src/context/AppContext.js`)

- When loading family data, derive `activeMember` by finding the member where
  `user_id === session.user.id` (i.e. the member whose `user_id` matches the logged-in
  auth user). Do NOT rely on `profiles.active_member_id` for display or action gating.
- Keep `active_member_id` in sync in the DB (it's still useful as a pointer), but
  stop using it as the source of truth in the app.
- Remove `setActiveMember` from the context (or make it a no-op that is not exposed
  to screens).
- `activeMember` should be derived automatically and never change within a session
  unless the user signs out.

### 2. MembersScreen (`src/screens/MembersScreen.js`)

- Remove the "You are" section entirely — the chip row that lets the user pick which
  member they are.
- Instead, show a small "Signed in as [Name]" read-only label near the top so the
  user can see who they are.
- Everything else (invite code, member list, add/edit/remove, sign out) stays.

### 3. CheckinScreen (`src/screens/CheckinScreen.js`)

- `activeMember` is used to determine who is rating (the rater). This will now be
  derived automatically — no changes needed to the rating logic itself, but verify
  that the screen still works correctly when `activeMember` is auto-derived.
- The "isMe" check (`m.id === activeMember?.id`) should still work correctly.

### 4. AuthScreen / OnboardingScreen

- No changes needed — each user already creates their own account and creates/joins
  a family, which sets `members.user_id` correctly.

### 5. BattleScreen (`src/screens/BattleScreen.js`)

- Currently uses `setActiveMember` indirectly through `MemberPickerModal`. Battle
  participants are chosen by the user tapping "Pick" — this is fine and unrelated
  to identity. Leave this alone.

## What NOT to Change

- The Supabase schema / migrations
- The `create_family` / `join_family` RPCs
- The invite code flow
- The ability to add members to a family who don't have their own login yet (e.g.
  children). These members simply won't have a `user_id` and won't be able to log in —
  that is acceptable for now.

## Acceptance Criteria

1. Joe signs up with joe@example.com, creates "The Blair Family", and sees himself
   auto-selected — no chip to tap.
2. Laura signs up with laura@example.com, joins the same family with the invite code,
   and immediately sees herself auto-selected.
3. Both phones are active at the same time. Joe's actions are attributed to Joe;
   Laura's to Laura. No manual switching required.
4. The "You are" chip row is gone from MembersScreen.
5. A child member added by Joe (who has no login) appears in the family but is not
   auto-selected for anyone.
6. Check-in ratings still work — you can only rate OTHER people's chores, not your own.

## Files Most Likely to Touch

- `src/context/AppContext.js` — main change
- `src/screens/MembersScreen.js` — remove the chip row
- `src/screens/CheckinScreen.js` — verify, minor tweak if needed

## Notes

- The existing `setActiveMember` calls in AppContext write to `profiles.active_member_id`
  in Supabase. Keep this write so the DB stays consistent, but stop reading from it
  to drive UI decisions.
- If `members.user_id` is null for the logged-in user's member (edge case: old test
  data), fall back gracefully — show a "tap to identify yourself" prompt rather than
  crashing.
- Run `npx expo start` to test after making changes.
