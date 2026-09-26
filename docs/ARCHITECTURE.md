# Architecture

## Target frontend stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- MDX
- OpenAPI-compatible internal data model

Exact versions are not hardcoded here. Use a current supported stable version at bootstrap time and record the actual choice in `docs/DECISIONS.md`.

## Main architectural boundaries

### Presentation layer

Reusable UI:
- portal shell
- sidebar/navigation
- search
- endpoint reference pages
- parameter tables
- code examples
- JSON response viewer
- guides
- feedback UI
- environment selector

### API content layer

Normalized endpoint metadata should be API-agnostic.

Example fields:
- api
- version
- category
- status
- method
- path
- title
- description
- authentication
- headers
- path parameters
- query parameters
- request body
- responses
- errors
- examples
- source URL
- verification state

### Execution layer

`ApiExecutor`
- `LiveProvider`
- `DemoProvider`

The UI consumes one execution contract.

### Live provider

Browser -> Developer Portal backend -> approved API infrastructure

Never allow arbitrary target URLs.

### Demo provider

Browser -> Developer Portal Demo provider -> synthetic fixture response

Demo provider must never call production systems.

### Implementation (Phase 5)

`src/components/playground/executor.ts` implements the contract above:
`liveProvider` and `demoProvider`, both satisfying `ApiExecutor.execute()`,
selected per-request by `use-playground.ts` with no fallback path between
them. `liveProvider` only ever calls this portal's own
`/api/playground` route (`src/lib/playground-protocol.ts` defines the
wire contract); it never calls an external host directly from the browser.
The backend side of the Live provider — the allowlist, validation,
timeout/size enforcement, and upstream call — lives in
`src/server/playground/` behind `src/app/api/playground/route.ts`; see
`docs/SECURITY.md` "Implementation (Phase 5)" for how each proxy
requirement is met there.

### Demo fixture system (Phase 6)

`demoProvider` (`executor.ts`) makes no network request. For an endpoint
with a fixture set, it resolves a scenario instead of falling back
straight to `unavailable`:

`src/content/demo/` defines the model (`types.ts`) and holds the fixture
data itself, one file per API (`proxy.ts`, `openapi.ts` — Phase 8 Stage 3).
`index.ts` merges every API's fixture sets into one `getDemoFixtures`
lookup, keyed by `${apiId}/${endpointId}`; `tests/unit/demo-fixtures.test.ts`
iterates the same merged list, so a new API's fixtures get the same
exhaustiveness/synthetic-value guards without any test-file changes beyond
adding its endpoints to `FIXTURE_ENDPOINTS`. A `DemoFixtureSet` attaches to
one non-synthetic endpoint (`ApiDefinition.synthetic === false`) without
touching that endpoint's own `responses` field — those stay vendor/observed
documentation and are never replayed. Every fixture value is
`evidence: "synthetic"` by construction: fabricated data that mirrors an
observed shape (real values never survive past the audit trail that
produced them — see `docs/SECURITY.md` "Demo mode guarantees").

A `DemoFixtureSet` is a list of `DemoCase`s, matched **in order**; the
first whose `when` matches every current query parameter wins. `when` must
cover every one of the endpoint's own query parameters — enforced by
`tests/unit/demo-fixtures.test.ts`'s exhaustiveness check — either `"*"`
(any value) or an explicit list of accepted values. **No match is not an
error**: the Playground shows "Not simulated" (`response-viewer.tsx`),
never a guessed response. This is the mechanism, not a per-endpoint
exception: `info-simplecdrs`'s default/plain format and `info-queuelogs`'s
answered-call records both resolve to "Not simulated" today simply because
no case's `when` covers them yet (A-54, A-50) — new evidence extends
coverage by adding a case, not by changing the resolver.

`getDemoFixtures(apiId, endpointId)` / `resolveDemoCase(set, query)`
(`resolve.ts`) are the only entry points `executor.ts` and the UI use;
callers never reach into `proxy.ts`'s fixture arrays directly. The UI
surfaces a resolved case's `label` as a scenario chip
(`request-builder.tsx`) and its `basis` on the response's "Scenario:" line
(`response-viewer.tsx`), citing the `DOCS_AUDIT.md` finding it reproduces.

## API-neutral design

The UI and content model must be reusable by both Proxy API and Open API.

## Documentation source strategy

Existing docs are imported into:
- source inventory
- normalized content model
- audit trail
- unresolved issues

Where an OpenAPI specification exists later, use it as structured input while preserving human-written guides separately.

## Data ownership

No database is required by default for the initial prototype unless a concrete feature requires one.

If persistence is introduced, document:
- purpose
- schema
- retention
- sensitive-data handling
- migration strategy
- rollback

before implementation.
