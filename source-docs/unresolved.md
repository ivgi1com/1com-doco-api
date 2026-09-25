# Unresolved Documentation Questions — Proxy API

Status: 11 items recorded in Phase 3 (2026-09-24). U-01, U-03, U-06, U-07,
U-09 and U-11 were decided in Phase 4 (2026-09-25); U-08 was decided in
Phase 5 planning (2026-09-25); U-02 and U-04 were applied by default (not
decided, reversible). U-05 was deferred in Phase 3. U-10 remains open.
Nothing below has been silently resolved: every normalized file and the
`proxy-api.ts` content keep `not_documented` / `"undocumented"` where these
apply. Finding IDs (`A-nn`) refer to `DOCS_AUDIT.md`.

Items marked **Blocks Phase 4** need a decision or input before the
one-endpoint vertical slice can be built truthfully.

---

## U-01 — 1com production host / base URL — Blocks Phase 4 (Live), Phase 5

- Source: every example (`https://pbx.example.com/mirtapbx/proxyapi.php`); A-34
- Ambiguity: the real host and path for 1com customers are not in the source.
- Why it matters: code samples, the Live proxy allowlist, and base-URL docs
  all need the real value. Sample URLs can't point customers at a
  placeholder.
- Options:
  1. 1com provides one fixed host
  2. there is a per-customer host, documented as `{your-pbx-host}`
  3. both (a default plus an override)
- Recommendation: none. This is a 1com deployment fact.
- User decision: **`https://pbx6webserver.1com.co.il/pbx/proxyapi.php` — fixed,
  never changes for proxyapi (2026-09-25).** Note: this differs from the
  vendor's own path (`/mirtapbx/proxyapi.php`); only the 1com path is used in
  the portal. Recorded in `proxy-api.ts` and `DOCS_AUDIT.md`.
- Final status: **decided**

## U-02 — Rights to reuse MiRTA's documentation text — Blocks publication

- Source: the entire page (vendor-authored); `raw/SOURCES.md`
- Ambiguity: whether 1com may republish, adapt, or paraphrase MiRTA PBX
  documentation on its own public portal.
- Why it matters: legal/licensing exposure. It also decides whether portal
  prose must be written from scratch rather than adapted.
- Options:
  1. 1com has a reseller/white-label agreement permitting reuse
  2. write original prose, using the vendor page only as factual evidence
  3. link to the vendor page instead of documenting
- Recommendation: (2) unless (1) is confirmed in writing. Facts such as
  parameter names aren't the issue; copied prose is.
- User decision: pending. Applied by default in Phase 4: `proxy-api.ts`
  prose is written from scratch; the vendor page is cited only as evidence
  (`source-docs/raw/`). Reversible if the user confirms otherwise.
- Final status: open (default applied)

## U-03 — How to label the legacy status in the portal

- Source: `bkmrk-overview`, `bkmrk-security-notes`; A-01
- Ambiguity: the vendor calls `proxyapi.php` legacy and recommends OpenAPI
  for new integrations. The user decided Proxy goes first (2026-09-24), but
  not how it is labelled.
- Why it matters: lifecycle badges and banners are part of the approved
  design (`legacy` state exists). Mislabeling either misleads customers or
  contradicts the vendor.
- Options:
  1. `legacy` badge + banner pointing to Open API (once it exists in the
     portal)
  2. `stable`, with no mention
  3. `stable` + a neutral note that a newer API exists
- Recommendation: (1), because it matches the source. Omitting a vendor
  statement would be a silent reinterpretation.
- User decision: **(1), legacy badge + note (2026-09-25).** The endpoint page
  shows the `legacy` lifecycle badge plus a callout stating the vendor
  recommends OpenAPI for new integrations. Implemented in `proxy-api.ts`
  (`status: "legacy"`, `deprecation.note`) and `endpoint-view.tsx`.
- Final status: **decided**

## U-04 — Error model — Blocks Phase 4 (error docs), Phase 5

