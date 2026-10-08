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

## Phase 8C Stage 1 — write-response audit; Stage 2 dropped (2026-10-01)

- **Finding (Sonnet, from the content model, `listEndpoints(openapi)` with
  `operationClass === "write"`):** of the 93 OpenAPI writes, only 3 carry
  any documented response — `dial`, `auth-token-create`,
  `auth-token-delete` (status 200, `evidence: "vendor"`). The other 90
  have no response at all and document only error *codes* (`errors[]`,
  every `status: "undocumented"`; no official page gives an HTTP status).
  `source-docs/openapi/examples.json` holds request examples only (325
  curl examples), no responses.
- All 3 documented writes are categorically excluded from Demo and Live
  by SEC-REQ-05 (Auth Token — credential issuance) and SEC-REQ-06 (Dial —
  originates a real call). Under the documented-only rule, **0 of 93
  writes can be Demo-simulated.**
- **User decision:** keep 0 and **drop Stage 2** (write fixtures). The
  Stage 0 guard (`DEMO_WRITE_APIS`, `isDemoSimulatedWrite`) and the
  SEC-REQ-27 amendment stay as dormant, unit-tested machinery: a future
  write gains Demo only by adding a documented-example fixture set, and
  the coverage test (`tests/unit/openapi-coverage.test.ts`) still pins
  every OpenAPI write without fixtures. Rejected alternatives: error-only
  Demo for the 90 (always ends in an error, status of non-auth errors
  undocumented) and lifting SEC-REQ-05/06 for the 3 (needs explicit user
  approval + Opus review).
- Consequences for 8C: write Demo coverage in the Section-13 report is
  stated as "0 simulatable: no documented success response (3
  documented, all SEC-REQ-05/06-excluded)". Body entry, request preview
  and cURL for writes (Stage 3/4) are unaffected: they build the request
  without sending it. Writes keep `writeOnlyNote`; `writeDemoNote` is
  unreachable until a write fixture exists.

## Phase 8C Stage 3 — request generation (2026-10-01, Sonnet 5)

- **Body in the generated request.** `sanitizedRequest` (`executor.ts`)
  now carries a `body` for non-GET operations, built from the entered
  `body:*` fields: empty fields omitted, values coerced only to the
  field's documented type (integer/number/boolean; array/object/unknown
  parsed as JSON when they start with `[`/`{`; anything that does not
  parse stays a string — never guessed). A list-shaped body falls back to
  its documented `requestExample`; multipart uploads have no form-field
  body. `Content-Type` is added (`application/json`, or form-encoded for
  `form-json-field`). `curlEquivalent` emits `-d '…'` (single-quote
  escaped) or `--data-urlencode 'field=…'`.
- **Secret-named body fields** (same name rule as `observed.ts`
  `SECRET_NAME`) render as `<REDACTED>` in the preview and the cURL. A
  separate `BODY_SECRET_MASK` is used so `curlEquivalent`'s
  `MASK`→`$ENV_VAR` swap can never turn a body field into the API key.
- **The body is preview-only.** `LiveRequestBody` has no body field, Live
  refuses writes (Stage 0), and Demo never fetches; a typed body never
  leaves the browser.
- **Request preview.** A new collapsed "Request preview" section in the
  request form (`request-builder.tsx`, shared by all APIs) reuses the
  response viewer's `RequestTab` (now exported; also shows the body).
  Updates as the user types, before Send, for every operation including
  writes and fixture-less reads. `unavailable` Demo results now carry the
  `request` and show it under the callout. Marked "Not sent" for Demo and
  for writes.
- **Pre-fill fix.** Array/object body examples now pre-fill as JSON text
  instead of `[object Object]` (`use-playground.ts`; brought forward from
  Stage 4 because the body preview depends on it).
- **Tests.** Unit 361/361 (+9: body building, coercion, masking, cURL
  escaping, form-json-field, unavailable-with-request, no fetch). New
  e2e: write preview with typed + masked body and no `/api/playground`
  request; fixture-less read still shows its request. Four existing
  e2e locators became ambiguous because the preview repeats the same
  text earlier in the DOM; scoped them (`.last()` / the cURL tab panel),
  no behavior change. Full Playwright 180/182 on a fresh build (the one
  failure is the documented parallel-load flake and passes alone);
  visual/console pass at 1440 and 390 px, en + he (RTL), OpenAPI and
  Proxy, zero console errors, no overflow, zero `/api/playground`
  requests.

## Phase 8C Stage 4 — Playground form and page UX (2026-10-01, Sonnet 5)

