# Decisions Log

Record decisions that should not be repeatedly re-litigated.

## 2026-09-24 — Initial architecture direction

Decision:
Use a modern developer-portal architecture rather than a static documentation-only site.

Direction:
- Next.js
- React
- TypeScript
- Tailwind CSS
- MDX
- OpenAPI-compatible internal model

Status:
Approved in planning discussion.

---

## 2026-09-24 — Proxy API first

Decision:
Proxy API is the pilot API because its smaller documentation surface makes it suitable for validating the architecture.

Status:
Approved in planning discussion.

---

## 2026-09-24 — One-endpoint prototype gate

Decision:
Implement exactly one suitable real Proxy API endpoint end-to-end before scaling.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Demo environment

Decision:
Demo mode uses the same Playground UI but a separate Demo provider and never touches production systems.

Status:
Approved in planning discussion.

---

## 2026-09-24 — No-guessing protocol

Decision:
Material ambiguity requires clarification rather than silent assumptions.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Git workflow

Decision:
Use `main` as the approved stable branch plus phase branches and approval tags.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Model routing

Decision:
- Sonnet 5 is the default implementation model.
- Opus 5.5 handles high-consequence architecture/security/review.
- Haiku 4.5 is restricted to low-risk repetitive work.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Phase 1 setup choices

Decision:
- Git initialized locally: `main` baseline + `phase/design-research`. No remote.
- Research tooling: WebSearch/WebFetch + Playwright screenshots (scratchpad, not committed) + `impeccable` rules in place of UI/UX Pro Max (not installed).
- Brand cues derived from public 1com.co.il, marked UNCONFIRMED.
- Locales: English + Hebrew (RTL) from the start.

Status:
Approved by user (plan approval, 2026-09-24).

---

## 2026-09-24 — Design direction (Phase 1 output)

Decision:
- Restrained color strategy on brand-hue-tinted neutrals; brand indigo (official) `#3731ee` as accent, violet `#781df0` as hover; lightened tint for dark mode.
- Light + dark, default follows OS; code/JSON surfaces dark in both.
- Assistant (official brand font; UI, Hebrew+Latin) + JetBrains Mono (code).
- Radii 4/6/10px.
- Three-column endpoint layout with sticky request panel; nothing hidden on mobile.
- Dedicated Playground route with persistent Live/Demo mode bar (amber Live, teal Demo) and per-response source stamp.
- Four lifecycle states shown as page banner + inline badge.

Status:
Approved by user at Phase 1 gate (2026-09-24). See `design-system/MASTER.md` "Resolved decisions".

Deferred (non-blocking):
- SVG logo availability (only raster PNG known).
- Hebrew content scope (chrome / guides / reference prose) — decide before Phase 3/4 content model.
- Sign-in / Console link destination — decide before Phase 2 nav is finalized.
- Whether to commit reference screenshots (currently no).

---

## 2026-09-24 — Process notes

Decision:
- `impeccable` init (PRODUCT.md creation) skipped: outside approved Phase 1 file scope.
- Reference-portal screenshots not committed (third-party imagery); regenerable.

Status:
Applied; revisit at gate if user prefers otherwise.

---

## 2026-09-24 — Phase 1 merge

Decision:
`phase/design-research` fast-forward merged into `main` (`dc5f5bc`).

Status:
Approved by user.

---

## 2026-09-24 — Phase 2 setup

Decision:
- Toolchain: Node 24.15.0 (LTS), npm 12.0.2. Next.js 16.3.6 (App Router, `src/`), React 19.2.8, TypeScript 5.9, Tailwind CSS 4.3.3, next-intl 4.14.7 (`/en`, `/he` prefixes via `src/proxy.ts`), shiki 4 (server-side highlighting), lucide-react (icons), vitest 5, @playwright/test 1.63.
- Prototype content: synthetic, clearly labelled "Sample API" (fictional endpoints, example.com host, 555-01xx numbers). No Proxy API claims before the Phase 3 audit.
- Header branding: official raster PNG logo from 1com.co.il, rendered as a CSS mask in theme ink colour. Swap for the SVG logo when it is provided.
- Console button: present but inert ("not available yet") until the destination is decided.
- Hebrew: UI chrome strings drafted by Claude, marked DRAFT for native review. API content prose stays English with a "not translated yet" banner until the Hebrew scope is decided.
- `AGENTS.md` added so `next dev` writes its agent rules there rather than into `CLAUDE.md`.

Status:
Approved by user (2026-09-24), except the implementation details noted as reversible.

---

## 2026-09-24 — Phase 2 approval

