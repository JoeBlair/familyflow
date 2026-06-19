// Supabase connection. Both values are safe to ship in a client app — the anon
// key is public by design; security is enforced by Row-Level Security in Postgres.
//
// Fill these in (or set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
// in a .env file at the project root). Find them in your Supabase project:
//   Project Settings → API → Project URL and anon/public key.

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mgvonazhifylfumplprf.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_qV16j65FcqaGQfBkmZv2nw_8i3lBJZX';

export function isSupabaseConfigured() {
  return (
    !SUPABASE_URL.includes('YOUR-PROJECT') &&
    !SUPABASE_ANON_KEY.includes('YOUR_ANON')
  );
}
