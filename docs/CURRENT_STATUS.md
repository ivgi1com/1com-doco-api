# Current Status

Current work:
**Production (2026-10-08): `main` `5ac5a82` deployed to
`https://pbx6webserver.1com.co.il/1com-api-doco/` and Live enabled
(`PLAYGROUND_LIVE_ENABLED=true`, 13:31 IDT). Verified from outside:
`openapi/simplecdrs-list` reaches the PBX (fake key -> upstream 401
`invalid_api_key`), other operations `endpoint_not_allowed`, foreign
origin `forbidden_origin`; CSP headers present; `/he/...` -> `/en/...`.
All work is merged to `main` and pushed. No next phase started.**
Procedure and kill switch: `docs/DEPLOYMENT.md`.

Previous:
**Hebrew removed — English-only portal (2026-10-08), merged to `main`
on the user's request together with the approved Phase 9 (Open API Live
pilot) it was built on. (Since pushed and deployed; see above.)** `/en/` addresses unchanged; `/he/...`
redirects to `/en/...`. See `docs/DECISIONS.md` "Hebrew removed".

**Phase 9 (Open API Live pilot, `simplecdrs-list`) APPROVED (2026-10-08,
gate B — approve, save, and stop) on `phase/openapi-live`. Not merged to
`main`, not pushed, not tagged. No next phase started; waiting for the user.
(Since merged, pushed, deployed and Live-enabled; see above.)**
Opus security review: no findings.
Server (header auth, JSON-only, 12-field allowlist, 3-day range cap,
multi-tenant block), Playground wiring, CSP lockdown and the env-gated
real-PBX spec are committed; the real-PBX spec passed 3/3 against the
production PBX with the user's TEST key. `npm run check` 474/474, Chromium
Playwright 118 passed / 3 skipped, WebKit 115 passed / 6 skipped. Production
enable happens only after gate approval (`docs/DEPLOYMENT.md`). Spec
`docs/phases/09-openapi-live-pilot.md`; detail `docs/DECISIONS.md` "Phase 9",
`docs/SECURITY.md` "Phase 9".

Previous:
**Phase 8 (Open API rollout) APPROVED (2026-10-07) and merged to `main`, tagged
`v1.0-developer-portal`, pushed.** Before the merge, GitHub `main` (sub-path
deployment `NEXT_PUBLIC_BASE_PATH`, v0.2.0, README revision) was merged into
`phase/open-api-review` (`040bc78`; one e2e conflict resolved). Validation on
the merge: check 408/408, build clean (450 pages), Playwright 206 passed /
3 WebKit skips / 1 flaky (extensions-get prefill, mobile-safari; 6/6 pass in
isolation). No next phase started; any further work awaits the user.

Previous:
**Phase 8 Stage 6 (cross-API consistency and security review) DONE with remediation on `phase/open-api-review` (2026-10-02); at the Phase 8 gate, awaiting the user (A/B/C/D). Check 405/405, Playwright 207/0 failed, readiness 6/6 PASS. Phase 8E (approved) detail: customer-facing change brief (before Phase 8 Stage 6): Stages
0-7 DONE and committed on branch `phase/customer-brief` (2026-10-02); Stage
5 made Open API first/default (Proxy "legacy", Playground opens on
`simplecdrs-list`). Stage 6 (Guides selector, Most Used Cases) done: check
395/395, build clean, targeted e2e 69 passed, 60-load visual pass clean
(0 errors, 0 overflow; earlier 500/404 were a stale-server artifact).
Stage 7 done: check 395/395, build clean (450 pages), Playwright 205 passed / 3 WebKit skips / 0 failed, 8D readiness PASS (6/6 boundary checks, 0 unexplained gaps). Awaiting the Stage 8 gate (A/B/C/D).
Nothing pushed/merged/tagged.** Spec `docs/phases/08E-customer-change-brief.md`;
detail `docs/DECISIONS.md` "Phase 8E ..." and `docs/SESSION_HANDOFF.md`.
Open API now 132 operations / 31 resources, Proxy 74 operations (admin
content excluded via `source-docs/portal-exclusions.json`). Validation at
`ce30196`: check 382/382, build clean, Playwright 197 passed / 2 skips / 1
known flake that passes alone.

