# Current Status

Current work:
**Proxy API documentation baseline reset — IN PROGRESS** (started
2026-09-25 on branch `docs/proxy-api-rebuild`, from `phase/demo-mode` @
`c802eb9`). The user directed discarding the MiRTA-sourced audit as
authoritative and rebuilding `source-docs/proxy-api/` from 1com's own
documentation (a Google Site + its linked Google Doc). This **suspends**
Phase 6 below — its Step 1 probe and its 7 Demo example selections are
voided, not decided differently; the user will re-supply the 7 examples
against the rebuilt documentation. Full detail: `docs/DECISIONS.md`
"Proxy API documentation baseline reset", `source-docs/DOCS_AUDIT.md`
§10, `source-docs/unresolved.md` U-12–U-16. See `docs/SESSION_HANDOFF.md`.

Paused phase (suspended by the rebuild above, not abandoned):
**Phase 6 — Demo mode: PAUSED** (started 2026-09-25 on branch
`phase/demo-mode`, from `main` @ `b37e51c`). Approved plan:
`C:\Users\ivgi-pc\.claude\plans\start-phase-06-harmonic-cherny.md`. Scope and
decisions are in `docs/DECISIONS.md` under "Phase 6 planning" — **now
superseded by the documentation reset**; the 7 examples it names will be
re-supplied and re-mapped before any Phase 6 work resumes. Step 0 is
done. Step 1 (a structure-only probe of INFO DIDS/SIMPLECDRS/EXTSTATE/
QUEUELOGS) is incomplete: one partial run covered EXTSTATE only, and the
probe script is currently broken (a SyntaxError) — this is now moot for
the DIDS/SIMPLECDRS/EXTSTATE/QUEUELOGS operations named in the old scope,
since that scope itself needs re-deciding. See `docs/SESSION_HANDOFF.md`.

Previous phase:
**Phase 5 — Live Playground: COMPLETE AND APPROVED, including both
pre-merge adjustment rounds** (Phase 5 approved 2026-09-25, gate B. Two
rounds of pre-merge adjustment followed, both approved gate B: round 1 —
endpoints + layout; round 2 — 3 UX fixes, described below. The user
fast-forward merged `phase/live-playground` into `main` (`b37e51c`).
No tag.)

## Phase 5 adjustment round 1 (committed: `d9994a1`, `f20c899`)

- Two more Live endpoints, `proxy/info-agents` and `proxy/cdr-get`, with
  per-endpoint param patterns and JSON field allowlists (`LIVE_POLICIES`).
  Probe findings A-41..A-43. LISTQUEUES was not added (no observable data,
  A-41). Content entries in both the Reference and the Playground. An
  empty-200 note in the Live response viewer. 55 new unit tests, 3 new
  Playwright tests. Real-host verification through the portal, logs
  scanned. Security review; one low-risk hardening applied.
- 50/50 request/response layout at lg/xl (`playground-app.tsx`); a new lg
  3-column breakpoint (1024-1279) that previously stacked. md/mobile
  unchanged. Removed the JSON viewer's own fixed 24rem inner scroll cap.
- Fully validated at the time: `npm run check` (166/166), `npm run build`,
  104/104 Playwright, manual visual pass en/he, secret scan clean.

## Phase 5 adjustment round 2 — 3 UX fixes (approved 2026-09-25, gate B)

Full detail: `docs/DECISIONS.md` "Phase 5 UX fixes",
`docs/SESSION_HANDOFF.md`.

- **Task 1** (`use-playground.ts`): tenant + API key now survive switching
  Live endpoints; endpoint-specific fields still reset normally.
- **Task 2** (`json-viewer.tsx`, `response-viewer.tsx`): the response
  toolbar stays visible over a long response. First attempt used CSS
  `position: sticky` and had a real bug — content rendered behind the
  toolbar, reported and reproduced by the user. Fixed by replacing sticky
  with a self-contained flex column (non-sticky header + its own scrolling
  content div), which makes the overlap structurally impossible rather
  than papering over it with CSS.
- **Task 3** (`response-viewer.tsx`): a "cURL" label added next to the
  existing "GET" label in the Request tab.
- **Status**: implemented and fully validated. `npm run check` (166/166
  unit tests) and `npm run build` clean. Full Playwright suite re-run to
  completion on a fresh build (108/108, Chromium + WebKit, port 3100
  since :3000 is held by an untouched stale process). Manual visual pass
  via a throwaway screenshot script confirmed all three tasks at desktop
  and tablet widths in both en and he (RTL); zero console errors across
  every locale/viewport combination tested. One known gap: Tasks 1/2
  weren't separately screenshotted at the mobile viewport (see
  `docs/SESSION_HANDOFF.md` for why this is considered low-risk, not
  unverified).
- **Approved** 2026-09-25 (gate option B): approve, save, and stop. The
  user then merged the branch into `main` (fast-forward, `b37e51c`).


Current branch:
`docs/proxy-api-rebuild` (from `phase/demo-mode` @ `c802eb9`, which is
itself from `main` @ `b37e51c`). `phase/demo-mode` is untouched and still
exists, paused.

Earlier phase:
**Phase 4 — One Real Proxy API Endpoint: COMPLETE AND APPROVED** (approved 2026-09-25, gate option B; all 7 steps of the approved plan done, U-11 resolved)

Previous phases:
- Phase 1: approved, tagged `v0.1-design-approved`, merged.
- Phase 2: approved 2026-09-24, tagged `v0.2-shell-approved` (`20597af`).
- Phase 3: approved 2026-09-24, no milestone tag (audit-only phase).
- Phase 4: approved 2026-09-25, tagged `v0.3-proxy-prototype-approved`.

## Phase 5 work done

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
- **Step 5 + A-40** (real call, user's key, `tenant=demo`, via the proxy): the
  documented response was wrong. Decisions: `format` allowlisted as
  plain/json; server-side JSON field allowlist (6 fields) plus
  credential redaction that fails closed; reference docs rewritten from the
  observed structure (U-11 superseded). Re-verified against the real host:
  JSON returns exactly the 6 fields (142 dropped); no password survives in
  plain output; logs contain no key/tenant/URL. `info-extensions` is
  `tested: true`, `verified: false`.
- **Security review** (Opus): no high/medium findings; three low fixed;
  accepted/open items in `docs/SECURITY.md`.
- **Final validation**: `npm run check` (111/111 unit), `npm run build`,
  98/98 Playwright (fresh build), visual pass of the reference page and the
  Live notes; zero console errors.

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

Next phase:
**Phase 7 — Proxy API rollout** (`docs/phases/07-proxy-api-rollout.md`).
Not started.

Resume: see `docs/SESSION_HANDOFF.md`.