- Source: absent everywhere; A-02
- Ambiguity: HTTP statuses, error body format, and error vocabulary are
  unknown.
- Why it matters: the Playground's error states and the reference "Errors"
  section can't be written without it. Inventing one violates the
  no-guessing rule.
- Options:
  1. observe real error responses in a controlled sandbox (Phase 4/5, via
     the approved proxy, sanitized)
  2. ask MiRTA
  3. publish "Errors: not documented" until verified
- Recommendation: (3) now, (1) when a sandbox route exists.
- User decision: pending. Applied by default in Phase 4: `proxy-api.ts` sets
  `errors: "undocumented"`; the reference page shows "Not documented by the
  source" rather than an invented error list. Revisit at Phase 5.
- Final status: open (default applied)

## U-05 — Hebrew content scope

- Source: `docs/DECISIONS.md` (deferred since Phase 1)
- Ambiguity: whether reference/guide prose is localized.
- Why it matters: it affects the content model (per-locale prose fields).
- Options: chrome only / chrome + guides / everything
- Recommendation: decide at the start of Phase 4, together with U-07.
- User decision: **deferred to Phase 4** (2026-09-24)
- Final status: deferred

## U-06 — Which endpoint for the Phase 4 vertical slice — Blocks Phase 4

- Source: `DOCS_AUDIT.md` §6
- Ambiguity: `docs/phases/04-one-endpoint.md` requires "one suitable real
  endpoint". The audit ranks candidates but can't choose for you.
- Why it matters: it defines Phase 4 scope, the Live allowlist entry, and
  Demo fixtures.
- Options:
  - INFO `info=EXTENSIONS`
  - INFO `info=EXTSTATE`
  - DND `action=get`
- Recommendation: INFO `info=EXTENSIONS`. It is read-only and
  tenant-scoped, and its 3 documented variants exercise the discriminator
  and optional parameters.
- User decision: **INFO `info=EXTENSIONS` (2026-09-25).** Implemented as
  `proxy-api.ts`'s `info-extensions` endpoint.
- Final status: **decided**

## U-07 — Content-model shape for reqtype-discriminated operations — Blocks Phase 4

- Source: `DOCS_AUDIT.md` §5; A-06, A-07
- Ambiguity: the Phase 2 `Endpoint` type assumes REST. How the non-REST
  shape should be modeled is an architecture decision (Opus-level per
  `CLAUDE.md` model routing).
- Why it matters: the model powers the docs, Playground forms, Demo
  fixtures, and search, and it has to stay reusable for Open API.
- Options:
  1. extend the API-neutral model (discriminator, body encoding, response
     format, tri-state required)
  2. synthetic REST-like paths
  3. a separate Proxy model
- Recommendation: (1).
- User decision: **(1), extend the API-neutral model (2026-09-25).**
  Implemented in `src/content/types.ts`: `fixedQuery`, `methodBasis`,
  `Authentication.location/parameter/scope`, tri-state `Requirement`,
  `ResponseSpec.format/evidence`, `errors: ErrorSpec[] | "undocumented"`,
  `notes`. Documented in `docs/API_CONTENT_MODEL.md`. The Sample API
  (REST-shaped) required no changes to its content, confirming the model
  stays API-neutral.
- Final status: **decided**

## U-08 — Live Playground allowlist scope — decide before Phase 5

- Source: A-06, A-29, A-30, A-31, A-39
- Ambiguity: which operations the Live proxy may ever forward, with which
  methods and parameters.
- Why it matters: this is the core security boundary (`CLAUDE.md` §7).
- Options:
  1. read-only, tenant-scoped operations only
  2. also low-impact writes (e.g. DND set)
  3. anything the user's key permits
- Recommendation: (1). Always block `callback`, free-form `filter`, and
  every A-31 operation.
