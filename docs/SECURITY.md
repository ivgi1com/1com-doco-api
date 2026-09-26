# Security Requirements

## Playground principles

Live and Demo modes must be strongly separated.

## Live Playground

Architecture:

Browser -> Developer Portal backend -> approved API infrastructure

The browser must not call production API infrastructure directly when that would expose credentials or weaken controls.

## Backend proxy requirements

The proxy must not accept arbitrary target URLs.

Define and enforce:
- allowed hosts
- allowed endpoints
- allowed methods
- request timeout
- response-size ceiling
- rate limit
- authentication/access policy
- sanitized error handling

## Credential policy

API keys and authorization values must never appear in:
- URLs
- analytics
- application logs
- error tracking
- telemetry
- request history

Credentials should remain session-scoped by default unless persistent storage is explicitly approved.

Any persistent credential storage requires a separate security decision.

## Demo mode guarantees

Demo mode:
- never contacts production APIs
- never requests a real API key
- never exposes real tenants
- never contains copied production records
- uses clearly synthetic data
- never silently replaces a Live failure with Demo output

## SSRF defense

The Live proxy must enforce destination allowlists and must not expose a general-purpose fetch endpoint.

Forbidden pattern:
`targetUrl=<arbitrary URL>`

## Logging

Sanitize:
- credentials
- auth headers
- cookies
- secrets
- sensitive payload fields

## Security review gate

Security review is mandatory before approving:
- credential handling
- Live proxying
- authentication
- session storage
- Demo/Live isolation
- production deployment

Use Opus 5.5 for the major security review.

## Implementation (Phase 5)

How the requirements above are met by `src/server/playground/` and
`src/app/api/playground/route.ts` — the only code path that may reach
production API infrastructure. See `docs/DECISIONS.md` "Phase 5 planning"
for why these choices were made.

- **Allowed hosts/endpoints/methods**: `allowlist.ts#LIVE_POLICIES`
  hard-codes exactly three targets (`proxy/info-extensions`,
  `proxy/info-agents`, `proxy/cdr-get`; all `GET`), each resolved from the
  content model and asserted against a fixed origin set at module load —
  not env-configurable, so no deployment config can widen it. A unit test
  pins the list to exactly these three.
- **Request timeout / response-size ceiling / rate limit**: `config.ts`
  reads env vars with a safe default and a hard ceiling neither can exceed
  (e.g. timeout defaults to 10 s, capped at 30 s regardless of the env
  value). Rate limiting is per-client (IP, only via an explicitly trusted
  header — `PLAYGROUND_TRUSTED_IP_HEADER`) in `rate-limit.ts`.
- **Authentication/access policy**: no portal login (U-08/decision log);
  the route instead enforces same-origin (`Origin` + `Sec-Fetch-Site` vs.
  `Host`), JSON-only content type, and a request-body size cap, ahead of
  rate limiting and validation, in that order (`route.ts`/`handler.ts`).
  A kill switch, `PLAYGROUND_LIVE_ENABLED`, defaults to off.
- **Sanitized error handling**: `execute.ts` never surfaces a caught
  error's own message — only a fixed code — because Node's fetch errors
  can embed the request URL, which carries the credential. Redirects are
  never followed (`redirect: "manual"`); only four response headers are
  ever passed through.
- **Credential policy**: the credential travels from the browser to
  `/api/playground` only in the JSON POST body (`src/components/playground/
  executor.ts`), never in a URL, query string, or header; it is not
  persisted beyond `sessionStorage` (Phase 2 decision, unchanged). The
  portal forwards it to 1com only as the documented `key` query parameter —
  the only place the vendor documents it going — a known, accepted
  limitation: it may appear in 1com's own access logs, outside this
  portal's control. `log.ts`'s entry type has no field for the credential,
  tenant, or URL, so none can be logged by construction, not just by
  discipline. Verified by unit tests that assert a specific fake
  credential/tenant never appear in any response body, log line, or
  thrown-error string across every failure path (timeout, oversize,
  redirect, network error, rate limit).
