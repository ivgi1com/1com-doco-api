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

**Not verified:** how `next start` is launched and supervised on the server
(process manager, user, working directory, how environment variables reach
it). Record it here once confirmed.

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
2. Set `PLAYGROUND_LIVE_ENABLED=true` and
   `PLAYGROUND_TRUSTED_IP_HEADER=x-forwarded-for` in the portal process's
   environment, then restart the portal process.
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