- User decision (2026-09-25, Phase 5 planning): option 1, narrowed further —
  only `reqtype=INFO&info=EXTENSIONS` (the Phase 4 endpoint) is allowlisted,
  not "every read-only reqtype." Widening the allowlist to more reqtypes is
  a separate, later, explicit decision (Phase 7 scope). Params on this one
  target: `tenant`, `id`, `number` (the credential `key` travels separately,
  never as an overridable param). Enforced in `src/server/playground/
  allowlist.ts`, asserted against the content model at module load.
- Final status: **decided**

## U-09 — Key scopes vs "all reqtypes exposed" — Blocks Phase 4 (auth docs)

- Source: A-18, the common-parameters text, and admin-only-looking examples
  (MANAGEDB tenant/provider/route/user with no `tenant`, COUNTCALLS, INFO
  DIDS all tenants)
- Ambiguity: the user confirmed that 1com exposes every documented reqtype
  (2026-09-24). The source, however, says some operations need an
  administrator key, and it contradicts itself on which ones. It is unclear
  whether 1com customers receive admin keys or only tenant keys.
- Why it matters: documenting admin-only operations to tenant-key customers
  sets up guaranteed failures. Mislabeling key requirements is a security
  documentation error.
- Options:
  1. customers get tenant keys only; admin-only operations are documented
     as admin/1com-internal or omitted
  2. some customers get admin keys; mark the requirement per operation
  3. unknown until tested
- Recommendation: needs a 1com answer. Until then, mark per-operation key
  scope `not_documented`.
- User decision: **for INFO EXTENSIONS specifically: a tenant key, including
  a read-only one, is sufficient (2026-09-25).** This does not resolve the
  reqtype catalogue's admin-key contradiction (A-18) in general — only this
  one endpoint's requirement. Recorded in `proxy-api.ts`
  (`authentication.scope`).
- Final status: **decided for this endpoint; open for the rest of the
  catalogue**

## U-10 — How to document the 23 table-only reqtypes

- Source: A-04
- Ambiguity: the source gives only a one-line purpose, with no parameters or
  examples.
- Why it matters: it decides Phase 7 scope. There is nothing truthful to
  publish beyond the purpose line.
- Options:
  1. obtain parameter info from MiRTA/1com
  2. publish as "listed, not documented"
  3. omit until documented
- Recommendation: decide in Phase 7. It doesn't block Phase 4.
- User decision: pending
- Final status: open

## U-11 — Source of real response samples — Blocks Phase 4 (responses)

- Source: A-03
- Ambiguity: no JSON response sample exists anywhere. The Phase 4 endpoint's
  response schema can't be documented from the source alone.
- Why it matters: publishing an invented schema violates the no-guessing
  rule, and Demo fixtures must be "derived from verified schemas"
  (`CLAUDE.md` §7).
- Options:
  1. the user supplies a sanitized real response (no real customer data or
     keys)
  2. capture one through the Phase 5 proxy in a sandbox tenant
  3. publish the request side only until verified
- Recommendation: (1) for the single Phase 4 endpoint, sanitized by the
  user before sharing.
- User decision: **(1), user supplied a sanitized real response (2026-09-25).**
  Captured on a tenant the user described as "demo"; extension names were
  real individuals' names in the raw capture and were replaced with
  placeholders (`REDACTED_NAME_n`) before anything was written to disk —
  the key and tenant were already redacted by the user. Saved as evidence at
  `source-docs/observed/info-extensions.json`. The response shape is a JSON
  object keyed by each extension's `ex_id` (not an array) — itself an
  observed fact, not documented anywhere in the vendor source. Schema and
  example in `proxy-api.ts`'s `infoExtensionsResponse` are derived from this
  capture only; `evidence: "observed-sanitized"` ensures Demo mode never
  replays it.
- Final status: **decided**
- Superseded (2026-09-25, Phase 5, A-40): the U-11 sample (object keyed by
  `ex_id`, 3 fields) matches neither real format observed through the Live
  proxy. The reference docs are rewritten from the observed structure; the
  sample file is kept as history only.
