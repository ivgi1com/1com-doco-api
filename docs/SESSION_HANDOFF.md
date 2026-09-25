# Session Handoff

Last updated: 2026-09-25 ~10:10 (Phase 5 implementation in progress — read this first)

## IN-PROGRESS checkpoint — Phase 5 (Live Playground), Steps 0–4 done, not approved

- Plan file: `C:\Users\ivgi-pc\.claude\plans\plan-phase-5-temporal-tower.md`
  (approved 2026-09-25). Covers Steps 0–7; this checkpoint is after Step 4.
- Branch `phase/live-playground`, off `main` @ `c99ef81` (approving the plan
  fast-forwarded `main` to the approved Phase 4 commit, same precedent as
  Phase 4). **Nothing in this phase is committed yet** — the working tree
  has all Step 0–4 changes uncommitted; see `git status` before doing
  anything else.
- Planning decisions (Opus 5.5, before implementation) are in
  `docs/DECISIONS.md` "Phase 5 planning": U-08 decided (only
  `proxy/info-extensions` allowlisted), anonymous access with
  same-origin/rate-limit/kill-switch controls, in-memory rate limiter
  behind a swappable interface, credential-in-upstream-URL accepted as a
  known limitation. Also written to `source-docs/unresolved.md` (U-08
  closed).
- **Done**: the security boundary (`src/server/playground/*`,
  `src/app/api/playground/route.ts`), the client execution contract
  (`src/components/playground/executor.ts`, rewired `use-playground.ts`),
  the response UI (`response-viewer.tsx` tabs/error callouts,
  `request-builder.tsx`, Download JSON in `json-viewer.tsx`), and tests
  (35 server + 11 executor unit tests, 20 new Playwright tests). A real
  pre-existing bug was found and fixed while wiring the API-key field:
  `RequestBuilder` used a hardcoded `SAMPLE_API_KEY` placeholder regardless
  of the endpoint's own auth env var; now uses the (newly exported)
  per-endpoint `authEnvVar()` from `src/lib/code-samples.ts`.
- **Verified**: `npm run check` (78/78 unit tests), `npm run build`, 98/98
  Playwright tests (Chromium + WebKit, fresh `build && start`), manual
  visual pass (1440/900, 390/844, en + he) via Playwright-driven screenshots
  with `page.route` mocks for every Live state (success, each portal-error
  code, disabled/not-allowlisted) — zero console errors. `playwright.config.ts`
  now runs its server with `PLAYGROUND_LIVE_ENABLED=true` so the
  allowlisted endpoint's Send button is testable; every Live-sending test
  mocks `/api/playground` first, so no test reaches the real 1com host.
- **Not done yet**:
  - Step 5: a **real** Live call against `pbx6webserver.1com.co.il` with a
    real key, performed by the user directly (Claude never receives the
    key). Only after the user confirms a real 200 does
    `info-extensions`'s `verification.tested` flag get set in
    `src/content/proxy-api.ts`. Any discrepancy between documented and
    observed behavior goes to `source-docs/DOCS_AUDIT.md`, not a silent fix.
  - Step 7: switch to Opus 5.5, run the `security-review` skill over the
    full branch diff, fix findings, re-verify, then present the Phase
    Completion Report and the mandatory A/B/C/D gate. **No phase-completion
    checkpoint, tag, or approval exists yet.**
- Next session's first action: continue Step 5 (ask the user to run a real
  Live request) or, if they'd rather defer that, proceed to Step 7's
  security review first and do Step 5 afterward — either order is fine,
  but the gate in Step 7 cannot be presented as passed until both are done.

## STOP checkpoint — Phase 4 approved and complete; next phase not started

- Phase 4 (One Real Proxy API Endpoint) is **approved** (2026-09-25, gate
  option B). All 7 steps of the plan are done, including U-11: the user
  supplied a sanitized real response to `reqtype=INFO&info=EXTENSIONS`
  (tenant described as "demo"). Extension names in the raw capture were
  real individuals' names; redacted to placeholders (`REDACTED_NAME_n`)
  before anything was written to disk. Saved as evidence at
  `source-docs/observed/info-extensions.json`; `proxy-api.ts`'s response
  schema/example are derived from it only (`evidence: "observed-sanitized"`,
  never replayed by Demo). Discovered fact, recorded as such: the response
  is a JSON object keyed by each extension's `ex_id`, not an array.