- **SSRF defense**: there is no caller-supplied target URL of any kind —
  `endpoint` selects one of the fixed allowlist entries by id; the upstream
  URL is built only from that entry's own origin/path/fixedQuery
  (`execute.ts#buildUpstreamUrl`), which also re-asserts the resulting URL
  didn't resolve outside the allowlisted origin/path before use.
- **Demo/Live isolation**: `src/components/playground/executor.ts` defines
  `liveProvider` and `demoProvider` as separate objects with no shared
  fallback path; a Live failure always renders as a Live failure
  (`kind: "portal-error"`), never Demo data.

## Security review — Phase 5 (2026-09-25, Opus 5.5)

Manual review of `main...phase/live-playground` (the `security-review`
skill needs an `origin` remote, which this repo does not have). No high or
medium findings. Fixed:

- **Low — misleading credential copy**: the API-key help text said "Never
  stored"; the key is kept in `sessionStorage` (Phase 2 design). Text now
  says exactly that (en/he).
- **Low (latent) — dev fetch logging**: Next's dev fetch logger prints
  outbound URLs when `logging.fetches` is enabled (and, untruncated, on its
  cache-warning path); the upstream URL carries the key. Not enabled today.
  Guarded by a comment in `next.config.ts` and a unit test that fails if
  `fetches` appears there.
- **Low — unhandled body-read error**: a client aborting mid-body threw out
  of the handler (generic 500, no leak). Now fails closed with
  `invalid_request`; unit-tested.

Accepted / open (not code defects in this phase):

- **No Content-Security-Policy.** The key lives in `sessionStorage`, so any
  future XSS could read it. Current HTML sinks (`dangerouslySetInnerHTML`)
  render only server-generated shiki output from static content and the
  constant theme script; upstream response data is rendered as text only.
  A CSP belongs to the deployment/security-policy decision (needs user
  approval per `CLAUDE.md` §11).
- **Shared rate-limit bucket** when `PLAYGROUND_TRUSTED_IP_HEADER` is unset:
  one caller can exhaust Live for everyone (availability, not
  confidentiality). Resolve at deployment by setting the trusted header.
- **Origin check compares against `Host`**: a reverse proxy that rewrites
  `Host` will make legitimate requests fail closed (403). Deployment
  concern.
- **Credential in the upstream URL** (1com access logs): accepted in
  planning; see "Implementation (Phase 5)".

### Response sanitization (added after A-40, 2026-09-25)

Pipeline in `handler.ts`, applied to every upstream body before it leaves
the server:

1. `projectJsonFields` keeps only the target's JSON field allowlist
   (`allowlist.ts#LIVE_POLICIES[...].jsonFields`). Any JSON shape other than
   array-of-objects or object-of-objects is withheld entirely.
2. `redactSensitive` replaces credential-like values
   (`pass|pwd|secret|token|2fa|otp|mfa|pin`) in JSON keys, XML
   elements/attributes and delimited-text columns. It fails closed on
   misaligned rows, quoted CSV, and sensitive XML elements containing
   markup.

The browser is told how many values were redacted and how many fields were
dropped (`redactedCount`, `fieldsOmitted`) and says so in the UI.
`sizeBytes` is the upstream size, before sanitization. Verified against the
real host: JSON returns exactly the 6 allowlisted fields (142 dropped); no
non-empty password cell survives in plain output.

### Phase 5 adjustment — two more Live endpoints (2026-09-25, Opus 5.5)