Previous: **Phase 8D — pre-Stage-6 readiness gate: validation run 2026-10-01, result
PASS — ready for Stage 6 (checkpoint commit, not an approval).** Phase 8
and Stage 6 are NOT complete; Stage 6 (Opus cross-API consistency and
security review) has NOT started and needs the user to switch to Opus 5.
Evidence: `source-docs/OPENAPI_READINESS.md`, `tests/unit/phase8-readiness.test.ts`
(15 new tests), `docs/DECISIONS.md` "Phase 8D". `npm run check` 376/376,
`npm run build` clean (576 pages), full Playwright 192 passed / 2 WebKit
skips / 0 failed, all boundary checks PASS, zero unexplained gaps.
Remaining limitations: see `docs/SESSION_HANDOFF.md`.

Previous: **Phase 8C — OpenAPI Playground: APPROVED (2026-10-01, gate A —
approve, save, and continue to planning the next phase). 8D (pre-Stage-6
readiness gate, Sonnet 5) is in PLAN MODE only: planning, no
implementation until its plan is separately approved.** Branch
`phase/open-api` (the 8C commits sit on top of the pushed 8B approval
`f56151b`; they are local, not pushed, not merged, not tagged). Stages
0–6 done: SEC-REQ-27 amended (a write may be Demo-simulated from a
documented example only, never Live — Stage 0, Opus); the write-response
audit found only 3 of 93 writes document a success response, all excluded
by SEC-REQ-05/06, so **0 writes are simulatable** and Stage 2 (write
fixtures) was dropped by user decision; request body + cURL + live
"Request preview"; field details, operation header (kind/auth/key scope),
API switcher, unknown-endpoint notice and an explicit Live-not-enabled
state; Playground coverage report. Coverage: 37/37 resources, 159/159
operations in the Playground; Demo 52 (52/66 reads, 0/93 writes); Live 0;
Live-disabled 159. Validation: `npm run check` 361/361, `npm run build`
clean (576 pages), full Playwright 192 passed / 2 WebKit skips / 0 failed
(194), a 96-load sweep (2 engines × 2 locales × 3 viewports × 8
operations) clean, secret/PII scan clean. Full detail: `docs/DECISIONS.md`
"Phase 8C ..." entries, `docs/SESSION_HANDOFF.md`. Open: TEST API key
rotation still pending; Hebrew strings still DRAFT.

