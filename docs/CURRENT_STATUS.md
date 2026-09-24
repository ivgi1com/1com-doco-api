# Current Status

Current phase:
**Phase 4 — One Real Proxy API Endpoint: COMPLETE AND APPROVED** (approved 2026-09-25, gate option B; all 7 steps of the approved plan done, U-11 resolved)

Current branch:
`phase/one-endpoint` (from `main` @ `658c423`, which includes the approved Phase 3)

Previous phase:
**Phase 3 — Proxy API Audit: COMPLETE AND APPROVED** (approved 2026-09-24, gate option A; committed `658c423`)

Previous phases:
- Phase 1: approved, tagged `v0.1-design-approved`, merged.
- Phase 2: approved 2026-09-24, tagged `v0.2-shell-approved` (`20597af`).
- Phase 3: approved 2026-09-24, no milestone tag (audit-only phase).
- Phase 4: approved 2026-09-25, tagged `v0.3-proxy-prototype-approved`.

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
**Phase 5 — Live Playground** (`docs/phases/05-live-playground.md`). Not
started; Phase 4 is approved (gate option B — stopped here, not
auto-continued). Per that phase's own model note, Opus 5.5 is required
before its security-sensitive proxy-boundary architecture is designed.

Resume: see `docs/SESSION_HANDOFF.md`.
