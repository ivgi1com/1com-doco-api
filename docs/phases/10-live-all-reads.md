# Phase 10 — Live for every read operation

> **Status (2026-10-08): APPROVED by the user (gate A — approve, save, and continue to planning).** Branch `phase/live-all-reads` (from `main` @ `88a4a3f`). Not merged, pushed, tagged or deployed.
> **Source:** user request 2026-10-08 ("all endpoints should be active besides create, update and delete; the request should take tenant name and API key"), then three decisions asked one at a time. Every decision below is the user's.
> **Primary model:** Opus 5.5 (security boundary, credentials, externally exposed API).
> **Deploy note:** production already runs with `PLAYGROUND_LIVE_ENABLED=true`, so deploying this build turns every read Live at once.

## 1. Decisions (user, 2026-10-08)

- **Output policy:** pass-through + server-side redaction for every read; keep categorical blocks. Supersedes the per-read field-allowlist SEC-REQs (`docs/SECURITY.md` "Phase 10").
- **Scope:** Open API and Proxy API reads.
- **Call content blocked:** AI Analysis, AI Logs, Proxy recordings, voicemail transcripts and audio files.
- Still blocked: every write and Proxy action, Dial, DISA, Auth Token (not in the portal), unclassified/"unclear" operations.

## 2. What changed

- `src/server/playground/allowlist.ts`: targets derived from the content model (GET + `read`), strict policies kept, `LIVE_BLOCKED_CATEGORIES` / `LIVE_BLOCKED_ENDPOINTS` (checked to exist at load), `projection: "passthrough"`, path-parameter support.
- `validate.ts` / `execute.ts`: `pathParams` in the request body, strict per-segment validation and encoding; built URL re-checked.
- `handler.ts`: pass-through skips the field allowlist; redaction always runs.
- `redact.ts`: `api_?key` names; same-record copies of a redacted value (4+ chars) redacted too.
- Client (`executor.ts`, `playground-protocol.ts`): sends `pathParams`; the existing key field and `tenant` parameter appear on every Live endpoint.
- Tests: `tests/unit/live-passthrough.test.ts` (new), membership pinned at 85 in `live-endpoints.test.ts`; e2e for a Live path-parameter read, blocked operations and real-route refusals.

## 3. Acceptance

- 85 Live targets (52 Open API, 33 Proxy); no write, no blocked op, no Sample API.
- Key never in a URL, preview or log; path values validated; blocked ops refused before any upstream call.
- `npm run check`, build, full Playwright pass (known CSP console-error flake excepted).
- Final Opus security review before the gate (done in-session; added the plain-text withholding rule).

## 4. Validation at the gate

- `npm run check` 505/505; Playwright 228 passed / 9 skipped / 3 failed, all three known timing flakes that pass alone (CSP console errors 1440px, mobile nav drawer x2).
- No real-PBX call made (no TEST key in session).
