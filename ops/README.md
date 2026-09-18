# FamilyFlow ops (Hetzner)

Two cron jobs that keep the free-tier Supabase project healthy until you move to
a durable setup (self-host — see the runbook — or Supabase Pro):

- **`keep-supabase-alive.sh`** — pings the API on a schedule so the ~7-day
  inactivity pause never triggers (this is what took the app down), **and**
  reports to a free uptime monitor so you're alerted if it's ever down anyway.
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

# 3. Store secrets in a private env file (NOT in git)
#    DB string: Supabase → Project Settings → Database → Connection string → URI
#    HC_URL:    from the uptime monitor set up below (optional but recommended)
cat > ~/.ff.env <<'EOF'
export FF_DB_URL='postgresql://postgres:YOUR_PASSWORD@db.mgvonazhifylfumplprf.supabase.co:5432/postgres'
export FF_BACKUP_DIR="$HOME/ff-backups"
export HC_URL='https://hc-ping.com/YOUR-CHECK-UUID'
EOF
chmod 600 ~/.ff.env

# 4. Schedule (crontab -e), add:
#    keep alive + monitor — every 30 min
*/30 * * * * . ~/.ff.env && ~/keep-supabase-alive.sh >> ~/logs/keepalive.log 2>&1
#    nightly backup at 03:00
0 3 * * * . ~/.ff.env && ~/backup-familyflow.sh >> ~/logs/backup.log 2>&1
```

## Uptime alerts (healthchecks.io — free)
So you hear about a pause before your users do:
1. Sign up at **https://healthchecks.io** (free) → **Add Check** → name it "FamilyFlow Supabase".
2. Set **Period = 1 hour**, **Grace = 30 min** (the check runs every 30 min).
3. Copy its **ping URL** (`https://hc-ping.com/<uuid>`) into `HC_URL` in `~/.ff.env`.
4. Add your email (or Slack/Telegram/push) under the check's **Integrations**.

Now: every run reports success; if Supabase is unreachable **or** the cron stops,
healthchecks emails you within the grace window. That's the whole safety net —
prevention (keep-alive), detection (this), and recovery (backups).

_Prefer not to touch the box for monitoring?_ Alternatively, point an external
monitor (e.g. UptimeRobot, free) at `https://mgvonazhifylfumplprf.supabase.co/auth/v1/health`
— it'll alert when the project goes unreachable. (It won't *prevent* the pause,
so you still need the keep-alive cron.)

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