Endpoints added by explicit user decision (`docs/DECISIONS.md` "Phase 5
adjustment"); evidence in `source-docs/DOCS_AUDIT.md` A-41..A-43. The rule is
unchanged: default deny, then an approved endpoint, then approved
parameters, then server-side validation, and only then forward.

- **Per-endpoint policy** (`allowlist.ts#LIVE_POLICIES`): JSON field
  allowlist plus optional **parameter patterns**, enforced in `validate.ts`
  after the generic limits (string, <=128 chars, no control chars) and enum
  checks. Patterns are asserted at load to be whole-value (`^...$`, no
  `m`/`g`/`y` flags) and to name only allowed params.
- **`proxy/info-agents`** (`reqtype=INFO, info=agents` fixed): params
  `tenant`, `queue` (`^\d+$`, optional), `format` (plain/json). JSON
  records are positional (numeric keys), so name-based redaction cannot
  match anything; the field allowlist (all 10 observed positions, user
  decision) is the effective control. Any new upstream position is dropped.
- **`proxy/cdr-get`** (`reqtype=CDR, action=GET, field=userfield` fixed):
  params `tenant`, `uniqueid` (`^([A-Za-z0-9_]+-)?\d+\.\d+$`). `field`
  cannot be set by the caller, so other CDR columns (caller/callee numbers)
  are unreachable; `action=UPDATE` is unreachable the same way. `format` is
  not offered (the body is the same whatever format is requested). The
  JSON field allowlist is empty: a JSON-record userfield is cut to empty
  records, and any other JSON shape is withheld.
- **Verified against the real host through the portal** (`tenant=demo`):
  expected bodies for both endpoints; a caller-set `field` and a malformed
  `queue` rejected with 400; `agent-listqueues` rejected with 403; the
  server log contains only the fixed telemetry fields (no key, tenant,
  queue, uniqueid or URL).

Accepted (user decisions, 2026-09-25):

- **CDR userfield is shown raw.** It is free-form data written by the
  tenant's own integration; the portal cannot know its content and does not
  filter single-line text. Rendered as text only (React-escaped), never HTML.
- **info-agents positions 4-8** were empty on the test tenant and their
  meaning is undocumented; allowed by user decision.
- **uniqueid enumeration**: a caller with a valid key could try uniqueids
  to read userfields. It needs that tenant's key and is subject to the rate
  limit; the upstream is authoritative for access.
- **Tenant scoping is upstream's**: the portal does not check that `tenant`
  belongs to the key (unchanged from U-08).

## Blocking requirements for future Live enablement

Each item here blocks one operation from the Live allowlist
(`src/server/playground/allowlist.ts#LIVE_POLICIES`) until it passes
validation. Demo mode is unaffected by these requirements: its data is
synthetic by construction.

### SEC-REQ-01 — QUEUELOGS response field allowlist (BLOCKING, open)

Recorded 2026-09-25 by user direction. Evidence: `source-docs/DOCS_AUDIT.md`
A-50, A-55.

Every `INFO QUEUELOGS` record embeds the answering agent's full extension row
(`ex_*`, 147 fields). That row includes passwords, tokens, 2FA data, lock
PINs, email addresses and other private extension data. Each value is also
repeated under a bare numeric key (`"0"`..`"155"`). Name-based redaction
cannot match those keys.

QUEUELOGS stays **disabled for Live** until all of the following are
implemented and validated:

1. A strict server-side, per-item response field allowlist for QUEUELOGS in
   `LIVE_POLICIES`.
2. Sensitive `ex_*` fields are removed: passwords, tokens, 2FA data, lock
   PINs, email where inappropriate, and other private extension data.
3. The numeric/positional duplicate keys are removed as well, so the same
   values cannot leak under an index.
4. Default deny: any QUEUELOGS response field not explicitly approved is
   dropped, including fields the upstream adds later.
5. Tests prove that sensitive values cannot reach the browser. At minimum:
   a unit test on the sanitizer with a record whose `ex_*` credential fields
   and their positional twins are populated, and an end-to-end test through
   `/api/playground` asserting none of them appear in the response.

Closing this requirement needs an Opus security review (`CLAUDE.md` model
routing), and the user's explicit approval to add QUEUELOGS to Live.

### SEC-REQ-02 — VOICEMAIL list response field allowlist (BLOCKING, open)

Recorded 2026-09-26 by Phase 7 Stage 4 probe. Evidence:
`source-docs/DOCS_AUDIT.md` A-77.

`INFO VOICEMAIL list`'s `format=json` response includes a plaintext IMAP
credential pair (`imapuser`, `imappassword`) per mailbox, alongside personal
fields (`fullname`, `email`), among roughly 60 fields total. Every value
observed for the credential fields in the probe was `null`; a populated
mailbox's actual behavior is not confirmed.

VOICEMAIL list stays **disabled for Live** (it is not on `LIVE_POLICIES`
today) until all of the following are implemented and validated, if it is
ever proposed for Live:

1. A strict server-side, per-item response field allowlist for this
   operation, matching the EXTENSIONS/QUEUELOGS pattern.
2. `imapuser`, `imappassword`, and any other credential-shaped field found
   on closer review (e.g. `serveremail`) are removed.
3. Default deny: any field not explicitly approved is dropped.
4. Tests prove the credential fields cannot reach the browser, including a
   case where they are populated (not just the all-null case observed so
   far).

Closing this requirement needs an Opus security review and the user's
explicit approval to add this operation to Live. Demo mode is unaffected
(synthetic data only), but Stage 5 must still decide, with the user, how to
represent `imapuser`/`imappassword` in the documented schema/fixtures — see
the QUEUELOGS precedent (SEC-REQ-01, A-55): keep the fields in the schema,
fixed at `null`.

### SEC-REQ-03 — OpenAPI Extension responses (BLOCKING for Live, open)

Recorded 2026-09-26 during the MiRTA OpenAPI documentation baseline. This is documentation only; OpenAPI has no Live support. Evidence: `source-docs/openapi/extensions.md`, `source-docs/raw/mirta-openapi/extension.md`.

**Why it is blocking:**
- `GET /extensions/{id}` and `GET /extensions/number/{n}` return the extension "and include related technology data" (`extension.md:42`).
- The technology rows (`sipfriends`, `ps_auths`, …) are where the extension's secret is stored: `password` maps to "technology secret/password" (`extension.md:15`).
- No response schema is documented, so the exact fields are unknown.
- The list response is described only as "ID, number, name, and technology".
- `ex_email` is PII.

**Before any Live exposure of an Extension read:**
1. A server-side, per-operation response field allowlist, default deny. It must cover nested technology objects and any numeric/positional duplicate keys (the SEC-REQ-01 lesson).
2. The response schema is established first, from the spec or an authorized read-only observation. An allowlist must not be designed against guessed fields.
3. Tests prove that technology secrets, passwords and email cannot reach the browser, including a case where they are populated.
4. Writes (create/update/cascading delete) stay out of Live, pending a separate security decision.

Closing needs an Opus security review and the user's explicit approval.

### SEC-REQ-04 — OpenAPI Extension State live caller data (REVIEW REQUIRED before Live, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/extensions-state.md`, `source-docs/raw/mirta-openapi/extension-state.md:27-55`.

**Why:** `GET /extensions/state` returns live call metadata: the other party's number and name (`Connected Line ID`, `Connected Line ID Name`, `OtherParty`, `Extension`) and channel IDs. This is customer PII. No credentials appear in the documented shape.

**Before any Live exposure:**
1. An allowlist of exactly the 8 documented keys. Nothing else is passed through.
2. Tenant-scoped keys only.
3. A decision on whether showing live caller numbers in the portal is acceptable.

Closing needs the user's explicit approval.

## Open action items

### Stage 4 TEST API key rotation (2026-09-26, not yet done)

The Phase 7 Stage 4 probe (35 read operations) used a user-supplied TEST
API key/tenant, in-process only, never written to disk. The user was
directed to rotate that key after the probe. Confirmed at the Phase 7
approval gate (2026-09-26): **rotation has not happened yet.**

This is a live credential-hygiene gap, not a code or documentation defect.
Rotate the key before that tenant/key pair is reused for any further
probing or verification work. Not itself blocking for Phase 7 approval
(no code or committed artifact depends on the key remaining valid), but
track it until closed.