Decision:
Phase 2 (Design Prototype) is complete and approved. All routes/components
listed in `docs/CURRENT_STATUS.md` are built; `npm run check`, `npm run build`
and `npm run test:e2e` (58 Playwright tests, Chromium + WebKit) pass; a
`code-review` pass and a manual UI audit against `design-system/MASTER.md`
were completed and their findings fixed (see `docs/SESSION_HANDOFF.md`).

Scope:
Approval covers the Phase 2 prototype only (visual/interaction shell over
synthetic content). It does not authorize Phase 3 (Proxy API audit) or any
later phase — those need their own separate, explicit approval per
`CLAUDE.md`'s approval-gate rule.

Consequences:
- `phase/design-prototype` remains unmerged into `main` as of this decision;
  merging still needs separate explicit approval per the Git workflow rules.
- Known issues/limitations recorded at approval time (SVG logo unavailable,
  Console link destination undecided, Hebrew content scope deferred, two
  design-system documentation tensions, one acknowledged non-bug code-quality
  duplication) are accepted as-is for this phase, not blockers.

Status:
Approved by user (2026-09-24).

---

## 2026-09-24 — Phase 3 setup (Proxy API audit)

Decision (user, via plan-mode questions and plan approval):
- Source of the existing Proxy API docs: the public vendor page
  https://manual.mirtapbx.com/books/api/page/old-proxyapi-legacy-proxy-api-reference-and-examples
  (MiRTA PBX `proxyapi.php`). 1com runs MiRTA PBX.
- Proxy API stays first, even though the vendor calls it legacy and recommends
  OpenAPI for new integrations. How the portal labels it is not decided (U-03).
- Every documented reqtype is exposed to 1com customers. How this squares with
  admin-key-only operations is open (U-09).
- Scope: full audit of the Proxy page only. The 38 OpenAPI pages are indexed
  in `source-docs/inventory.json` as out of scope (Phase 8).
- Docs only: no live API calls in Phase 3. Everything stays DOCUMENTED.
- Hebrew content scope: deferred to Phase 4.
- Git: `phase/design-prototype` fast-forwarded into `main` (`1980a72`).
  Phase 3 branch `phase/proxy-api-audit` created off `main`. The tag
  `v0.2-shell-approved` already existed (user-created, annotated, on
  `20597af`), so it was left unchanged.
- Model: Opus 5.5 for the whole phase (interpretation, content-model fit,
  security findings). `CLAUDE.md` routing is canonical over the phase doc's
  "Sonnet 5" line.