- **Field details** (`param-field.tsx`, shared by all APIs): each field
  shows its documented type, description (inline code rendered), condition,
  default and constraints, wired to the control with `aria-describedby`.
  The type chip sits outside the `<label>` so a control's accessible name
  stays the bare field name (an earlier draft put it inside and broke 15
  e2e locators). API prose is `lang="en" dir="auto"`, matching the
  Reference's `ContentText`.
- **Defaults are placeholders, not pre-fills (deviation from the plan,
  reversible):** the plan said "pre-fill from `default`". Pre-filling would
  send a value the user never chose and change which Demo scenario
  resolves (the `info-extstate` lesson). The documented default is shown
  as the placeholder when no example exists, and in the details line.
- **Array/object body fields** render as a JSON `<textarea>`; an optional
  enum can be cleared again (blank option enabled unless required).
- **Operation header** (`operation-header.tsx`): title, summary, read vs
  "Changes state", auth transport and the key scope — all from the
  content model (`authentication.scope`), no per-API logic.
- **API switcher** in the endpoint picker; the page remounts per API
  (`key={api.id}`). An unknown `?endpoint=` now shows a "not found" notice
  naming the endpoint it fell back to, instead of silently showing the
  first Proxy endpoint. (Notice + fallback rather than replacing the
  Playground with an error page — smaller, still not silent.)
- **Live-unavailable UI:** for an operation with no Live target the API
  key field is hidden, the mode bar says "Live execution is not enabled
  for this operation. Nothing is sent." and the blocked text names the
  default-deny. "Requests reach your tenant." now appears only where Live
  can send. Demo-unavailable copy no longer says "built in a later phase"
  (accurate for both APIs: there is no verified response to simulate).
  Hebrew strings are DRAFT.
- **Tests:** unit 361/361. e2e added: operation header (kind/auth/scope),
  field type/description + JSON textarea, API switcher (WebKit skipped,
  same `selectOption` gap), unknown-endpoint notice, Live-not-enabled on an
  OpenAPI read with zero `/api/playground` requests. Two older tests
  updated for the intentional behavior change (the key-field test now uses
  an allowlisted endpoint; the Sample-API Live test asserts the new text
  and no key field). Full Playwright on a fresh build: 185/190 before
  those two updates, with only the 2 intended-change tests plus the known
  parallel-load flake failing; the updated tests and the flake pass.
  Visual/console pass (desktop 1440, mobile 390, en + he) over the new
  header, fields, switcher, not-found and Live states: zero console
  errors, no overflow, zero `/api/playground` requests.

## Phase 8C Stage 5 — Playground coverage report (2026-10-01, Sonnet 5)

- `npm run rollout:status` now also writes
  `source-docs/OPENAPI_PLAYGROUND_STATUS.md` (spec §13), generated from
  `operations.json`, the content model, the Demo registry
  (`isDemoSimulatedWrite`) and the **real Live allowlist**
  (`listLiveTargetIds`). The Live count is therefore computed, not
  hard-coded. Because `allowlist.ts` imports `server-only`, the script now
  runs as `tsx --conditions=react-server` (package.json); this resolves
  `server-only` to its empty module, as Next.js does on the server.
- **Result:** 37 documented resources, 37 represented (36 picker
  categories: `extension` holds the Extension and Extension State pages);
  159/159 operations represented; Demo-executable 52 (52/66 reads, 0/93
  writes); Live-executable 0; Live-disabled 159; Send-blocked in Demo
  107 (14 reads without a fixture, 93 writes); missing operations none;
  no operation is hidden from the Playground. Only 3 of the 93 writes
  document a success response (dial, auth-token-create/delete), all
  excluded by SEC-REQ-05/06.
- Kept `OPENAPI_DEMO_STATUS.md` unchanged and separate (Demo-only view).

## Phase 8C Stage 6 — validation (2026-10-01, Sonnet 5)

- **New e2e:** a narrow-mobile (390 px) OpenAPI Playground flow —
  header, tenant entry, request preview, Demo run on the Response step,
  resource selection through the Endpoint step onto a write that stays
  unsendable; asserts no horizontal overflow, zero console errors and zero
  `/api/playground` requests. The tenant fill is wrapped in `toPass` because
  a fill sent before hydration is overwritten by the controlled value
  (the same race as the search-palette and nav-drawer tests); it failed
  once on WebKit before that and passed 6/6 after.
- **Checks on the final code, fresh build:** `npm run check` 361/361
  (typecheck, lint, unit); `npm run build` clean (576 pages); full
  Playwright 192 passed / 2 skipped (WebKit `selectOption` gap) / 0
  failed (194 tests). Note: running `npm run check` right after deleting
  `.next` shows `Cannot find name 'PageProps'` — those global types are
  generated by Next; they return after any build or dev run, not a defect.
