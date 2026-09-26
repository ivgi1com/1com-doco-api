# Session Handoff

Last updated: 2026-09-26 (Phase 8B — OpenAPI Demo: Stages 1–5 COMPLETE,
validation done, AT THE GATE — awaiting the user's A/B/C/D decision;
read this first)

## Phase 8B — Stages 1–5 complete, at the approval gate (2026-09-26, Sonnet 5)

- Branch `phase/open-api`, HEAD `71fcc30` (on top of the Stage 4/5 WIP
  commits `2de5888`/`11377ef`). Not pushed, not merged, not tagged.
- **This session fixed one real bug found during its own Stage 5
  validation** (rule 6 — drive the real UI, don't trust unit tests
  alone): `aianalysis-get`'s "Unique ID missing" case relied on
  submitting an empty `uniqueid`, but that field is a documented
  `required: true` query parameter, so the Playground's own client-side
  validation (`use-playground.ts`) blocks Send before the Demo resolver
  ever runs — the case was permanently unreachable. Removed (commit
  `71fcc30`); the file's header comment now explains this alongside the
  analogous, already-known get-by-ID 404 exclusion.
- **Validation, now complete:**
  - `npm run check`: 348/348 unit tests, typecheck, lint.
  - `npm run build`: clean, 576 pages.
  - A 76-test Playwright pass (not committed, scratch file deleted
    after running) covering every new fixture's scenario resolution —
    chromium-desktop + mobile-safari, en + he, at the 1440×900 viewport
    this project's own `smoke.spec.ts` "interactions" block always
    uses for these tests (its `test.use({viewport})` override applies
    regardless of Playwright project name — "mobile-safari" there means
    the WebKit engine, not a narrow viewport) — plus a narrow-mobile
    (390px) layout/console/no-network smoke check on 4 representative
    endpoints × 2 locales. All 76 passed: correct DEMO stamp, correct
    status/scenario text, zero console errors, zero
    `**/api/playground` requests, zero horizontal overflow. One
    screenshot manually reviewed (rule 6).
  - Full Playwright suite re-run fresh, twice: 176/178 both times. The
    one failure each time (`Try in Playground opens the Playground on
    this endpoint with the Proxy API's own samples`, unrelated to
    OpenAPI or this work) passed cleanly when rerun alone — confirmed
    as this project's documented parallel-load flake class.
  - Secret/PII scan of `git diff 63aa91b..HEAD`: clean. Also checked
    every literal string in the masked probe file itself: only already-
    public MiRTA error codes and type/length descriptors, no PII or
    secrets of any kind.
  - `source-docs/OPENAPI_DEMO_STATUS.md` (Stage 5 coverage report):
    52/66 read operations Demo-supported; the other 14 have a recorded
    reason (global-key-only resource, not probed, or probed with no
    fixturable data).
- **Debugging note, in case it recurs:** while building the 76-test
  pass, several confusing dead ends turned out to be test-script bugs,
  not product bugs — worth knowing before assuming a "hang" or
  "mobile-only failure" is real: (a) a stale `npm run start` background
  process left running from an earlier build served pre-edit code,
  producing a phantom "tenant field won't clear" symptom that a fresh
  `rm -rf .next && npm run build` resolved; (b) `.md\:grid`
  (`desktopPane`) is genuinely `display:none` below the 768px Tailwind
  `md` breakpoint — the existing OpenAPI Demo e2e tests only appear to
  validate mobile-safari because `test.use({viewport:{width:1440,
  height:900}})` at the top of `smoke.spec.ts`'s "interactions" describe
  block overrides the project's own device viewport; a genuine narrow
  check needs an explicit `page.setViewportSize()`, matching that same
  file's own "mobile nav drawer" test; (c) a chip's `preset` value only
  reaches the real field after React flushes the state update — a
  `chip.click()` immediately followed by `send.click()` with no wait
  can race it (the same class of bug as the Phase 7 `info-extstate`
  lesson).
- **Untracked cleanup:** all scratch/diagnostic files from this and the
  crashed prior session were deleted after use (`.diag-tmp.mjs`,
  `.diag-aia.mjs`, `.diag-params.mjs`, the temporary Playwright spec,
  and `test-results/`) — none were ever committed, and `.diag-tmp.mjs`'s
  original question (a "Try in Playground" issue on `extensions-get`)
  turned out to match the same parallel-load flake class confirmed
  above, so its investigation is resolved, not abandoned.
- **Not yet done (deliberately, per the plan):** Stage 6 (Opus
  cross-API consistency and security review) stays on hold behind 8C
  (Playground) and 8D (readiness gate), per the existing plan — this
  session did not touch either. The TEST API key rotation from Phase
  8B Stage 2 is still an open `docs/SECURITY.md` action.
- **Environment:** the Playwright-managed `next start` server from the
  last full-suite run was torn down when the run finished; port 3000
  should be free. No dev/start server was left running by this session.
- **Model:** Sonnet 5 for all of this session's Stage 4/5 work, per the
  project's routing rule (routine fixture/test/validation work). The
  Stage 6 review, whenever it starts, is Opus per the existing plan.
- **First action next session:** `git status`, `git log -3`, confirm
  the tree is clean, then present (or re-present, if the user already
  saw it and this is a fresh session) the Phase 8B §16 completion
  report and wait for the A/B/C/D decision below. Do not start 8C.

## (Superseded by the entry above) Phase 8B — Stage 4 + Stage 5 coverage report: WIP checkpoint committed (2026-09-26, Sonnet 5); STOP, Stage 5 validation not finished

- Branch `phase/open-api`, commit `2de5888` (WIP, not final). Not pushed.
- **Why this entry exists — do not trust the entry below by itself:** the
  user's PC crashed mid-session. The plan file this session needed
  (`C:\Users\ivgi-pc\.claude\plans\linked-rolling-seal.md`) had already
  been overwritten by an earlier resume (see the STOP entry below), and
  the working tree held **uncommitted** partial Stage 4 work from the
  crashed session with no record of what scope had been decided. This
  session recovered the original approved 8B plan text and every later
  user decision **verbatim from the raw session transcripts**
  (`~/.claude/projects/.../590e8438-....jsonl` and `9981270b-....jsonl`),
  not from any handoff file, then asked the user to confirm the Stage 4
  scope before continuing. The recovered plan and decisions are recorded
  in full in `C:\Users\ivgi-pc\.claude\plans\compiled-spinning-hellman.md`
  — read that file, not just this entry, if anything here is unclear.
- **User's confirmed scope (this session):** every OpenAPI GET the Phase
  8B masked probe (`source-docs/observed/openapi/probe-2026-09-26.masked
  .json`) returned genuine data for gets a Demo fixture (not just the 4
  the crashed session had produced), plus every observed error/empty
  scenario on an endpoint that also has a success fixture.
