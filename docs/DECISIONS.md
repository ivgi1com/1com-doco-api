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

---

## 2026-09-25 — Phase 5 UX fixes (pre-merge, approved gate B)

Context:
After the endpoints + 50/50 layout checkpoint (`f20c899`), the user asked
for three targeted UX fixes before merge: (1) tenant + API key persist
across a Live endpoint switch, (2) the JSON response toolbar stays visible
over a long response, (3) a "cURL" label matching the existing "GET" label
in the Request tab.

Decision (Task 1 — shared Live-mode fields):
`tenant` is tracked in an in-memory ref inside `usePlayground`
(`use-playground.ts`), restored at both places that reset per-endpoint
field state (an endpoint switch, and switching Demo→Live), mirroring why
the API key already survived those resets. No sessionStorage, no new
browser persistence — the user asked specifically for in-memory/session
state, not long-term storage.

Decision (Task 2 — sticky toolbar) and the bug it produced:
The first implementation used CSS `position: sticky` on the toolbar,
relative to `response-viewer.tsx`'s own scroll container. The user reported
real JSON content rendering behind/inside the toolbar (e.g. `"11": "236"`
visible inside the sticky region) and asked for the structure to be fixed,
not the CSS symptom.

Root cause: `position: sticky` pins an element relative to its nearest
ancestor that establishes a scroll container. That ancestor
(`response-viewer.tsx`'s shared tab-panel div) also holds sibling content
above the JSON viewer (redaction/field-omission callouts) and is reused
unmodified across every tab. Making the toolbar's "stuck" geometry depend
on a shared ancestor it doesn't own is inherently fragile — it's the kind
of cross-ancestor dependency that produces exactly this class of overlap.

Fix: removed CSS sticky entirely. `JsonViewer` (`json-viewer.tsx`) is now a
self-contained flex column: a plain, non-growing (`shrink-0`) header and a
separate `flex-1 overflow-y-auto` content div that owns its own scrolling.
Overlap becomes structurally impossible — the header and content are
sibling flex items with independent box space, not a positioned element
sharing an ancestor's scroll state. `response-viewer.tsx`'s call site
passes `className="h-full"` so the viewer still fills the tall 50/50
column, via the same proven `flex h-full flex-col` chain used for the
layout fix. Both elements carry `data-testid` (`json-toolbar` /
`json-content`) for precise test targeting, since the toolbar's own
"Collapse all"/"Expand all" text collides with individual tree-row
aria-labels that reuse the same translation strings.

Decision (Task 3 — cURL label):
A plain `<p>` with the exact same classes as the existing "GET" label,
text "cURL" (untranslated — matches the existing precedent in
`code-samples.ts`, a proper noun already rendered as a literal string
elsewhere in this codebase).

Status: implemented, fully validated (`npm run check`, `npm run build`,
108/108 Playwright on a fresh build, manual visual pass en/he desktop +
tablet, secret scan), approved 2026-09-25 (gate option B) — see
`docs/SESSION_HANDOFF.md` for the full validation record and one noted gap
(mobile viewport not separately screenshotted for Tasks 1/2).

## 2026-09-25 — Phase 6 planning (Demo mode)

Decisions made by the user during planning (Opus 5.5):
- **Scope**: Demo covers 7 Proxy operations: `info-extensions`,
  `info-agents` and `cdr-get`, plus the new INFO `DIDS`, `SIMPLECDRS`,
  `EXTSTATE` and `QUEUELOGS`.
- **The 4 new operations get Reference + Demo only.** They are not Live;
  `LIVE_POLICIES` is unchanged. SIMPLECDRS, QUEUELOGS and DIDS return call
  records and phone numbers, so allowlisting them for Live needs its own
  redaction design and security review (Phase 7).
- **Behavior**: parameter values drive the Demo response, but only for
  behavior that was actually observed (A-40..A-43, plus the probe results
  for the new operations). Any other input shows "Not simulated", never
  fabricated data. Preset chips fill the inputs for each observed scenario.
- **Errors**: none are invented. No auth or validation error has been
  observed; misses return 200 `null` or an empty 200. "Simulate error" is
  hidden for endpoints that have Demo fixtures and kept for the Sample API.
- **Fixtures**: a new, separate module tagged `synthetic`, with obviously
  fake values (tenant `EXAMPLE`, never `demo`, which is a real tenant code;
  fictional 555-01xx numbers). The Reference examples are unchanged, and the
  Evidence rule still holds.
- **Structure for the 4 new operations**: `info.yaml` and the vendor
  snapshot have only request URLs for these operations (responses
  `not_documented`), so their structure comes from a structure-only probe:
  - The user runs the script with their own key (`PROXY_PROBE_KEY`), so the
    key never enters chat.
  - The script records no values.
  - DIDS without `tenant` (the all-tenants form) is not probed.

Status: plan approved 2026-09-25; implementation on `phase/demo-mode`.

## 2026-09-25 — Proxy API documentation baseline reset

The user directed a reset of the Proxy API documentation before continuing
Phase 6: **discard the MiRTA-sourced audit as authoritative** and rebuild
`source-docs/proxy-api/` from 1com's own documentation. This voids the
Phase 6 Step 1 probe (structure-only investigation of the 4 new INFO
operations, in progress and blocked on a broken script) and the 7 Demo
example selections recorded above — **both are suspended**, not decided
differently; the user will re-supply the 7 examples once the rebuild is
done, to be mapped against the new documentation before any
implementation resumes.

Decisions made by the user for the rebuild (this session, Sonnet 5 —
documentation work, no architecture/security/credential handling):
- **Source**: the 1com Site (`sites.google.com/1com.co.il/1com-api/בית`)
  **and** its linked Google Doc (parameter reference), both authoritative.
  Where they conflict, or are internally inconsistent, record both and
  mark UNRESOLVED — no winner picked without a further user decision. Full
  list of conflicts: `source-docs/DOCS_AUDIT.md` §10,
  `source-docs/unresolved.md` U-12–U-16.
- **Format**: Markdown per reqtype (`source-docs/proxy-api/<reqtype>.md`),
  replacing the old YAML convention.
- **Old files**: the 40 MiRTA-sourced `*.yaml` files and
  `source-docs/inventory.json` were removed with `git rm` (recoverable
  from git history, not deleted from disk permanently). The MiRTA raw
  snapshot (`source-docs/raw/proxyapi-legacy.*`) is kept as historical
  evidence — it still backs the observed Live-endpoint behavior in
  `DOCS_AUDIT.md` §7–9, which is unaffected by this rebuild.
- **Branch**: `docs/proxy-api-rebuild`, from `phase/demo-mode` @ `c802eb9`.
  Documentation-only change; `src/` is not touched. Phase 6's own branch
  and its WIP checkpoint commit are left as-is.
- **Scope boundary**: re-mapping the 3 already-implemented Live endpoints
  (`info-extensions`, `info-agents`, `cdr-get`) against the new source, and
  re-specifying the 7 Demo examples, are explicitly deferred to a
  follow-up step, not done as part of this rebuild.

Status: rebuild complete on `docs/proxy-api-rebuild`, not merged. Phase 6
(`phase/demo-mode`) is paused, not resumed, pending the user's re-supplied
7 examples and a decision on how/whether to merge this branch first.

## 2026-09-25 — Demo Playground rescoped to 5 operations; Stage A/B split

Supersedes "Phase 6 planning" above: the user replaced the 7-operation
scope with exactly 5: `INFO SIMPLECDRS`, `QUEUELOGS`, `EXTENSIONS`,
`AGENTS`, `DIDS`. `docs/proxy-api-rebuild` was fast-forwarded into
`phase/demo-mode` (`0631a95`) as the base.

Decisions:
- **Verification before fixtures**: a user-supplied TEST key/tenant was
  used for a structure-only, masked probe of all 5 operations (never
  written to disk; findings only, no values — `DOCS_AUDIT.md` §11,
  A-48..A-54). The key is rotated after use, not by this project's
  tooling.
- **QUEUELOGS deferred**: no observable data on the test tenant (A-50).
  The user chose to proceed with Demo for the other 4 operations rather
  than wait or drop the operation.
- **Demo response shape**: EXTENSIONS mirrors the Live view's 6 fields;
  DIDS mirrors only the plain-format columns' `di_*` fields (no `te_*`
  tenant block, no credential fields) — full detail `DOCS_AUDIT.md`
  §11.1.
