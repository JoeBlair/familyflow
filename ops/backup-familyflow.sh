#!/usr/bin/env bash
# Nightly logical backup of the FamilyFlow Supabase database (free tier has none).
# Requires: postgresql-client (pg_dump) and FF_DB_URL set to the connection string.
set -euo pipefail

: "${FF_DB_URL:?set FF_DB_URL to your Supabase connection string (Settings > Database > URI)}"
OUT="${FF_BACKUP_DIR:-$HOME/ff-backups}"
KEEP="${FF_BACKUP_KEEP:-14}"

mkdir -p "$OUT"
file="$OUT/familyflow_$(date -u +%F_%H%M).sql.gz"

pg_dump "$FF_DB_URL" --no-owner --no-privileges | gzip > "$file"
echo "$(date -u +%FT%TZ) backup -> $file ($(du -h "$file" | cut -f1))"

# Rotate: keep only the most recent $KEEP backups.
ls -1t "$OUT"/familyflow_*.sql.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f
