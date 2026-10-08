# Phase 11 — verify Phase 10 against the real PBX, merge, tag, deploy

> **Status (2026-10-08): PLANNED, NOT STARTED.** Chosen by the user at the Phase 10 gate (option A). The plan below has not been approved for execution yet; present it for approval before starting.
> **Starting point:** branch `phase/live-all-reads` @ Phase 10 commit (approved). Production runs `v1.2-side-menus` with `PLAYGROUND_LIVE_ENABLED=true`.
> **Model:** step 1 on Opus 5.5 (judging real redaction output is security work); steps 2-4 routine (Sonnet), flag the switch.

## Why

Phase 10 was tested only against a mocked upstream. Deploying it turns all 85 reads Live in production at once, so the redaction must first be checked against real PBX answers.

## Steps

1. **Real-PBX smoke spec** (on `phase/live-all-reads`, new commit). Extend `tests/e2e/live-real.spec.ts` (env-gated by `OPENAPI_TEST_KEY` + `OPENAPI_TEST_TENANT`; chromium only; trace/screenshot/video off; list reporter; assertions are counts/booleans, never values):
   - `openapi/queues-list` -> 200 + array; then `openapi/queues-get` with the first record's `qu_id` (path parameter) -> 200 + object.
   - `openapi/extensions-list`, `openapi/voicemails-list` (secret-bearing): in every record, every key matching the redaction name pattern is `""`, `null` or `[REDACTED]`; the response never contains the key.
   - `openapi/aianalysis-get` -> `endpoint_not_allowed`, no upstream call.
   - At most 8 real calls per run (proxy limit 10/min).
   - Proxy API reads only if the user supplies `PROXY_TEST_KEY` (one `proxy/info-queues` check); otherwise skipped.
   - The user runs it in their own shell (the key never enters chat); give only that command and read pass/fail. Any redaction gap: stop, report, fix before merging.
2. **Merge** (on approval): record the real-check result in `docs/phases/10-live-all-reads.md` / status; `git switch main && git merge --no-ff phase/live-all-reads`; `npm run check` on `main`; record the merged state in docs (small `docs/...` branch merged no-ff, as before).
3. **Tag** `v1.3-live-all-reads` on the merge commit. **Push** only when the user says so.
4. **Deploy** (user runs on the server, one step at a time, `docs/DEPLOYMENT.md` "Updating production"): fetch tags, verify the tag commit, `systemctl stop portal`, checkout + `cp -a .next .next.prev`, `npm ci --include=dev`, build with `/etc/portal.env`, start, check `active` + `200`. Then verify from outside: security headers; a blocked operation returns `endpoint_not_allowed`; a Live read with a fake key returns upstream 401 `invalid_api_key`; open the Playground in Chrome for the user. Rollback: restore `.next.prev` or rebuild `v1.2.1-evidence-badge`; kill switch: remove `PLAYGROUND_LIVE_ENABLED` from `/etc/portal.env` and restart.

## Acceptance

- Real-PBX spec passes with the user's TEST key; no secret-named field carries a value.
- `npm run check` and full Playwright pass (known flakes excepted) before the merge.
- Post-deploy outside checks pass; the user approves the Playground in Chrome.
