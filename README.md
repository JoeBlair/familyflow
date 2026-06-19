# FamilyFlow

A fun, clean chore-sharing app for families — built with Expo + React Native, with
**Supabase** for accounts and real-time cross-device sync. Create a family, add members,
divide the chores, and settle the one nobody wants with a tap-mash battle game.

## Run it on your iPhone (no Mac build needed)

1. **Set up Supabase** — see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) (~5 min, free). This
   gives you the cloud backend that lets two phones share one family's list.
2. Install **Expo Go** from the App Store on your iPhone.
3. On your computer:
   ```bash
   cd ~/Dev/FamilyFlow
   npm install        # first time only
   npx expo start
   ```
4. Scan the QR code in the terminal with the iPhone Camera → opens in Expo Go.

To run in the iOS Simulator instead: `npx expo start --ios`.

## Accounts & family

- Sign up with email + password → **create a family** (you become the first member) or
  **join one** with an invite code (shown on the **Family** tab).
- The **Family** tab manages members (add / rename / remove, colour + emoji each), lets you
  pick which member you're acting as, and shares the invite code.
- All data syncs in real time across everyone in the family.

## Features

- **Chores** tab — Daily / Weekly / Yearly frequency tabs, four domains (Household, Baby,
  Admin, Social), claim a chore for Laura/Joe (tap the chip to cycle), tick it done, add custom
  chores (＋ button), long-press to delete. Done state auto-resets: daily each day, weekly each
  Monday, yearly each January (driven by period keys, no background timers — see
  `src/utils/periods.js`).
- **Charts** tab — a doughnut per person (claimed chores by domain), paid-work % sliders, and a
  combined load bar (chores + work + free time).
- **Battle** tab — each week a random unwanted chore is the stake; tap your side fastest to win;
  the loser is auto-assigned the chore. Past results are kept in History.

## Tech

Expo SDK 56 · React Navigation (bottom tabs) · **Supabase** (Postgres + Auth + Realtime,
`@supabase/supabase-js`) · react-native-svg (charts + pixel sprites) ·
@react-native-community/slider · expo-haptics · AsyncStorage (Supabase session storage).

## Architecture notes

- `src/context/AppContext.js` holds auth session, profile, and the live family data
  (family/members/chores/battles), subscribes to Supabase Realtime, and exposes all actions.
- **`src/data/api.js` is the single data seam** — every read/write/subscribe goes through it,
  mapping DB rows ↔ app shapes.
- `src/supabase/` holds the client and config (URL + anon key via `.env`).
- `supabase/migrations/` is the database schema: tables, RLS policies (each family only sees
  its own rows), the `create_family` / `join_family` RPCs, and Realtime setup.
- Theme/palette, domain maps, and member colour/emoji options live in `src/theme/colors.js`.
