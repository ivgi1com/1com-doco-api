# Session Handoff

Last updated: 2026-09-24 ~23:40 (STOP checkpoint mid-Phase 4, step 3)

## STOP checkpoint — Phase 4 in progress (read this first)

- Branch `phase/one-endpoint` (off `main` @ `658c423`; `main` was fast-forwarded to
  the approved Phase 3 commit with user approval via the Phase 4 plan).
- The approved Phase 4 plan is at `C:\Users\ivgi-pc\.claude\plans\piped-meandering-stallman.md`
  (outside the repo). It covers steps 1–7, the user decisions (U-01/03/05/06/07/09/11) and the gate.
- User decisions for Phase 4 (not yet written to DECISIONS.md/unresolved.md; that is plan step 6):
  - endpoint `reqtype=INFO&info=EXTENSIONS`
  - host `https://pbx6webserver.1com.co.il/pbx/proxyapi.php`, fixed (note `/pbx/` vs vendor `/mirtapbx/`)
  - tenant key (read-only is sufficient)
  - `legacy` badge + OpenAPI note
  - English prose + untranslated banner
  - extend the neutral model
  - keep the Sample API; Proxy becomes the default API
  - response example = a user-supplied sanitized real sample (`evidence: observed-sanitized`, never replayed by Demo)
- Done:
  - step 1 (git)
  - step 2 (content model, on Opus): `src/content/types.ts` gains `Requirement`
    tri-state, `fixedQuery`, `methodBasis`, `Authentication.location/parameter/scope`,
    `ResponseSpec.format/evidence`, `errors: ErrorSpec[] | "undocumented"`, `notes`
  - `docs/API_CONTENT_MODEL.md` rewritten to match
  - minimal consumer fixes: `use-playground.ts` validates `required === true` only;
    `endpoint-view.tsx` guards `Array.isArray(errors)`
  - `npm run check` passed (tsc, lint, 27 unit tests) after step 2
  - committed as the checkpoint below
- Not started: steps 3–7. Step 3 was about to begin; only files were read. Specifics:
  - `src/content/proxy-api.ts` (new) and registering it first in `src/content/index.ts`
  - adapt `code-samples.ts`: query auth via env `PROXY_API_KEY`, `fixedQuery`
  - adapt `endpoint-view`, `request-panel`, `param-list`, `param-field`: tri-state required,
    fixedQuery path line, notes, legacy callout, method-inferred note, evidence label,
    empty/undocumented responses & errors
  - `reference/[api]/page.tsx`: the quickstart hardcodes Bearer + `/v1/call-records`
  - `playground/page.tsx`: derive the API from the `?endpoint=` param; it currently uses `apis[0]`
  - Demo: replay only when `api.synthetic`
  - i18n en/he keys
  - docs (step 6)
  - tests (step 7)
- Blocking input still outstanding: the user's sanitized real response for INFO EXTENSIONS
  (requested; must have SIP secrets/passwords redacted). Everything except the response
  section can be built without it.
- Model: Sonnet 5 for steps 3–7 (the user already switched). Opus for the final review if required.
- A `next dev` server started by Claude may still be running on port 3000 (background task);
  on Windows also check for an orphaned `start-server.js` child before starting another.
- Next session's first action: read the plan file, then start step 3 (`src/content/proxy-api.ts`).

## State

- Branch: `phase/proxy-api-audit` (off `main` @ `1980a72`). No remote, nothing pushed.
- `main` now includes the approved Phase 2 work (fast-forwarded this session).
  The tag `v0.2-shell-approved` on `20597af` already existed (created by the
  user) and was left as-is.
- **Phase 3 is APPROVED (2026-09-24, gate option A)** and committed on
  `phase/proxy-api-audit` (not merged to `main`; merging needs explicit approval).
- **Phase 4 is in PLANNING only.** No Phase 4 implementation until its plan is
  separately approved. No milestone tag was created for Phase 3 (the suggested
  tag list has no audit tag; `v0.3-proxy-prototype-approved` belongs to Phase 4).

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

## Exact next action for a new session

1. Read this file and `docs/CURRENT_STATUS.md`.
2. Continue Phase 4 planning (plan mode). Phase 4 needs decisions on U-01,
   U-04, U-06, U-07, U-09, U-11 first. U-07 (content model) is Opus-level
   architecture work.
3. Do not implement Phase 4 until its plan is explicitly approved.

## Open items (carried)

- SVG logo; Console link destination; Hebrew UI strings are DRAFT; Hebrew
  content scope (deferred to Phase 4); reference screenshots not committed.
- Phase 2 design-doc tensions (home card grid; 32px dense controls vs 40px
  touch rule).
- `use-playground.ts` / `theme.ts` storage-sync duplication (non-bug).
- impeccable update available; `PRODUCT.md` still out of scope.
- npm 12 blocked install scripts (`@parcel/watcher`, `@swc/core`,
  `unrs-resolver`), still not blocking.