- **Faithfully reproduced quirks**: the 0-byte empty-result body, the
  fixed Live auth-error text (not applicable to Demo, which sends no
  credential), SIMPLECDRS's positional duplicate keys, and `plain`/`csv`
  formats wherever their structure is actually understood.
- **SIMPLECDRS default/plain excluded from Demo** (A-54): its real
  structure is only partially decoded from a masked capture (found while
  building fixtures, not during the original probe); reproducing it with
  confidence isn't possible, so the Playground shows "Not simulated" for
  that combination rather than a guessed layout. `json`/`csv` are
  unaffected and fully simulated.
- **No Live allowlist change**: per explicit instruction, adding these
  operations to Demo does not add them to `LIVE_POLICIES`
  (`src/server/playground/allowlist.ts`, untouched).

Status: Stage A (verification) done and committed (`e05cfcb`, `0631a95`
on `phase/demo-mode`). Stage B (fixtures + UI) in progress, uncommitted —
see `docs/SESSION_HANDOFF.md` for the exact file-by-file state and the
next action.

## 2026-09-25 — Phase 6 (Demo Mode) approved, gate B — QUEUELOGS added, SEC-REQ-01 recorded

Approved by the user (gate B: approve, save, and stop; next phase not
started). Supersedes "Demo Playground rescoped to 5 operations" above:
all 5 operations now have Demo fixtures, including `QUEUELOGS`, which was
unblocked mid-session by one real record the user pasted in.