- **Done:**
  - `src/content/demo/openapi.ts`: 48 new `DemoFixtureSet` consts (list
    them all in the file's own export array) covering calleridblacklists,
    campaignnumbers, campaigns, conditions, conferencerooms, cronjobs,
    customdestinations, dids, disas, featurecodes, flows, huntlists,
    ivrs, mediafiles, musiconholds, paginggroups, phonebooks,
    provisioningphones, settings, shortnumbers, voicemails (list+get
    each), extensions (list, get, get-by-number), simplecdrs-list (+ a
    "no match" empty-array case), phonebookentries (list+get).
    `openapiDemoFixtures` now has 52 sets (was 4).
  - Each new set has two cases: "Tenant omitted" (401 `invalid_api_key`,
    OA-15, applied on the premise that the same auth layer runs in front
    of every resource — only probed directly on `extensions-list`,
    flagged as such in each case's own `basis`) and "Found" (the probe's
    observed field shape with fabricated values, generated by
    reproducing `src/content/observed.ts`'s mask-to-example rules in a
    scratch generator — not imported at runtime, so the probe file is
    not shipped to the client bundle — so Demo and the Reference page's
    observed schema agree). Long numbered-field runs (`paramN`, `fieldN`,
    `lineN_ex_id`) are mechanically collapsed to their first 2 members,
    and fields the probe observed as empty/null on every row are
    dropped — both are evidence-based trims documented in the file's
    header comment, not per-field guesses.
  - `aianalysis-get` gains "Tenant omitted" (401), "Unique ID missing"
    (400 `uniqueid_required`), and "No analysis for the unique ID" (200,
    empty array) cases, alongside the existing invalid-key/one-unknown/
    found cases.
  - **Every get-by-ID endpoint's observed 404 `object_not_found` (OA-16)
    stays unfixtured.** The id that selects it is a path parameter, and
    `DemoCase.when` only matches query parameters (`types.ts`) — the
    same limitation the crashed session already accepted for
    `queues-get` ("Skip it for queues-get" per its own AskUserQuestion),
    generalized here to every resource rather than asked again.
  - `tests/unit/openapi-coverage.test.ts` (`DEMO_ALLOWED`) and
    `tests/unit/demo-fixtures.test.ts` (`FIXTURE_ENDPOINTS`) extended to
    the full 52-endpoint set.
  - **Two real bugs found and fixed while validating, both now fixed in
    the same commit:**
    1. Every "Tenant omitted" case's `preset` was `{}`. `tenantParam()`
       gives every `tenant` field a documented example value
       (`TESTTENANT`), which the Playground pre-fills by default (the
       same `info-extstate` lesson from Phase 7 Stage 5), so an empty
       preset never actually cleared the field and the case could never
       resolve through the real UI. Fixed to `preset: { tenant: "" }` on
       all 49 cases (48 new + the added `aianalysis-get` one). Caught by
       the existing "each scenario chip resolves to its own case, given
       the Playground's prefilled defaults" unit test — not by manual UI
       driving this time, since the story is identical to the documented
       Phase 7 precedent.
    2. `simplecdrs-list`'s generated `sc_calleridnum` fell back to the
       generic `"example"` placeholder (the probe's masked shape had no
       `digits` hint for that field) instead of the project's synthetic
       555-exchange convention, failing the existing NANP-555 guard
       test. Fixed to `"5550100"`.
  - `messages/en.json` / `messages/he.json`: `demoText` now also states
    "No credentials required" (Hebrew is a DRAFT translation, per the
    project's standing Hebrew-strings status).
  - `scripts/rollout-status.ts`: a new OpenAPI Demo coverage section
    (Phase 8B §12), writing a new `source-docs/OPENAPI_DEMO_STATUS.md`
    (52/66 read operations Demo-supported; the other 14 broken down by
    reason: global-key-only resource, not probed — e.g. `cdrs-list`'s
    possible side effect — or probed with no fixturable success data).
    Kept as a second file alongside the existing Proxy-only
    `ROLLOUT_STATUS.md` rather than merged into it, since that file's own
    header and `docs/CURRENT_STATUS.md` both describe it as "Proxy-only,
    generated" — a small, reversible choice, not asked separately.
- **Validation done:**
  - `npm run check`: 348/348 unit tests, typecheck, lint — all clean.
  - `npm run build`: clean, 576 pages (unchanged count).
  - Targeted Playwright (`-g "Open API"`, 30 tests, fresh build): 27
    passed, 3 failed on the parallel run — "the sidebar API select
    switches from Proxy to Open API" (chromium) and "a path-parameter
    endpoint documents its example placeholder and prefills it in the
    Playground" (chromium **and** mobile-safari). All 3 passed cleanly
    when rerun alone (2-worker run, same test file). This session did
    not touch the sidebar API-select or the "Try in Playground" link, so
    this is this project's already-documented pre-existing parallel-load
    flake class (Phase 5/Stage 3/Stage 4 history all describe the same
    "different single test fails each run, passes alone" pattern), not
    a regression from this work.
- **Not yet done — Stage 5's validation checklist is unfinished:**
  - The **full** Playwright suite has not been re-run fresh (only the
    `-g "Open API"` subset above).
  - No visual pass (desktop + mobile × en + he) over a sample of the 48
    new fixtures — rule 6 (Visual validation) requires driving the real
    UI, not trusting the unit tests alone.
  - No explicit no-network check for the new endpoints (the existing
    "no `**/api/playground` request for any OpenAPI Demo fixture" e2e
    test covers the *3 already-parametrized* endpoints in
    `smoke.spec.ts`'s `demoFixtures` list at ~L995 — it was not extended
    to iterate the new 48; confirm whether that's necessary, since the
    underlying `DemoProvider`/`executor.ts` code is unchanged and
    API-shape-agnostic).
  - No secret/PII scan of the diff has been run as an explicit step
    (informally reviewed while writing this handoff: every new value is
    a fabricated placeholder or the existing `TESTTENANT`/`5550100`/
    `SYNTHETIC_SECRET` conventions; no probe value, key, or real tenant
    appears).
  - `.diag-tmp.mjs` (untracked, predates this session — from the crashed
    session's own investigation of the "Try in Playground" issue on
    `extensions-get`) and this session's own throwaway
    `.diag-aia.mjs`/`.diag-params.mjs` are still sitting in the repo
    root, uncommitted and not covered by `.gitignore`. Given the flake
    finding above, `.diag-tmp.mjs`'s investigation may now be moot (the
    failure reproduces on chromium too and passes alone — looks like the
    parallel-flake class, not the WebKit-specific issue it was written
    to chase) — worth confirming, then deleting all three with the
    user's OK (terminal-safety rule).
  - The Stage 4/5 completion report (coverage numbers, files, tests, git
    status) has **not** been presented, and the Phase 8B approval gate
    has **not** been opened. Do not skip straight to it — finish the
    validation above first.
- **Environment:** a `next start` server from the Playwright run may still
  be bound to port 3000; check before starting another one.
- **Model:** this session ran Stage 4/5 on **Sonnet 5** (switched from
  Opus 5.5 after the plan-recovery/scope-confirmation step, per the
  project's routing rule — routine fixture and validation work). Stay on
  Sonnet 5 for the remaining Stage 5 validation.
- **First action next session:** `git status` (expect the same dirty
  state as this entry describes, `.diag-*.mjs` files included, unless the
  user asked for a cleanup), `git log -2`, then read
  `C:\Users\ivgi-pc\.claude\plans\compiled-spinning-hellman.md`, then
  finish the "Not yet done" validation list above before presenting the
  Stage 4/5 state to the user.

## (Superseded by the entry above) Phase 8B — Stage 3 DONE (2026-09-26, Opus 5.5); STOP, Stage 4 not started

- Branch `phase/open-api`, Stage 3 commit on top of `6a42faa`. Not pushed.
- **Done:**
  - `withObserved` is wired into
    `src/app/[locale]/reference/[api]/[endpoint]/page.tsx`, which passes
    the merged endpoint to `buildPanelData` and `EndpointView`. It runs
    server-side only.
  - `src/content/observed.ts` accuracy fixes, each checked against the
    masked probe file:
    - The generic-field sentence is now derived from the observed keys.
      The old fixed wording was wrong for Simple CDR (none), Extension
      (no `object`) and Phone Book Entry (no `name`).
    - The Extension State note no longer claims "registered" or "caller
      fields empty": `UniqueID`/`LinkedID` were non-empty.
    - The Phone Book note no longer claims "20 seconds"; the duration is
      not recorded.
    - `*meid` fields (media-file IDs such as `cr_pinenteredmeid`) are no
      longer masked as `SYNTHETIC_SECRET`.
  - New `tests/unit/observed.test.ts` (6 tests):
    - probed ids are documented GETs;
    - an observed 200 is added only when no 2xx is documented, and
      documented responses are kept;
    - every masked field path, nested ones included, is in the schema;
    - examples contain no probe markers and every secret-named field is
      `SYNTHETIC_SECRET`;
    - Proxy and unprobed endpoints are returned unchanged;
    - every cited OA-nn exists in DOCS_AUDIT.
  - `source-docs/DOCS_AUDIT.md` §14:
    - OA-14: general conventions;
    - OA-15: tenant errors CONFLICT;
    - OA-16: `object_not_found` undocumented;
    - OA-17: AI Logs 404;
    - OA-18: endpoint-specific findings, including Media File not
      returning `me_data` but returning undocumented
      `me_voiceapiusername`/`me_voiceapihost`.
  - `docs/SECURITY.md` "Phase 8B probe observations" (no label changes):
    - confirmed exposures: SEC-REQ-19 `pa_pin`, SEC-REQ-20
      `related.meetme.pin`/`adminpin`, SEC-REQ-22 `ds_pin`;
    - partly observed: SEC-REQ-26 (`ph_mac` yes, passwords not
      returned), SEC-REQ-15 (no `password`; `email` returned) and
      SEC-REQ-18;
    - still unresolved: SEC-REQ-03 (virtual extension only).
- **Validation:**
  - `npm run check`: 295/295.
  - `npm run build`: clean, 576 pages.
  - Throwaway Playwright pass against `next start` (fresh build): 8
    pages (7 OpenAPI plus 1 Proxy) at desktop and mobile in en, plus
    mobile he (all 8) and desktop he (1). 25 loads: zero console errors,
    no overflow, no probe markers rendered, and observed content present
    only on OpenAPI pages.
  - Screenshots checked.
  - Secret scan of the diff: clean.
  - Full Playwright suite: not run (8B gate item).
- **Discrepancy to resolve before Stage 4:** the approved 8B plan file
  `C:\Users\ivgi-pc\.claude\plans\linked-rolling-seal.md` was
  **overwritten** by the Stage 3 resume plan. The original Stage 4–5
  text is gone. What survives is "Stage 4 (fixtures)" and the fixture
  decisions in `docs/DECISIONS.md` "Phase 8B planning and probe
  decisions": Queue GETs replace AI Logs; error chips only where a
  success fixture exists. Stage 5's content is not recorded anywhere
  found. **Ask the user to confirm the Stage 4–5 scope before starting.**
- **Environment:** the port 3100 server is stopped and the port is free.
- **Model:** Stage 3 ran on Opus 5.5 at the user's choice. Stages 4–5
  route to **Sonnet 5**.
- **First action next session:** `git status`, `git log -2`, then ask
  the user for the Stage 4–5 scope (see the discrepancy above). Do not
  start Stage 4 without approval.

## (Superseded by the entry above) Phase 8B — STOP checkpoint (2026-09-26): Stages 1-2 done, Stage 3 just started

- Branch `phase/open-api`. Plan (approved):
  `C:\Users\ivgi-pc\.claude\plans\linked-rolling-seal.md` (Stages 1-5).
  Decisions: `docs/DECISIONS.md` "Phase 8B planning and probe decisions".
  Not pushed.
- **Stage 1 done** (`f833747`):
  - Request tab substitutes path values and shows the masked
    `X-API-Key` header.
  - "Simulate error" is shown only for the synthetic Sample API.
  - Two documented Demo cases were added: Extension State "Not
    registered", AI Analysis "One of two unique IDs unknown".
  - Isolation tests were added.
  - Validation: `npm run check` 289/289; targeted Playwright 31 passed
    (plus the fixed Request-tab test, 2/2).
- **Stage 2 done** (`e73e8c5`):
  - Masked, structure-only GET probe (57 calls, 7 error checks and a
    follow-up), stored in
    `source-docs/observed/openapi/probe-2026-09-26.masked.json`
    (verified to contain no key or tenant).
  - `cdrs-list` was not probed. The user did not answer whether to probe
    it; skipped because of a possible side effect.
  - **The TEST key the user shared in chat must be rotated.** This is an
    open action in `docs/SECURITY.md`.
- **Decisions after the probe** (`16731db`):
  - Tenant errors: record both the documented codes and the observed
    behavior (401 `invalid_api_key`).
  - Drop the AI Logs Demo fixture (the endpoint returns 404 on the test
    PBX) and use the Queue GETs instead.
  - Error chips only on endpoints that have a success fixture.
- **Stage 3 partial (uncommitted until this checkpoint):**
  - `src/content/observed.ts` is written but **not wired and not
    type-checked or tested**. It is a server-side accessor
    (`withObserved`, `observedOperationIds`) that turns the masked
    shapes into observed 200 responses (schema, synthetic placeholder
    example, `evidence: "observed-sanitized"`, `tested: true`) and
    per-endpoint observed notes. It follows the 8A examples.ts pattern
    so the client sidebar bundle doesn't ship the schemas. Its notes
    cite DOCS_AUDIT OA-15/16/17, which **do not exist yet**.
  - Still to do in Stage 3:
    - Wire `withObserved` into
      `src/app/[locale]/reference/[api]/[endpoint]/page.tsx` (pass the
      merged endpoint to `buildPanelData` and `EndpointView`).
    - Unit tests: probed ids gain an observed 200 when no documented 2xx
      exists; no secret-shaped example values; every masked field
      appears in the schema.
    - Write `source-docs/DOCS_AUDIT.md` §14 (OA-14.. findings).
      - General:
        - error envelope `{"error":{"code","message"}}` (401/403/404/400);
        - lists are top-level arrays with extra `id`/`name`;
        - gets add `id`/`name`/`object`/`related`;
        - most numerics are returned as strings;
        - no pagination (campaignnumbers returned 5251 rows).
      - OA-15: the tenant error mismatch.
      - OA-16: `object_not_found` is undocumented.
      - OA-17: ailogs returns 404.
      - Endpoint-specific:
        - extension list keys `id`/`number`/`name`/`tech`;
        - aianalysis all-miss returns `[]`;
        - Simple CDR no-match returns `[]`;
        - phonebookentries without a filter timed out;
        - tenantvariables returned empty.
    - `docs/SECURITY.md`: observations confirming SEC-REQ-19 (`pa_pin`),
      20 (meetme `pin`/`adminpin` on conference get), 22 (`ds_pin`),
      26 (`ph_mac`) and 15 (voicemail email). SEC-REQ-03 is still
      unresolved: the probed extension was VIRTUAL, so no SIP/PJSIP
      secret was observed.
    - Run `npm run check`, then commit, then **stop** (the user asked to
      do Stage 3 and stop).
- **Model:** the user kept Opus 5.5 for Stages 1-3. The plan routes
  Stages 3-5 to Sonnet 5.
- **First action next session:** `git status`, `git log -3`, then
  `npx tsc --noEmit` to check `src/content/observed.ts`, then continue
  the Stage 3 items above.

## (Superseded by the entry above) Phase 8A — APPROVED (2026-09-26 ~17:55, gate A: approve, save, continue to planning 8B)

- Branch `phase/open-api`. Approved on top of the two WIP checkpoints
  below (`634f58b`, then this session's alias/notes-audit checkpoint),
  plus one more fix made after approval was requested: every content-
  model text spot in `src/components/reference/endpoint-view.tsx`
  (notes, error/response/example descriptions, deprecation notes) now
  passes through `InlineMarkup` instead of being rendered raw — found
  by the user checking the official Campaign page's "Delete Campaign"
  example against the app and seeing literal backticks
  (e.g. `` `/campaign` ``) instead of inline code. `ParamList` already
  did this correctly; only `endpoint-view.tsx`'s other text was wrong.
  This is a shared component, so Proxy pages were affected too.
  Examples' collapsed-by-default display was reviewed and **kept as
  is** (user decision, not a defect).
- Full detail, all 6 alias/notes-audit fixes, and the new
  request-body-key coverage test: the superseded checkpoint entries
  below and `docs/DECISIONS.md` "Phase 8A — APPROVED".
- **Validation:** `npm run check` 285/285, `npm run build` clean (576
  pages) — both fresh after the `InlineMarkup` fix. Full Playwright
  (162 passed, 1 known flake confirmed to pass alone, 1 WebKit skip)
  and a 40-load visual/console-error pass across representative OpenAPI
  pages were run just before that fix; not re-run after it (narrow
  rendering-only change, no test depends on literal backtick text, user
  confirmed the render personally). Secret scan of the diff: clean.
- **Not merged into `main`, not tagged, not pushed.**
- **Next: Phase 8B — OpenAPI Demo** (`docs/phases/08B-openapi-demo.md`).
  Planning has not started. **Switch to Opus 5.5 before planning 8B**
  — the user asked to be prompted for this switch, and 8B's scope
  question (its spec asks for Demo coverage beyond the 3 GETs already
  decided — see `docs/DECISIONS.md` "Phase 8 pre-Stage-6 sub-phases
  inserted", "Scope note") is a Demo-architecture decision, not routine
  implementation.
- **First action next session:** confirm the model is Opus 5.5, then
  read `docs/phases/08B-openapi-demo.md` and enter plan mode.

## (Superseded by the entry above) Phase 8A — second STOP checkpoint (2026-09-26 ~17:45): WIP, not finished, not approved

- Branch `phase/open-api`. This session's work is committed as a WIP
  checkpoint on top of `634f58b`. Not pushed.
- **Done this session (Sonnet 5):**
  - Remaining raw-page sections audited against the app: Accepted
    Field Aliases, Destination Fields, path aliases, all 12 "Important
    Notes"/"Notes" sections, Simple CDR Template Variables, auth-token
    Supported Identities, dial Compatibility Notes, extension-state
    Response.
  - 6 content gaps fixed:
    - `mediafiles.ts`: `format` now maps to `me_format`.
    - `extensions.ts`: the full `EXT-*` destination alias table
      (`onnoanswer`, `onbusy`, ... were missing).
    - `ivrs.ts`: the `ivr_*` / `key_*` / `customivr_support` aliases.
    - `customdestinations.ts`: the bare `randomdestination` /
      `random_destination` aliases.
    - `paginggroups.ts`: path alias `/paginggroup`.
    - `reporting.ts`: the Simple CDR `start`/`end` rule "applied when
      neither `id` nor `uniqueid` is supplied".
  - New unit test in `tests/unit/openapi-coverage.test.ts`: every
    request-body key used by an official example is a modeled field, a
    documented alias, or a documented numbered template
    (`condition[N]`, `ivr_<n>`).
- **Validation:**
  - `npm run check`: 285/285.
  - `npm run build`: clean, 576 pages.
  - Full Playwright suite (fresh build): 162 passed, 1 WebKit skip,
    1 failure. The failure was the known "tenant and API key survive an
    endpoint switch" flake; it passed when re-run alone. The 8A CDR e2e
    test passed.
  - Throwaway visual pass: 10 OpenAPI pages × desktop/mobile × en/he,
    zero console errors, no overflow.
  - Secret scan of the diff: clean.
- **My earlier 8A gate report was premature. 8A is NOT finished.**
  The user checked the official Campaign page's "Delete Campaign"
  example against the app and found two open problems:
  - **(a) Examples are collapsed.** The example exists on
    `campaigns-delete` and its content matches, but every example
    renders as a collapsed `<details>`
    (`src/components/reference/endpoint-view.tsx` ~l.270), so only the
    title shows. Display mode is **undecided**: the user rejected my
    question (always expanded / expand when ≤3 / first expanded). Ask
    again. Do not pick one silently.
  - **(b) Literal backticks render as text.** Notes, error
    descriptions, example descriptions and response descriptions use
    `ContentText` instead of `InlineMarkup` (endpoint-view.tsx ~l.245,
    ~l.283, ~l.322, ~l.336). Example: "Documented path aliases:
    \`/campaign\`." on campaigns-delete. This is a real, visible defect.
    Check first whether Proxy pages are affected too.
- **Model:** the 8A work ran on Sonnet 5, and the user switched to Opus
  5.5 at the stop. 8A routes to Sonnet.
- **Environment:** the dev server started this session was stopped, and
  port 3000 is free.
- **Exact next task:** resolve (a) with the user, then fix (a) and (b).
  Then re-run `npm run check`, `npm run build`, the Examples/Notes e2e
  checks and a visual pass, and present the 8A gate.
- **First action next session:** `git status`, `git log -2`, then ask
  the user the Examples display question.

## (Superseded by the entry above) Phase 8A — STOP checkpoint (2026-09-26): WIP, not finished, not approved

- Branch `phase/open-api`, WIP checkpoint commit on top of `1f4c0df`
  holding all 8A work so far. Not pushed.
- **History this session:** a first 8A pass fixed only 2 unmodeled list
  filters and was reported to the user as complete — **that report was
  wrong**. The user compared the official CDR page
  (manual.mirtapbx.com/books/api/page/cdr) with the app and said 8A is
  not finished. A systematic comparison against all 38 raw official
  snapshots (`source-docs/raw/mirta-openapi/*.md`) then found two
  systemic gaps, now addressed:
  1. **Named official examples (none were shown anywhere):** 326 curl
     examples on the official pages. User chose "structured + generated"
     (AskUserQuestion, this session). New `scripts/openapi-examples.mjs`
     generates `source-docs/openapi/examples.json`: 325 matched to an
     operation, 1 unmatched (the Overview's cross-resource auth example,
     expected); all 159/159 operations have at least 1 example.
     Real-looking values normalized via
     `scripts/openapi-examples-normalize.json` (CANISTRACCI -> TESTTENANT,
     CAN% -> TEST%, person names/emails -> Demo User, Kartoon Cars -> Demo
     Corp, 39055123456 -> 5550100 — matching Stage 2 precedent); every
     credential-shaped body key -> `SYNTHETIC_SECRET`. Accessor:
     `src/content/examples.ts` (`getEndpointExamples`) — deliberately
     not on `Endpoint`, so the client sidebar bundle does not ship them.
     New `EndpointExample` type in `src/content/types.ts`;
     `exampleEndpoint()` in `src/lib/code-samples.ts` renders each
     example through the existing `buildSample` (portal base URL,
     `X-API-Key: $OPENAPI_API_KEY`); server pre-render in
     `src/lib/endpoint-panel.ts` (`buildExamples`); new collapsible
     "Examples" section in `src/components/reference/endpoint-view.tsx`
     with a "Global key" badge where the source used a global key.
  2. **Response Fields tables not rendered:** CDR (30 fields) and Simple
     CDR (12) now have a 200 response carrying the field table
     (`type: "unknown"`, `required: "undocumented"`, no example) —
     applies the Stage 1 "vendor examples go under status 200" decision
     to field tables; the description states status, envelope and types
     are undocumented. `response-examples.tsx` now says "No example body
     documented. The response fields are listed under Responses."
     instead of the misleading "No response body." (new `schemaOnly`
     flag, new i18n key `noExampleSchemaOnly` in en + he).
  3. CDR `start`/`end`: added the missing second date-range rule
     (neither `id` nor `linkedid`).
  4. Kept from the first pass: `ResourceSpec.listFilters`
     (`src/content/openapi/shared.ts`), `phonebook_id` / `campaign_id`
     list filters.
- **Tests added** (`tests/unit/openapi-coverage.test.ts`, "OpenAPI
  Reference completeness (Phase 8A)"): example <-> operation mapping and
  159/159 coverage; total curl-heading count equals the raw pages;
  normalization/credential guard; **every query key used by an official
  example is a modeled query parameter**; rendered examples use the
  portal base URL and header credential; every field of every official
  "... Fields" table (CDR, Simple CDR, AI Analysis, AI Logs) appears in
  the 2xx schema. One e2e test added in `tests/e2e/smoke.spec.ts`
  ("CDR Reference shows the documented response fields and the official
  named examples (8A)") — **not yet run**.
- **Validation done:** `npm run check` 284/284, lint clean.
  `npm run build` clean (576 static pages) — ran before the
  `noExampleSchemaOnly` wording change; re-run. A throwaway Playwright
  pass against `next dev` (desktop 1440 + mobile 390, en + he) over
  cdrs-list, simplecdrs-list, extensions-create,
  customdestinations-update and a Proxy page: examples render
  (10/11/4/30), CDR shows 30 response anchors, zero console errors, no
  overflow, no `pbx.example.com` / CANISTRACCI / `key=` in rendered
  curl; Proxy unchanged (0 examples). Secret/PII scan of the diff: the
  only hits are the normalize map's source keys and the tests' ban
  lists — values already present in the committed public raw snapshots.
- **Validation NOT done / incomplete:** the full Playwright suite was
  **stopped at 80/164** by the user's stop request; the only failure
  so far was the known Phase 5 "tenant and API key survive an endpoint
  switch" chromium-desktop flake (same class as Stage 5; not re-run
  alone this time). The new 8A e2e test was not reached.
- **Not yet audited (possible remaining 8A gaps):** examples,
  response-field tables and query-parameter coverage were checked
  systematically; still to compare against the raw pages: "Endpoint
  Patterns" tables; "Accepted Field Aliases" / "Destination Fields"
  field by field (are all body fields and aliases modeled? — a test
  comparing example body keys against `requestBody`, like the
  query-key test, would answer this); Simple CDR "Template Variables"
  (currently a notes line); auth-token "Supported Identities"; dial
  "Compatibility Notes"; extension-state "Response"; "Important Notes"
  on each page.
- **Environment:** the dev server (was :3000) and the orphaned e2e
  `next start` were both stopped; port 3000 is free. Chrome tabs opened
  on localhost pages are dead until a server is restarted.
- **Model:** the user switched to Opus 5.5 mid-8A and said "continue";
  project routing puts 8A on Sonnet 5 (user override, deliberate).
  Confirm with the user which model to use next session.
- **Exact next task:** finish the 8A audit (the remaining sections
  above), re-run `npm run build` and the full Playwright suite fresh,
  then present the 8A STOP-gate report (coverage numbers, files, tests,
  git status) and wait for approval before 8B. Record the
  examples/normalization decision in `docs/DECISIONS.md` at the gate.
- **First action next session:** `git status`, `git log -3`, then
  `npx vitest run tests/unit/openapi-coverage.test.ts` (expect 22/22),
  then continue the section-by-section comparison.

## (Superseded by the entry above) Phase 8 — pre-Stage-6 sub-phases 8A–8D inserted (2026-09-26); 8A next, on SONNET

A manual product review found Phase 8 was not actually
feature-complete before the existing Stage 6 review: the OpenAPI API
Reference did not expose all information available in the approved
baseline, and the OpenAPI Demo and Playground were missing/incomplete.

Four sub-phases were inserted between Stage 5 (below) and the existing
Stage 6, each with its own STOP/approval gate, specified in
`docs/phases/08A-openapi-api-reference-completeness.md`,
`08B-openapi-demo.md`, `08C-openapi-playground.md`,
`08D-pre-stage6-readiness-gate.md`, and ordered/routed in
`docs/phases/08-substages-README.md`:

1. **8A — OpenAPI API Reference completeness** (Sonnet 5) — next.
2. **8B — OpenAPI Demo** (Sonnet 5) — after 8A is approved.
3. **8C — OpenAPI Playground** (Sonnet 5) — after 8B is approved.
4. **8D — Pre-Stage-6 readiness gate** (Sonnet 5, deterministic
   validation) — after 8C is approved.
5. **Existing Stage 6 — cross-API consistency and security review**
   (Opus 5.5) — only after 8D passes.

This supersedes the "Phase 8 is feature-complete" status below and in
`docs/CURRENT_STATUS.md`. Stages 0–5 are unaffected and remain done;
nothing about them is reopened. Full detail:
`docs/DECISIONS.md` "Phase 8 pre-Stage-6 sub-phases inserted".

## (Superseded by the entry above) Phase 8 — Stage 5 DONE (2026-09-26); Stage 6 next, on OPUS (gate item)

- New e2e coverage in `tests/e2e/smoke.spec.ts` ("Open API rollout
  (Phase 8)"): API-select switching, a path-param endpoint (`OBJECT_ID`
  placeholder through both the code sample and the Playground field), a
  write staying Reference-only (Reference page + Playground), all 3
  Demo fixtures resolving, and 2 negative states
  (`format=csv`→Not simulated, `cdrs-list`→unavailable). `requestPanel`
  hoisted to shared scope for reuse across the Proxy and Open API
  describe blocks.
- **2 real issues found and fixed while writing this coverage, both
  test/content-only, not product bugs**: a fixture's own `basis` prose
  accidentally contained the literal string "Not simulated" (reworded);
  Playwright's WebKit driver doesn't fire `onChange` for a
  React-controlled `<select>` via `selectOption` (confirmed directly
  against plain WebKit vs Chromium) — that one test is skipped on
  `browserName === "webkit"` with the reasoning recorded inline. Full
  detail: `docs/DECISIONS.md` "Phase 8 Stage 5 complete".
- `source-docs/ROLLOUT_STATUS.md` (Proxy-only, generated) regenerated —
  was stale since Stage 0 closed U-17/opened U-18.
- Validation: `npm run check` 277/277, `npm run build` clean, full
  Playwright suite fresh 160/162 (1 WebKit skip, 1 pre-existing-class
  flake confirmed to pass alone), a visual pass at desktop/tablet/mobile
  × en/he over 8 representative pages (48 loads, zero console errors,
  no overflow), a secret scan of the full `main..HEAD` diff (clean).
- **Phase 8 is now feature-complete.** Only Stage 6 remains: the Opus
  cross-API consistency and security review — this is the Phase 8 gate
  item, followed by the Phase Completion Report and the A/B/C/D
  approval question. **Switch to Opus 5.5 before Stage 6.**

## (Superseded by the entry above) Phase 8 — Stage 4 DONE (2026-09-26); Stage 5 next, on Sonnet

- One new guide: "OpenAPI authentication and scope"
  (`src/content/guides/openapi-authentication.ts`, slug
  `openapi-authentication`), built only from
  `source-docs/openapi/_common.md`. Registered in
  `src/content/guides/index.ts`.
- **A real, pre-existing layout bug found and fixed**: the guide page's
  grid (`src/app/[locale]/guides/[slug]/page.tsx`) had no base column
  definition below `xl`, so a CSS grid's default `min-width: auto` let
  a long single content line stretch the whole mobile page instead of
  scrolling inside its own code block. The 3 existing Proxy guides
  never triggered it (their sample lines are shorter); this guide's
  OpenAPI base-URL sample did. Fixed with Tailwind's `grid-cols-1` base
  class. Also fixed in the new guide's own content: several
  slash-joined inline-code runs (no wrap opportunity) switched to
  comma-separated lists. Full detail: `docs/DECISIONS.md` "Phase 8
  Stage 4 complete".
- Validation: `npm run check` 277/277, `npm run build` clean, a
  Playwright pass over the new guide (desktop/mobile, en/he) — before/
  after the two fixes, confirming both were real and both are now
  resolved — plus a regression check of the 3 existing guides (mobile,
  unchanged). Full Playwright suite: 144/146 (2 chromium-desktop
  failures, both unrelated to this stage, reproduced the project's
  known parallel-load flake class and passed alone).
- **Next: Stage 5 on Sonnet** — full validation pass per the plan:
  `npm run check`, `npm run build`, the full Playwright suite (already
  clean above, but re-run fresh per the plan's own step), new e2e tests
  (API switcher, an OpenAPI page with a path param, a Reference-only
  write, the 3 Demo fixtures, a GET without a fixture), a visual pass
  at 3 viewports × 2 locales, and a secret scan of the diff.

## (Superseded by the entry above) Phase 8 — Stage 3 DONE (2026-09-26); Stage 4 next, on Sonnet

- Close-out (continuing from the STOP checkpoint below): `npm run
  check` 272/272, `npm run build` clean (546 endpoint pages).
- Playground validation (a throwaway Playwright script against a fresh
  `build && start`, not committed): all 3 Demo endpoints
  (`extensions-state-get`, `ailogs-list`, `aianalysis-get`) resolve
  their documented-example scenario at desktop 1440 + mobile 390, plus
  one Hebrew page (English scenario label in Hebrew chrome) — zero
  console errors, no overflow. 3 negative states confirmed: `ailogs-list
  format=csv` → "Not simulated"; `cdrs-list` → "Demo data not
  available"; `dial` (a write) → "Reference only", Send absent/disabled.
- `docs/ARCHITECTURE.md` "Demo fixture system" updated for the per-API
  merge; `docs/DECISIONS.md` "Phase 8 Stage 3 complete" has full detail.
  `docs/API_CONTENT_MODEL.md` and `docs/SECURITY.md` "Demo mode
  guarantees" were checked and need no change (already API-neutral).
- **Next: Stage 4 on Sonnet** — one guide, "OpenAPI authentication and
  scope", built only from `_common.md` (key kinds, `tenant`, `global=1`,
  errors, the Live-never-uses-global-keys rule). Update
  `docs/API_CONTENT_MODEL.md` if the guide content model needs it.

## (Superseded by the entry above) Phase 8 — STOP checkpoint (2026-09-26): Stage 3 in progress, WIP, NOT committed

- Branch `phase/open-api` @ `c353d4b` (Stage 2's final commit). Stage 3
  work is **uncommitted** on top of it (`git status`: `src/content/demo/
  index.ts` and `tests/unit/demo-fixtures.test.ts` modified,
  `src/content/demo/openapi.ts` untracked — nothing else).
- **Done:** `src/content/demo/openapi.ts` — 3 fixture sets
  (`extensions-state-get`, `ailogs-list`, `aianalysis-get`), one
  documented-example case each, values reused from the endpoints' own
  vendor examples (already synthetic per Stage 1/2). `src/content/demo/
  index.ts` merges `openapiDemoFixtures` into the registry.
  `tests/unit/demo-fixtures.test.ts` generalized per the plan ("the
  fixtures test iterates over every API"): `fixtureSetFor` now takes
  `(apiId, endpointId)`, `FIXTURE_ENDPOINTS` gained the 3 new
  `openapi/*` rows, the synthetic-value guard now scans
  `allFixtureSets` (Proxy + OpenAPI) and its phone-field list gained
  `ai_callerid`/`Extension`/`OtherParty`/`Connected Line ID`.
- **Validated so far:** `npm run check` — 272/272 (3 new exhaustiveness
  tests for the OpenAPI endpoints pass; the existing Proxy tests are
  unaffected).
- **Not yet done/verified this session:**
  - `npm run build` — started, not completed (session stopped mid-run,
    no output captured; treat as **not verified**, not as failing).
  - No Playground/Playwright pass on the 3 new Demo scenario chips yet
    (the Stage 5/6 precedent is to drive the real UI, not just trust
    the code — do this before calling Stage 3 done).
  - `docs/DECISIONS.md`, `docs/ARCHITECTURE.md` "Demo provider",
    `docs/API_CONTENT_MODEL.md` not yet updated for this stage.
  - No checkpoint commit — the user stopped the session before one was
    made; nothing here is safe to assume finished.
- **First action next session:** confirm branch/`HEAD` above and
  `git status` matches this description, then re-run `npm run build`
  and the Playground visual check for the 3 Demo endpoints before
  moving on.

## (Superseded by the entry above) Phase 8 — Stage 2 DONE (2026-09-26); Stage 3 next, on Sonnet

- All 34 remaining resources authored (159/159 operations total), in 5
  commits by category batch, each with `npm run check` green:
  Reporting + Auth Token; then config objects in batches of 6, 6, 6, 6,
  and a final batch of 5 (Tenant, Tenant Variable, User Profile, User,
  Voicemail). Every field, alias, error code, and security note is
  transcribed only from `source-docs/openapi/*.md` — no invented
  behavior.
- `tests/unit/openapi-coverage.test.ts`: `ROLLOUT_COMPLETE` flipped to
  `true`. Every inventory operation now resolves to exactly one
  endpoint; the coverage/consistency assertions (unique titles, header
  auth everywhere, no Live policy, no undocumented error status, no
  duplicate response status, code samples resolve every path param)
  all pass across the full 159-operation set.
- Global-key-only resources (`tenantScoped: false`, per SEC-REQ-28 §4):
  Tenant, User, User Profile, Routing Profile, Provider, Auth Token —
  none accepts a `tenant` parameter, matching the Overview's own list.
- Final validation: `npm run check` 269/269, `npm run build` clean (546
  endpoint pages: 109 Proxy + 159 OpenAPI × 2 locales, plus Sample), a
  Playwright console-error pass over 8 representative new pages
  (desktop 1440 + mobile 390, including nested-schema and object-field
  pages) — zero console errors. Full Playwright suite and the he-locale
  visual pass are deferred to Stage 5 per the plan.
- **Next: Stage 3 on Sonnet** — generalize the Demo fixture registry to
  merge fixture sets per API, then add fixtures for the 3 approved GETs
  (`extensions-state-get`, `ailogs-list`, `aianalysis-get`) in
  `src/content/demo/openapi.ts`, derived only from the documented
  vendor examples with synthetic values. Every other OpenAPI GET shows
  "Demo data not available"; writes stay Reference-only.

## (Superseded by the entry above) Phase 8 — Stage 1 DONE (2026-09-26); Stage 2 next, on Sonnet

- Close-out: `npm run check` 269/269 (lint covers `scripts/*.mjs`,
  verified), `npm run build` clean. No fixes needed after the WIP
  checkpoint, so the visual pass was not re-run.
- The user confirmed the per-resource sidebar (37 groups). Recorded
  together with the 159 count and the status-200 vendor-example
  convention in `docs/DECISIONS.md` "Phase 8 Stage 1 complete".
- **Next: Stage 2 on Sonnet 5.** Write the remaining 34 resources as
  `openapiResource()` descriptors, transcribed only from
  `source-docs/openapi/*.md`. Stage 2 has not started.

## (Superseded by the entry above) Phase 8 — STOP checkpoint (2026-09-26): Stage 1 mostly done, WIP commit, NOT final

- Branch `phase/open-api`. Stage 0 done (`4cd738f`). Stage 1 (Opus) work
  is saved in a WIP checkpoint commit on top of it, which is **not** a
  completed stage.
- **Done in Stage 1:**
  - Model: `Authentication.parameter` names a header (`X-API-Key`), and
    `ErrorSpec.status` accepts `"undocumented"` (`src/content/types.ts`).
  - `code-samples.ts`: named-header auth, and `authEnvVar` returns
    `<API>_API_KEY` whenever a parameter is named.
  - `endpoint-view.tsx`: auth-header note; undocumented error status
    shown as "—" with an sr-only label; inline markup in the summary and
    auth notes. This also fixes literal backticks on existing Proxy
    pages.
  - Sidebar API/version selects stacked. This fixes truncation, which
    also affected Proxy ("Proxy /").
  - "Open API (coming later)" removed from the sidebar and home. Home
    now links every non-synthetic API.
  - Proxy legacy note now points to the OpenAPI reference.
  - `src/content/openapi/` (`shared.ts` with `openapiAuth`, `tenantParam`,
    `globalParam`, `errors()`, `openapiOperation()`, `openapiResource()`;
    `extensions.ts`; `dial.ts`; `index.ts`), registered second in
    `src/content/index.ts`. Pilots: Extension (6 operations) plus
    Extension State, and Dial. That is 8 of 159 endpoints.
  - `source-docs/openapi/operations.json`, generated by
    `scripts/openapi-operations.mjs`: **159** operations, not 128
    (OA-13 in `DOCS_AUDIT.md`; the README now shows both counters).
  - `tests/unit/openapi-coverage.test.ts` (`ROLLOUT_COMPLETE = false`),
    plus new OpenAPI cases in `tests/unit/code-samples.test.ts`.
  - `docs/API_CONTENT_MODEL.md` updated.
- **Deviation from the plan (reversible, not asked):** sidebar categories
  are one per resource (37 groups, like Proxy's one per reqtype), not the
  planned ~9 domain groups. The domain order is kept in
  `openapi/index.ts`.
- **Validation:**
  - Before the final small edits: `npm run check` passed (269/269 unit
    tests, typecheck, lint); `npm run build` was clean (272 pages); a
    Playwright visual pass of 10 pages × desktop/mobile (en + one he)
    showed 0 console errors and 0 overflow, confirmed by screenshots.
  - **Not re-run after the last edits:** the `ov:18`/`SEC-REQ-28`
    citations removed from user-facing strings in `openapi/shared.ts`,
    the docs edits, and the new `scripts/openapi-operations.mjs`. The
    user interrupted the re-run, and whether ESLint covers `scripts/*.mjs`
    is unverified.
- **Remaining Stage 1 work:**
  1. Re-run `npm run check` and `npm run build`, and fix anything found.
  2. Update `docs/DECISIONS.md`: the per-resource category choice, the
     159 count, and the 200-placeholder convention for vendor examples.
  3. Update `docs/CURRENT_STATUS.md` and create the final Stage 1
     checkpoint commit.
  4. Tell the user to switch to **Sonnet** for Stage 2 (remaining 34
     resources via `openapiResource()` descriptors, transcribed only from
     `source-docs/openapi/*.md`).
- **First action next session:** confirm branch `phase/open-api` and a
  clean tree, then run `npm run check`.

## Phase 8 — Open API rollout: Stage 0 done, Stage 1 next (Opus) (superseded by the STOP checkpoint above)

- Plan: `C:\Users\ivgi-pc\.claude\plans\zany-fluttering-dewdrop.md`
  (Stages 0–6). Decisions: `docs/DECISIONS.md` "Phase 8 planning".
- Stage 0: `main` fast-forwarded `0cbd7ba`→`be23fb2`, tagged
  `v0.5-proxy-complete`, branch `phase/open-api` created. U-17 closed on
  the user's confirmation (base URL
  `https://pbx6webserver.1com.co.il/pbx/openapi.php`; nothing tested).
- Next: Stage 1 on Opus. It covers:
  - header-auth parameter support in `code-samples.ts` and a per-API env var;
  - `src/content/openapi/` (`shared.ts`, the `openapiResource()` helper, `index.ts`);
  - `source-docs/openapi/operations.json` and `tests/unit/openapi-coverage.test.ts`;
  - the pilots `extensions-state`, `extensions` and `dial`;
  - removing "Open API" from the `plannedApis` lists.
- Stages 2–5 run on Sonnet; Stage 6 (review) on Opus. No Live, no push.

## MiRTA OpenAPI documentation baseline — APPROVED (gate A)

- **Approved 2026-09-26, gate A** (approve, save, and continue to
  planning). Stage C checkpoint `f1c61a3`; approval recorded in its own
  commit on top. Branch `docs/openapi-baseline`, not merged, not pushed,
  not tagged. Next: Phase 8 (`docs/phases/08-open-api.md`) enters PLAN
  MODE; no implementation until that plan is separately approved.
- **Stage C done 2026-09-26 (Opus 5.5).**
- Second-pass audit (3 parallel read-only agents plus Opus verification
  of every reported item): 29/37 resource files clean; 8 resource files
  plus `_common.md` had 15 local defects, all fixed (1 wrong alias, 3
  invented descriptions, 5 omitted official notes, 6 count/citation/
  format/revision fixes). Index 38/38, snapshot
  hashes 38/38 match, 0 CONFLICT.
- Security review: rationale overstating evidence was corrected in SEC-REQ-14/20/26
  (no label change). User decisions: SEC-REQ-27 (no OpenAPI write in
  Live by default), SEC-REQ-28 (tenant isolation; no global key in Live),
  SEC-REQ-19 Paging Group → BLOCK LIVE, SEC-REQ-29 (Custom Destination)
  and SEC-REQ-30 (MOH `application`) new REVIEW REQUIRED. Full record:
  `docs/DECISIONS.md` "Stage C security review decisions",
  `source-docs/DOCS_AUDIT.md` §13.2.
- Validation: docs-only diff (`src tests messages scripts package*.json`
  untouched), SEC-REQ parity 03–30 both directions, labels consistent
  across files/README/resources.json, secret/PII scan clean, `npm run
  check` 250/250.
- **Next:** Phase 8 planning (plan mode). Do not implement anything,
  or select Demo/Live candidates, until the Phase 8 plan is approved.

## (Superseded by Stage C above) Stage B done, awaiting Stage C (Opus)

- **Task, not a numbered phase**: a docs-only baseline requested directly
  by the user (not part of the Phase 7/8 sequence), governed by the
  permanent rules in `docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md`. Full
  plan: `C:\Users\ivgi-pc\.claude\plans\keen-swinging-origami.md`.
- **Branch**: `docs/openapi-baseline`, created off `phase/proxy-rollout`
  @ `3612586` (Phase 7's approval commit). **Not merged, not pushed, no
  tag.** Working tree clean at `HEAD`.
- **Commits on this branch** (newest first):
  - `fade01f` — Stage B: all 37 resource docs + `SEC-REQ-05`..`26`.
  - `ebe3f5b` — official snapshots (38 pages), `_common.md` rebuilt,
    Extension/Extension State pilots, wrapper retired as a source.
  - `a3d8046` — Stage A scaffold checkpoint (superseded content, kept
    for history).
- **What exists now** (`source-docs/openapi/`):
  - `README.md` — coverage index, all 38 official pages accounted for
    (37 resources + Overview), generated from `resources.json`.
  - `_common.md` — base URL/spec URLs, auth (3 transports, 4 key kinds),
    `global=1` scope, CRUD conventions, full error-code table — all
    cited to `source-docs/raw/mirta-openapi/overview-and-examples.md`.
  - 37 per-resource files, one per official page, using the template in
    `docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md` §15.
  - `resources.json` — machine-readable mirror of the coverage index.
  - `source-docs/raw/mirta-openapi/` — all 38 official pages (HTML +
    Markdown export), fetched 2026-09-26, session-token redacted,
    hashes in `source-docs/raw/SOURCES.md`.
- **Coverage**: 38/38 official pages accounted for. 5 resources fully
  `DOCUMENTED` (Extension State, Dial, Auth Token, AI Analysis, AI Logs
  — each has a worked response example). The other 32 are `PARTIAL`:
  every field/method/alias is documented, but **no response schema
  exists on any official page for them** — deliberately left `UNKNOWN`
  rather than guessed. 0 `CONFLICT`, 0 unprocessed.
- **Authority decision** (`docs/DECISIONS.md`): official MiRTA pages/spec
  are authoritative for OpenAPI (unlike Proxy, where 1com's own docs
  outrank MiRTA — 1com publishes no OpenAPI docs). The former local
  wrapper `docs/mirta-openapi-claude-reference.md` was retired from the
  tree by the user (commit `a3d8046`); every distinctive claim in it was
  checked against the official pages before removal (only `global=yes`
  vs the official `global=1` was wrong); it survives only in Git history
  (`git show 5395552:docs/mirta-openapi-claude-reference.md`) and is
  **not cited as evidence anywhere** in the active docs.
- **Security**: 22 new `SEC-REQ-05`..`SEC-REQ-26` entries in
  `docs/SECURITY.md`, one per resource with a real finding (a
  create/update that writes a secret, or a response that exposes
  sensitive content). Three are categorical Live/Demo exclusions, not
  ordinary allowlist cases: Auth Token (mints login credentials), Dial
  (places a real call), DISA (a PIN that grants outbound dialing).
  Every `SEC-REQ-*` cited from a resource file is defined in
  `SECURITY.md` and vice versa (verified by diff).
- **Validation done this session**: all 38 pages cross-checked against
  the chapter index (no gaps/extras); every resource has a path and
  method set; `git diff --stat -- src tests messages scripts
  package*.json` is empty (zero application-code change); a secret/PII
  scan of the full diff and raw snapshots found nothing beyond the
  project's synthetic conventions (`pbx.example.com`, `TEST_API_KEY`,
  `TESTTENANT`, `555-01xx`, `example.com`); `npm run check` passes
  250/250. **Not run this session** (out of scope for docs-only work):
  `npm run build`, Playwright.
- **Explicitly NOT done yet** (reserved for Opus, per the plan's model
  routing — do not start on Sonnet):
  - the cross-resource security review (consistency of the `SEC-REQ`
    judgments, anything missed);
  - the second-pass documentation-quality audit
    (`docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md` §12);
  - the 24-item completion report (§14) and the STOP gate — completion
    is explicitly **not** approval, per the instructions' own rule.
- **Next session's first action**: confirm the model is Opus 5.5, then
  run the Stage C security/consistency review and the second-pass audit
  described above, then present the §14 completion report and wait —
  do not proceed to choosing Demo/Live candidates or any Phase 8
  implementation planning without a separate user go-ahead.
- **Carried, unrelated to this task**: the Stage 4 Proxy TEST API key is
  still not rotated (`docs/SECURITY.md` "Open action items"). Phase 7 is
  approved and sits below, unaffected by this branch.

## Phase 7 — Stages 0–7 done, APPROVED (gate A)

Approved 2026-09-26. Freshness checks re-run at approval time: `npm run
check` 250/250, `npm run build` clean (254 pages). Full Playwright/visual/
secret-scan validation below is from the Stage 7 remediation session and
was not re-run at approval time (no code changed since).

**Open action, explicitly not resolved by this approval**: the Stage 4
probe's TEST API key has been confirmed **not yet rotated**. This is a
live credential-hygiene gap, not a documentation gap — rotate it before
any further probing work reuses the same tenant/key. Tracked in
`docs/SECURITY.md` "Open action items".

- Approved plan: `C:\Users\ivgi-pc\.claude\plans\start-phase-7-swirling-boot.md`
  (Stages 0–7). Decisions: `docs/DECISIONS.md` "Phase 7 planning", "Phase
  7 Stage 1 checkpoint", "Phase 7 Stage 3 complete".
- `main` fast-forwarded to `0cbd7ba`, tagged `v0.4-demo-approved`. Work
  branch `phase/proxy-rollout`, not merged, not pushed.
- **Stage 1**: `source-docs/proxy-api/operations.json` (110 operations, 1
  excluded: `cdr-update`), `tests/unit/proxy-coverage.test.ts`,
  `scripts/rollout-status.ts` (`npm run rollout:status` →
  `source-docs/ROLLOUT_STATUS.md`; `tsx` added as devDependency). User
  decisions (`DECISIONS.md` "Phase 7 Stage 1 checkpoint"): unclear ops
  (`info-voicemail`, `voicemail-message`) are Reference-only, never
  probed, no Demo; one page per operation; sidebar grouped by reqtype;
  `cdr-update` excluded.
- **Stage 2** (Opus): `src/content/proxy-api.ts` split into
  `src/content/proxy/` (`shared.ts` with `proxyOperation()`/`q()`/`b()`
  and auth variants; one module per reqtype family). Model:
  `requestBodyEncoding`, `operationClass`, array-valued `requestExample`
  (`docs/API_CONTENT_MODEL.md`). Code samples cover POST
  form/multipart bodies and format-aware response reading. Write
  operations are Reference-only in the UI and in the executor. Three
  pilots: `dial`, `managedb-custom-add`, `info-recording`.
- **Stage 3 — Reference authoring, COMPLETE** (Sonnet, 6 commits by
  reqtype-family batch: INFO; call-control; extension/peer; queue/flow;
  VOICEMAIL/FAX/MEDIAFILE/PHONEBOOK/RESPONSEPATH/SMS/HELP; MANAGEDB).
  **All 109/109 non-excluded operations now have a Reference page**
  (`npm run rollout:status`: 0 broken links). `ROLLOUT_COMPLETE` flipped
  to `true` in `tests/unit/proxy-coverage.test.ts` — full coverage is now
  enforced, not just tracked.
  - **Two real bugs found and fixed while authoring, both now
    permanently guarded by coverage-test assertions** (`DECISIONS.md`
    "Phase 7 Stage 3 complete" has full detail): (1) two `ResponseSpec`
    entries at the same HTTP status (RESPONSEPATH-GETLAST's plain + xml
    samples, both 200) caused a React duplicate-key warning and made the
    xml sample unreachable in the status selector — the response viewer
    supports one example per status code; fixed by folding the xml
    variant into a note. (2) `info-extensions`/`managedb-extension-list`
    and `info-dids`/`managedb-did-list` shared an exact title — harmless
    in the content model but a real endpoint-picker UX ambiguity and an
    e2e-locator hazard (Playwright's default name match is substring);
    fixed by appending "(ManageDB)" to both ManageDB titles, plus a
    disambiguating regex on two pre-existing e2e locators.
  - Full validation: `npm run check` 209/209, `npm run build` clean (228
    pre-rendered paths), full Playwright suite **141/142 on two separate
    fresh `build && start` runs** — a different single test failed each
    time and passed cleanly in isolation (pre-existing test-infra
    flakiness under parallel workers, not a regression). The Phase 6
    dev-only 404-page quirk did **not** reproduce against either fresh
    build, confirming that prior finding was dev-server-only. Visual
    pass (desktop 1440 + iPhone 14, en + he) over a spread of new pages
    including `responsepath-getlast`, `managedb-mediafile-updatebinary`,
    `managedb-condition-replaceextendedinfos`: zero console errors, zero
    horizontal overflow.
- **Stage 4 — Probe the read operations, COMPLETE** (Opus 5.5 for the probe
  itself; Sonnet 5 for writing up the findings once the raw output was in
  hand, per model routing). 35 non-ManageDB read operations (all except the
  6 already characterised: EXTENSIONS, AGENTS, DIDS, SIMPLECDRS, QUEUELOGS,
  CDR GET) were probed once with a user-supplied TEST key/tenant, in-process
  env only, never written to disk — a follow-up probe on 6 ops used a
  longer timeout and explicit tenant handling. The probe script (session
  scratchpad, not committed) masked every value before printing and its own
  self-test (fake secrets in values, keys, error text, CSV, XML, an echoed
  URL, and a mixed-key map) found zero leaks before each real run. **The
  user was told to rotate the TEST key after this stage.**
  - Findings: `source-docs/DOCS_AUDIT.md` §12, A-56..A-77. Two are
    security-relevant: A-58 (INFO outdialed's json keys can be human-
    readable device labels, not just numeric ids) and **A-77 (VOICEMAIL
    list exposes a plaintext `imapuser`/`imappassword` pair per mailbox)**
    — tracked as new blocking requirement **SEC-REQ-02** in
    `docs/SECURITY.md`, alongside Phase 6's SEC-REQ-01 (QUEUELOGS).
  - All 32 operations with an observed response (not the 3 that timed out
    or returned truly nothing new) got their Reference response spec filled
    in (`src/content/proxy/{info,calls,extensions,queues,misc,voicemail}.ts`):
    `evidence: "observed-sanitized"`, `verification.tested = true`, full
    schemas from the probe's masked shapes, synthetic example values. Three
    operations that already had a vendor-presumed response (INFO
    recording/playrecording/mediafile-getaudio) kept that response and got
    the new "no id → error text" finding folded into a note instead of a
    second same-status response entry (the response viewer only supports
    one example per status code — same constraint as the Stage 3
    RESPONSEPATH-GETLAST fix). `info-call` alone stayed untouched
    (`tested: false`): both attempts timed out with no response at all.
  - **No Live allowlist change.** `src/server/playground/allowlist.ts` is
    untouched; nothing from this stage is newly callable in the Live
    Playground.
  - Validation: `npm run check` 209/209, `npm run build` clean (`npm run
    rollout:status`: 109/109 Reference pages, 0 broken links, endpoints
    tested 38/109), a Playwright visual pass over 10 of the newly-filled
    pages (desktop 1440 + mobile 390) — zero console errors, no overflow.
    Full Playwright suite and a locale (he) pass were **not** re-run this
    stage (content-only change to already-tested components); do before the
    Stage 7 gate if not done by then.
- **Stage 5 — Demo fixtures for the observed reads, COMPLETE** (Sonnet 5).
  User decision: `imapuser`/`imappassword` (VOICEMAIL list, A-77) stay in
  the documented schema but are fixed at `null` in every fixture — the same
  treatment QUEUELOGS gives its joined `ex_*` credential fields (A-55).
  - **Scope decision** (`src/content/demo/proxy.ts` header comment): only
    the 13 Stage 4 operations whose probe returned genuine multi-field data
    got a fixture set. The other ~19 (whose only observed behavior was a
    missing-parameter error string, a true empty/no-data result, or a
    timeout — A-59..A-61, A-64, A-67..A-69, A-74..A-76) get **no** fixture;
    the Playground falls back to "Demo data not available" for them, judged
    more honest than fixturing an error string as normal behavior. Not
    separately asked — flagged here as a reversible implementation choice,
    easy to revisit if more fixtures are wanted later.
  - New fixture sets (one case each, since none of these endpoints has a
    selectable `format` query parameter — info-queues is the only
    exception and gets two): `info-queues`, `info-queue`,
    `info-agentsconnected`, `info-agentsdelay`, `info-outdialed`,
    `info-config`, `info-balance`, `info-extstate`, `peers`, `blfs`,
    `flows`, `countpeers`, `voicemail-list`.
  - **Bug found and fixed during manual verification**: `info-extstate`'s
    case initially used `when: { ext: [""], ... }`, but its `ext` query
    parameter has a documented example value (`"500"`), which
    `use-playground.ts` pre-fills as the field's default — so the case
    could never match through the actual UI (only an explicitly cleared
    field would trigger it). Fixed to `ext: "*"`, matching how every other
    non-differentiating param here is treated. Found by driving the real
    Playground with Playwright, not by reading the code — this class of
    bug (a fixture matching what the probe sent, not what the UI's own
    defaults send) has no unit-test guard yet.
  - `tests/unit/demo-fixtures.test.ts`: the 13 new endpoints added to
    `FIXTURE_ENDPOINTS` (covered automatically by the existing
    exhaustiveness and synthetic-value guard tests) plus one new dedicated
    test asserting `imapuser`/`imappassword` are `null` in every
    `voicemail-list` case.
  - Validation: `npm run check` 223/223 (+14 tests), `npm run build` clean.
    A Playwright pass drove the real Playground for all 13 new endpoints
    (desktop) — each resolves its fixture (`status: 200`, a "Scenario:"
    line), zero console errors; a second pass on `voicemail-list` at mobile
    width (390) — zero console errors, no overflow. Full Playwright suite
    and the `he` locale were **not** re-run this stage; do before the Stage
    7 gate.
  - ManageDB and the two `unclear` operations (`info-voicemail`,
    `voicemail-message`) still have no Demo fixture, per the Stage 1
    decision — unaffected by this stage.
- **Stage 6 — Guides and Search, COMPLETE.** The guide-body content-model
  design was Opus (`src/content/guides/types.ts` + a generic
  `<GuideBody>` renderer, replacing the old hardcoded single-guide page —
  full detail in the Stage 6 commit and `docs/DECISIONS.md`); writing the
  3 Proxy guides' actual content and the rest of this stage was Sonnet.
  - **3 new guides** (`src/content/guides/{authentication,call-history,
    managedb-writes}.ts`), built only from documented/observed facts
    (`_common.md`, `info.md`, `managedb.md`, plus Stage 4's A-49/A-54/A-64
    findings): key kinds and the Admin-key rule, `tenant` scoping;
    CDRS vs SIMPLECDRS, `format` per operation, the 3 recording lookups'
    shared "no id" error; `jsondata` encoding, the Admin-key requirement,
    and destination tags. "Getting started" (Sample API) migrated into
    the new model unchanged, still prototype-labelled.
  - **Search**: `tests/unit/guides.test.ts` adds the Stage 6 index-count
    test (endpoints + guides) — passes as-is, so `getSearchIndex()`
    already covered every endpoint and guide with no code change needed.
    Also added: referential integrity for every guide (every `sample`/
    `endpoints` block resolves to a real endpoint of its own API, unique
    slugs/section ids, balanced inline-code backticks, non-synthetic
    guides cite sources).
  - **Two real, pre-existing Playwright bugs found and fixed** (both the
    same root cause, found via systematic debugging while chasing the
    Ctrl+K flake): `SearchPalette`'s and the mobile nav drawer's listeners
    are wired up in a `useEffect`, which only runs after hydration.
    `page.keyboard.press` and a locator `.click()` both retry/settle on
    their own action, but neither waits for *hydration* — a keystroke or
    click landing in that pre-hydration window is silently lost, with no
    further retry, so a single subsequent assertion times out. This is a
    strong candidate for the **actual root cause of the "a different
    single test fails each run under full-suite parallel load" pattern**
    dismissed as unavoidable flakiness across Phase 5 and Stage 3 (heavier
    CPU contention under parallel workers delays hydration enough to lose
    the input) — not confirmed for every one of those past occurrences,
    but both bugs found this session fit the pattern exactly, and the
    fixed suite ran clean 3/3 full runs afterward (142/142 each) where it
    had not run clean 3 times in a row before. Fixed by retrying the
    input itself (`expect(async () => {...}).toPass(...)`) instead of a
    single fire-and-forget attempt, in both tests.
  - **Dev-only 404 `<script>` warning** (`src/app/[locale]/layout.tsx`):
    attempted per your go-ahead; the "one-line `next/script` fix" the
    prior session predicted **did not work** — verified with a clean
    `.next` cache and a fresh dev server restart, the warning still
    fires. Root cause is deeper: Next's dev-mode not-found boundary does
    a client-side re-render of the root layout, and React's warning fires
    for *any* `<script>`-type element hit during a client render pass,
    regardless of whether it's a raw `<script>` or `next/script`. Your
    call: kept the `next/script` change anyway (verified harmless — zero
    console errors and correct theme resolution on every normal page
    tested) since it's arguably better practice, but the dev-only warning
    itself remains open, unresolved, non-blocking.
  - Validation: `npm run check` 245/245 (+15 over Stage 5), `npm run
    build` clean, a Playwright pass of all 3 new guides at desktop/mobile
    × en/he (12 combinations) — 200, zero console errors, no overflow,
    every reference link resolves. **Full Playwright suite run 3 times on
    a fresh `build && start` this stage: 142/142 clean every time**
    (previously the standing bar was "141/142, a different failure each
    run" — now clean, consistent with the hydration-race fixes above).
- **Stage 7 — review (Opus) and remediation (Sonnet), COMPLETE.** Findings
  and full detail: `docs/DECISIONS.md` "Phase 7 Stage 7 review", its
  interrupted-session amendment, and "Stage 7 remediation completion".
  Live boundary, write blocking, secrets and guide rendering all passed
  review. All 4 findings resolved (finding 3 turned out to be a review
  counting error, not a real bug — closed with no code change).
  1. **format=json samples**: 18 Proxy endpoints' `format` query parameter
     now has `example: "json"`, matching their JSON-primary documented
     response; a new `proxy-coverage.test.ts` guard enforces it going
     forward.
  2. **BLFS/FLOWS positional keys**: BLFS has 3 (`0`-`2`), FLOWS has 18
     (`0`-`17`), each mirroring its named field at that index — confirmed
     directly from the Stage 4 probe's raw default-line token count
     (`source-docs/DOCS_AUDIT.md` A-72/A-73), not just inferred from the
     JSON masker's collision bug. Applied to the content model, the Demo
     fixtures, and two new unit tests.
  3. Queue-stats field count: closed, not a real bug (the array already
     had the correct 23 entries; only 3 stray "24" mentions in prose were
     wrong).
  4. **Error-only responses**: exactly 13 operations' response descriptions
     rewritten to lead with "Success response not documented" instead of
     presenting an observed error/empty body as the normal result. Full
     list and the two operations deliberately excluded (`channel`, `help`
     — each returned genuine non-error data too):
     `source-docs/DOCS_AUDIT.md` §12.2.
  - **A real regression was also found and fixed this session**, not in
    the original review or remediation spec: finding 1's format=json fix
    silently flipped 3 endpoints' (`info-extensions`/`-agents`/`-dids`)
    Demo default resolution from their "plain" fixture case to their
    "JSON" one, which broke the "default resolves to plain" assumption in
    5 e2e tests (undetected by them due to a separate, now-fixed locator
    weakness — see `docs/DECISIONS.md` for the full mechanism). Fixed:
    labels/assertions corrected in `tests/e2e/smoke.spec.ts`; the two
    `info-simplecdrs`/`info-queuelogs` "unset-format default is Not
    simulated" tests were replaced with scenario-chip-switching tests,
    since that state is no longer reachable through the real Playground
    UI for either endpoint (their `format` `<select>`'s blank placeholder
    is `disabled`, and every reachable format value is now covered by a
    fixture).
  - **Final checks, all green**: `npm run check` (250/250 unit tests),
    `npm run build` clean, `npm run rollout:status` (109/109 Reference
    pages, 0 broken links, 18 Demo fixture sets), full Playwright suite
    (146 tests, both projects) run 3 times on a fresh `build && start` —
    clean twice, one unrelated test failed once under parallel load and
    passed deterministically alone (the known pre-existing
    "different-test-each-run-under-load" flakiness class, not this
    endpoint, not introduced this session). A manual visual/console-error
    pass (desktop 1440, tablet 1024, mobile 390 × en/he — 90 page loads)
    over the 13 relabeled Reference pages plus the BLFS/FLOWS Demo
    Playground pages: zero console errors, zero overflow, new text and
    positional keys spot-checked as actually rendering. Secret scan of
    the full `main..HEAD` diff and the working tree: clean.
  - This work was preserved in WIP checkpoint commit `7644136` before the
    gate decision (verified, not itself an approval — see its commit
    message). The approval below is recorded as its own commit on top.
  - **Approved 2026-09-26 (gate A: approve, save, and continue to
    planning the next phase)**. Not merged into `main`, not tagged, not
    pushed (none requested). Full decision record: `docs/DECISIONS.md`
    "Phase 7 approval". Carried-forward open items (none block the
    approval; none newly introduced by Phase 7 review/remediation):
    SEC-REQ-01 (QUEUELOGS) and SEC-REQ-02 (VOICEMAIL imap credentials)
    both stay blocking for Live; `info-call` remains untested
    (`tested: false`, both probe attempts timed out); ~19 read operations
    intentionally ship with no Demo fixture (error/empty/timeout-only
    observations); the residual "different single test fails once under
    parallel load" Playwright flake class; the dev-only 404 `<script>`
    React warning (confirmed prod-clean). **New open action**: the Stage
    4 probe's TEST API key is confirmed **not rotated** — see
    `docs/SECURITY.md` "Open action items".
  - Next phase has **not started** — no planning, research, or
    implementation. Waiting for its own plan to be presented and
    separately approved before any implementation begins.

## Phase 6 complete and approved (gate B) — Demo Playground, all 5 operations

- Branch `phase/demo-mode`, committed on top of `950e1d4`. **Not merged
  into `main`, not pushed, no tag** — none requested (matching Phase 5's
  own precedent, see `docs/CURRENT_STATUS.md`). The next phase (Phase 7 —
  Proxy API rollout) has **not started** and is waiting for a separate
  approval before planning begins (gate B: stop completely, don't plan
  ahead). Full decision record: `docs/DECISIONS.md` "Phase 6 (Demo Mode)
  approved, gate B". Supersedes the Stage B checkpoint below in full (all
  of its "not started yet" items are now done).
- Session recovery after a PC shutdown: the interrupted Playwright run's
  14 failures were test-only strict-mode locator collisions (scenario-chip
  text repeated elsewhere); 5 locators fixed in `tests/e2e/smoke.spec.ts`.
- Visual pass found a real bug: the Not-simulated and portal-error request
  lines overflowed on mobile (no `break-all`). Fixed in
  `response-viewer.tsx` (the portal-error one is Phase 5 code).
- `tests/unit/demo-fixtures.test.ts` added (resolver, exhaustiveness,
  shape and synthetic-value guards).
- **QUEUELOGS added** (user-supplied record; user decisions: full 156-key
  shape with every `ex_*` null; observed cases only):
  - Evidence: `source-docs/observed/info-queuelogs.json` (real values
    redacted; key "0" inferred from a truncated paste). Audit: A-50 updated,
    A-55 added.
  - Content: `infoQueuelogs` in `src/content/proxy-api.ts` (Queues,
    "List queue calls"). Fixtures: 3 cases in `src/content/demo/proxy.ts`.
    Unit and e2e tests added.
  - **SEC-REQ-01** (`docs/SECURITY.md`, pointer in Phase 7 file): blocking
    requirement before QUEUELOGS may ever go Live.
- Checks: `npm run check` clean (194); `npm run build` clean; full
  Playwright 127/134 (both projects, against the dev server).
- **Known issues, recorded not fixed** (`docs/CURRENT_STATUS.md` has the
  same note; both confirmed pre-existing via `git stash` back to
  `950e1d4`, neither introduced by this phase):
  - **6 failures** — "loads without console errors: /en/no-such-page"
    (desktop/tablet/mobile). Cause: a dev-only React warning, "Encountered
    a script tag while rendering React component" — almost certainly the
    inline theme-init script in `src/app/[locale]/layout.tsx:62` (`<script
    dangerouslySetInnerHTML={{__html: THEME_INIT_SCRIPT}}>`), surfaced via
    the not-found boundary. Confirmed dev-only: the same check against a
    production server (`npm run build && npm run start`, port 3001, this
    session) shows only the expected 404 network-error entry, nothing
    else. Not fixed here (Phase 5 layout code, out of Phase 6 scope) — a
    fix, if wanted, would replace the inline `<script>` with Next's
    `<Script>` component or move the theme-init logic out of the root
    layout.
  - **1 failure** — "search palette: keyboard shortcut opens it, Escape
    closes it" (chromium-desktop only). Unrelated to Demo Mode (global
    Ctrl+K search); confirmed pre-existing the same way; not investigated
    further.
- Phase 6 completion report was presented and approved (gate B) this
  session; this checkpoint **is** that save. Next session: read this file
  first, then wait for the user to request Phase 7 planning — do not start
  it unprompted.

## WIP checkpoint — Demo Playground for 5 Proxy operations, Stage B in progress

- Branch `phase/demo-mode` @ `0631a95` (fast-forwarded from
  `docs/proxy-api-rebuild`; see the superseded section below for that
  rebuild). Not merged, not pushed.
- **Supersedes** the "waiting for the 7 examples" checkpoint below: the
  user narrowed scope to **5** operations (not 7) and this is that work,
  already past the question stage:
  `INFO SIMPLECDRS`, `QUEUELOGS`, `EXTENSIONS`, `AGENTS`, `DIDS`.
- **Stage A (verification) — done, committed** (`e05cfcb`, `0631a95`):
  real-API structure-only verification of all 5 operations with a
  user-supplied TEST key/tenant (never written to disk or committed).
  Findings: `source-docs/DOCS_AUDIT.md` §11 (A-48..A-54). One correction
  to the doc rebuild itself: `info=EXTENSIONS`/`info=AGENTS` **are** in
  the 1com Doc (an earlier claim they were absent was wrong; fixed,
  `e05cfcb`). **QUEUELOGS has no observable data on the test tenant**
  (A-50) — every date range/queue tried returns an empty or 1-byte body.
  Its Demo build is blocked pending real data; the user chose to proceed
  with the other 4 operations meanwhile (recorded decision, not asked
  again this checkpoint).
- User decisions from Stage A's follow-up questions (also in
  `DOCS_AUDIT.md` §11.1): EXTENSIONS Demo mirrors the Live view's 6
  fields; DIDS Demo mirrors only the plain-format columns' `di_*` fields
  (no `te_*` tenant block, no credential fields); faithfully reproduce
  the 0-byte-empty-result quirk, the fixed auth-error text (Live only,
  not applicable to Demo), SIMPLECDRS's positional duplicate keys, and
  `plain`/`csv` formats where the structure is actually understood.
- **Stage B (Demo data + UI) — in progress, uncommitted.** Model: Sonnet 5
  (routine implementation, per `CLAUDE.md` routing — Stage A's credential
  handling was the Opus-requiring part, already done).
  **Working tree is dirty; nothing from this stage is committed yet.**
  - **Done**, per `npm run check` (typecheck + lint + 168/168 unit tests,
    including new/updated ones below) passing as of the last run this
    session:
    - `src/content/proxy-api.ts`: two new endpoints, `info-dids`
      (category `numbers`, new) and `info-simplecdrs` (category `cdr`,
      alongside the existing `cdr-get`) — Reference content only, not
      added to `LIVE_POLICIES` (`src/server/playground/allowlist.ts`
      untouched, per the user's explicit "no Live allowlist expansion").
      Also fixed stale citations left dangling by the earlier docs
      rebuild (`info.yaml`/`cdr.yaml` → the new `.md` files).
    - `source-docs/DOCS_AUDIT.md`: A-54 added (SIMPLECDRS's default/plain
      format is malformed and only partially decoded from the masked
      probe — deliberately **not** simulated in Demo; `json`/`csv` are).
    - New module `src/content/demo/` (`types.ts`, `resolve.ts`,
      `proxy.ts`, `index.ts`): the fixture-set/case model, the
      first-match-wins resolver, and synthetic fixture data for 4
      operations (`info-extensions`, `info-agents`, `info-dids`,
      `info-simplecdrs` — **not** `info-queuelogs`, blocked per above).
      All values fabricated: tenant `EXAMPLE`, phone numbers in the
      fictional `555-01xx` range, names prefixed "Demo".
    - `src/components/playground/executor.ts`: `demoProvider` now checks
      for a fixture set first (via the new `getDemoFixtures`/
      `resolveDemoCase`), falls back to the existing `api.synthetic`
      Sample-API behavior, then `unavailable`. `PlaygroundResponse`'s
      DEMO variants gained `format`/`contentType`/`request` (always) and
      `caseLabel`/`basis` (when a fixture resolved). New
      `{ source: "DEMO", notSimulated: true, request }` variant for an
      input combination no case covers.
    - `src/components/playground/response-viewer.tsx`: handles
      `notSimulated` (a dedicated callout); the Request tab is now
      available for Demo too (reuses the same `RequestTab`, generalized
      to take a bare `request`, with a "not sent" note); a "Scenario:
      &lt;label&gt; · &lt;basis&gt;" line shows under the status bar
      when a fixture resolved.
    - `src/components/playground/request-builder.tsx` +
      `playground-app.tsx`: a scenario-chip row when the endpoint has
      fixtures (clicking one fills the preset query values); "Simulate
      error" is now hidden whenever fixtures exist (unchanged for the
      Sample API, which has none); the Demo note text is fixture-aware.
    - `messages/en.json` + `messages/he.json`: `scenarios`, `scenario`,
      `demoFixtureNote`, `notSimulatedTitle`, `notSimulatedBody`,
      `demoRequestNotSent` (Hebrew stays DRAFT, per the standing
      decision, but is filled in, not omitted).
    - `tests/unit/executor.test.ts`: updated the old "reports unavailable
      for a non-synthetic API" test to use `cdr-get` (which genuinely has
      no fixture set) instead of `info-extensions` (which now resolves a
      case) — that old assertion would otherwise now be wrong, not just
      stale. Added tests for fixture resolution and `notSimulated`.
  - **Not started yet**:
    - `tests/unit/demo-fixtures.test.ts` (the resolver's own unit tests,
      the exhaustiveness check — every case's `when` covers every query
      param — schema-conformance check, and the synthetic-value guard
      scanning for `demo`-as-tenant / anything from `source-docs/observed/`
      / phone numbers outside `555-01xx`). This was the very next step
      when the session was stopped.
    - Playwright coverage for Demo mode (the new "Demo mode (Phase 6)"
      block from the original plan): success + scenario chips + Not
      simulated + no-network-request assertion + mobile + en/he, for the
      4 operations that have fixtures.
    - `npm run build` has not been run this session with the new code.
    - No manual/visual browser pass yet.
    - Docs updates from the original plan's Step 7
      (`docs/ARCHITECTURE.md` "Demo provider", `docs/SECURITY.md` "Demo
      mode guarantees", `docs/API_CONTENT_MODEL.md`, `docs/DECISIONS.md`)
      have **not** been done yet — this handoff and `DOCS_AUDIT.md` are
      the only docs touched so far this stage.
    - QUEUELOGS itself: still needs real data from the user, then its own
      structure-only verification pass (same method as the other 4),
      then its content entry + fixture set + inclusion in Playwright.
- **No git checkpoint commit exists for Stage B** — the working tree is
  dirty with exactly the files listed above (`git status --short`
  confirms nothing unrelated is mixed in) and was left uncommitted
  because `npm run check` had passed but the broader validation
  (Playwright, build, visual pass, docs) had not, so this isn't yet a
  safe/complete point to describe as "done" in a commit message.
- Next session's first action: continue Stage B exactly where it left
  off — write `tests/unit/demo-fixtures.test.ts`, then the Playwright
  block, then `npm run build`, then the visual pass, then the docs
  updates, then decide with the user whether to present a Phase
  Completion Report for 4/5 operations now or wait for QUEUELOGS data
  first (the user was not asked this explicitly; both were left open in
  the last message to them before this checkpoint).

## Superseded — Proxy API documentation rebuild, "waiting for the 7 examples"

This section is historical: the user's next message narrowed scope to 5
operations (not the 7 named here) and this repo state has moved well past
it (see the WIP checkpoint above). Kept only for the rebuild's own record.

### STOP checkpoint — Proxy API documentation rebuild complete, waiting for the 7 examples

- Branch `docs/proxy-api-rebuild`, from `phase/demo-mode` @ `c802eb9`.
  Documentation-only; `src/` untouched. `phase/demo-mode` itself is
  untouched and paused (see the superseded section below).
- The user directed discarding the MiRTA-sourced audit as authoritative
  and rebuilding `source-docs/proxy-api/` from 1com's own documentation:
  the Site (`sites.google.com/1com.co.il/1com-api/בית`) + its linked
  Google Doc. Full decision record: `docs/DECISIONS.md` "Proxy API
  documentation baseline reset".
- **Done**: evidence snapshot (`source-docs/raw/1com-site.html` +
  `1com-site-extracted.txt` + `1com-doc.txt`, keys redacted, hashes in
  `SOURCES.md`); 29 new `source-docs/proxy-api/<reqtype>.md` files +
  `README.md` + `_common.md` + `cdr-standalone.md` (historical-only, see
  below); the 40 old `*.yaml` files and `inventory.json` removed via
  `git rm`; `DOCS_AUDIT.md` §10 (old-vs-new conflicts, ambiguities) and
  `unresolved.md` U-12–U-16 added; `docs/CURRENT_STATUS.md` and
  `docs/DECISIONS.md` updated.
- **This voids Phase 6's Step 1 probe and its 7 Demo example selections**
  — not decided differently, suspended. Phase 6's own branch
  (`phase/demo-mode`) and its broken probe script are left exactly as
  they were; nothing there needs fixing before the user re-supplies the 7
  examples.
- **Not done / deferred, per the user's explicit scope**: re-mapping the 3
  already-implemented Live endpoints (`info-extensions`, `info-agents`,
  `cdr-get`) against the new source (their `proxy-api.ts` comments still
  cite the now-removed `info.yaml`/`cdr.yaml`/`_common.yaml` — stale, not
  fixed, reported as a finding); deciding U-12–U-16 (base URL, tenant
  placeholder, `format` conflict, CDR/EXTENSIONS/AGENTS documentation
  gaps).
- Next session's first action: the user provides the 7 Demo Playground
  examples again; map each against `source-docs/proxy-api/*.md` before
  any implementation. Do not resume Phase 6's old scope from memory.

## Earlier IN-PROGRESS checkpoint — Phase 6 (Demo mode), Step 1 (superseded by the documentation reset above; kept for history)

- Plan (approved 2026-09-25):
  `C:\Users\ivgi-pc\.claude\plans\start-phase-06-harmonic-cherny.md`.
- Branch `phase/demo-mode`, from `main` @ `b37e51c`. The user
  fast-forward merged `phase/live-playground` into `main` before this phase
  started.
- Scope: Demo covers 7 operations — the 3 existing ones plus INFO DIDS,
  SIMPLECDRS, EXTSTATE and QUEUELOGS. The 4 new ones get Reference + Demo
  only and are **not** Live. Demo behavior is driven by inputs and uses
  observed behavior only; anything else shows "Not simulated". No error
  scenarios are invented. Fixtures are new and synthetic. Full detail:
  `docs/DECISIONS.md` "Phase 6 planning".
- Step 1: `info.yaml` has no response samples for the 4 new operations, so
  their structure comes from a structure-only probe. The script lives in the
  session scratchpad and is not committed. The user runs it in their own
  terminal with `PROXY_PROBE_KEY` set and pastes the output, so the key
  never enters chat. Results go to `source-docs/DOCS_AUDIT.md` §9
  (A-44..A-47).
- Model: the probe runs on Opus. Steps 2–7 run on Sonnet 5, with a short
  Opus Demo-isolation review before the gate.

### STOP checkpoint — 2026-09-25, user-requested stop during Step 1

- **Done**: Step 0 (the branch; status and decision docs). The probe script
  was written and self-tested with fake data (no leaks).
- **Partial probe run** (user's terminal, a real tenant that is *not*
  `demo`; its name is deliberately not recorded anywhere). EXTSTATE only;
  the pasted output ends after csv:
  - `format=json`: `application/json`, 55 B, a record
    `{UniqueID: 2 letters, LinkedID: text ≤64}`.
  - Default and `plain`: `text/html`, a 2-byte whitespace-only body.
  - `csv`: 0 bytes.
  - `ext` was passed in the `<n>-<tenant>` form; the source example uses a
    bare number.
  - Not yet recorded in `DOCS_AUDIT.md`, because the run is incomplete.
- **Blocker: the probe script is BROKEN.** A python heredoc edit turned
  the `\r\n` escapes in the whitespace-body regex into literal newlines, so
  `node --check` now fails with a SyntaxError. Because a parse error runs
  nothing, no network call is made, but the script is unusable.
  - File: session scratchpad
    `...\7bce4a1f-...\scratchpad\probe-info.mjs`, plus the leak test
    `probe-selftest.mjs`. Both are outside the repo.
  - If a new session can't access that scratchpad, rewrite the script from
    the approved plan (Step 1).
- **Pending script improvements** (partially applied, unverified):
  - text `shape` mask (letters → `a`, digits → `9`);
  - short all-caps alpha values printed;
  - whitespace-only bodies shown as a `\r\n` mask;
  - an extra EXTSTATE call using the bare ext number;
  - secrets scrubbed longest-first.
- **Next task**: finish Step 1 (the probe), then Steps 2–7 of the plan.
- **First action for the next session**:
  1. Repair `probe-info.mjs` with the Edit tool, not python heredocs.
  2. Run `node --check`.
  3. Run `node probe-selftest.mjs`, then grep its output for the fake
     secrets; a match means a leak.
  4. Ask the user to re-run the full script in their own terminal and paste
     all of the output, through the final "Done." line.


## Earlier STOP checkpoint (historical; the "unmerged" statements below are superseded)

## STOP checkpoint — Phase 5 adjustment round 2 (3 UX fixes) approved and complete; next phase not started

Approved 2026-09-25, gate option B (approve, save, and stop). Committed on
top of `f20c899` (see `git log` for the commit hash). Not merged into
`main`, not tagged (no suggested milestone tag for a pre-merge adjustment
round, consistent with round 1). Phase 6 (Demo mode) has not started: no
planning, research, or implementation. Next session's first action is to
wait for the user to say to begin Phase 6 planning, or to approve merging
`phase/live-playground` into `main`.

**Working-tree changes (`git status`), all task-related, nothing unrelated
mixed in:**
- `src/components/playground/use-playground.ts` — Task 1: tenant + API key
  now survive switching Live endpoints (a `sharedFieldsRef`, in-memory
  only, restores the shared `tenant` field at both places that used to
  reset it). Endpoint-specific fields still reset normally.
- `src/components/json/json-viewer.tsx`, `src/components/playground/
  response-viewer.tsx` — Task 2 (sticky response toolbar) **plus a
  same-session bugfix**: the first attempt used CSS `position: sticky`
  relative to `response-viewer.tsx`'s shared scroll container, and the
  user reported real JSON content rendering behind/inside the toolbar. Root
  cause and fix are written up in `docs/DECISIONS.md` "Phase 5 UX fixes" —
  short version: replaced sticky positioning with a self-contained flex
  column (non-sticky `shrink-0` header + its own `flex-1 overflow-y-auto`
  content div, `data-testid="json-toolbar"` / `"json-content"`), so overlap
  is structurally impossible rather than CSS-tuned away. Also carries Task
  3 (a "cURL" label added next to the existing "GET" label in the Request
  tab, in `response-viewer.tsx`).
- `tests/e2e/smoke.spec.ts` — new/updated Playwright coverage for all of
  the above, including a geometry assertion (`getBoundingClientRect`-based
  `noOverlap()` check) that the JSON content never renders above the
  toolbar's bottom edge, both at rest and mid-scroll.
- `docs/CURRENT_STATUS.md` — updated at this checkpoint to describe the
  true state below (its previous content, from before this round, said
  the adjustment was "complete, at re-approval gate"; that framing is
  superseded by this round's additional fixes and is no longer accurate).

**Validation status (this round, complete):**
- `npm run check` (typecheck + lint + 166/166 unit tests): clean.
- `npm run build`: clean.
- **Full Playwright suite re-run to completion on a fresh build**, via a
  temporary `playwright.tmp-3100.config.ts` (port 3100, `reuseExistingServer:
  false`; deleted again after the run — not committed). **108/108 passed**
  (Chromium + WebKit), including the sticky-toolbar geometry test
  post-restructure.
- **Manual/visual browser pass done** via a throwaway Playwright-library
  script (not committed) against the same fresh build on :3100, covering
  all three tasks:
  - Task 1 (tenant/key persist across endpoint switch): confirmed by
    screenshot at desktop 1440×900, tablet 1024, en **and** he (RTL).
  - Task 2 (no toolbar/content overlap while scrolling a 60-entry mock
    response): confirmed by screenshot before/after scroll at desktop and
    tablet, en and he — toolbar position unchanged, content scrolled
    underneath, RTL layout intact.
  - Task 3 (cURL label next to GET): confirmed present at every
    locale/viewport combination tested (desktop, tablet, mobile; en, he).
  - Zero console errors across all 8 locale/viewport combinations run
    (en/he × desktop/tablet/mobile, one combo run twice).
  - **Gap**: Task 1/2 were not captured on the mobile viewport (390×844)
    by this manual script — the mobile step-flow UI uses different
    selectors than the desktop grid and the script wasn't extended to
    cover them. This is not a new risk: the automated Playwright suite's
    own dedicated mobile test ("mobile: Live success is reachable through
    the step flow...") exercises the same shared `use-playground.ts` /
    `JsonViewer` code paths at 390×844 and passed; no mobile-only code
    path exists for Tasks 1/2. If a fully manual mobile screenshot pass is
    wanted before merge, it hasn't been done.
- Secret scan of this round's diff: clean (checked again after adding the
  validation script; no keys/tenants/tokens beyond the existing test
  fixture `not-a-real-key-e2e-only` / `FAKE_KEY`).

Do not merge into `main` and do not start Phase 6 without explicit
approval.

## STOP checkpoint — Phase 5 (original scope) approved and complete; next phase not started

- Phase 5 approved 2026-09-25 (gate option B). Not merged into `main`, not
  tagged (no suggested tag for this phase). Phase 6 (Demo mode) has not
  started: no planning, research or implementation.
- Rotate the key pasted into chat on 2026-09-25 if not already done.

### Gate-time details (kept for history)

- All plan steps are done, including the Opus security review and a real
  Live call (Step 5). The real call found A-40 (the documented response was
  wrong; json output carries credentials, 2FA params and PII), resolved by
  user decisions: `format` plain/json, a server-side JSON field allowlist,
  fail-closed redaction, docs rewritten from observation. See
  `docs/DECISIONS.md` "Phase 5 Step 5".
- The user pasted a production key (tenant `demo`) into the chat on
  2026-09-25 and it was used for verification. Recommended: rotate it. It is
  not written to any file in the repo or scratchpad.

## Earlier IN-PROGRESS checkpoint — Phase 5, Steps 0–4 (superseded)

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
