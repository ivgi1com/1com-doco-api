# Current Status

Current phase:
**Phase 4 — One Real Proxy API Endpoint: SUBSTANTIALLY COMPLETE, BLOCKED ON U-11** (implementation steps 1-5 and 7 of the approved plan done; step 6 nearly done; gate not yet presented — see SESSION_HANDOFF.md)

Current branch:
`phase/one-endpoint` (from `main` @ `658c423`, which includes the approved Phase 3)

Previous phase:
**Phase 3 — Proxy API Audit: COMPLETE AND APPROVED** (approved 2026-09-24, gate option A; committed `658c423`)

Previous phases:
- Phase 1: approved, tagged `v0.1-design-approved`, merged.
- Phase 2: approved 2026-09-24, tagged `v0.2-shell-approved` (`20597af`).

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
- **Two real, pre-existing bugs found and fixed** (invisible before
  because Sample API was always the only/default API): the reference
  sidebar's API/version switcher was hardcoded to the Sample API with a
  non-functional `<select>` (now reads the current API from the URL and
  actually navigates on change); the Playground page always used the
  first API regardless of the requested endpoint's own API. Also removed
  "Proxy API" from two remaining "coming later" lists (home page, sidebar).
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
  the getting-started guide, and the Playground in both Demo states.
  Zero console errors observed.
- Secrets scan: no real keys, tenant codes, or credentials introduced;
  code samples reference an env var, never an inline value.

## Blocked

**U-11 (response example) is still open.** The user was asked for one
sanitized real response to `reqtype=INFO&info=EXTENSIONS` (key, tenant
code, names, numbers, emails, IPs, MACs and any passwords/SIP secrets
redacted). Not received yet. `proxy-api.ts` ships with `responses: []`;
the page correctly shows "Not documented by the source" rather than a
fabricated example or schema. `docs/phases/04-one-endpoint.md` requires a
response example in its "Required page content" list, so **the Phase 4
completion gate has not been presented** — do not present a Phase
Completion Report or the A/B/C/D question until this is resolved (either
the response arrives, or the user explicitly agrees to reach the gate
without it).

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
**Phase 5 — Live Playground** (`docs/phases/05-live-playground.md`). Not
started; requires the Phase 4 gate to be resolved and approved first.

Resume: see `docs/SESSION_HANDOFF.md`.