- Also found and fixed a third real pre-existing bug (see the two from the
  prior checkpoint below): the response-schema heading read "Request body"
  (reused the wrong i18n key, `endpoint.body`) — added a dedicated
  `endpoint.responseBody` key (en/he) and repointed it.
- A genuine race was found and fixed in the new Playwright assertion itself
  while writing it: `page.getByText("Request example")` (to open the mobile
  disclosure) matched 2 elements — the disclosure's `<summary>` and an
  unrelated note ("...its request examples.") via case-insensitive
  substring matching. It "passed" once by timing luck before being caught
  and fixed to `page.locator("summary", { hasText: "Request example" })`.
  Verified deterministic (3 repeat runs) before trusting it.
- `docs/DECISIONS.md`, `docs/CURRENT_STATUS.md`, `source-docs/unresolved.md`
  (U-11 closed), `source-docs/DOCS_AUDIT.md` (A-03 resolved note) all
  updated at this checkpoint.
- Verified again after these changes: `npm run check`, `npm run build`,
  **80/80 Playwright tests** (Chromium + WebKit, fresh `build && start`),
  manual screenshots at 1440×900 and 390×844 via a live `next dev` server,
  zero console errors.
- Tagged `v0.3-proxy-prototype-approved` on the phase-completion commit
  (this checkpoint), per `CLAUDE.md`'s suggested milestone tags.
- **Not done, per option B (approve, save, and stop)**: `phase/one-endpoint`
  is not merged into `main`; Phase 5 (Live Playground,
  `docs/phases/05-live-playground.md`) has not started — no planning, no
  research, no implementation. Its own model note requires **Opus 5.5** for
  the security-sensitive proxy-boundary architecture before implementation;
  do not begin that work on Sonnet.
- Next session's first action: wait for the user to say to begin Phase 5
  (or to merge `phase/one-endpoint` into `main`, which also needs separate
  explicit approval). Do not infer either from this file alone.

## Prior checkpoint — Phase 4 substantially complete, blocked on one input (superseded by the approval above; kept for history)

- Branch `phase/one-endpoint` (off `main` @ `658c423`; `main` was fast-forwarded to
  the approved Phase 3 commit with user approval via the Phase 4 plan).
- The approved Phase 4 plan is at `C:\Users\ivgi-pc\.claude\plans\piped-meandering-stallman.md`
  (outside the repo). It covers steps 1–7, the user decisions and the gate.
- User decisions for Phase 4 are now written to `docs/DECISIONS.md` ("Phase 4
  implementation") and `source-docs/unresolved.md` (U-01, U-03, U-06, U-07, U-09
  marked decided; U-02, U-04 marked "default applied"; U-05 was already deferred;
  U-11 stays open — see below). Summary:
  - endpoint `reqtype=INFO&info=EXTENSIONS` → `src/content/proxy-api.ts`
  - host `https://pbx6webserver.1com.co.il/pbx/proxyapi.php`, fixed (note `/pbx/` vs vendor `/mirtapbx/`)
  - tenant key (read-only is sufficient)
  - `legacy` badge + OpenAPI note
  - English prose + untranslated banner (Hebrew scope unchanged from Phase 2)
  - extended the neutral model (`src/content/types.ts`)
  - kept the Sample API; Proxy API is now `apis[0]` (the default everywhere)
