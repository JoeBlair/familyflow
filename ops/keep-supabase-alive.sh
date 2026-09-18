#!/usr/bin/env bash
# Pings FamilyFlow's Supabase REST API so the free tier's ~7-day inactivity
# pause never triggers. Run from cron every few days.
# The anon/publishable key is public by design (RLS protects the data).
set -euo pipefail

URL="https://mgvonazhifylfumplprf.supabase.co"
KEY="sb_publishable_qV16j65FcqaGQfBkmZv2nw_8i3lBJZX"

# A trivial read against a real table = a DB request, which resets the timer.
# (RLS returns 0 rows for the anon role — that's fine; the request still counts.)
code=$(curl -s -o /dev/null -w "%{http_code}" -m 30 \
  "$URL/rest/v1/families?select=id&limit=1" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY")

echo "$(date -u +%FT%TZ) keep-alive -> HTTP $code"
[ "$code" = "200" ] || { echo "WARN: unexpected status $code (project paused? key rotated?)"; exit 1; }