- **Representative sweep (scratch script, not committed):** 8 operations
  — read, parameterized read, CRUD write, secret-body write, no-Demo read,
  global-key read, Dial, and a Proxy Live-capable endpoint — × desktop
  1440 / tablet 820 / mobile 390 × en + he × Chromium + WebKit = 96 page
  loads. Zero console errors, zero horizontal overflow, zero
  `/api/playground` requests, header and request preview present on every
  one, every write's Send disabled. 60 Sends: 36 returned a DEMO response,
  24 (cdrs-list, tenants-list) the expected "Demo data not available".
- **Scans:** secret/PII scan of the whole 8C diff (`f56151b..HEAD`) and
  worktree: no keys, tokens, emails, phone numbers or credentials (the only
  secret-looking string is the unit/e2e sentinel `hunter2-REAL`, used to
  prove it never reaches a request, preview or cURL). Diff review: 21 files,
  all within the 8C plan.
- **Regenerated reports:** `npm run rollout:status` produced no change to
  `OPENAPI_PLAYGROUND_STATUS.md`, `OPENAPI_DEMO_STATUS.md` or
  `ROLLOUT_STATUS.md`.

## Phase 8C — at the approval gate (2026-10-01)

Stages 0–6 are done (Stage 2 dropped by decision); validation results are
in "Phase 8C Stage 6". The phase was **at the gate** here; it is now approved (see
"Phase 8C — APPROVED" below). 8D (pre-Stage-6
readiness gate, Sonnet 5) and the Phase 8 Stage 6 review (Opus) have not
started. Stale notes corrected in `docs/CURRENT_STATUS.md` and
`docs/SESSION_HANDOFF.md`: the branch is pushed through the 8B approval
(`f56151b`), and the 8B "present the report" instruction is obsolete.

## Phase 8C — APPROVED (2026-10-01, gate A)

Approved: approve, save, and continue to planning the next phase. Stages
0–6 complete (Stage 2 dropped by decision); coverage 37/37 resources,
159/159 operations, Demo 52, Live 0, Live-disabled 159; validation clean
(check 361/361, build clean, Playwright 192/194 with 2 WebKit skips, 96-
load sweep and secret scan clean). Not merged into `main`, not tagged,
not pushed (none requested). **Next: Phase 8D — pre-Stage-6 readiness
gate** (Sonnet 5): plan mode only; no implementation until its plan is
separately approved. The Phase 8 Stage 6 Opus review stays on hold behind
8D.

## Phase 8D — pre-Stage-6 readiness gate: PASS (2026-10-01, Sonnet 5)

- **Plan decisions (user, 2026-10-01):** the approved baseline files are
  left untouched; CDR/Simple CDR being PARTIAL there while 8A documents
  their field tables is reported as a classified discrepancy. OA-15, U-17,
  U-18, the TEST-key rotation and Proxy-era U-03/05/06/15 are known
  limitations, not gate blockers.
- **Added (no product behavior change):** `tests/unit/phase8-readiness.test.ts`
  (15 tests), `scripts/openapi-readiness.ts` (`npm run readiness:openapi`,
  `tsx --conditions=react-server`) and the generated
  `source-docs/OPENAPI_READINESS.md`; `isSecretField` is now exported from
  `executor.ts` so the test and the executor share one name rule.
- **Gate result: PASS.** Reconciled coverage, mismatch classification (93
  documentation UNKNOWN, 13 security-blocked, 1 intentionally unsupported;
  0 implementation gaps, 0 unexplained) and boundary checks are in
  `OPENAPI_READINESS.md`. The secret scan initially flagged two documented
  placeholders (`generated-token-value`, `REPLACE_WITH_A_STRONG_SECRET`);
  the pattern now excludes placeholder-named values (verified they are the
  vendor/Proxy example strings, not credentials).
- **Validation:** `npm run check` 376/376; build clean (576 pages); full
  Playwright 192 passed / 2 WebKit skips / 0 failed (no flake this run);
  Phase 8 diff secret + customer-data scans clean; server, Live and
  tenant-isolation code (`src/server`, `src/app/api`,
  `src/lib/playground-protocol.ts`) has no diff versus `main`.
- **Not done / by design:** Phase 8 and Stage 6 are not marked complete;
  nothing merged, pushed or tagged. Stage 6 needs Opus 5.

## Phase 8E — customer-facing change brief: planning (2026-10-01)

- **Why:** the user added `docs/phases/1com_API_Documentation_App_Change_Brief.md`
  (12 items) to make the portal customer-ready. It removes content the 8D
  readiness gate counted, so it runs as a **new phase before the Phase 8
  Stage 6 Opus review**, on branch `phase/customer-brief` (from the 8D
  checkpoint `4d1c8ab`). The 8D checks are re-run at the end against the
  reduced surface. Phase doc: `docs/phases/08E-customer-change-brief.md`.
