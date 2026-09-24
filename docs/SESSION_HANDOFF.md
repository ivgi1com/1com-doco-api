# Session Handoff

Last updated: 2026-09-24 (Phase 3 approved, option A; Phase 4 in planning)

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