Decisions:
- **QUEUELOGS shape**: reproduce the full observed 156-key record (9
  queue-log fields + the answering agent's 147-field extension-row join),
  every `ex_*` field null, positional-key duplicates included — user's
  explicit choice over a trimmed "queue fields only" alternative.
- **QUEUELOGS scenarios**: observed-only (3 cases: one abandoned-call
  record in json, plus the two known empty results) — user's explicit
  choice over waiting for more samples. Answered calls, other
  dispositions, and csv/default with data are "Not simulated" until
  observed.
- **New blocking security requirement, SEC-REQ-01** (`docs/SECURITY.md`):
  the QUEUELOGS extension-row join carries credential fields
  (`ex_webpassword`, `ex_token`, `ex_2fa_*`, `ex_lockpin`, `ex_email`),
  each also duplicated under a bare positional key that name-based
  redaction cannot match (A-55). QUEUELOGS must not be added to
  `LIVE_POLICIES` until a strict, default-deny, per-item field allowlist
  (covering positional keys too) is implemented and tested; user directed
  this be recorded as blocking rather than change current scope.
- Real evidence handling: the user's pasted record was redacted before
  being written to disk (`source-docs/observed/info-queuelogs.json`); real
  values (time, queue name, caller id, call id) never committed anywhere
  else — verified by a repo-wide search before this commit.
- **No merge to `main`**: approval is for the phase's completion, not a
  merge; `phase/demo-mode` stays unmerged pending a separate, explicit
  merge instruction (matching Phase 5's precedent — see "COMPLETE AND
  APPROVED" above, "No tag"). No tag created this round either, for the
  same reason: not requested.

Also fixed this session (not a scope decision, recorded for completeness):
a mobile-width overflow bug in the Not-simulated/portal-error request-line
boxes (missing `break-all`, `response-viewer.tsx`), and 5 Playwright
locator strict-mode collisions in the Phase 6 test block, found while
recovering from an interrupted validation run after an unexpected shutdown.

Status: Phase 6 complete and approved. Full detail:
`docs/CURRENT_STATUS.md`, `docs/SESSION_HANDOFF.md`.

## Phase 7 planning (2026-09-25, Opus 5.5)

Plan: `C:\Users\ivgi-pc\.claude\plans\start-phase-7-swirling-boot.md`
(approved). Branch `phase/proxy-rollout`, from `main` after the user
approved fast-forwarding `main` to `phase/demo-mode` (`0cbd7ba`) and
tagging it `v0.4-demo-approved`.

User decisions:
- **Scope**: Reference pages for every documented Proxy operation (reads
  and writes). Demo fixtures only for read operations whose real response
  structure is observed. Live allowlist unchanged (3 operations);
  SEC-REQ-01 still applies.
- **U-10** (thin operations): publish with documented parameters;
  responses/errors "Not documented by the source"; requirement
  `"undocumented"` where the source is silent.
- **U-12/U-13/U-14**: audit defaults accepted — host
  `https://pbx6webserver.1com.co.il/pbx/proxyapi.php`; tenant placeholder
  `TENANTCODE` (never `DEMO`/`DEVEL`/`ophir`); `format` accepted values
  taken per operation from its own note.
- **Probing** read operations: the user supplies a TEST key/tenant in
  chat (Phase 6 Stage A method). Never written to disk, repo, logs or
  scratchpad; the user rotates it afterwards.
- **No admin key** available: ManageDB operations get Reference only, no
  Demo, no probing.
- **Quality additions** in scope: guides, search coverage. Out of scope:
  feedback widget, observability, request history.
- Proposed category taxonomy and the `unclear` read/write list are shown
  to the user at the Stage 1 checkpoint before content authoring.

## Phase 7 Stage 1 checkpoint (2026-09-25)

Inventory: `source-docs/proxy-api/operations.json` — 110 operations (62
read, 45 write, 2 unclear, 1 excluded). User decisions:
- **Unclear** (`info-voicemail`, `voicemail-message` — retrieval may mark
  a message read): Reference only; never probed; no Demo.
- **Granularity**: one Reference page per operation (reqtype +
  discriminator value), matching the existing `info-extensions` pattern.
- **Taxonomy**: sidebar grouped **by reqtype** (category id = lowercase
  reqtype, title = the reqtype) — user chose this over the proposed
  14-group functional taxonomy. The 6 existing endpoints were regrouped
  into `info` and `cdr`; category ids are not part of any URL.
- **`cdr-update`**: excluded (only in the superseded MiRTA manual).

## Phase 7 Stage 3 complete (2026-09-25)

All 109 non-excluded operations from `source-docs/proxy-api/operations.json`
now have a Reference page (`npm run rollout:status`: 109/109, 0 broken
links). Authored across 6 batches by reqtype-family, each committed and
`npm run check`-verified separately:
1. INFO (22 operations, incl. the 6 already implemented)
2. Call-control: AGENT, ATXTRANSFER, CHANNEL(S), COUNTCALLS,
   COUNTCHANNELS, HANGUP, TRANSFER
3. Extension/peer: BLFS, COUNTPEERS, PEERS, UNREGISTER, REBOOT, VIRTUALEXT
4. Queue/flow: QUEUE, QUEUERESET, CAMPAIGN, FLOWS, SETFLOW
5. VOICEMAIL, FAX, MEDIAFILE, PHONEBOOK, RESPONSEPATH, SMS, HELP
6. MANAGEDB (34 operations across 9 objects)

`tests/unit/proxy-coverage.test.ts`'s `ROLLOUT_COMPLETE` flag flipped to
`true`: every non-excluded inventory row must now have an endpoint, going
forward.

Two real bugs found and fixed while authoring, both now guarded by
permanent coverage-test assertions:
- Two `ResponseSpec` entries at the same HTTP status (RESPONSEPATH-GETLAST's
  plain and xml samples, both 200) caused a React duplicate-key warning and
  made the second example unreachable in the status selector — the response
  viewer supports one example per status code. Fixed by folding the xml
  variant into a note; the plain vendor sample is documented as the
  better-attested of the two.
- Two endpoints shared an exact title ("List extensions": info-extensions
  vs the new managedb-extension-list; "List DIDs": info-dids vs the new
  managedb-did-list) — harmless in the content model itself, but a real
  UX ambiguity (the Playground's endpoint picker shows two identical
  button labels) and a real e2e-test hazard (Playwright's default
  substring name-matching can't tell them apart). Fixed by appending
  "(ManageDB)" to the ManageDB variant's title in both cases; two
  pre-existing e2e locators (Live-mode field-persistence test) needed a
  disambiguating regex to keep matching only the INFO endpoint.

Full validation: `npm run check` 209/209 after each fix, `npm run build`
clean (228 pre-rendered paths), full Playwright suite on a fresh
`build && start` (see this session's completion report for the pass
count — run in progress at commit time).

## Phase 7 Stage 6 guide model (2026-09-26, Opus 5.5)

- Guides are content modules (`src/content/guides/`), rendered by one
  generic page; the page holds no API-specific logic. Blocks: paragraph,
  list, callout, code (literal), `sample` (generated from a real endpoint
  by `buildSample`, so guides can't drift from the reference), `endpoints`
  (reference links resolved from the content model). Inline code via
  backticks only; no HTML or markdown. Referential integrity is enforced by
  `tests/unit/guides.test.ts`.
- "Getting started" (Sample API) migrated unchanged, still prototype-labelled.

## Phase 7 Stage 7 review (2026-09-26, Opus 5.5)

Architecture, code and security review over `main..HEAD`. Live boundary
unchanged (allowlist: import path only; GET-only assertion intact); writes
blocked in Demo, UI and Live; no secret in the tree or scratchpad; guides
render no raw HTML. Findings and user decisions:

1. **Samples parse JSON without requesting it** (18 Proxy endpoints):
   `buildQueryAuthSample` picks `response.json()` from the first documented
   response's format, but no sample sends `format=json`, and the Proxy
   default output is plain text. Decision: every Proxy endpoint whose
   primary documented response is `format: "json"` gets a `format` query
   parameter with `example: "json"` (added where missing, documented as
   observed/undocumented where the source doesn't list json). Accepted
   side effect: the Playground pre-fills format=json, so Live defaults for
   info-extensions/info-agents switch from plain to json (already allowed
   by `LIVE_POLICIES`). Guarded by a new test.
2. **BLFS/FLOWS positional-key counts wrong** (A-72/A-73): the Stage 4
   masker labelled every 1-digit key `<9>` and 2-digit key `<99>`, so
   positional keys collided in its output. Default-format lines show
   named/positional alternation for every field: BLFS has `0`..`2`, FLOWS
   `0`..`17`, each mirroring the named field at that index. To be corrected
   in the audit, schemas and fixtures.
3. **Queue stats field count** is 23, not 24 (trailing `|` on the default
   line). To be corrected.
4. **Error-only responses read as the operation's response** (13
   endpoints whose only observation was a missing-parameter error or an
   empty body). To be relabelled so the Reference doesn't present an error
   as the normal result.
5. **`use-playground.ts` hard-codes `tenant`** as the endpoint-switch
   shared field (Phase 5 code). Recorded, not fixed: harmless for Open API;
   move to the API definition if Open API needs a different shared field.

### Stage 7 remediation amendment (2026-09-26, Sonnet 5, session interrupted mid-fix)

- **Finding 2 (BLFS/FLOWS positional keys) re-checked and confirmed**, not
  just re-asserted: cross-checked the JSON masked shapes against the
  probe's own default/plain-format lines (a separate channel the
  digit-masking bug doesn't corrupt the same way). BLFS's plain line shows
  exactly 3 interleaved positional/named pairs, a closed match to its 3
  named fields — keys `0`-`2`. FLOWS's plain line shows 4+ interleaved
  pairs before the probe's capture-length truncation, and the JSON shape's
  two colliding buckets (one single-digit, one double-digit) are exactly
  what 18 positional keys (0-9 single-digit, 10-17 double-digit) would
  produce under that masking bug, with nothing left over — keys `0`-`17`.
  Not yet written into `source-docs/DOCS_AUDIT.md` A-72/A-73 or the
  content model at session end; see `docs/SESSION_HANDOFF.md` for the
  exact resume point.
- **Finding 3 (queue-stats field count) closed as a review counting
  error, not a real bug.** Re-counted both the original probe evidence and
  `queueStatsFieldNames` in `info.ts`: the array already has 23 unique
  entries. The Stage 7 review's "should be 23, code says 24" claim was
  itself a miscount made during that review — only 3 prose mentions of
  "24" needed fixing (`demo/proxy.ts`, `DOCS_AUDIT.md` A-56 ×2), not the
  array.

### Stage 7 remediation completion (2026-09-26, Sonnet 5)

Resumed the interrupted remediation (the prior amendment above was written
mid-fix, before a commit). Two resume-time corrections and one new
regression, all found and fixed this session:

- **Handoff/status said the working tree was dirty with 7 uncommitted
  files; it was not** — those edits were already committed
  (`9faecc2`), tree was clean at resume. No recovery needed; both docs
  corrected.
- **Finding 2 evidence upgraded from inferred to directly confirmed.**
  The prior amendment's BLFS/FLOWS key counts were inferred from the
  JSON-format masked shapes' collision pattern. This session instead
  read the *default-format* line's own token count straight from the
  Stage 4 probe transcript (`fieldsLine1`): BLFS = 7 (3 positional/named
  pairs + trailing separator), FLOWS = 37 (18 pairs + trailing
  separator) — a direct count, not an inference from a masking bug's
  side effect. Same conclusion (BLFS 0-2, FLOWS 0-17), stronger evidence.
  Applied to `source-docs/DOCS_AUDIT.md` A-72/A-73,
  `src/content/proxy/{extensions,queues}.ts` schemas/examples,
  `src/content/demo/proxy.ts`'s FLOWS fixture (BLFS's fixture was already
  correct — done before the interruption), and two new
  `tests/unit/demo-fixtures.test.ts` mirror-check tests.
- **New regression found and fixed: finding 1's `format=json` example
  fix silently broke 3 endpoints' "default resolves to plain" Demo/e2e
  assumption**, undetected until this session because the affected
  Playwright assertions used a `.getByText(label).last()` pattern that
  degrades to a false pass when only one match exists (the always-
  rendered scenario-chip button) instead of two (the button plus the
  response's own "Scenario:" line). `info-extensions`/`info-agents`/
  `info-dids`' shared `format` parameter gained `example: "json"` — the
  Playground now pre-fills `format=json` on load, which resolves their
  richer JSON fixture case by default instead of the plain one their
  tests assumed. Same root cause independently affected
  `info-simplecdrs`/`info-queuelogs` (their `format` example was also
  added, and their old dedicated "unset-format default is Not
  simulated" tests assumed a state the enum `<select>`'s disabled blank
  placeholder no longer lets a user reach at all). Fixed: `defaultResolves`
  labels corrected to what actually resolves now; the assertion itself
  fixed to scope to the response's own `<p>Scenario: …</p>` line
  (`response-viewer.tsx`) instead of any element containing the label
  text; the two simplecdrs/queuelogs "Not simulated" tests replaced with
  scenario-chip-switching tests (that state is no longer reachable
  through the real UI for either endpoint — every reachable `format` ×
  filter combination is now covered by a fixture). Full detail:
  `tests/e2e/smoke.spec.ts` "Demo Mode (Phase 6)" block comments.
- **Finding 4 (error/empty-only responses), done.** Exactly 13 operations'
  `responses[0].description` rewritten to lead with "Success response not
  documented" (or the operation's own equivalent phrasing) instead of
  presenting the observed missing-parameter error or empty body as the
  normal result. Two operations named in the review's own A-69 group
  (`channel`, `help`) were excluded on inspection: both returned genuine
  non-empty, non-error data for one input case, so their existing
  "plausibly...not confirmed" framing was already honest and finding 4
  doesn't apply. Full list, exclusions and reasoning:
  `source-docs/DOCS_AUDIT.md` §12.2. Guarded by a new
  `tests/unit/proxy-coverage.test.ts` test asserting all 13 exist, are
  status 200, and lead with "Success response".
- **Stage 7 final checks, all green**: `npm run check` (250/250 unit
  tests), `npm run build` clean, `npm run rollout:status` (109/109
  Reference pages, 0 broken links), full Playwright suite (146 tests,
  both projects) run 3 times on a fresh `build && start` — clean twice,
  one single unrelated test (`Live mode: tenant and API key survive an
  endpoint switch`) failed once under parallel load and passed
  deterministically in isolation, consistent with the same
  known/pre-existing "a different single test under parallel load" class
  of flakiness recorded since Phase 5/Stage 3 (not this endpoint, not
  introduced this session). A manual visual/console-error pass (desktop
  1440, tablet 1024, mobile 390 × en/he — 90 page loads) over the 13
  relabeled Reference pages plus the BLFS/FLOWS Demo Playground pages:
  zero console errors, zero horizontal overflow, and the new response
  text/positional keys spot-checked to actually render as intended. A
  secret scan of the full `main..HEAD` diff and the working tree: clean.

## 2026-09-26 — Phase 7 (Proxy API rollout) approved, gate A

Approved by the user (gate A: approve, save, and continue to planning the
next phase). Freshness checks re-run at approval time on the unchanged
checkpoint (`7644136`): `npm run check` 250/250, `npm run build` clean
(254 pages). Both passed with no unexpected failures. The rest of the
Stage 7 validation (Playwright, visual pass, secret scan) was not re-run,
since no code changed since it was last performed — see
`docs/SESSION_HANDOFF.md` "Phase 7 — Stages 0–7 done" for those results.

Documentation discrepancies found and fixed as part of this approval (all
stale wording only, no code/behavior implication):
- `docs/SESSION_HANDOFF.md` said Stage 7's work was "not committed yet";
  it was already preserved in WIP checkpoint `7644136`. Corrected to
  describe the approval as its own commit on top of that checkpoint.
- `docs/CURRENT_STATUS.md`'s header said "Stages 0–6 done" while its own
  body described Stage 7 as complete. Corrected.
- `docs/CURRENT_STATUS.md`'s "Current branch" section still described
  "Stages 0–4 committed", stale since Stage 4. Corrected.

**New open action, recorded rather than resolved by this approval**: the
Stage 4 probe's TEST API key was confirmed by the user as **not yet
rotated**. This is a live credential-hygiene item, not a documentation
gap. Added to `docs/SECURITY.md` "Open action items"; must be resolved
before that tenant/key is reused for any further probing.

Carried-forward open items, none newly introduced, none blocking this
approval: SEC-REQ-01 (QUEUELOGS) and SEC-REQ-02 (VOICEMAIL imap
credentials) both remain blocking for Live enablement; `info-call` stays
untested (`tested: false`, both probe attempts timed out with no
response); ~19 read operations intentionally ship with no Demo fixture
(their only observed behavior was an error string, a true empty result,
or a timeout); a residual "a different single test fails once under
parallel load" Playwright flake class (not this phase's introduction);
the dev-only 404 `<script>` React warning (confirmed harmless against a
production build).

**No merge to `main`, no tag, no push** — none requested, matching every
prior phase's precedent in this project. `phase/proxy-rollout` stays
unmerged pending a separate, explicit instruction.

Status: Phase 7 complete and approved. Next phase has not started — no
planning, research, or implementation — and needs its own plan presented
and separately approved before implementation begins. Full detail:
`docs/CURRENT_STATUS.md`, `docs/SESSION_HANDOFF.md`.

## 2026-09-26 — MiRTA OpenAPI documentation baseline (docs only)

User direction: before any OpenAPI implementation, establish an
evidence-based MiRTA OpenAPI reference. The work is documentation only.
Plan: `C:\Users\ivgi-pc\.claude\plans\keen-swinging-origami.md`
(approved).

**Decisions:**
- **Authority for OpenAPI** is the official MiRTA OpenAPI documentation
  (`manual.mirtapbx.com/books/api/chapter/openapi`) and the OpenAPI 3.0.3
  specification, both supplied by the user.
  - This deliberately differs from the Proxy baseline reset above, where
    1com's sources outrank MiRTA; 1com publishes no OpenAPI documentation.
  - Proxy is unaffected.
  - Resolves `source-docs/DOCS_AUDIT.md` OA-06.
- **`docs/mirta-openapi-claude-reference.md` is the "wrapper"**:
  - Adopted: its structure, security rules, safe-testing policy,
    verification states and checklist.
  - Every technical claim in it is `UNKNOWN` until officially confirmed.
  - Where it conflicts with the official source, the official source wins;
    the local docs are corrected and the conflict logged as an `OA-` item.
  - The file itself is kept unmodified.
- **Evidence states:** `DOCUMENTED`, `OBSERVED`, `DOCUMENTED+OBSERVED`,
  `CONFLICT`, `UNKNOWN`. Accuracy is preferred over completeness.
- **Location:** `source-docs/openapi/` (README with coverage index,
  `_common.md`, per-resource files only once evidence exists,
  `resources.json`), mirroring `source-docs/proxy-api/`. Raw snapshots go
  under `source-docs/raw/mirta-openapi/`.
- **Out of scope:** real API calls, the application, Demo, Live, the
  allowlist and Proxy docs. A mutation is never executed without explicit
  per-operation approval.
- **Branch:** `docs/openapi-baseline`, from `phase/proxy-rollout` @
  `3612586`, following the `docs/proxy-api-rebuild` precedent. Not merged.

**Correction to an earlier entry:** "Phase 3 setup" above says the 38
OpenAPI pages are indexed in `source-docs/inventory.json`. That file was
removed in the 2026-09-25 reset; `source-docs/openapi/resources.json`
supersedes it (OA-07).

**Status:** Stage A (scaffold) is done. Stage B (ingesting the official
pages and spec) is waiting on user inputs (`source-docs/unresolved.md`
U-18, U-19).

## MiRTA OpenAPI baseline — Stage C security review decisions (2026-09-26)

User decisions from the Stage C cross-resource security review (Opus 5.5).
Documentation only; nothing is implemented or Live-enabled.

- **SEC-REQ-27 (new, cross-cutting):** no OpenAPI write (POST/PATCH/PUT/
  DELETE) is Live-enabled by default. Each one needs its own security
  decision, matching the Proxy precedent.
- **SEC-REQ-28 (new, cross-cutting):** OpenAPI Live uses tenant-scoped
  keys only. The server enforces the tenant. No global key, `global=1`,
  `%` wildcard or omitted tenant. Global-key-only resources are excluded
  from Live.
- **SEC-REQ-19 (Paging Group) raised to BLOCK LIVE.** Rule now applied
  consistently: a write of a credential/PIN plus an undocumented GET means
  BLOCK LIVE.
- **SEC-REQ-29 (Custom Destination `extended_infos`) and SEC-REQ-30 (Music
  On Hold `application`/`streamengine`) added as REVIEW REQUIRED.** Both
  resources move from UNKNOWN. The MOH entry is worded as undocumented
  semantics, not asserted behavior.

Factual corrections from the same review are logged in
`source-docs/DOCS_AUDIT.md` §13.2 (OA-11, OA-12).

## MiRTA OpenAPI documentation baseline approved (gate A, 2026-09-26)

- The user approved the baseline (Stages A–C, final checkpoint `f1c61a3`)
  at gate A: approve, save, and continue to planning the next phase.
- Not merged into `main`, not pushed, not tagged; none requested, and
  the suggested tag list has no docs-baseline tag.
- Carried open items: 32 response schemas are UNKNOWN pending the PBX
  OpenAPI JSON (U-18) or authorized read-only observation; whether 1com's
  PBX serves `openapi.php` is unverified (U-17); SEC-REQ-03..30 are open;
  the Phase 7 Stage 4 Proxy TEST key is still not rotated.
- Next: Phase 8 (`docs/phases/08-open-api.md`), planning only.

## Phase 8 planning — Open API rollout (2026-09-26)

Plan approved: `C:\Users\ivgi-pc\.claude\plans\zany-fluttering-dewdrop.md`
(Stages 0–6). User decisions:

- **Input:** the approved docs baseline (`source-docs/openapi/`). No
  OpenAPI JSON spec is available (U-18); a spec importer is a later task.
- **Scope:** Reference pages for all 128 operations. Demo only for
  `extensions-state`, `ailogs` and `aianalysis` GETs, the only resources
  with a documented response and no categorical exclusion. No Live
  (SEC-REQ-27/28; nothing tested).
- **Base URL:** `https://pbx6webserver.1com.co.il/pbx/openapi.php`.
  U-17 is closed on the user's confirmation; `tested` stays false.
- **Branching:** `main` fast-forwarded to `be23fb2` (Phase 7 plus the
  OpenAPI docs baseline) and tagged `v0.5-proxy-complete`. Work branch
  `phase/open-api` from `main`. Not pushed.
- **Model routing:** Stage 1 (auth model, content helper, inventory) is
  Opus; Stages 2–5 are Sonnet; Stage 6 (cross-API consistency and
  security review) is Opus.

## Phase 8 Stage 1 complete (2026-09-26)

- **Operation count is 159, not 128.** The baseline's 128 counted
  distinct HTTP methods per resource, not operations
  (`source-docs/DOCS_AUDIT.md` OA-13). `source-docs/openapi/operations.json`
  (generated by `scripts/openapi-operations.mjs`) is the inventory the
  coverage test enforces. This supersedes "128 operations" in "Phase 8
  planning" above.
- **Sidebar: one category per resource (37 groups)**, matching Proxy's one
  group per reqtype, instead of the planned ~9 domain groups. Implemented
  without asking first, then confirmed by the user at Stage 1 close-out.
  The domain order is kept in `src/content/openapi/index.ts`.
- **Vendor examples go under status 200.** The official pages never give
  an HTTP status for their example responses. Each vendor example goes
  under status 200 (`evidence: "vendor"`, `verified: false`), and its
  description says the status is not documented.
- Validation at close-out: `npm run check` 269/269, lint covers
  `scripts/*.mjs` (no ignore, verified), `npm run build` clean.

## Phase 8 Stage 3 complete (2026-09-26)

- **Demo fixtures added for the 3 approved OpenAPI GETs**
  (`extensions-state-get`, `ailogs-list`, `aianalysis-get` — the only
  resources with both a documented response schema and no categorical
  Live/Demo exclusion, per "Phase 8 planning" above):
  `src/content/demo/openapi.ts`, one case each, reusing the same values
  already published as each endpoint's own vendor response example
  (already normalized to the project's synthetic conventions at Stage 1).
  Every other OpenAPI GET falls back to "Demo data not available"; every
  write stays Reference-only (SEC-REQ-27) — verified directly against the
  running Playground, not just by reading the code.
- **Demo registry generalized to merge fixture sets per API**
  (`src/content/demo/index.ts`), and `tests/unit/demo-fixtures.test.ts`
  now iterates a combined Proxy+OpenAPI fixture list
  (`fixtureSetFor(apiId, endpointId)`) instead of a Proxy-only helper, so
  a future API's fixtures reuse the same exhaustiveness/synthetic-value
  guards without further test-file changes.
- **Not simulated by design, not by gap:** an explicit `format=csv` on AI
  Logs, an all-miss AI Analysis query, and an unregistered/no-active-
  channel Extension State all resolve to "Not simulated" — none of those
  cases has a worked example on the official pages, so none is fixtured.
- Validation: `npm run check` 272/272, `npm run build` clean (546
  endpoint pages), a Playwright pass driving the real Playground for all
  3 Demo endpoints (desktop 1440 + mobile 390, en) plus one Hebrew page —
  scenario resolution, the 3 negative states above (Not simulated, Demo
  data not available, Reference-only/Send-blocked), zero console errors,
  no overflow.

## Phase 8 Stage 4 complete (2026-09-26)

- **One new guide**: "OpenAPI authentication and scope"
  (`src/content/guides/openapi-authentication.ts`, slug
  `openapi-authentication` — distinct from the Proxy API's own
  `authentication` slug), built only from `source-docs/openapi/_common.md`.
  Covers the 4 key kinds and where the key travels, tenant vs `global=1`
  scope (including the 6 global-key-only and 8 `global=1`-capable
  resources), the common error codes, and why no OpenAPI operation is
  Live yet (SEC-REQ-27/28).
- **A real, pre-existing layout bug was found and fixed while authoring**,
  not by reading code but by driving the built page with Playwright at
  mobile width: `src/app/[locale]/guides/[slug]/page.tsx`'s two-column
  grid (`xl:grid-cols-[minmax(0,1fr)_16rem]`) had no base column
  definition below the `xl` breakpoint, so a CSS grid's default
  `min-width: auto` let a sufficiently long single line of content stretch
  the whole page instead of scrolling inside its own code block. The 3
  existing Proxy guides never triggered it — their sample code lines are
  short enough to fit. OpenAPI's own base URL
  (`pbx6webserver.1com.co.il/pbx/openapi.php`) plus a query string is
  long enough that this guide's own `sample` block did. Fixed by adding
  Tailwind's `grid-cols-1` base class (`repeat(1, minmax(0, 1fr))`),
  giving the single-column track the same shrink protection the `xl:`
  variant already had. Re-verified: the 3 existing guides still render
  identically (byte-identical `scrollWidth === clientWidth` at mobile).
- **A second, content-only bug in the new guide itself**: several inline
  `` `code` `` spans were joined by a bare `/` with no surrounding space
  (e.g. `` `admin_required`/`missing_user` ``), which the browser cannot
  break a line on, so a long run of them overflowed at mobile width the
  same way. Fixed by switching to `, `-separated lists, matching how
  every other multi-value alias list in this project's content is
  written.
- Validation: `npm run check` 277/277, `npm run build` clean, a
  Playwright pass over the new guide (desktop 1440 + mobile 390, en +
  he) confirming every section, the sample code block, and the endpoint
  links, zero console errors, no overflow (both before-fix failures
  reproduced and then confirmed fixed); a regression check of the 3
  existing guides at mobile width (unchanged); the full Playwright suite
  (146 tests × 2 desktop + mobile-safari) — 144/146 clean, 2 failures
  (both chromium-desktop, both unrelated to this stage: Proxy "Try in
  Playground" and Phase 5 Live tenant/key persistence) reproduced the
  project's known "a different single test fails once under full-suite
  parallel load" flakiness class and passed cleanly when re-run alone.

## Phase 8 Stage 5 complete (2026-09-26)

- **New e2e coverage** (`tests/e2e/smoke.spec.ts`, "Open API rollout
  (Phase 8)"): the sidebar API select switching Proxy → Open API; a
  path-parameter endpoint's documented placeholder (`OBJECT_ID`)
  carrying through to both the code sample and the Playground's
  prefilled field; a write endpoint staying Reference-only on both the
  Reference page and the Playground (mirroring the Proxy precedent); all
  3 Demo fixtures resolving their documented scenario; the `format=csv`
  and `cdrs-list` negative states. `requestPanel` (previously local to
  the Proxy describe block) was hoisted to shared scope so both APIs'
  tests reuse it.
- **Two real bugs found while writing this coverage, both fixed, neither
  a false alarm**:
  1. A fixture's own `basis` prose (`ailogs-list`) literally contained
     the substring "Not simulated" as descriptive text, which a blunt
     `getByText("Not simulated")` assertion — the same pattern already
     used by the pre-existing Proxy tests — matched even though the
     actual resolved scenario was correct. Reworded the prose; no
     assertion or product code changed.
  2. Playwright's WebKit driver never fires `onChange` for this
     React-controlled `<select>` via `selectOption`, confirmed directly
     against a plain (non-mobile-emulated) WebKit instance, with the
     identical call working on Chromium — a Playwright/WebKit
     automation gap, not a product defect (real Safari/iOS users use
     the native picker). The one affected test is skipped on
     `browserName === "webkit"` with that reasoning recorded inline.
- `source-docs/ROLLOUT_STATUS.md` (Proxy-only, generated) was stale
  since Phase 8 Stage 0 closed U-17/opened U-18 in
  `source-docs/unresolved.md`; regenerating it here is an unrelated,
  accurate correction, not new Stage 5 work.
- Validation: `npm run check` 277/277, `npm run build` clean, the full
  Playwright suite fresh on a `build && start` — 160/162, 1 skipped
  (the WebKit gap above), 1 failure (chromium-desktop, Phase 5 Live
  tenant/key persistence, unrelated to this stage) confirmed to be the
  project's known parallel-load flakiness class by passing cleanly
  alone. A dedicated visual pass at desktop 1440, tablet 1024 and
  mobile 390, in en and he, over 8 representative OpenAPI pages
  (overview, path-param, global-only, write, nested-schema, rich-field,
  the new guide, a Demo Playground page) — 48 page loads, zero console
  errors, no overflow. A secret/PII scan of the full `main..HEAD` diff:
  clean.
- Phase 8 is now feature-complete pending Stage 6 (Opus cross-API
  consistency and security review — the Phase 8 gate item).
  **Superseded 2026-09-26** — see "Phase 8 pre-Stage-6 sub-phases
  inserted" below: a manual review found this claim premature.

## Phase 8 pre-Stage-6 sub-phases inserted (2026-09-26)

- **Reason:** a manual product review (not an automated check) found
  that Phase 8 was not actually feature-complete despite the Stage 5
  entry above. The OpenAPI API Reference did not expose all
  information available in the approved documentation baseline
  (aliases, enums, defaults, filters, body-field detail, evidence/
  security notes, etc. present in `source-docs/openapi/` but not
  surfaced in the app), and the OpenAPI Demo and Playground were
  missing/incomplete relative to what the baseline supports.
- **Decision:** four sub-phases are inserted between Stage 5 and the
  existing Stage 6, each with its own STOP/approval gate. Full spec:
  `docs/phases/08A-openapi-api-reference-completeness.md`,
  `08B-openapi-demo.md`, `08C-openapi-playground.md`,
  `08D-pre-stage6-readiness-gate.md`; order and routing summarized in
  `docs/phases/08-substages-README.md` and
  `docs/phases/08-open-api.md` "Pre-Stage-6 sub-phases".
- **Order:** 8A (API Reference completeness) → 8B (Demo) → 8C
  (Playground) → 8D (pre-Stage-6 readiness gate) → existing Stage 6.
- **Model routing:** 8A, 8B, 8C, and 8D (deterministic validation) are
  all Sonnet 5, per the user's explicit instruction that this is
  routine implementation work, not architecture/security design.
  Existing Stage 6 stays Opus 5.5 and does not start until 8D passes.
- **Scope note:** 8B's spec asks for evidence-based Demo coverage
  beyond the 3 GETs decided in "Phase 8 planning" above (possibly
  including simulated writes). This is not decided yet — it will be
  presented as an explicit option at the 8B planning gate, not assumed.
  The Live allowlist is unaffected by any of these sub-phases; it stays
  the 3 Proxy IDs already approved.
- **Not reopened:** Stages 0–5 remain approved/done as recorded above;
  none of that work is redone or undone by this insertion.

## Phase 8A — official named examples and response field tables (2026-09-26, 8A in progress)

- **Examples: structured + generated** (user decision, this session).
  `scripts/openapi-examples.mjs` parses the official page snapshots into
  `source-docs/openapi/examples.json`, one entry per named curl example
  matched to an operation. Code samples are rendered from the structured
  fields by the existing `buildSample`, so they use the portal base URL
  and the `X-API-Key` env-var convention, and are never copied verbatim.
  Examples are read server-side (`src/content/examples.ts`) and are not
  a field on `Endpoint`, so the client sidebar bundle does not ship them.
- **Normalization:** official example values that look like real data
  are replaced with the synthetic values Stage 2 already uses
  (`scripts/openapi-examples-normalize.json`: TESTTENANT, Demo User,
  Demo Corp, 5550100). Every credential-shaped body key becomes
  `SYNTHETIC_SECRET`.
- **Response field tables:** a documented field/description table with
  no example goes under status 200, with `type: "unknown"` and
  `required: "undocumented"`. This extends Stage 1's "vendor examples go
  under status 200"; the response description states that the status,
  envelope and types are undocumented.
- **Correction:** an earlier 8A completion report this session (only 2
  list filters fixed, "complete") was wrong. The user found the gap by
  comparing the official CDR page.

## Phase 8A — APPROVED (2026-09-26, gate A: approve, save, and continue to planning 8B)

- **Second correction, same session:** a follow-up completion report
  (after the examples/field-table work above plus a section-by-section
  alias/notes audit) was also premature. The user checked the official
  Campaign page's "Delete Campaign" example against the app and found
  two real UI gaps not caught by any existing test:
  1. Notes, error descriptions, example descriptions, response
     descriptions, and deprecation notes were rendered as raw text
     (`ContentText` with no markup pass), so documented backtick spans
     like `` `/campaign` `` showed as literal backticks instead of
     inline code. Parameter descriptions were already correct
     (`ParamList` already used `InlineMarkup`) — only
     `endpoint-view.tsx`'s other content-model text was affected. This
     is a shared component, so it affected the Proxy API's pages too,
     not just OpenAPI.
  2. Every example under "Examples" renders collapsed by default,
     showing only its title until clicked.
- **User decisions:** (1) is a real defect, fixed by wrapping every
  affected spot in `endpoint-view.tsx` with the existing `InlineMarkup`
  component (no new component, matching the `ParamList` precedent).
  (2) is not a defect — **examples stay collapsed by default**, kept
  as-is.
- **Audit fixes this session** (`docs/SESSION_HANDOFF.md` has the full
  list): `mediafiles.ts` `format`→`me_format` citation corrected;
  `extensions.ts`/`ivrs.ts` destination-alias lists completed to match
  the aliases the official examples actually send;
  `customdestinations.ts` bare `RANDOMDESTINATION`/`random_destination`
  alias added; `paginggroups.ts` missing `/paginggroup` path alias
  added; `reporting.ts` Simple CDR gained the same start/end
  applicability rule CDR already had. A new unit test
  (`tests/unit/openapi-coverage.test.ts`) ties every official example's
  request-body keys to a modeled field, a documented alias, or a
  documented numbered-key template, guarding against this class of gap.
- **Validation at approval:** `npm run check` 285/285 (typecheck, lint,
  unit tests), `npm run build` clean (576 pages) — both re-run fresh
  after the `InlineMarkup` fix. The full Playwright suite (162 passed,
  1 known pre-existing flake confirmed to pass alone, 1 WebKit skip)
  and the 40-load visual/console-error pass across representative
  OpenAPI resources were run just before the `InlineMarkup` fix; the
  fix itself is a narrow rendering-only change (no test asserts literal
  backtick text) and the user personally confirmed the rendered result
  on the flagged page, so the full e2e suite was not re-run a second
  time for this fix specifically.
- **Approved 2026-09-26**, gate A. Not merged into `main`, not tagged,
  not pushed. Next: Phase 8B (OpenAPI Demo) planning, per
  `docs/phases/08B-openapi-demo.md`.

## Phase 8B planning and probe decisions (2026-09-26)

- **Plan:** `C:\Users\ivgi-pc\.claude\plans\linked-rolling-seal.md`
  (Stages 1-5). **Mirror Phase 6 for OpenAPI:** a one-time masked,
  structure-only probe of the OpenAPI GETs with a user-supplied
  tenant-scoped TEST key, then synthetic fixtures from the observed
  shapes. Overrides 8B §14 ("no real API calls") for read-only calls
  only. Writes stay Reference-only (no write is ever sent, SEC-REQ-27).
  AI Logs `format=csv` stays "Not simulated".
- **Stage 1 done** (`f833747`): Request tab substitutes path values and
  shows the masked header credential; "Simulate error" shown only for the
  synthetic Sample API; two documented cases added (Extension State not
  registered, AI Analysis unknown-uniqueid omitted); isolation tests.
- **Stage 2 done** (`e73e8c5`): probe results stored masked in
  `source-docs/observed/openapi/probe-2026-09-26.masked.json`.
  `cdrs-list` not probed (docs: may repair CDR metadata). Key rotation
  is an open action in `docs/SECURITY.md`.
- **Doc vs observed — tenant errors:** omitting the tenant, or an
  unknown tenant, returned 401 `invalid_api_key`, not the documented
  `tenant_required` / `tenant_not_found`. User decision: **record both**
  — the Reference keeps the documented codes plus an "observed on the
  test PBX" note; Demo scenarios use the observed behavior; logged in
  `source-docs/DOCS_AUDIT.md`.
- **AI Logs:** `/ailogs` (and `/ailog`) returned 404 `not_found` on the
  test PBX. User decision: **drop the AI Logs Demo fixture** and use the
  Queue GETs instead (List queues / Get queue, whose observed response
  includes `members` and `allowed_members`). The AI Logs Reference page
  is unchanged apart from a note recording the 404.
- **Error scenarios:** only on endpoints that have a success fixture —
  404 `object_not_found` on get-by-ID and 401 `invalid_api_key`, with
  the observed `{"error":{"code","message"}}` envelope. Error-only
  endpoints (the global-key resources, 403 `admin_required`) get no
  fixture, matching Proxy Stage 5.

## Phase 8B Stage 4–5 completion, recovered scope, and generalized decisions (2026-09-26)

- **Context — session recovered from a crash.** The user's PC crashed
  mid-session. `linked-rolling-seal.md` (the approved 8B plan) had
  already been overwritten by an earlier resume, and the working tree
  held uncommitted, partial Stage 4 work (4 of ~52 fixturable
  endpoints) with no record of what scope had been decided. This
  session recovered the original plan text and every later user
  decision verbatim from the raw session transcripts, then asked the
  user to confirm the Stage 4 scope before continuing — recorded in
  `C:\Users\ivgi-pc\.claude\plans\compiled-spinning-hellman.md`.
- **Stage 4 scope (user-confirmed):** every OpenAPI GET the Phase 8B
  masked probe returned genuine data for gets a Demo fixture — not just
  the 3–4 endpoints with a documented vendor example. Plus every
  observed error/empty scenario, on an endpoint that also has a success
  fixture. Result: `openapiDemoFixtures` grew from 4 to 52 sets.
- **Fixture bodies, generation method:** for the ~48 endpoints with no
  documented response, bodies are generated by reproducing
  `src/content/observed.ts`'s exact mask-to-example rules in a scratch
  script (not committed, not imported at runtime — the probe file stays
  out of the client bundle) — so Demo and the Reference page's observed
  schema agree. Two mechanical, evidence-based trims keep bodies
  reviewable: fields the probe observed as empty/null on every row are
  dropped, and long numbered-field runs (`paramN`, `fieldN`,
  `lineN_ex_id`) are collapsed to their first 2 members.
- **Tenant-omitted 401 generalized to every optional-tenant endpoint:**
  the probe tested this auth check directly on one representative
  endpoint (`extensions-list`, OA-15). Applying it to every other
  fixtured endpoint is an explicit premise (the same auth layer runs in
  front of every OpenAPI resource), not a fresh observation per
  endpoint — flagged as such in each case's own `basis` string.
  `extensions-state-get` is excluded (its `tenant` is documented
  `required: true`, a different, unprobed situation).
- **Two observed error scenarios are permanently unfixturable**, both
  because the real Playground's client-side `validate()`
  (`use-playground.ts`) blocks Send whenever a documented
  `required: true` field is empty, before the Demo resolver ever runs:
  get-by-ID's observed 404 `object_not_found` (the id is a required
  *path* parameter — the crashed session's own `queues-get` decision,
  generalized here), and AI Analysis's observed 400 `uniqueid_required`
  (`uniqueid` is a required *query* parameter — added, then found
  unreachable and removed, during this session's own Stage 5 visual
  validation; commit `71fcc30`).
- **Stage 5 done:** `demoText` states "No credentials required" (en +
  DRAFT he); `scripts/rollout-status.ts` gained an OpenAPI Demo coverage
  section, writing `source-docs/OPENAPI_DEMO_STATUS.md` (kept as a
  second file rather than merged into the Proxy-only
  `ROLLOUT_STATUS.md`) — 52/66 read operations Demo-supported, the
  other 14 broken down by reason (global-key-only resource, not probed,
  or probed with no fixturable data).
- **Validation:** `npm run check` 348/348, `npm run build` clean (576
  pages). A 76-test Playwright pass (chromium-desktop + mobile-safari,
  en + he) covering every new fixture's scenario resolution at desktop
  size — this project's own established convention for OpenAPI Demo
  scenario tests (`smoke.spec.ts`'s "interactions" describe block
  forces a 1440×900 viewport regardless of project) — plus a narrow-
  mobile (390px) layout/console/no-network smoke check: all 76 passed.
  Full Playwright suite re-run fresh twice: 176/178 both times, the
  same single pre-existing, unrelated Phase 4 test failing under
  parallel load and passing alone (this project's documented
  parallel-load flake class). Secret/PII scan of the diff: clean (only
  the project's synthetic conventions and already-public MiRTA error
  codes appear; no probe literal, key, or real tenant/PII leaked).
- **Phase 8B is complete pending the user's gate decision** (§16 report
  presented separately). Stage 6 (cross-API consistency and security
  review, Opus) remains on hold behind 8C/8D per the existing plan.

## Phase 8B — APPROVED (2026-09-26, gate B)

Approved: approve, save, and stop. Stages 1–5 complete per the
completion report and the "Phase 8B Stage 4–5 completion, recovered
scope, and generalized decisions" entry above (52 Demo-supported
OpenAPI GETs, full validation clean). Not merged into `main`, not
tagged, not pushed (none requested). **Next: Phase 8C — OpenAPI
Playground.** Not started; waiting for its own plan to be presented and
separately approved. Do not begin 8C planning or implementation without
that approval.

## Phase 8C planning and SEC-REQ-27 amendment (2026-10-01)

- **Plan approved 2026-10-01**
  (`C:\Users\ivgi-pc\.claude\plans\magical-zooming-sutton.md`,
  Stages 0–7). Branch `phase/open-api` (already pushed and in sync with
  `origin` before this phase — the 8B handoff's "not pushed" was stale).
- **User decisions (AskUserQuestion, this session):**
  1. OpenAPI writes get a **synthetic Demo**, **documented-only**: only
     the vendor's documented example responses and the observed generic
     error envelope; a write with no documented response shows "Demo data
     not available". This **supersedes** the "writes stay Reference-only"
     wording in "Phase 8 planning", "Phase 8 Stage 3 complete", "Phase 8
     Stage 5 complete" and "Phase 8B planning and probe decisions" — for
     Demo only. Live is unchanged: no write of any API is ever sent.
  2. 8C Playground changes go into the **shared** components (Proxy
     pages gain them too; Proxy regression pass required).
  3. The SEC-REQ-27 change runs on **Opus** (Stage 0); the rest of 8C on
     Sonnet 5.
- **Stage 0 (Opus) implementation:** `DEMO_WRITE_APIS` (`openapi` only)
  and `isDemoSimulatedWrite()` in `src/content/demo/index.ts` are the
  single predicate used by `demoProvider`, `use-playground.ts` `send`,
  `request-builder.tsx` and `response-viewer.tsx`. `liveProvider` gained
  a defensive write block (`endpoint_not_allowed`, no fetch). New
  `playground.writeDemoNote` string (en; he DRAFT). No write fixture
  exists yet (Stage 2), so the visible behavior is unchanged until then.
  `docs/SECURITY.md` SEC-REQ-27 and "Demo mode guarantees" amended.
  `npm run check` 352/352.