- **Decisions (user):** remove everything admin-keyed (27 OpenAPI + 35 Proxy
  ManageDB operations, guides, `global=1`, "or global key" wording; approved
  baseline files untouched, reconciled through an exclusion list); OpenAPI is
  named "1com Open API"; `srv02` call-ID prefixes and node ids become `PBX`
  (Live responses never rewritten); native date/time inputs with no timezone
  conversion, documented-format fields only; "Most Used Cases" ships with
  Click to Call and CDRs, and the inbound-call popup and post-call delivery
  wait for the user's description (no documented mechanism exists);
  Sample guide kept as a third Guides selector entry.
- **Defaults chosen (confirmed by approving the plan):** "Key scope" display
  dropped; tenant parameter wording changed but `required` unchanged; Demo
  error bodies that mimic API output stay verbatim; code-sample env var names
  unchanged; date-only on a date-time field uses the documented default time;
  Playground default endpoint `simplecdrs-list`; Change Log route deleted;
  Proxy second with a "legacy" qualifier. Open question for Stage 1:
  `proxy/info.ts:110` (`/mirtapbx/proxyapi.php`, a quoted vendor path).
- **Model routing:** Sonnet 5 throughout; Stage 2's exclusion mechanism and
  SECURITY.md notes on Opus 5; Stage 6 (Phase 8) review stays Opus 5.

## Phase 8E Stage 1 — branding, API Key wording, SRV (2026-10-01, Sonnet 5)

- **Mirta -> 1com:** the OpenAPI is named "1com Open API" (selectors,
  breadcrumbs, titles); customer-visible prose reworded ("Open API" is the
  spelling in prose; `openapi.php`, ids and env var names are unchanged).
  Reworded: API summaries, `proxy/cdr.ts`, `extensions.ts`, `misc.ts`,
  `shared.ts`, `musiconholds.ts`, `reporting.ts`, `auth-token.ts` (removed in
  Stage 2). `examples.json` is regenerated through a new `brand` map in
  `scripts/openapi-examples-normalize.json` (also normalises "API key").
  Not rendered and left alone: `sourceUrl`/`source` provenance
  (`manual.mirtapbx.com`, `source-docs/raw/mirta-openapi`), comments,
  `source-docs/`. **Kept by the user's decision:** the quoted vendor path
  `/mirtapbx/proxyapi.php` in `proxy/info.ts:110`.
- **API Key:** "API key" -> "API Key" in the content model and `messages/en.json`
  (Hebrew keeps "מפתח API"); "Tenant API key"/"Tenant key" qualifiers on the
  ordinary key removed. Demo `error.message` bodies that reproduce the API's
  output stay verbatim (default 4). The "Key scope" display and the
  `Authentication.scope` data were removed (default 1): `openapiAuth()` no
  longer takes a scope, resource files lost their `scope:` lines, the
  Reference and Playground no longer render it. Global/admin wording and
  the Proxy Admin text are left for Stage 2.
- **SRV -> PBX:** 22 occurrences (call IDs and node/peer ids) in the Proxy
  content, Demo fixtures and tests are now `PBX` / `PBX-<id>`; no code parsed the
  prefix (the Live `uniqueid` pattern accepts any `word-` prefix).
- **Guard test:** `tests/unit/customer-copy.test.ts` walks every
  customer-visible string (content model incl. the observed layer, guides,
  Demo fixtures, rendered examples, both message files) and fails on Mirta
  (except the kept path), `SRVxx`, "API key" outside verbatim API output, and
  Sample/Tenant API Key qualifiers.
- **Validation:** `npm run check` 382/382; build clean (576 pages); full
  Playwright 192 passed / 2 WebKit skips / 0 failed after updating the chip
  label test; browser spot check (en/he, desktop/mobile): no Mirta, no key
  scope, no `API key`, no SRV, no overflow.

## Phase 8E Stage 2 — admin-keyed content removed (2026-10-01, Opus 5.5)

- **Removed from the customer portal:** 27 Open API operations (Tenant,
  User, User Profile, Routing Profile, Provider, Auth Token — 6 resources),
  35 Proxy `MANAGEDB` operations, the `managedb-writes` guide, the
  Admin/global sections of both authentication guides (rewritten), the
  `global=1` parameter (`globalParam`/`globalFlag`), the admin-only error
  texts (`admin_required`, Auth Token codes), the `authAdmin` auth object,
  global/Admin wording on customer resources (tenant parameter, reporting
  pages, Extension State, Proxy COUNTCHANNELS/COUNTPEERS/PEERS/INFO
  DIDS/CDRS), the `tenant=%` wildcard mention, and the 11 official Open API
  examples made with a global key (filtered in `src/content/examples.ts`;
  the "Global key" badge and its i18n key are gone).