Process notes (reversible, Claude's choice):
- Vendor pages are kept as local evidence snapshots with hashes. The
  session CSRF token is redacted before commit.
- Normalized data is split one YAML file per reqtype, with operations
  nested inside.

Status:
Applied. The Phase 3 audit is complete and awaiting approval at the gate.

---

## 2026-09-24 — Phase 3 approval

Decision:
Phase 3 (Proxy API Audit) is complete and approved (gate option A). Outputs:
`source-docs/{raw/,proxy-api/,inventory.json,DOCS_AUDIT.md,unresolved.md}`.

Scope:
Approval covers the audit only. The 11 items in `source-docs/unresolved.md`
stay open and are not decided by this approval. Option A authorizes Phase 4
*planning* only; implementation needs separate approval of the Phase 4 plan.

Consequences:
- `phase/proxy-api-audit` is not merged into `main`; merging needs explicit
  approval.
- No milestone tag was created (the suggested tag list has no audit-phase tag).

Status:
Approved by user (2026-09-24).

---

## 2026-09-25 — Phase 4 implementation (One Real Proxy API Endpoint)

Decision (user, via plan-mode questions and plan approval, 2026-09-24/25):
- Endpoint: `reqtype=INFO&info=EXTENSIONS` (list / by id / by number).
- Host: `https://pbx6webserver.1com.co.il/pbx/proxyapi.php`, fixed, never
  changes for proxyapi. Differs from the vendor's own `/mirtapbx/` path.
- Auth: a tenant key, including a read-only one, is sufficient.
- Lifecycle: `legacy` badge plus a note that the vendor recommends OpenAPI
  for new integrations.
- Hebrew: English endpoint prose plus the existing "not translated yet"
  banner, unchanged from Phase 2. Content model stays single-locale.
- Content model: extend the existing API-neutral model rather than modeling
  Proxy as synthetic REST or as a separate model (U-07).
- Sample API: kept, clearly labelled prototype. Proxy API is now `apis[0]`
  (the default API across home, the API-reference redirect, and Playground).
- Response (U-11): the user supplied one sanitized real response to
  `reqtype=INFO&info=EXTENSIONS` (2026-09-25), captured on a tenant
  described as "demo". Extension names in the raw capture were real
  individuals' names; the user chose to have them replaced with placeholders
  (`REDACTED_NAME_n`) before anything was written to disk. Saved as evidence
  at `source-docs/observed/info-extensions.json`; the schema and example in
  `proxy-api.ts` are derived from it only, `evidence: "observed-sanitized"`.
  The response is a JSON object keyed by each extension's `ex_id`, not an
  array — itself an observed fact, not vendor-documented.
- Errors and the vendor-text-reuse question (U-02, U-04) were left at their
  audit-recommended defaults (undocumented / original prose), not decided
  by the user; both are reversible.

Implementation notes (Claude's engineering choices, reversible):
- `src/content/proxy-api.ts` is hand-authored from the Phase 3 YAML
  evidence, not generated. A YAML→content generator is a Phase 7 concern.
- Query-parameter authentication (the Proxy API's `key`) is a new code-path
  in `src/lib/code-samples.ts`, additive alongside the existing header-auth
  path; the Sample API's samples are pinned unchanged by a regression test.
- Fixed two real, pre-existing bugs surfaced by having a second real API
  (previously masked because Sample API was always `apis[0]`):
  1. `ReferenceNav`'s API/version switcher was hardcoded to `apiId="sample"`
     and its `<select>` had no `onChange` — it always showed Sample API's
     sidebar regardless of the page being viewed, and picking an option did
     nothing. Fixed by making it a client component that reads the current
     API from the path (`usePathname`) and wired the switcher to navigate.
  2. `playground/page.tsx` always used `apis[0]` regardless of the
     requested endpoint's own API, and the home page's/API-overview page's
     "planned APIs" list still listed "Proxy API" as not-yet-documented.
     Both fixed.
- Playground's Demo mode never replays a response for a non-synthetic API
  (`PlaygroundResponse` gained an `unavailable` variant); it shows "Demo
  data not available yet" instead. This upholds the Evidence rule even once
  a real (`observed-sanitized`) response is eventually added — Demo must
  still never replay it.
- `buildPlaygroundSamples` is now cached per API id (like the existing
  `getSearchIndex()`), fixing a genuine performance issue: it recomputed
  shiki highlighting for every endpoint/language on every request/prefetch.
  Also fixed `tests/e2e/smoke.spec.ts`'s console-error check to use
  `waitForLoadState("load")` instead of `"networkidle"` — Next's Link
  prefetching keeps the network busy in the background, which is normal,
  not a defect, and Playwright's own docs discourage relying on
  `networkidle` for this reason.

Status:
Applied. All 7 steps of the approved plan are complete and verified
(`npm run check`, `npm run build`, 80/80 Playwright tests on Chromium +
WebKit, manual visual pass at 1440/900 desktop and 390/844 mobile, zero
console errors). U-11 is resolved. A pre-existing mislabeling bug was found
and fixed while reviewing the rendered response section: the "Response
body" schema heading reused the `endpoint.body` string ("Request body"),
which is meant for actual request bodies — added a separate
`endpoint.responseBody` key (en/he) and pointed the response heading at it.

---

## 2026-09-25 — Phase 4 approval

Decision:
Phase 4 (One Real Proxy API Endpoint) is complete and approved (gate option
B). All 7 steps of the approved plan are done, including U-11 (the sole
blocker): a user-supplied sanitized real response is now the endpoint's
documented response, evidence-labelled `observed-sanitized` and never
replayed by Demo. `npm run check`, `npm run build`, and 80/80 Playwright
tests (Chromium + WebKit) pass; manual visual pass at desktop and mobile
widths shows zero console errors.

Scope:
Approval covers the Phase 4 vertical slice only (one endpoint, real content,
Live/Demo behavior for it). It does not authorize merging
`phase/one-endpoint` into `main`, scaling to the remaining Proxy API
reqtypes (Phase 7), or starting Phase 5 (Live Playground) — each needs its
own separate, explicit approval per `CLAUDE.md`'s approval-gate rule.

Consequences:
- `phase/one-endpoint` remains unmerged into `main`; merging needs separate
  explicit approval.
- Tagged `v0.3-proxy-prototype-approved` on the phase-completion commit, per
  `CLAUDE.md`'s suggested milestone tags.
- Known limitations recorded at approval time (SVG logo, Console link
  destination, Hebrew UI strings DRAFT, two Phase-2 design-doc tensions,
  U-02/U-04 applied at audit defaults not user-decided, U-08 Live-allowlist
  scope open, U-10 the 23 table-only reqtypes open) are accepted as-is for
  this phase, not blockers. U-08 must be decided before Phase 5.
- Per Phase 5's own model note (`docs/phases/05-live-playground.md`), Opus
  5.5 is required for its security-sensitive proxy-boundary architecture
  before implementation begins; Sonnet 5 remains correct for the current
  stopped state.

Status:
Approved by user (2026-09-25). Next phase (Phase 5 — Live Playground) has
not started and is waiting for user approval to begin planning.

---

## 2026-09-25 — Phase 5 planning: Live Playground security boundary

Decisions (Opus 5.5, before any implementation, per this phase's own model
note):

- **U-08 (Live allowlist scope)**: decided narrower than either original
  option — only `proxy/info-extensions` (the one Phase 4 endpoint) is
  allowlisted, not "every read-only reqtype." Widening is a separate, later,
  explicit decision (Phase 7 scope). See `source-docs/unresolved.md` U-08.
- **Access to `/api/playground`**: anonymous, no portal login. The caller
  supplies their own 1com key each time. Controls: same-origin check
  (`Origin`/`Sec-Fetch-Site` vs `Host`), JSON-only POST, an 8 KiB request
  cap, a per-client rate limit, and a kill switch
  (`PLAYGROUND_LIVE_ENABLED`, default off).
- **Deployment / rate-limit storage**: undecided, so the limiter is an
  in-memory sliding window behind a `RateLimiter` interface
  (`src/server/playground/rate-limit.ts`), swappable for a shared store
  (e.g. Redis) without touching the route. Documented limitation:
  per-process, so N instances allow N× the limit. Client-IP trust is
  env-controlled (`PLAYGROUND_TRUSTED_IP_HEADER`, unset by default — every
  caller then shares one bucket).
- **Credential in the upstream URL**: accepted. The Proxy API's `key` is
  only ever documented as a query parameter; the portal forwards it that
  way to `pbx6webserver.1com.co.il`, so it may appear in 1com's own
  access logs — a known upstream limitation (`docs/SECURITY.md`), not
  something this portal can avoid while honoring the documented contract.
  The browser→portal leg never carries it this way: the credential is
  POST-body-only there, and never appears in a portal-controlled URL,
  application log, or error message (verified by unit tests asserting the
  fake key/tenant used in tests never appear in any response, log line, or
  thrown-error string).

Architecture implemented against these decisions:

- `src/server/playground/` (`config`, `allowlist`, `validate`, `execute`,
  `rate-limit`, `log`) + `src/app/api/playground/route.ts`: the only code
  path that may reach `pbx6webserver.1com.co.il`. The allowlist resolves
  from the content model (`src/content/proxy-api.ts`) and asserts its
  origin at module load; `validate.ts` rejects unknown fields, fixed-query
  overrides, and credential-as-param attempts; `execute.ts` never follows a
  redirect, enforces a timeout and response-size ceiling, and maps every
  failure to a fixed code — never the underlying error message, since
  Node's fetch errors can embed the request URL (and so the key).
- `src/components/playground/executor.ts`: the client-side execution
  contract (`docs/ARCHITECTURE.md`'s `ApiExecutor`) — separate `liveProvider`
  and `demoProvider`, no code path from a Live failure to Demo data. The
  rendered "Request" tab and curl sample always show the credential masked
  (`••••`), swapped for its env var name only in the copyable curl line.
- `playwright.config.ts`: the e2e server runs with `PLAYGROUND_LIVE_ENABLED=
  true` so the allowlisted endpoint's Send button is actually enabled to
  test; every Live-sending e2e test installs a `page.route("**/api/
  playground", ...)` mock first, so no test can reach the real 1com host.

Status:
Implemented and validated: `npm run check` (78/78 unit tests, including
server-boundary tests asserting the fake credential/tenant never leak into
a response, log line, or error), `npm run build`, 98/98 Playwright tests
(Chromium + WebKit, fresh `build && start`), manual visual pass (desktop
1440, mobile 390, en + he) covering Live success, each portal-error code,
and the disabled/not-allowlisted states — zero console errors. Real
end-to-end verification against the live 1com host (with a real key) is a
separate step the user performs directly (`docs/phases/05-live-playground.md`
Step 5) — Claude does not receive or handle a real credential. Not yet
reached: the final Opus security-review gate before the phase completion
report.

---

## 2026-09-25 — Phase 5 Step 5: first real Live call, A-40 decisions

Context:
The first real call (user-supplied key, `tenant=demo`, through the portal's
Live proxy) showed the documented response was wrong (A-40): the default
output is a pipe-delimited table with a `Password` column; `format=json`
is an array of about 148-field config records including credentials, 2FA
params, PINs and PII; xml/csv returned empty bodies.

Decisions (user, 2026-09-25):
- `format` becomes an allowlisted, enum-restricted param. It was first
  exposed as plain/json/xml/csv, then narrowed to **plain/json** once
  xml/csv were observed to return empty bodies.
- **Server-side redaction** of credential-like values
  (`src/server/playground/redact.ts`), which fails closed (whole body
  withheld) when it can't align a sensitive column.
- **JSON field allowlist**: Live returns only `ex_id, ex_number, ex_name,
  ex_tech, st_state, username` per item (the plain table's columns minus
  Password); everything else is dropped on the server, with redaction as a
  second layer. Unit-tested to match the documented schema exactly.
- **Reference docs rewritten from observation** (structure only, synthetic
  example values); the U-11 sample is superseded.

Consequences:
- `info-extensions`: `verification.tested = true`, `verified = false` (one
  tenant observed; pagination, id+number combination, and full enum values
  are still undocumented). The footer now shows the tested stage.
- Content-model limitation: responses are keyed by status, so the two
  observed 200 formats are documented as one response plus a description.
  Multi-format responses belong to Phase 7 model work.

---

## 2026-09-25 — Phase 5 approval

Decision:
Phase 5 (Live Playground) is complete and approved (gate option B). The
Live proxy for `proxy/info-extensions` works end to end against the real
1com host with server-side sanitization (A-40 decisions above). Validation:
`npm run check` (111/111), `npm run build`, 98/98 Playwright (Chromium +
WebKit, fresh build), Opus security review (no high/medium; three low
fixed), visual pass desktop/mobile en/he, zero console errors.

Scope:
Approval covers Phase 5 only. It does not authorize merging
`phase/live-playground` into `main`, starting Phase 6 (Demo mode), or any
deployment. Each needs its own explicit approval.

Consequences:
- Accepted as known limitations: no CSP yet (deployment decision); in-memory,
  shared-bucket rate limiter until a trusted IP header is configured; the
  Origin-vs-Host check depends on the reverse proxy; the key may appear in
  1com's access logs; the redaction module was added after the formal
  security review (covered by unit tests and a real-host check, but a
  focused second review is recommended); `verified: false` for
  info-extensions; single-format-per-status content-model limitation;
  Phase 2 carry-overs.
- A production key was pasted into the chat for Step 5; rotation recommended.
- No milestone tag: `CLAUDE.md`'s suggested tags have none for the Live
  Playground phase, and none was requested.

Status:
Approved by user (2026-09-25). Phase 6 (Demo mode) has not started and is
waiting for user approval to begin planning.

---

## 2026-09-25 — Phase 5 adjustment: more Live endpoints (pre-merge)

Context:
Before merging Phase 5, the user asked for (1) a roughly 50/50
request/response Playground layout and (2) more Live endpoints, chosen by
the user, without broadening the proxy generically. Plan:
`C:\Users\ivgi-pc\.claude\plans\where-wi-stopped-delegated-willow.md`.

Decisions (user, 2026-09-25):
- The user asked for `AGENT/LISTQUEUES` and `CDR/GET`.
  - LISTQUEUES returned an empty body in every case, controls included
    (A-41), so it is **not added**. The user replaced it with
    **`INFO info=agents`** (A-43), an operation the source names but never
    exemplifies.
- **CDR GET**:
  - `field` is fixed to `userfield` (fixedQuery, never caller-set).
  - `uniqueid` is pattern-checked.
  - No `format` parameter.
  - The raw userfield is shown as returned (A-42).
- **INFO/agents**:
  - `queue` is optional and digits only.
  - `format` is plain/json.
  - The JSON field allowlist is all 10 observed positions (`0,1,2,4-8,10,11`).
- Response structure was obtained by a **structure-only probe**. It printed
  names, types and counts, not values, and was run from a scratchpad script
  that is not committed. The user supplied a key, `queue=3698` and a CDR
  uniqueid for it.
- Both endpoints appear in the Reference and the Playground, marked
  `legacy`, `tested: true`, `verified: false`.

Consequences:
- `allowlist.ts` moves from two parallel constants to one
  per-endpoint `LIVE_POLICIES` map. It adds `paramPatterns`, enforced in
  `validate.ts`.
- New content categories: Queues (`info-agents`) and Call records
  (`cdr-get`).
- The Live response viewer explains an empty 200, since both new endpoints
  answer "not found" with HTTP 200.
- The layout change (step 8) runs on Sonnet 5 after this checkpoint.
