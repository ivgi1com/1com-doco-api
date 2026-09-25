# Current Status

Current phase:
**Phase 5 — Live Playground: IN PROGRESS** (implementation Steps 0–4 of the
approved plan done — security boundary, execution contract, response UI,
tests; Step 5 — real end-to-end verification by the user with a real key —
and Step 7 — the Opus security-review gate — are not yet done; no
completion gate reached, nothing approved yet)

Current branch:
`phase/live-playground` (from `main` @ `c99ef81`, which includes the
approved Phase 4; `main` was fast-forwarded to `c99ef81` when this plan was
approved, same precedent as Phase 4)

Previous phase:
**Phase 4 — One Real Proxy API Endpoint: COMPLETE AND APPROVED** (approved 2026-09-25, gate option B; all 7 steps of the approved plan done, U-11 resolved)

Previous phases:
- Phase 1: approved, tagged `v0.1-design-approved`, merged.
- Phase 2: approved 2026-09-24, tagged `v0.2-shell-approved` (`20597af`).
- Phase 3: approved 2026-09-24, no milestone tag (audit-only phase).
- Phase 4: approved 2026-09-25, tagged `v0.3-proxy-prototype-approved`.

## Phase 5 work done so far (not yet complete)

- **Planning decisions** (Opus 5.5, before implementation): U-08 decided —
  only `proxy/info-extensions` allowlisted; anonymous access with
  same-origin/rate-limit/kill-switch controls; in-memory rate limiter
  behind a swappable interface; credential-in-upstream-URL accepted as a
  documented, known limitation. Full detail in `docs/DECISIONS.md` "Phase 5
  planning".
- **Server boundary** (`src/server/playground/` + `src/app/api/playground/
  route.ts`): allowlist resolved from the content model and asserted at
  load; strict request validation (no fixed-query override, no credential
  smuggling); redirects never followed; timeout and response-size ceiling
  enforced; every upstream/network failure mapped to a fixed code, never
  the underlying error message; sanitized, field-limited logging; a
  same-origin + JSON-only + size-capped + rate-limited request pipeline; a
  kill switch defaulting to off. See `docs/SECURITY.md` "Implementation
  (Phase 5)" for the full mapping to each proxy requirement.
- **Execution contract** (`src/components/playground/executor.ts`):
  separate `liveProvider`/`demoProvider`, no fallback path between them;
  the credential travels browser→portal only in the POST body, is masked
  (`••••`) everywhere it's rendered, and is swapped for its env var name
  only in the copyable curl sample.
- **Response UI** (`response-viewer.tsx`, `request-builder.tsx`,
  `json-viewer.tsx`): Live stamp, status/latency/size, Body/Headers/Request
  tabs, a distinct callout per portal-error code (with retry-after where
  applicable), non-JSON body rendered as escaped text, Download JSON added
  to the JSON viewer. Also fixed a real pre-existing bug found while wiring
  this up: the Live API-key input's placeholder always showed
  `$SAMPLE_API_KEY` regardless of the endpoint's own auth env var, because
  `RequestBuilder` used a hardcoded constant instead of the already-existing
  (but unexported) per-endpoint `authEnvVar()` helper.
- **Tests**: 35 new server unit tests + 11 executor unit tests (78/78 unit
  tests total) asserting the fake test credential/tenant never leak into a
  response, log line, or thrown-error string across every failure path.
  20 new Playwright tests (98/98 total, Chromium + WebKit) covering
  per-endpoint Live allowlisting, client-side missing-credential
  validation, a full Live success round trip (desktop + mobile), every
  portal-error code, Download JSON, and direct route-level checks (GET →
  405, foreign Origin → 403) — all via `page.route` mocks, so no test ever
  reaches the real 1com host even though the e2e server itself runs with
  `PLAYGROUND_LIVE_ENABLED=true` (`playwright.config.ts`).
- **Validation performed so far**: `npm run check` (typecheck + lint +
  78/78 unit tests), `npm run build`, 98/98 Playwright tests (fresh
  `build && start`), manual visual pass (1440/900 desktop, 390/844 mobile,
  en + he) covering Live success, every portal-error tone, and the
  disabled/not-allowlisted states — zero console errors observed.
- **Not yet done**: Step 5 (the user performs a real Live call against
  1com with their own key, outside this session, so Claude never receives
  it; only after that succeeds does `info-extensions`'s `verification.tested`
  flag get set), Step 6 remaining doc updates beyond this file and
  `DECISIONS.md`/`unresolved.md`/`SECURITY.md`/`ENVIRONMENT.md`/
  `ARCHITECTURE.md` (already done), and Step 7 (switch to Opus 5.5, run the
  `security-review` skill over the branch diff, fix findings, then present
  the Phase Completion Report and gate). Nothing in this phase is approved
  yet; `phase/live-playground` is not merged into `main`.

## Phase 4 work done

- **Content model** (`src/content/types.ts`, `docs/API_CONTENT_MODEL.md`):
  extended additively for reqtype-style (non-REST) APIs — `fixedQuery`,
  `methodBasis`, `Authentication.location/parameter/scope`, tri-state
  `Requirement`, `ResponseSpec.format/evidence`, `errors: ErrorSpec[] |
  "undocumented"`, `notes`. The Sample API needed no content changes,
  confirming the model stayed API-neutral.