- **Exclusion mechanism (the approved baselines stay untouched):**
  `source-docs/portal-exclusions.json` lists the excluded operations,
  resources, reqtype and guide with the reason. `tests/unit/helpers/exclusions.ts`
  exposes it to tests; `openapi-coverage`, `proxy-coverage` and
  `phase8-readiness` now assert that every baseline operation is either in
  the portal or excluded, **never both**, and that excluded resources are
  excluded whole. `scripts/rollout-status.ts` and
  `scripts/openapi-readiness.ts` report baseline vs portal counts and
  classify the 27 as "out of scope by explicit decision" (readiness: 0
  implementation gaps, 0 unexplained, all boundary checks PASS).
- **Counts:** Open API 159 -> **132** operations, 37 -> **31** resources
  (the plan's "32" was an arithmetic slip: Auth Token is its own resource);
  Proxy 109 -> **74** operations (110 inventory rows: 35 portal-excluded + 1
  previously excluded); 576 -> 450 static pages.
- **Guards:** `tests/unit/customer-copy.test.ts` also fails on
  global/Admin/SysAdmin key wording, `global=1`, cross-tenant phrasing or
  `tenant=%` in customer-visible copy (verbatim Demo API error bodies
  excepted), on any excluded operation or guide in the content registry or
  search index, and on any `related` link to a removed page. New e2e: the
  removed pages return 404 and are absent from the Reference navigation.
- **Security docs:** `docs/SECURITY.md` SEC-REQ-05/11/12/13/14 annotated
  "not reachable from the customer portal" (kept, not closed — they apply
  again if a resource is ever re-added); SEC-REQ-28 notes the
  documentation-level effect; new section "Customer portal exclusions".
  Removing documentation is explicitly **not** a security control; the
  Live boundary is unchanged (3 Proxy reads, no Open API operation).
- **Kept by design:** the form-encoded body support in `executor.ts` and
  `code-samples.ts` (still used by Proxy PHONEBOOK add); the executor test
  now uses a synthetic endpoint. Fixed a Stage 1 wording slip ("Required
  with a API Key" -> "Required with your API Key").
- **Validation:** `npm run check` 375/375; build clean (450 pages);
  `rollout:status` and `readiness:openapi` clean; full Playwright 192
  passed / 2 WebKit skips, then the 2 failures (the CDR example count and
  its removed global-key example) updated and re-run green.
- **Noted, out of scope:** `phonebook-add`'s vendor example
  (`NAME: "Ross"`, `PHONE1: "3564732920"`) looks like real-world data; it
  predates this phase and is not part of the brief — flag for a later
  decision.
- **Model note:** the plan routed only the mechanism and SECURITY.md notes
  to Opus; the removals were done in the same Opus session because the
  exclusion list, deletions and test reconciliation only pass together.

## Phase 8E Stage 3 — Console and Change Log removed (2026-10-01, Sonnet 5)

- **Console:** `console-button.tsx` and its render in `site-header.tsx` are
  deleted (it was an inert, disabled button with no route), plus the
  `nav.console*` keys. The header's right-hand cluster is now search, locale
  switch, theme toggle; no spacing change was needed (`ms-auto` + `gap`).
- **Change Log:** the single `mainNav` entry in `nav-config.ts` (which feeds
  both the desktop nav and the mobile drawer), the empty placeholder route
  `src/app/[locale]/changelog` and the `nav.changelog` / `changelog.*` keys
  (en + he) are deleted. There was no release-history data in the repo to
  preserve. `/en/changelog` now returns the standard 404; it is dropped from
  the smoke route list.
- **Tests:** new e2e (desktop 1440 and drawer at 390): no Console, no
  Changelog link, no overflow, `/en/changelog` is 404.
- **Build note:** after deleting a route, `.next` kept stale generated types
  and failed the build's type check; `.next` (git-ignored build cache) was
  cleared and rebuilt. Not a source issue.
- **Validation:** `npm run check` 375/375; build clean (448 pages);
  Playwright 190 passed / 2 WebKit skips / 0 failed; browser check en/he ×
  desktop/tablet/mobile: no Console or Changelog text, no overflow, no
  console errors.

## Phase 8E Stage 4 — date/time pickers (2026-10-02, Sonnet 5)

- **Approach (user decision):** native `<input type="date">` plus, for
  date-times, `<input type="time" step="1">`, composed into the exact
  documented string, no timezone conversion, a Clear button. Display follows
  the browser locale; the Request preview shows the exact string sent.
- **Content model:** additive `Parameter.format?: "date" | "datetime"`
  (`docs/API_CONTENT_MODEL.md`), set only where the source documents an
  exact format: Open API `start`/`end` on `cdrs-list`, `simplecdrs-list`,
  `ailogs-list` (`YYYY-MM-DD HH:MM:SS`) and Proxy `start`/`end` on
  `info-simplecdrs`, `info-queuelogs`, `info-cdrs` (`YYYY-MM-DD`) — 12
  fields. A unit test pins that list, so no format can be added without a
  decision. Campaign (`datestart`/`dateend`), conference-room
  (`startdate`/`enddate`) and `inserted` have no documented format and stay
  text; the auth-token `validity` field went with the admin content.
- **Logic:** `src/lib/date-value.ts` (`parseDateValue`, `composeDateValue`,
  `defaultTimeFor`). A date chosen without a time gets the documented
  default (start 00:00:00, end 23:59:59). A value not in the documented
  format makes the field fall back to plain text, so a typed value is never
  rewritten. The picker writes into the same `fieldKey`, so Demo matching
  (date params are `"*"` in every fixture), scenario chips, the Request
  preview and cURL are unchanged. No date parameter is Live-allowlisted.
- **Tests:** unit +7 (parse/compose/default time/round-trip, the 12-field
  list, every example parses); e2e: date-time pickers compose
  `start=2026-03-05+09%3A15%3A30` (not ISO) and the documented default end
  time, Clear removes `start`, Demo still sends; date-only Proxy field has
  no time input; undocumented-format fields have no picker; narrow mobile in
  Hebrew. The mobile test needed a state-derived retry (same hydration race
  as earlier tests). Full Playwright 197 passed / 2 WebKit skips / 1
  known parallel-load flake that passes alone.
- **Visual:** the first layout stacked each control full-width because the
  shared `w-full` class beat `w-auto`; fixed to one row (date, time, Clear),
  mirrored correctly in RTL, no overflow, no console errors.
- **Not covered:** the native picker popup itself (browser UI) is not
  automated; values are driven through the inputs.

## Phase 8E APPROVED (2026-10-02, gate A: approve, save, continue to planning)

- The user approved Phase 8E (customer-facing change brief, Stages 0-7) at
  `f084710` with option A. Final validation: check 395/395, build clean (450
  pages), Playwright 205 passed / 3 WebKit skips / 0 failed, 8D readiness
  PASS (6/6 boundary checks, 0 unexplained gaps).
- Carried forward, not blockers: inbound-call popup and post-call delivery
  guides await the user's description; Hebrew DRAFT; TEST API key rotation
  open; `phonebook-add` vendor example looks like real data (out of scope).
- Next: Phase 8 Stage 6 (cross-API consistency and security review, Opus
  5.5, review-first) enters PLAN MODE only. Not pushed, merged or tagged.

## Phase 8 Stage 6 — review findings (2026-10-02, Opus 5.5) — awaiting user decision

Branch `phase/open-api-review` (from `053e4cd`). Security: no high or medium
findings; L-1..L-3 are in `docs/SECURITY.md` "Security review — Phase 8
Stage 6". Consistency review over Proxy / Open API / Sample (8
representative Reference pages, en + he, plus the selectors):

- **Consistent:**
  - Section order (Authentication → parameters → body → Responses →
    Examples [Open API only] → Errors → Notes → Related).
  - Writes have no "Try in Playground" link on either real API.
  - One shared mechanism for evidence and verification labels ("Not
    documented", "Observed", "Verification: …").
  - The "Legacy" badge and "(legacy)" qualifier are Proxy-only.
  - Open API comes first in every selector; "API Key" wording on Open API
    and Proxy.
- **C-1 (Medium, customer-facing copy):** Reference notes show internal
  evidence references to customers:
  - "Source: source-docs/…md" (all 206 en Reference pages)
  - SEC-REQ-nn (99 pages)
  - DOCS_AUDIT / A-nn / OA-nn (36)
  - U-nn and "Site line N" / "Doc line N"
  - "Phase 7" (4)
  - `src/server/playground/allowlist.ts` (2)

  Shared by both APIs, so it is consistent but not customer-ready.
  Options: keep; strip from rendered notes; or move them to a collapsed
  "Evidence" block. The 8E brief did not cover it.
- **C-2 (Low):** the selectors show "Sample API"; 8E spec
  (`08E-customer-change-brief.md:23`) says "Sample (prototype)".
- **C-3 (Low):** Sample auth still says "Keys are scoped to one tenant",
  although 8E removed key-scope display from Open API and Proxy. The Sample
  API is synthetic.
- **C-4 (Info):** Sample lists `Authorization` under "Headers"; Open API's
  `X-API-Key` appears only under Authentication.

## Phase 8 Stage 6 — remediation done (2026-10-02, Sonnet 5)

User decisions: fix L-1, L-2, C-2, C-3, and C-1 with option A (strip the
internal references and hide the internal notes).

- **L-1:** `phonebook-add` example is now `Demo User` / `5550100`
  (`src/content/proxy/misc.ts`). Deviation from the vendor example, by
  decision.
- **L-2:** `import "server-only"` in `src/content/examples.ts` and
  `observed.ts`. Production build confirms no client import; vitest aliases
  the stub; the readiness script already runs with `react-server`.
- **C-2:** the third API is named "Sample (prototype)" (`sample-api.ts`).
- **C-3:** the Sample auth text no longer states a key scope.
- **C-1:** `src/lib/customer-text.ts`. `customerText` strips audit ids
  (A-/OA-/U-nn), SEC-REQ ids, source-docs paths, "Doc/Site line N" citations,
  "Phase N" and "see A-nn" pointers; applied inside `InlineMarkup`, so every
  content description, summary and note. `isInternalNote` hides whole notes in
  the Reference Notes list: "Security (SEC-REQ-..." and "SECURITY:" review
  notes, "Source: source-docs/..." lines, notes naming `src/` paths, and any
  note whose references cannot be removed cleanly (286 notes hidden). The
  references stay in the content files and tests (readiness and coverage
  tests read them). 24,688 rendered strings checked: 0 leftovers; all 127
  changed strings reviewed before/after. Prerendered Reference and
  Playground HTML: 0 hits (was 206 / 99 / 36 pages).
- **Residual (not fixed, by scope):** the raw strings still sit in three
  client JavaScript chunks (the content registry is imported by client
  components), so they are readable in the bundle source but never rendered.
  Vendor-doc wording such as "Doc-only purpose line" and "the Site's own
  example" remains in a few Proxy notes (no identifiers). The 8E-spec
  "Sample (prototype)" label now appears wherever the API name does.
- **Validation:** `npm run check` 405/405 (+10 new tests in
  `customer-text.test.ts`); build clean (450); full Playwright 207 passed /
  3 WebKit skips / 0 failed (the new e2e `Reference pages show no internal
  evidence references` passes on both engines); readiness 6/6 PASS, 0
  unexplained gaps; 56-load visual pass (chromium + webkit, en/he, desktop +
  mobile) 0 overflow, 0 leaks, 0 real errors (WebKit logs the known RSC
  prefetch-abort message in some loads).

## Phase 8 APPROVED and merged to main (2026-10-07)

- The user approved Phase 8 (Open API rollout, incl. 8A–8E and Stage 6
  review/remediation) and asked for `main` on GitHub to match the local
  advanced project.
- GitHub `main` (sub-path deployment, v0.2.0) was first merged into
  `phase/open-api-review` (`040bc78`), then that branch was merged into
  `main` and tagged `v1.0-developer-portal`.
- No next phase is planned or started.


## Phase 9 — Open API Live pilot (2026-10-08)

Defined by a grilling session with the user; every point below is the
user's decision unless marked otherwise. Spec: `docs/phases/09-openapi-live-pilot.md`.
Branch `phase/openapi-live` from `main` @ `9dc8562` (`v1.0-developer-portal`).

- **Scope**: exactly one Open API operation goes Live, `simplecdrs-list`
  (read-only). Everything else stays Live-disabled; later operations are
  added one at a time in later phases with the same pattern. *Why*: mirrors
  the Proxy pilot (Phase 4/5) and keeps the security review small.
- **Caller PII shown in full to the key holder; never logged or stored.**
  Closes SEC-REQ-08 for this operation only. *Alternatives rejected*:
  masking in the portal (no longer shows real API output) and removing the
  fields (diverges from the documented response).
- **Credential upstream in the `X-API-Key` header** (the documented
  preferred transport), not the `key` query parameter, so it stays out of
  URLs and the vendor's access logs. Required extending the allowlist from
  query-only to header auth for the one name `X-API-Key`.
- **JSON only.** `format=json` forced; `format`/`template`/`contenttype`
  not caller-settable. The user first chose to allow XML/template output,
  then reconsidered after learning it cannot be field-filtered.
- **12-field default-deny response allowlist** (observed record); error
  answers cut to `error.code`/`error.message` (without this the field
  allowlist would have emptied them to `{"error":{}}`).
- **All 13 documented filters + `tenant` accepted, each with an anchored
  pattern.**
- **Date range**: first decided 7 days, **amended the same day to 3 days
  (user)**. Enforced before any upstream call, with the documented defaults
  (today 00:00:00 / 23:59:59) applied for an omitted bound.
- **Multi-tenant answer blocked** whole (`multi_tenant_blocked`): a key that
  sees several tenants (admin/global) is not supported in the Playground.
- **Playground still opens in Demo**; Live is a deliberate switch with the
  existing confirmation.
- **CSP "lockdown" over strict-nonce CSP.** Pages stay statically
  pre-rendered; `script-src` keeps `'unsafe-inline'`. The policy locks the
  page to its own origin (exfiltration lock). *Trade-off recorded*: injected
  script is not blocked. The strict alternative would render every page per
  request on the PBX host.
- **Testing**: unit + mocked-browser tests always; an env-gated real-PBX
  spec (`tests/e2e/live-real.spec.ts`) the user runs locally with the TEST
  key in their own shell: trace/screenshot/video off, structure-only
  assertions, the one browser test filtered to an empty result.
- **TEST key**: local testing only; never in production configuration or in
  the repository. Rotation not tied to this phase (user). Note: the key was
  pasted into the chat on 2026-10-08 (value not recorded anywhere).
- **Production**: Live is enabled on the production server right after gate
  approval, with `PLAYGROUND_TRUSTED_IP_HEADER=x-forwarded-for`. Hosting
  facts (Apache reverse proxy to `127.0.0.1:3100`) were verified by the user
  and are recorded in `docs/DEPLOYMENT.md`, which did not exist before.
- **BLOCK LIVE bookkeeping** (Claude, not asked): the baseline's `BLOCK
  LIVE` mark on `simplecdrs-list` is left as recorded history; the readiness
  test lists an explicit, self-checking exemption instead of rewriting the
  baseline.

Stages (all on `phase/openapi-live`): 1 server `b93afe0` (+ 3-day amendment
`99abefd`), 2 client `aa1ba60`, 3 CSP `0fb9c94`, 4 real-PBX spec `7c6636b`,
5 docs. Stage 6 (Opus security review and gate) pending.

## Phase 9 APPROVED (2026-10-08)

- The user approved Phase 9 at its gate with option B (approve, save, and
  stop). Final branch state on `phase/openapi-live`; not merged, pushed or
  tagged. No next phase is planned or started.
- Production Live enable (decided "right after the gate") is still a
  separate, user-run step and has not been done.

## Hebrew removed — English-only portal (2026-10-08)

User decisions (asked one by one), on branch `chore/remove-hebrew` from
`phase/openapi-live`:

- **Hebrew is removed completely** from the site: no Hebrew pages, language
  switcher, Hebrew messages (`messages/he.json` deleted) or "not translated"
  banner. Supersedes the Phase 1–4 bilingual (en/he, RTL) decisions.
- **Addresses keep `/en/`**, so every existing English link and bookmark
  keeps working (next-intl stays, with a single locale and no detection).
- **Old `/he/...` addresses redirect (308) to the same `/en/...` page**
  (`next.config.ts` redirects; query kept).
- **RTL-only code removed** (RTL CSS, `rtl:` variants, mirrored icons,
  RTL arrow-key logic, Hebrew font subset, redundant `lang="en"` markers).
  Kept: generic logical CSS classes and the `dir="ltr"`/`dir="auto"`
  isolation around code, URLs and parameter names.
- Kept on purpose (not UI language): the vendor source-site URL that
  contains Hebrew (`src/content/proxy/shared.ts`) and a Hebrew caller-name
  test value — real call data may contain Hebrew names, and the Live filter
  pattern must keep accepting them.
- Historical decision and phase entries that mention Hebrew are unchanged.

## Merged to main (2026-10-08)

- On the user's request, `chore/remove-hebrew` was merged into `main`
  (no-ff). Because it was built on `phase/openapi-live`, this also merges
  the approved Phase 9 (Open API Live pilot). Not pushed, not tagged;
  production Live not enabled.

## Live enabled in production (2026-10-08)

- On the user's request, `main` (`5ac5a82`) was deployed to the production
  server and `PLAYGROUND_LIVE_ENABLED=true` was added to `/etc/portal.env`
  (the Phase 9 decision "enable right after the gate"). Verified from
  outside the network. Kill switch: remove the line and restart the portal.

## Side menus: hide, not delete (2026-10-08)

- The user asked to remove Provisioning and Settings from the menu. Chosen
  (user): hide from the side menus only. Content, routes, search, Demo
  fixtures and coverage tests are unchanged; direct URLs still work.
  Ordering and hiding are per-API config (`menuOrder`, `menuHidden`), set
  only for the Open API.

## Observed-example label: neutral chip + caption (2026-10-08)

- The amber, two-line "Observed, sanitized - not vendor-documented" chip
  looked alarming. Chosen (user): a short neutral "Observed sample" chip and
  the full wording kept as a muted caption under the example. The
  documented-vs-observed disclosure stays visible; only its styling changed.