- **Done (steps 1, 2, 3, 4, 5, 7 of the plan):**
  - Content model extension (`src/content/types.ts`, `docs/API_CONTENT_MODEL.md`):
    `Requirement` tri-state, `fixedQuery`, `methodBasis`, `Authentication.location/
    parameter/scope`, `ResponseSpec.format/evidence`, `errors: ErrorSpec[] |
    "undocumented"`, `notes`. Additive; Sample API needed no content changes.
  - `src/content/proxy-api.ts`: the `info-extensions` endpoint, hand-authored from
    `source-docs/proxy-api/info.yaml` + `_common.yaml`. Registered first in
    `src/content/index.ts` (`apis = [proxyApi, sampleApi]`).
  - `src/lib/code-samples.ts`: new query-auth branch (curl `-G`/`--data-urlencode`,
    JS `URLSearchParams`, Python `requests.get(params=...)`), env var derived per-API
    (`PROXY_API_KEY` / kept `SAMPLE_API_KEY`). Header-auth path untouched and pinned
    by a regression test.
  - Components adapted (no new Proxy-specific components): `endpoint-view.tsx`
    (fixedQuery path line, method-inferred note, auth scope/location, Fixed
    parameters section, legacy callout, undocumented responses/errors fallback,
    Notes section), `param-list.tsx` + `param-field.tsx` (tri-state required),
    `request-panel.tsx`, `response-examples.tsx` (evidence badge), `use-playground.ts`
    (validate only blocks on `required === true`; Demo never replays for a
    non-synthetic API — new `unavailable` response variant), `response-viewer.tsx`,
    `request-builder.tsx` (per-API demo note), `reference/[api]/page.tsx` (quickstart
    now generated via `buildSample`, not hardcoded Bearer/`/v1/call-records`).
  - **Two real pre-existing bugs found and fixed** (masked before because Sample API
    was always `apis[0]`): `sidebar-nav.tsx`'s `ReferenceNav` was hardcoded to
    `apiId="sample"` with a non-functional API `<select>` (now a client component
    reading the path via `usePathname`, with a working `onChange` that navigates);
    `playground/page.tsx` always used `apis[0]` instead of the requested endpoint's
    own API. Also dropped "Proxy API" from the two remaining `plannedApis`
    hardcoded lists (home page, sidebar) now that it's real.
  - `src/lib/playground-index.ts`: cached `buildPlaygroundSamples` per API id (like
    the existing `getSearchIndex()`) — fixes a real perf issue (recomputed shiki
    highlighting on every request/prefetch) that was also causing Playwright
    `networkidle` timeouts on the Proxy endpoint page.
  - i18n: new keys in both `messages/en.json` and `messages/he.json`.
  - Tests: 5 new unit tests (`tests/unit/code-samples.test.ts`, query-auth samples
    + a Sample-API regression guard) and 5 new Playwright tests (`tests/e2e/smoke.spec.ts`,
    "Proxy API endpoint (Phase 4)" describe block). Also fixed
    `tests/e2e/smoke.spec.ts`'s console-error check to use `waitForLoadState("load")`
    instead of `"networkidle"` (Next's Link prefetch fan-out under Chromium made
    `networkidle` flaky-timeout on pages with both a full sidebar and other links —
    Playwright's own docs discourage relying on `networkidle` for this reason).
  - Verified: `npm run check` (tsc + lint + 32 unit tests), `npm run build`, **80/80
    Playwright tests on Chromium + WebKit** (fresh `build && start`, not `next dev`),
    manual visual pass (screenshots) at 1440/1024/768/390, en+he, zero console errors.
  - `docs/DECISIONS.md`, `source-docs/unresolved.md`, `source-docs/DOCS_AUDIT.md`
    (host fact) updated. This file and `docs/CURRENT_STATUS.md` updated at this
    checkpoint.
- **Not done / blocking (step 6 partial, gate not reached):**
  - **U-11 (response example) is still open.** The user was asked for a sanitized
    real response to `reqtype=INFO&info=EXTENSIONS` (key/tenant/names/numbers/
    emails/IPs/MACs/secrets redacted). Not received. `proxy-api.ts` ships with
    `responses: []`; the page correctly shows "Not documented by the source"
    rather than a fabricated example. `docs/phases/04-one-endpoint.md` requires a
    response example in its "Required page content" list, so **the phase gate has
    not been presented yet** — do not present a Phase Completion Report or ask the
    A/B/C/D question until this is resolved (either the response arrives, or the
    user explicitly agrees to reach the gate without it).
  - `source-docs/observed/` (evidence copy of the sanitized response) was
    deliberately not created — nothing to put in it yet.
- Model: Sonnet 5 (current, correct for this remaining work). Opus only if a
  final security/architecture review is later required.
- Tooling notes from this session (see also "Things a new session must know"
  below): a long-lived `next dev` process across many edits produced a spurious
  React "script tag" console warning that a fresh production build didn't have —
  if debugging console errors, prefer a fresh `npm run build && npm run start`
  (or let Playwright's own `webServer` manage it) over a dev server that's had
  heavy HMR churn. Also: after `next dev`/`next start` on Windows, stopping the
  background task can leave the `start-server.js` child listening on the port —
  check `Get-NetTCPConnection -LocalPort 3000 -State Listen` and kill that PID too.
- Next session's first action: get the sanitized response from the user (ask again
  if not yet supplied), add it to `proxy-api.ts`'s `responses` (evidence:
  "observed-sanitized"), derive the schema from it only, save an evidence copy
  under `source-docs/observed/`, update U-11 to decided, then run the Phase 4
  completion gate (verify against `docs/phases/04-one-endpoint.md`'s acceptance
  criteria, re-run `npm run check`/`build`/Playwright, present the Phase Completion
  Report, ask A/B/C/D). If the user instead says to reach the gate without a
  response sample, present the report with that explicitly flagged as a known
  limitation rather than deciding it yourself.