- **Proxy content** (`src/content/proxy-api.ts`): the `info-extensions`
  endpoint (`reqtype=INFO&info=EXTENSIONS`), hand-authored from the Phase 3
  audit evidence. Registered first in `src/content/index.ts` — the Proxy
  API is now the default API across home, the reference redirect, and the
  Playground. The Sample API is kept, still clearly labelled prototype.
- **Code samples** (`src/lib/code-samples.ts`): a new query-parameter-auth
  branch (curl `-G`/`--data-urlencode`, JS `URLSearchParams`, Python
  `requests.get(params=...)`), env var name derived per API
  (`PROXY_API_KEY`). The existing header-auth branch (Sample API) is
  unchanged and pinned by a regression test.
- **Components adapted, none Proxy-specific**: endpoint reference view
  (fixed-query path line, method-inferred note, auth scope/location note,
  a "Fixed parameters" section, legacy callout, "Not documented by the
  source" fallback for undocumented responses/errors, a Notes section),
  parameter list and Playground field (tri-state required indicator),
  response example (evidence badge), Playground state/response viewer
  (Demo never fabricates or replays data for a non-synthetic API — shows
  "Demo data not available yet" instead), the API overview page's
  quickstart (now generated from the API's own auth/endpoint via
  `buildSample`, not hardcoded).
- **Three real, pre-existing bugs found and fixed** (invisible before
  because Sample API was always the only/default API, or because no real
  response existed yet to render): the reference sidebar's API/version
  switcher was hardcoded to the Sample API with a non-functional `<select>`
  (now reads the current API from the URL and actually navigates on
  change); the Playground page always used the first API regardless of the
  requested endpoint's own API; the response-schema heading read "Request
  body" (reused the wrong i18n key) — a dedicated `endpoint.responseBody`
  key now reads "Response body". Also removed "Proxy API" from two
  remaining "coming later" lists (home page, sidebar).
- **U-11 resolved**: the user supplied a sanitized real response to
  `reqtype=INFO&info=EXTENSIONS` (captured on a tenant described as
  "demo"). Extension names in the raw capture were real individuals'
  names; redacted to placeholders (`REDACTED_NAME_n`) before anything was
  written to disk. Saved as evidence at
  `source-docs/observed/info-extensions.json`; `proxy-api.ts`'s response
  schema/example are derived from it only, `evidence: "observed-sanitized"`
  (never replayed by Demo). Discovered fact: the response is a JSON object
  keyed by each extension's `ex_id`, not an array — observed, not
  vendor-documented.
- **Performance fix**: `buildPlaygroundSamples` is now cached per API id
  (matching the existing `getSearchIndex()` pattern) instead of
  recomputing shiki syntax highlighting on every request.
- **i18n**: new keys added to both `messages/en.json` and `messages/he.json`.
- **Tests**: 5 new unit tests (query-auth code samples + a Sample-API
  regression guard) and 5 new Playwright tests (legacy badge, fixed
  params, undocumented states, Try-in-Playground, Demo-never-fabricates,
  tri-state-required-never-blocks-Send). Also fixed a pre-existing
  Playwright reliability issue: the console-error check used
  `waitForLoadState("networkidle")`, which is flaky under Next.js's
  Link-prefetch fan-out (Playwright's own docs discourage relying on it);
  switched to `waitForLoadState("load")` plus a short settle window.

## Validation

- `npm run check` (typecheck + lint + 32 unit tests): pass.
- `npm run build`: pass, all routes compile.
- `npx playwright test`: **80/80 pass**, Chromium + WebKit, against a
  fresh `next build && next start` (not `next dev` — a long-lived dev
  server produced an unrelated, dev-only React console warning that a
  clean production server does not).
- Manual visual pass (screenshots): desktop 1440, tablet 1024/768, mobile
  390; en and he (RTL); the Proxy endpoint page, its overview page, home,
  the getting-started guide, and the Playground in both Demo states. Also
  re-checked desktop 1440/900 and mobile 390/844 after the response/U-11
  content landed. Zero console errors observed throughout.
- Secrets scan: no real keys, tenant codes, or credentials introduced;
  code samples reference an env var, never an inline value. The raw
  response capture's key/tenant were already redacted by the user before
  being shared; names were redacted before anything was written to disk.

## Known issues / limitations

- All Phase 2 carry-over items remain open (SVG logo, Console link,
  Hebrew UI strings still DRAFT, reference screenshots not committed,
  two design-doc tensions, one acknowledged non-bug storage-sync
  duplication).
- Phase 3's `source-docs/unresolved.md` items U-02 and U-04 were applied
  at their audit-recommended defaults (original prose; errors
  undocumented), not explicitly decided by the user — reversible.
- U-08 (Live allowlist scope) and U-10 (the 23 table-only reqtypes) remain
  open; neither blocks Phase 4.

Remaining in this phase:
Step 5 (user-run real Live verification), Step 7 (Opus 5.5 security review
+ Phase Completion Report + approval gate). See
`docs/phases/05-live-playground.md` and the plan file referenced in
`docs/SESSION_HANDOFF.md`.

Resume: see `docs/SESSION_HANDOFF.md`.