Previous Phase 8 summary (history, kept for context):
**Phase 8 — Open API rollout: Stages 0–5 done. A manual product review
on 2026-09-26 found the OpenAPI implementation was not actually
feature-complete before Stage 6** (the API Reference didn't expose all
baseline-documented information; the OpenAPI Demo and Playground were
missing/incomplete). **Four sub-phases were inserted before Stage 6:
8A (API Reference completeness), 8B (Demo), 8C (Playground), 8D
(pre-Stage-6 readiness gate) — all Sonnet 5. **8A is APPROVED
(2026-09-26, gate A):** 325 official named examples in the Reference
(`source-docs/openapi/examples.json`), CDR/Simple CDR response field
tables, 2 list filters, a full alias/notes audit (6 fixes) with a new
request-body-key coverage test, and a shared-component rendering fix
(`endpoint-view.tsx` now passes notes/error/response/example
descriptions through `InlineMarkup`, so documented backtick spans
render as inline code instead of literal text — also benefits Proxy
pages). `npm run check` 285/285, `npm run build` clean, Playwright
162/164 (1 known flake confirmed to pass alone, 1 WebKit skip), a
40-load visual pass and a secret scan, all clean. Full detail:
`docs/DECISIONS.md` "Phase 8A — APPROVED", `docs/SESSION_HANDOFF.md`.
**Phase 8B (OpenAPI Demo): Stages 1–5 COMPLETE, APPROVED (2026-09-26,
gate B — approve, save, and stop; next phase (8C) not started, waiting
for separate approval before planning begins).** Stage 1
(Demo fixes and documented cases), Stage 2 (masked OpenAPI GET probe),
Stage 3 (observed Reference responses wired via
`src/content/observed.ts`, `DOCS_AUDIT.md` §14 OA-14..OA-18,
SECURITY.md probe observations), Stage 4 (Demo fixtures for all 52
Demo-supported OpenAPI GETs), and Stage 5 (labeling, the
`source-docs/OPENAPI_DEMO_STATUS.md` coverage report, and full
validation) are all done. After a PC crash mid-session lost the running
handoff, the Stage 4 scope was recovered from raw session transcripts
and reconfirmed with the user; one real bug found during Stage 5's own
visual validation (an unreachable "Unique ID missing" Demo case, since
its field is client-side-required) was fixed. `npm run check` 348/348,
`npm run build` clean (576 pages), a dedicated 76-test Playwright pass
across both engines/locales/desktop+narrow-mobile all green, the full
Playwright suite 176/178 (the one failure unrelated, confirmed to pass
alone), and a secret/PII scan, all clean. Full detail:
`docs/SESSION_HANDOFF.md` "Phase 8B — Stages 1–5 complete, at the
approval gate", `docs/DECISIONS.md` "Phase 8B Stage 4–5 completion,
recovered scope, and generalized decisions". TEST key rotation still
pending. Stage 6 (Opus cross-API consistency and security review — the
Phase 8 gate item) is on hold until 8C and 8D pass.** Full
detail: `docs/phases/08-open-api.md` "Pre-Stage-6 sub-phases",
`docs/phases/08-substages-README.md`, `docs/DECISIONS.md` "Phase 8
pre-Stage-6 sub-phases inserted". This supersedes the "FEATURE-COMPLETE"
status previously recorded here.
Plan approved 2026-09-26
(`C:\Users\ivgi-pc\.claude\plans\zany-fluttering-dewdrop.md`; decisions
in `docs/DECISIONS.md` "Phase 8 planning", "Phase 8 Stage 1 complete",
"Phase 8 Stage 3 complete", "Phase 8 Stage 4 complete", "Phase 8 Stage 5
complete"). `main` fast-forwarded to `be23fb2` and tagged
`v0.5-proxy-complete`. Branch `phase/open-api` (pushed through the 8B approval; 8C commits local). Scope:
Reference pages for all 159 operations (OA-13) complete —
`ROLLOUT_COMPLETE = true` in `tests/unit/openapi-coverage.test.ts`.
Demo fixtures for the 3 approved GETs; every write Reference-only. One
guide, "OpenAPI authentication and scope" (a real pre-existing CSS grid
bug found and fixed while authoring it). New e2e coverage: API
switching, a path-param endpoint, write-blocking, the 3 Demo fixtures,
2 negative states (2 real test-only issues found and fixed along the
way, not product bugs — see "Phase 8 Stage 5 complete"). `npm run
check` 277/277, `npm run build` clean (546 endpoint pages), full
Playwright suite 160/162 (1 WebKit-only skip, 1 pre-existing-class
flake confirmed to pass alone), a 48-page-load visual pass (3 viewports
× 2 locales) and a secret scan, both clean.

Previous work (approved):
**MiRTA OpenAPI documentation baseline: Stage C (security review +
second-pass audit) done — APPROVED 2026-09-26 (gate A: approve, save,
and continue to planning the next phase).** Not merged, not pushed, not
tagged (none requested). Next: Phase 8 (`docs/phases/08-open-api.md`)
planning only — no implementation until its plan is separately approved. Stage C (Opus): 15
local transcription defects fixed (OA-11) plus evidence-overstatement
wording in 3 SEC-REQs and a README rule (OA-12), `DOCS_AUDIT.md` §13.2; 4 user security decisions applied (SEC-REQ-27 writes out
of Live, SEC-REQ-28 tenant isolation, SEC-REQ-19 → BLOCK LIVE,
SEC-REQ-29/30 new REVIEW REQUIRED). Labels now: 13 BLOCK LIVE, 13 REVIEW
REQUIRED, 11 UNKNOWN. Stage B summary (kept for context) follows.
**Stage B (resource transcription):** A docs-only task
requested directly by the user, governed by
`docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md`. Branch
`docs/openapi-baseline` off `phase/proxy-rollout` @ `3612586`, HEAD at
`fade01f`, working tree clean. All 38 official MiRTA OpenAPI pages (37
resources + Overview) are documented in `source-docs/openapi/`: 5 fully
`DOCUMENTED`, 32 `PARTIAL` (no response schema on the official pages —
left `UNKNOWN`, not guessed), 0 `CONFLICT`, 0 unprocessed. 22 new
`SEC-REQ-05`..`26` entries added to `docs/SECURITY.md`. Zero application-
code changes; `npm run check` 250/250. **Next: the Stage C
cross-resource security review, the second-pass documentation audit, and
the §14 completion report — reserved for Opus, not started.** Full
detail: `docs/SESSION_HANDOFF.md` (read this first).

Earlier work (unaffected, unrelated to the above):
**Phase 7 — Proxy API rollout: APPROVED (gate A), Stages 0–7 done.** Plan
approved 2026-09-25
(`C:\Users\ivgi-pc\.claude\plans\start-phase-7-swirling-boot.md`;
decisions in `docs/DECISIONS.md` "Phase 7 planning", "Phase 7 Stage 1
checkpoint", "Phase 7 Stage 3 complete"). `main` fast-forwarded to
`0cbd7ba` and tagged `v0.4-demo-approved`. Branch `phase/proxy-rollout`.
Stage 3 (Reference authoring) is complete: **all 109 non-excluded
operations now have a Reference page** (`npm run rollout:status`:
109/109, 0 broken links); `tests/unit/proxy-coverage.test.ts`'s
`ROLLOUT_COMPLETE` flag is now `true`, enforcing full coverage going
forward.
Stage 4 (probe the read operations, Opus for the probe + Sonnet for the
write-up) is also complete: 35 operations probed with a user-supplied TEST
key/tenant (never written to disk; rotated after the stage), full findings
in `source-docs/DOCS_AUDIT.md` §12 (A-56..A-77), 32 operations gained a
full observed Reference response. Two security findings: A-58 (INFO
outdialed's json keys can be human-readable device labels) and **A-77**
(VOICEMAIL list exposes a plaintext `imapuser`/`imappassword` pair) — new
blocking requirement **SEC-REQ-02** in `docs/SECURITY.md`. No Live
allowlist change. `npm run check` 209/209, build clean (`rollout:status`:
109/109, 0 broken links, 38/109 endpoints tested), a Playwright visual
pass over 10 newly-filled pages (desktop/mobile) — zero console errors, no
overflow. The full Playwright suite and an he-locale pass were not re-run
this stage; do before the Stage 7 gate.
Stage 5 (Demo fixtures for the observed reads, Sonnet) is also complete: 13
new fixture sets in `src/content/demo/proxy.ts` for the operations with
genuine multi-field observed data; the other ~19 (error-only/empty/timeout)
get no fixture by design. `imapuser`/`imappassword` (VOICEMAIL list, A-77)
fixed at `null` in every fixture, per user decision, matching the QUEUELOGS
precedent. A real UI bug was found and fixed during manual verification
(`info-extstate`'s case didn't match the field's own pre-filled example
value). `npm run check` 223/223, build clean, a Playwright pass driving the
real Playground confirmed all 13 resolve with zero console errors.
Stage 6 (Guides and Search) is also complete: a new guide content model
(Opus — `src/content/guides/types.ts` + a generic renderer, replacing
hardcoded single-guide JSX) plus 3 new Proxy guides (Sonnet — Authentication
and keys, Call history, ManageDB writes); search already covered every
endpoint and guide (new index-count test passes as-is). Two real,
pre-existing Playwright bugs fixed (a hydration race losing an early
keystroke/click in the search-palette and mobile-nav-drawer tests) — very
likely the actual cause of the "different single test fails each run"
flakiness dismissed across Phase 5/Stage 3; the suite ran 142/142 clean 3
times in a row afterward. The dev-only 404 `<script>` warning was attempted
but not resolved — the predicted one-line fix doesn't work (deeper Next.js
dev-mode behavior); the `next/script` cleanup was kept anyway (harmless),
warning stays open. `npm run check` 245/245, build clean.
Stage 7 review (Opus) and remediation (Sonnet) are both COMPLETE. Live
boundary, write blocking, secrets and guide rendering all passed review;
all 4 findings resolved (one closed as a review counting error, not a real
bug). A genuine regression from finding 1's own fix (3 endpoints' Demo
default silently switched from "plain" to "JSON", breaking 5 e2e
assumptions undetected by a locator weakness) was found and fixed this
session, along with directly confirming the BLFS/FLOWS positional-key
counts (previously inferred) from the raw probe capture. Full detail:
`docs/SESSION_HANDOFF.md` "Phase 7 — Stages 0–7 done, at the completion
gate", `docs/DECISIONS.md` "Stage 7 remediation completion".
Final checks: `npm run check` 250/250, `npm run build` clean,
`npm run rollout:status` 109/109 pages, 0 broken links, 18 Demo fixture
sets, full Playwright (146 tests × 2 projects) clean on 2 of 3 fresh-build
runs (1 unrelated pre-existing-class flake, passed alone), a 90-page-load
visual/console pass at 3 viewports × 2 locales over the newly-touched
pages, and a clean secret scan. **Phase 7 is APPROVED (2026-09-26, gate
A)** — freshness checks (`npm run check`, `npm run build`) re-confirmed
clean at approval time; full detail in `docs/DECISIONS.md` "Phase 7
approval". Not merged into `main`, not tagged, not pushed. Next phase has
not started; waiting for its own plan to be presented and approved.
**Open action carried forward**: the Stage 4 TEST API key is confirmed
not yet rotated (`docs/SECURITY.md` "Open action items").

Previous phase:
**Phase 6 — Demo Mode: COMPLETE AND APPROVED** (approved 2026-09-25, gate
B — approve, save, and stop; next phase **not started**, waiting for
separate approval before planning begins). Branch `phase/demo-mode`,
committed on top of `950e1d4`. Not merged into `main`, not pushed, no tag
(matching Phase 5's precedent below — neither requested).

All 5 rescoped operations have Reference content and Demo fixtures:
`INFO EXTENSIONS`, `AGENTS`, `DIDS`, `SIMPLECDRS`, and now `QUEUELOGS`,
unblocked mid-phase by one user-supplied real record (A-50; redacted copy
in `source-docs/observed/info-queuelogs.json`) — only its observed
outcomes are simulated, per user decision (`docs/DECISIONS.md`). Security
finding A-55 is recorded as blocking requirement **SEC-REQ-01**
(`docs/SECURITY.md`): QUEUELOGS stays off Live until a strict field
allowlist (incl. positional keys) passes validation. Checks: `npm run
check` clean (194 unit tests), build clean, full Playwright 127/134 (7
pre-existing, unrelated failures — see known issues below and
`docs/SESSION_HANDOFF.md`). Full detail, incl. the completion report:
`docs/SESSION_HANDOFF.md`, `docs/DECISIONS.md`.

**Known issues (not fixed, recorded 2026-09-25, both confirmed pre-existing
via `git stash` back to this phase's starting checkpoint `950e1d4` —
neither introduced by Phase 6, neither fixed here):**
- **6 of 134** — "loads without console errors" fails on `/en/no-such-page`
  (desktop/tablet/mobile) when run against `npm run dev`. Cause: React's
  dev-only warning "Encountered a script tag while rendering React
  component", almost certainly from the inline theme-init `<script
  dangerouslySetInnerHTML>` in `src/app/[locale]/layout.tsx:62`
  re-rendering through the not-found boundary; dev-only (React strips this
  warning from production bundles) — passes clean against a production
  server (`npm run build && npm run start`, verified this session). Fix,
  if wanted, belongs with Phase 5's layout code.
- **1 of 134** — "search palette: keyboard shortcut opens it, Escape
  closes it" (chromium-desktop only), unrelated to Demo Mode. Not
  investigated further.

This superseded an earlier, narrower "waiting for the 7 examples"
checkpoint, itself preceded by a full rebuild of `source-docs/proxy-api/`
from 1com's own documentation (the MiRTA-sourced audit was discarded as
authoritative). That rebuild is done and committed (`docs/DECISIONS.md`
"Proxy API documentation baseline reset", `source-docs/DOCS_AUDIT.md`
§10, `source-docs/unresolved.md` U-12–U-16, all still open/unaffected by
the work above).

Superseded (kept for history, not current):
**Phase 6 — Demo mode (7-operation scope): SUPERSEDED.** Its plan
(`C:\Users\ivgi-pc\.claude\plans\start-phase-06-harmonic-cherny.md`) and
`docs/DECISIONS.md` "Phase 6 planning" named 7 operations and a broken
probe script; both are moot now that the user re-scoped to the 5
operations described above and verification was done a different way.

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
`phase/open-api` (Phase 8, see the top of this file). The Phase 7 note
that follows is history: `phase/proxy-rollout`, Stages 0–7 APPROVED at
gate A on 2026-09-26. Not
merged into `main`, not tagged, not pushed. The `phase/demo-mode` @
`0631a95` line this section used to show is stale history from before the
Phase 6 approval and the Phase 7 branch — kept below only as
Phase 6/6-superseded record.

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

Earlier phase:
**Phase 7 — Proxy API rollout** (`docs/phases/07-proxy-api-rollout.md`).
Approved 2026-09-26, gate A — see the top of this file.

Next phase:
Not started. Waiting for its plan to be presented and separately
approved before any implementation begins.

Resume: see `docs/SESSION_HANDOFF.md`.
