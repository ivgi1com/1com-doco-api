# Deployment

Last updated: 2026-10-08 (Phase 9). Facts below marked **verified** were
read from the production server by the user on 2026-10-08 (`curl -I`,
`grep` of `/etc/httpd`, `ss -ltnp`). Anything marked **not verified** was not
checked and must be confirmed before relying on it.

## Production layout (verified)

- URL: `https://pbx6webserver.1com.co.il/1com-api-doco/` — the same host
  that serves the PBX Proxy API and Open API.
- Apache 2.4.62 on CentOS Stream terminates TLS and reverse-proxies the
  portal. In `/etc/httpd/conf.d/ssl.conf`:

  ```apache
  # 1com developer portal (Next.js basePath /1com-api-doco)
  ProxyPass        /1com-api-doco  http://127.0.0.1:3100/1com-api-doco
  ProxyPassReverse /1com-api-doco  http://127.0.0.1:3100/1com-api-doco
  <Location "/1com-api-doco">
      RequestHeader set X-Forwarded-Proto "https"
      ...
  </Location>
  ```

- The portal is a Next.js production server (`next-server`) listening on
  `127.0.0.1:3100` only — not reachable except through Apache.
- Other applications share the same Apache (`/dashboard-dev` on :3001,
  `/noc` on :3000). Do not change their configuration.
- Backups of `ssl.conf` exist beside it (`ssl.conf.bak`,
  `ssl.conf.pre-portal.bak`).

## Build (sub-path)

The base path is **build-time**; changing it requires a rebuild.

```
NEXT_PUBLIC_BASE_PATH=/1com-api-doco npm run build
```

(`src/lib/base-path.ts`, `next.config.ts`; leading slash, no trailing slash.)
Unset, the portal is served from the domain root.

## Process and settings (verified 2026-10-08)

- systemd unit `/etc/systemd/system/portal.service` (enabled), **not PM2**
  (PM2 on this server runs other applications; leave it alone):

  ```ini
  [Service]
  User=portal
  WorkingDirectory=/home/portal/app
  EnvironmentFile=/etc/portal.env
  ExecStart=/opt/node-v24/bin/node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3100
  Restart=on-failure
  MemoryMax=1G
  NoNewPrivileges=true
  PrivateTmp=true
  ```

- `/etc/portal.env` (no secrets): `NODE_ENV=production`,
  `PLAYGROUND_TRUSTED_IP_HEADER=x-forwarded-for`,
  `NEXT_PUBLIC_BASE_PATH=/1com-api-doco`, `PLAYGROUND_LIVE_ENABLED=true`
  (Live enabled 2026-10-08 13:31 IDT). Kill switch: remove that line and
  `systemctl restart portal`.
- `/home/portal/app` is a git clone of `github.com/ivgi1com/1com-doco-api`,
  checked out detached at the deployed commit.

## Updating production (verified 2026-10-08, deployed `5ac5a82`)

Run as root on the server; the portal is down for a few minutes.

```
systemctl stop portal
sudo -u portal bash -c 'cd /home/portal/app \
  && export PATH=/opt/node-v24/bin:$PATH \
  && git fetch --tags origin && git checkout --detach <commit> \
  && cp -a .next .next.prev \
  && npm ci --include=dev \
  && set -a && . /etc/portal.env && set +a \
  && npm run build'
systemctl start portal
```

Pitfalls seen on 2026-10-08:

- (2026-10-09) If `.next.prev` already exists, `cp -a .next .next.prev`
  copies *into* it (`.next.prev/.next`). Remove or rename the old copy
  first. `systemctl stop portal` leaves the unit `failed` (Next exits
  non-zero on SIGTERM); `start` works normally. Paste-wrapped long
  commands break in the server terminal: keep each command short.

- Install **before** loading `/etc/portal.env`, or pass `--include=dev`:
  with `NODE_ENV=production`, `npm ci` skips devDependencies and the build
  fails with `Cannot find module '@tailwindcss/postcss'`.
- After a failed build, move `.next` aside before retrying: its Turbopack
  cache kept reporting the same missing module even after it was installed.

Rollback: `git checkout --detach <previous commit>`, then `npm ci
--include=dev` and rebuild, or restore the previous `.next` copy and
restart (the update above keeps one in `.next.prev`). The extra copies from
the 2026-10-08 update were deleted the same day, so returning to v1.0 means
rebuilding from the `v1.0-developer-portal` tag.

## Runtime environment

Names only; see `.env.example` and `docs/ENVIRONMENT.md`.

| Variable | Production value for the Live pilot |
|---|---|
| `PLAYGROUND_LIVE_ENABLED` | `true` (kill switch; anything else = Live off) |
| `PLAYGROUND_TRUSTED_IP_HEADER` | `x-forwarded-for` |
| `PLAYGROUND_REQUEST_TIMEOUT_MS`, `PLAYGROUND_MAX_RESPONSE_BYTES`, `PLAYGROUND_RATE_LIMIT` | leave unset (safe defaults: 10 s, 1 MB, 10 requests/minute/client) |

Why `x-forwarded-for`: Apache's `mod_proxy` appends the connecting client's
address to `X-Forwarded-For`. The portal uses the **last** entry
(`src/server/playground/rate-limit.ts#clientKey`), which is the one Apache
added, so a visitor cannot forge it. This holds only while the app is
reachable **only** through Apache: keep it bound to `127.0.0.1` (verified
on 2026-10-08). If it were ever exposed directly, the header would be
caller-controlled and per-client rate limiting would be bypassable.

Never set, on the production server: `OPENAPI_TEST_KEY`,
`OPENAPI_TEST_TENANT` (local testing only), or any API key. The portal holds
no keys of its own; each visitor's key lives only in their browser tab and
is forwarded per request.

## Enabling the Live pilot (after the Phase 9 gate is approved)

Done by the user on the server, one step at a time:

1. Build with the sub-path (above) from the approved commit.
2. Add `PLAYGROUND_LIVE_ENABLED=true` to `/etc/portal.env`
   (`PLAYGROUND_TRUSTED_IP_HEADER=x-forwarded-for` is already there), then
   `systemctl restart portal`. No rebuild needed.
3. Verify headers: `curl -sI https://pbx6webserver.1com.co.il/1com-api-doco/en`
   shows `Content-Security-Policy`, `Referrer-Policy: no-referrer`,
   `X-Frame-Options: DENY`.
4. In a browser, open the Playground on `openapi/simplecdrs-list`, switch to
   Live with a tenant key and tenant code, and send one request.

**Rollback / kill switch:** unset `PLAYGROUND_LIVE_ENABLED` (or set it to
anything but `true`) and restart. Live then answers `live_disabled` and the
Playground shows every operation as Live-disabled; Demo is unaffected. No
rebuild is needed.

## Local checks before a release

```
npm run check          # typecheck, lint, unit tests
npm run build
npx playwright test    # full browser suite (needs chromium and webkit)
```

Real-PBX check (local only; the key stays in your own shell):

```
$env:OPENAPI_TEST_KEY="<TEST key>"; $env:OPENAPI_TEST_TENANT="<tenant>"
npx playwright test tests/e2e/live-real.spec.ts --project=chromium-desktop --reporter=list
```
