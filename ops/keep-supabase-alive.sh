#!/usr/bin/env bash
# Keeps FamilyFlow's Supabase awake AND monitored.
#   - Hits the REST API (a real DB request) so the ~7-day inactivity pause never fires.
#   - If HC_URL is set (a free healthchecks.io check), reports success/failure — so you
#     get an alert the moment Supabase is unreachable OR this cron stops running.
# The anon/publishable key is public by design (RLS protects the data).
set -euo pipefail

URL="https://mgvonazhifylfumplprf.supabase.co"
KEY="sb_publishable_qV16j65FcqaGQfBkmZv2nw_8i3lBJZX"
HC_URL="${HC_URL:-}"   # optional: https://hc-ping.com/<your-uuid>

# A trivial read = a DB request, which resets the inactivity timer.
# `|| echo 000` so a connection failure (paused project) is reported, not aborted.
code=$(curl -s -o /dev/null -w "%{http_code}" -m 30 \
  "$URL/rest/v1/families?select=id&limit=1" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" || echo 000)

echo "$(date -u +%FT%TZ) keep-alive -> HTTP $code"

if [ "$code" = "200" ]; then
  [ -n "$HC_URL" ] && curl -fsS -m 10 "$HC_URL" >/dev/null || true
  exit 0
fi

echo "WARN: Supabase unreachable (HTTP $code) — likely paused"
[ -n "$HC_URL" ] && curl -fsS -m 10 "$HC_URL/fail" >/dev/null || true
exit 1
