# Hostinger VPS migration

Status (2026-09-29): app and MongoDB installed on Hostinger VPS `82.25.110.57`
(`smr-vps`), release `/opt/myrashifal/releases/20260929-migration1`. Production
build and read-only smoke checks passed. Public DNS cutover and HTTPS are complete:
Google/Cloudflare DNS resolve to the VPS; some older resolver caches may persist.
Public HTTPS checks against the VPS passed for the home page, Kundli, auth providers
and Panchang. HTTP and www redirect to the canonical `https://myrashifal.in`.
The certificate covers both names, expires 2026-12-28 and has automatic renewal;
`certbot renew --cert-name myrashifal.in --dry-run --no-random-sleep-on-renew` passed.
The active proxy configuration is recorded in `nginx-https.conf`.

The user explicitly approved launching with a fresh database on 2026-09-29.
No old Atlas records will be restored as part of this migration. Existing local
integration credentials were transferred, but parity with Vercel-only settings is
unverified because the saved Vercel login expired. Instagram credentials are absent.
The eight outbound automation timers are installed but disabled; daily database
backup is enabled. Interactive Google sign-in and live payments were not exercised.

The app runs as a Node.js service behind Nginx. At the user's request, MongoDB 8.0
also runs on the VPS, bound to `127.0.0.1:27017` with authentication and a 0.5 GB
WiredTiger cache. App credentials only allow read/write on `myrashifal`. The old
Atlas hostname does not currently resolve; restoring its data requires a recovered
cluster or backup. The user has accepted launching with the fresh VPS database.
Other external integrations remain in use.

Runtime environment: `/opt/myrashifal/shared/.env.production.local`, mode 600,
symlinked into the release. Admin database credentials are stored privately at
`/root/.config/myrashifal/mongodb.json`. Never print either file into logs.
Two GB of swap was added at `/swapfile-myrashifal` for build memory headroom.
The hard-coded test login is now restricted to development.

Daily backups run at 20:30 UTC (02:00 IST), retain 14 successful archives in
`/var/backups/myrashifal`, and have been run once successfully. These are local
backups, not protection against losing the VPS; an off-server copy is still needed.
They are per-database dumps, not a transactional point-in-time snapshot.

## Server preparation

Inspect the target server's OS, memory, free disk, occupied ports, existing reverse
proxy and hosted applications before installing anything. These templates assume
Linux with systemd, Node.js 22 at `/usr/bin/node`, and an available loopback port 3100.
Adapt to the existing proxy if Nginx is not already used. Do not replace other sites.

Create a dedicated `myrashifal` service user. Put each source release under
`/opt/myrashifal/releases/<release-id>` and point `/opt/myrashifal/current` at the
chosen release. Transfer the working tree, including untracked app files, rather
than assuming the Git remote contains the current application. Exclude `.git`,
`.next`, `node_modules`, `.vercel`, local environment files and ad-generation media.

## Environment and build

Provision a mode-600 `.env.production.local`, owned by the service user, in the
release directory. Retrieve production-only settings from Vercel before retirement;
the local `.env.local` currently lacks the cron and Instagram settings.

- Set `NEXTAUTH_URL` and `AUTH_URL` to `https://myrashifal.in`.
- Preserve existing auth secrets, MongoDB URI, Google credentials, live Razorpay
  keys, Claude key, Resend credentials, and VAPID key pair.
- Include `CRON_SECRET`, Instagram/Facebook settings, administrator settings,
  analytics and site verification variables when used in production.
- Do not transfer `VERCEL_OIDC_TOKEN`; it is not needed on the VPS.
- For an Atlas export, temporarily allow the VPS outbound IP in Atlas and verify
  connectivity; normal app operation now uses the authenticated local database.
- Keep Google OAuth's production callback at
  `https://myrashifal.in/api/auth/callback/google`.

Build on the Linux server using `npm ci` then `npm run build` with production
environment values present. `NEXT_PUBLIC_*` values are embedded at build time.
Install `myrashifal.service`, reload systemd, and start the application. Verify
loopback HTTP responses before adding public traffic.

## HTTPS and DNS

Adapt `nginx.conf` into a separate virtual host and validate with `nginx -t`.
Obtain a certificate for the apex and www names and enable HTTPS redirects and
certificate renewal. A DNS challenge permits certificate issuance before cutover.
Verify routing using curl's `--resolve` option before changing public DNS.

Set apex A to the VPS address; point www to the apex or the same server. Review
existing AAAA records so they cannot send IPv6 clients to the old host. Preserve
MX, TXT and email verification records. Confirm authoritative DNS and then public
HTTPS, static assets, Google sign-in and read-only application routes. Verify
payment configuration without creating a live charge.

## Scheduled jobs

`node deploy/generate-timers.cjs` generates eight systemd timers from the current
`vercel.json` schedules, explicitly in UTC. Copy the timers and
`myrashifal-cron@.service` into `/etc/systemd/system`, validate with
`systemd-analyze verify` and `systemd-analyze calendar`, then reload systemd.
Do not enable timers until production secrets are restored and the old Vercel
schedules are disabled. Some jobs send email, push notifications or Instagram
posts; do not invoke them as smoke tests. Enable those schedules only when their
outbound behavior is approved. Timers skip missed runs, do not automatically retry,
and prevent the same unit from overlapping itself. Inspect application logs for
per-recipient errors in addition to timer status.

## Verification and rollback

Check `systemctl status myrashifal`, `journalctl -u myrashifal`, and
`systemctl list-timers 'myrashifal-*'`. Test reboot persistence, login, existing
saved data, Kundli generation, and the agreed payment test flow after cutover.
Keep the previous release and DNS values. For a code rollback, repoint `current`
and restart the service. Do not delete Vercel until HTTPS, environment parity,
application behavior and schedules are verified. `node deploy/smoke.cjs` verifies
local pages, built assets, database authentication, public auth URLs, Panchang,
and rejected unauthenticated API requests without sending outbound communications.
