import PostHog from 'posthog-react-native';

// PostHog project ("phc_") key — public / write-only by design, safe to embed
// (like the Supabase anon key). .env overrides let you swap it without a rebuild.
// HOST must match your project's region: US -> us.i.posthog.com, EU -> eu.i.posthog.com.
const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || 'phc_BPA7tMihFvNaoyFM9FRco3KbbU3JPx5CSd4jujx5qsDq';
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';

export const posthog = KEY ? new PostHog(KEY, { host: HOST }) : null;

export function track(event, props) {
  try { posthog?.capture(event, props); } catch {}
}
export function identify(id, props) {
  try { if (id) posthog?.identify(id, props); } catch {}
}
export function resetAnalytics() {
  try { posthog?.reset(); } catch {}
}
