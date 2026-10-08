# Phase 9 — Open API Live pilot

> **Status (2026-10-08): DEFINED — not started.** Branch `phase/openapi-live`, created from `main` @ `9dc8562` (`v1.0-developer-portal`). Not pushed, merged or tagged.
> **Source:** grilling session with the user, 2026-10-08. Every decision below is the user's.
> **Primary model:** Opus 5.5 (security boundary, credential handling, PII). Routine UI/docs sub-tasks may return to Sonnet 5 — flag at each stage.
> **Next step:** plan mode. No implementation until the plan is approved.

## 1. Objective

Enable Live mode for exactly one Open API operation, `simplecdrs-list`, end-to-end through the existing backend proxy, then stop at the approval gate. Later operations are added one at a time in later phases using the same pattern.

## 2. Decisions (user, 2026-10-08)

- **Scope:** one operation, `simplecdrs-list` (GET, read-only). Everything else in Open API stays Live-disabled.
- **Caller PII** (`sc_calleridnum`, `sc_calleridname`, `sc_dialednum`): shown in full to the key holder. The server never logs or stores request/response bodies. Updates SEC-REQ-08 in `docs/SECURITY.md`.
- **Credential transport upstream:** `X-API-Key` header (documented preferred method). The Live proxy is extended for header auth; the key must never appear in the upstream URL.
- **Base URL:** the Open API base `https://pbx6webserver.1com.co.il/pbx/openapi.php` has a path; the allowlist origin check is extended to accept an allowed origin plus a fixed base path. Origin allowlist stays `pbx6webserver.1com.co.il` only.
- **Format:** JSON only. Server forces `format=json`; `format`, `template`, `contenttype` are not caller-settable. The per-field JSON allowlist stays the effective control.
- **Response fields:** default-deny allowlist of the 12 observed fields (probe 2026-09-26): `sc_te_id`, `tenantcode`, `sc_start`, `sc_direction`, `sc_calleridnum`, `sc_calleridname`, `sc_dialednum`, `sc_disposition`, `sc_duration`, `sc_billsec`, `sc_uniqueid`, `sc_whoanswered`.
- **Filters:** all 13 documented (`start`, `end`, `id`, `uniqueid`, `calleridnum`, `calleridname`, `disposition`, `direction`, `dialednum`, `whoanswered`, `phone`, `minduration`, `mintalktime`), each validated by an anchored pattern; anything else rejected.
- **Date range:** `end - start` at most 3 days (amended 2026-10-08 by the user, was 7); wider ranges rejected by the portal with a clear error before any upstream call.
- **Multi-tenant answer** (records with more than one distinct `tenantcode`, i.e. likely an admin/global key): whole answer blocked with an explicit error; only the event is logged (no data, no key).
- **Content-Security-Policy:** added by the Next.js app in this phase; verified with Playwright (desktop + mobile, both locales) that nothing breaks. Closes the gap at `docs/SECURITY.md` "No Content-Security-Policy".
- **Default mode:** Playground still opens in Demo; Live is a deliberate user switch.
- **Testing:**
  - Unit + e2e against a fake upstream (always run).
  - Automated real-PBX e2e, runs only when the TEST key env var is set, skipped otherwise. Screenshots, video and trace off for it; asserts structure only (field names, counts, tenant check), never prints values. Artifact dirs confirmed git-ignored.
- **TEST API key:** local testing only. Never in production config. Never written to a tracked file, never committed or pushed.
- **Production:** enabled right after gate approval: `PLAYGROUND_LIVE_ENABLED=true`, `PLAYGROUND_TRUSTED_IP_HEADER=x-forwarded-for`. Server steps given to the user one at a time.
- **Hosting documentation:** production setup (Apache 2.4 reverse proxy `/1com-api-doco` -> `127.0.0.1:3100`, `NEXT_PUBLIC_BASE_PATH=/1com-api-doco`) documented in the repo; it was never committed before.

## 3. Facts established (2026-10-08)

- Live proxy today: `src/server/playground/` (`allowlist.ts#LIVE_POLICIES`, `handler.ts`, `rate-limit.ts`, `config.ts`). Proxy API only; query-parameter auth only (`allowlist.ts:85`); base URL must equal origin (`allowlist.ts:77`).
- Limits: timeout 10 s, response 1 MB, 10 requests/min/client (`config.ts`).
- Production: Apache 2.4.62 (CentOS Stream) on `pbx6webserver.1com.co.il` (same host as the PBX APIs); `next-server` bound to `127.0.0.1:3100` only. `mod_proxy` appends the client IP to `X-Forwarded-For`; `rate-limit.ts:59` takes the last entry, so the header is not client-spoofable through this single hop.
- `simplecdrs-list` probe 2026-09-26: HTTP 200, JSON array, 12 fields per record (`source-docs/observed/openapi/probe-2026-09-26.masked.json`).

## 4. Out of scope

- Any other Open API operation, any write, any Proxy API change beyond shared-code refactoring.
- XML/template output.
- TEST key rotation (user decision: not tied to this phase).

## 5. Acceptance criteria

1. `simplecdrs-list` works Live in the Playground with a valid tenant key; all other Open API operations remain Live-disabled.
2. Key travels upstream only in `X-API-Key`; never in URLs, logs, telemetry, or client-visible errors.
3. Only the 12 allowlisted fields reach the browser; `format` forced to JSON.
4. Invalid filter values and ranges over 3 days rejected before upstream.
5. Multi-tenant answers blocked.
6. CSP active; no console errors; Playground, Reference, Guides unaffected (desktop + mobile, en + he).
7. Demo/Live isolation unchanged; a Live failure never shows Demo data.
8. `npm run check`, `npm run build`, full Playwright pass; real-PBX e2e passes locally with the TEST key; secret scan clean.
9. `docs/SECURITY.md`, `docs/DECISIONS.md`, `docs/CURRENT_STATUS.md`, `docs/SESSION_HANDOFF.md`, deployment doc updated.
10. Final Opus security review before the gate.

## 6. Stages

To be defined in plan mode.
