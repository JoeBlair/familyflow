import PostHog from 'posthog-react-native';

// Set EXPO_PUBLIC_POSTHOG_KEY (and optionally _HOST) in .env. With no key,
// analytics is a safe no-op — nothing is sent, nothing breaks.
const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || '';
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
