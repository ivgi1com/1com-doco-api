# Session Handoff

Last updated: 2026-09-26 (MiRTA OpenAPI documentation baseline — Stage B
[resource transcription] done, checkpoint committed, **not reviewed or
approved** — Stage C [security review] and the completion report are
next, on Opus — read this first)

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
