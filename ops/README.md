# FamilyFlow ops (Hetzner)

Two cron jobs that keep the free-tier Supabase project healthy until you move to
a durable setup (self-host — see the runbook — or Supabase Pro):

- **`keep-supabase-alive.sh`** — pings the API every few days so the ~7-day
  inactivity pause never triggers (this is what took the app down).
- **`backup-familyflow.sh`** — nightly off-box `pg_dump` (free tier has **no**
  backups, so this is your only safety net for real users' data).

> Keep-alive is a stopgap, not a fix. You're one failed cron away from a pause,
> and free tier still has no managed backups. The durable answer is self-hosting
> Supabase on this box, or Supabase Pro.

## Setup on the Hetzner box
```bash
# 1. Postgres client (for pg_dump)
sudo apt-get update && sudo apt-get install -y postgresql-client

# 2. Copy the scripts up (from your Mac, in the repo root)
scp ops/keep-supabase-alive.sh ops/backup-familyflow.sh deploy@YOUR_SERVER:~/
ssh deploy@YOUR_SERVER 'chmod +x ~/keep-supabase-alive.sh ~/backup-familyflow.sh && mkdir -p ~/logs'

# 3. Store the DB connection string in a private env file (NOT in git)
#    Get it from: Supabase → Project Settings → Database → Connection string → URI
cat > ~/.ff.env <<'EOF'
export FF_DB_URL='postgresql://postgres:YOUR_PASSWORD@db.mgvonazhifylfumplprf.supabase.co:5432/postgres'
export FF_BACKUP_DIR="$HOME/ff-backups"
EOF
chmod 600 ~/.ff.env

# 4. Schedule (crontab -e), add:
#    keep Supabase awake — every 3 days at 09:00
0 9 */3 * * ~/keep-supabase-alive.sh >> ~/logs/keepalive.log 2>&1
#    nightly backup at 03:00
0 3 * * * . ~/.ff.env && ~/backup-familyflow.sh >> ~/logs/backup.log 2>&1
```

## Restore from a backup
```bash
. ~/.ff.env
gunzip -c ~/ff-backups/familyflow_YYYY-MM-DD_HHMM.sql.gz | psql "$FF_DB_URL"
```

## Optional hardening
- Copy backups off the Hetzner box too (Hetzner Storage Box / S3) so a box failure
  doesn't take the backups with it.
- Add an uptime check (e.g. a free monitor hitting the app's Supabase health URL)
  so you hear about a pause immediately instead of from a user.