## State (superseded by the STOP checkpoint above; kept for Phase 3 history)

- `main` includes the approved Phase 2 and Phase 3 work (`658c423`). The tag
  `v0.2-shell-approved` on `20597af` already existed (created by the user) and
  was left as-is. No milestone tag exists for Phase 3 (the suggested tag list
  has no audit tag).
- Phase 3 was approved 2026-09-24 (gate option A) and is committed on `main`.
- Phase 4 is now implemented (see the STOP checkpoint at the top of this
  file for the real current state) on branch `phase/one-endpoint`, not
  merged to `main`; merging needs explicit approval at the Phase 4 gate.

## What Phase 3 produced

See `docs/CURRENT_STATUS.md` for counts. Files:
- `source-docs/raw/`: the evidence snapshots and `SOURCES.md` (hashes,
  redaction note).
- `source-docs/proxy-api/`: `_common.yaml`, 39 `<reqtype>.yaml`, and
  `README.md` (conventions: `not_documented`, `method.basis`,
  `sourceAnchor`).
- `source-docs/inventory.json`: generated from the YAML.
- `source-docs/DOCS_AUDIT.md` and `source-docs/unresolved.md`.

The verification scripts are session scratch, not committed. They:
- parse the YAML
- resolve anchors
- compare the file set against the reqtype table
- check URL and payload coverage
- regenerate the inventory

If the YAML changes, rebuilding the inventory needs an equivalent script.
Committing one (e.g. `scripts/audit/build-inventory.cjs`) was deliberately
not done; decide it at the gate or in Phase 4.

## Things a new session must know

- Source page facts:
  - it is a request-example catalogue
  - 39 reqtypes: 16 exemplified, 23 table-only
  - no errors documented
  - one response sample
  - the vendor calls it legacy
- A preliminary WebFetch summary during planning claimed 28 reqtypes and
  "response examples for most". Both were wrong. Always use the snapshot,
  never a WebFetch summary.
- Tooling gotcha (new): `tsconfig.json` includes both `.next/types` and
  `.next/dev/types`. If `.next/dev/types/routes.d.ts` goes stale with
  `AppRoutes = never`, every `PageProps<…>` fails with TS2344/TS2339.
  - `next typegen` does NOT fix it (it only writes `.next/types`).
  - Fix: run `next dev` briefly so it rewrites the dev types.
  - On Windows, stopping the background task leaves the
    `start-server.js` child listening; kill that PID too.
  - Most likely cause here: a watcher regenerated the dev types while
    `git checkout main` briefly switched to the old commit, which had no
    `src/`. Not proven.
- Carried: heredoc + `node -e` is unreliable in this Bash tool. Write
  scripts to the scratchpad and run them as files.

## Open items (carried)

- SVG logo; Console link destination; Hebrew UI strings are DRAFT; Hebrew
  content scope (unchanged from Phase 2 — English prose + banner, per the
  Phase 4 decision).
- Phase 2 design-doc tensions (home card grid; 32px dense controls vs 40px
  touch rule).
- `use-playground.ts` / `theme.ts` storage-sync duplication (non-bug).
- impeccable update available; `PRODUCT.md` still out of scope.
- npm 12 blocked install scripts (`@parcel/watcher`, `@swc/core`,
  `unrs-resolver`), still not blocking.
