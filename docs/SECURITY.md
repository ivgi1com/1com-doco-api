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
- never sends a write operation anywhere; a simulated write (SEC-REQ-27, amended) is answered locally from documented examples only

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
  hard-codes exactly four targets (`proxy/info-extensions`,
  `proxy/info-agents`, `proxy/cdr-get`, and since Phase 9
  `openapi/simplecdrs-list`; all `GET`), each resolved from the content
  model and asserted against a fixed set of exact base URLs
  (`ALLOWED_BASES`) at module load — not env-configurable, so no
  deployment config can widen it. Unit tests pin the list.
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
  **Open API (Phase 9):** the key is forwarded only in the `X-API-Key`
  header (`execute.ts#buildUpstreamHeaders`), never in the upstream URL, so
  the Proxy API access-log limitation above does not apply to it. `key` is
  a reserved name that can never be caller-set as a query parameter.
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

- **No Content-Security-Policy.** (**Addressed in Phase 9, 2026-10-08: see
  "Phase 9 — Open API Live pilot" below.**) The key lives in `sessionStorage`, so any
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

## Phase 9 — Open API Live pilot (2026-10-08, Opus 5.5)

First Open API operation on the Live allowlist: `openapi/simplecdrs-list`
(`GET /simplecdrs`). Decisions are the user's (grilling session 2026-10-08;
`docs/phases/09-openapi-live-pilot.md`, `docs/DECISIONS.md` "Phase 9").

Controls (all in `src/server/playground/`, enforced server-side):

- **Credential transport**: `X-API-Key` header only; never in the upstream
  URL. Header-unsafe keys (anything outside visible ASCII) are rejected.
- **Base URL**: exact-match allowlist (`ALLOWED_BASES`), including
  `https://pbx6webserver.1com.co.il/pbx/openapi.php`; the target path is the
  base path plus the fixed endpoint path.
- **Output format**: JSON only. `format=json` is forced; `format`,
  `template` and `contenttype` are not caller-settable (template/XML output
  cannot be field-filtered). The Playground hides them in Live.
- **Response fields**: default-deny allowlist of the 12 observed fields
  (`sc_te_id`, `tenantcode`, `sc_start`, `sc_direction`, `sc_calleridnum`,
  `sc_calleridname`, `sc_dialednum`, `sc_disposition`, `sc_duration`,
  `sc_billsec`, `sc_uniqueid`, `sc_whoanswered`). Any other JSON shape is
  withheld. Upstream error answers are cut to `error.code` and
  `error.message`.
- **Filters**: `tenant` and the 13 documented filters, each with an
  anchored pattern; anything else is rejected before any upstream call.
- **Date range**: `end - start` at most **3 days** (user amendment
  2026-10-08), with the documented defaults for an omitted bound (today
  00:00:00 / 23:59:59); impossible dates and `end < start` are rejected;
  `range_too_wide` is returned before any upstream call.
- **Multi-tenant answers**: if the (projected) answer contains more than
  one distinct `tenantcode` (an admin/global key), the whole answer is
  blocked (`multi_tenant_blocked`); only the event is logged, no data.
- **Logging**: unchanged by construction (`log.ts` has no field for
  parameters, tenant, credential, URL or body). Verified by tests that fake
  call data never appears in any log line.
- **Content-Security-Policy** (`src/lib/security-headers.ts`, applied to
  every route by `next.config.ts`): `default-src 'self'`, `connect-src
  'self'`, `img-src 'self' data:`, `font-src 'self'`, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`; plus
  `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`. Development alone adds `'unsafe-eval'` and `ws:`.

Residual risks and limits (accepted):

- **The CSP is an exfiltration lock, not an injection block.** By user
  decision the pages stay statically pre-rendered, so `script-src` keeps
  `'unsafe-inline'` (the theme script and Next's bootstrap need it). Script
  injected by a future XSS could therefore still run and read the key from
  `sessionStorage`, but the page cannot send it to any other origin.
  Removing `'unsafe-inline'` needs per-request nonces and dynamic rendering
  of every page, a deployment-level change.
- **Caller PII is shown in full** to the key holder (decision above). The
  portal never logs or stores it; the browser tab shows it until closed.
- **`tenant` is required in practice**: a tenant key without it gets
  `401 invalid_api_key` (probe 2026-09-26).
- **Rate limit**: in-memory, per instance. Behind the production Apache the
  client IP arrives as the last `X-Forwarded-For` entry, appended by
  `mod_proxy`; set `PLAYGROUND_TRUSTED_IP_HEADER=x-forwarded-for`
  (`docs/DEPLOYMENT.md`). The port the app listens on must stay bound to
  `127.0.0.1`, otherwise a caller could forge the header.
- **TEST key handling**: the TEST key is for local testing only, never in
  production configuration, never committed. A TEST key was pasted into the
  chat session on 2026-10-08 so the real-PBX e2e could run; rotating it is
  recommended (the value is deliberately not recorded here).

Validation (2026-10-08): 474 unit tests; Chromium Playwright 118 passed
(zero CSP violations across en/he pages at 1440px and 390px); the env-gated
real-PBX spec (`tests/e2e/live-real.spec.ts`, 3 tests) passed against the
production PBX with a TEST key. WebKit (mobile-safari) was installed later
the same day (user OK) and its full project passed: 115 passed, 6 skipped.

## Security review — Phase 9 (2026-10-08, Opus 5.5)

`security-review` over `main...phase/openapi-live`. **No findings** at the
review's confidence threshold. Verified: the Open API base URL is fixed in
code and must exactly match `ALLOWED_BASES`, endpoint paths cannot contain
`{` or `..`, and the built URL is re-checked; only exactly-named documented
parameters are accepted (`KEY`, `Format`, `format[]`, `__proto__` are
rejected), and reserved/forced/excluded names cannot be set, so
`format=json` cannot be overridden; the key reaches the PBX only in the
`X-API-Key` header and only visible-ASCII keys are accepted (no header
injection); only fixed, read-only `GET` targets exist; the error-envelope
path keeps only string `code`/`message` and cannot carry records; other
response shapes are withheld; log lines carry no key, URL, filter or call
data; Live responses render as text (no `dangerouslySetInnerHTML`); the
production CSP keeps every fetch, image, font, form and frame same-origin.
Accepted and out of scope: `'unsafe-inline'` (see Phase 9 above).

Manual visual pass (2026-10-08, production build, Chrome desktop 1440px):
Playground `openapi/simplecdrs-list` in Demo and Live (Live hides
`format/template/contenttype`, shows the key field, request preview and
Send), Hebrew Reference page; no console errors. The browser window could
not be narrowed to phone width, so the 390px layout relies on the
Playwright checks.

## Phase 10 — Live for every read (2026-10-08, Opus 5.5)

User decision (2026-10-08, asked one question at a time): Live works for every
read operation of the Open API and the Proxy API, with **pass-through output
plus server-side redaction**, keeping categorical blocks. This replaces the
per-operation field-allowlist requirement of the SEC-REQ items below for
reads (see "Status after Phase 10" there).

Policy (`src/server/playground/allowlist.ts`):

- Live targets = every `GET` operation whose content-model class is `read`,
  plus the four strict pre-Phase-10 policies, minus the blocks. 85 targets
  (52 Open API, 33 Proxy). Unit-pinned in `tests/unit/live-endpoints.test.ts`;
  any change to the count is a security decision.
- Never Live: every write (POST/PATCH/DELETE and Proxy GET actions such as
  dial, hangup, reboot, sms, queue-add); operations not classified `read`;
  the Sample API; categorical blocks — Open API AI Analysis, AI Logs (call
  content, SEC-REQ-09/10), Dial (SEC-REQ-06), DISA (SEC-REQ-22); Proxy
  recordings, voicemail transcripts and audio (`info-recording`,
  `info-playrecording`, `info-inforecording`, `info-voicemailtranscript`,
  `mediafile-getaudio`: call content, user decision); Proxy `info-voicemail`
  and `voicemail-message` (inventory class "unclear", default deny). Auth
  Token is not in the portal at all (SEC-REQ-05). A misspelt block entry
  fails at load.
- Strict policies unchanged: `proxy/info-extensions`, `proxy/info-agents`,
  `proxy/cdr-get`, `openapi/simplecdrs-list` (field allowlist, 3-day range,
  multi-tenant block).
- Pass-through targets: the upstream body is returned as is, except
  `redact.ts`: credential-like names (password, pwd, secret, token, 2fa, otp,
  mfa, pin, api key) are replaced in JSON, XML and delimited text; text that
  names a secret but can't be aligned is withheld whole (fail closed); new in
  Phase 10, any other key in the same JSON record holding the same value as a
  redacted one (4+ characters) is redacted too, which covers positional
  `"0".."n"` duplicates (the SEC-REQ-01 lesson); and plain text whose
  secret can't be located by column (free text, or a `name|value` listing
  where a row names a secret) is withheld whole. Open API error envelopes are
  cut to `code` + `message`.
- Path parameters (26 Open API `get` operations): sent as `pathParams` in the
  POST body; exactly the documented names, each `^[A-Za-z0-9_.@+-]{1,64}$`,
  never `.`/`..`, percent-encoded into one segment; the built URL must equal
  the substituted template under the allowlisted base.
- Unchanged: fixed origins, GET only, header (`X-API-Key`) or query (`key`)
  credential per API, key only in the same-origin POST body, Origin check,
  10 requests/minute/client, 10 s timeout, 1 MB cap, sanitized logs (no
  params, path values, bodies or keys), kill switch `PLAYGROUND_LIVE_ENABLED`.

Residual risk accepted by the user:

- Redaction is name-based. A secret under an unrecognized field name (or a
  positional key without a named twin in the same record) is shown. The
  response goes only to the key holder, who could fetch the same data with
  the same key directly; the portal does not store or log it.
- No tenant-isolation check on pass-through targets (SEC-REQ-28): a key that
  sees several tenants gets all of them, as it would directly.
- Personal data (caller IDs, names, e-mail, phone-book entries) is shown to
  the key holder unfiltered.

## Phase 11 — key found in a real answer, redaction extended (2026-10-09, Opus 5.5)

The real-PBX check (Phase 11 step 1) found the caller's key in
`openapi/queues-list`: a queue's webhook URL (`qu_notifyabandonedurl`) holds a
Proxy API URL with `key=<key>` (DOCS_AUDIT OA-19). User decision: two new
rules in `redact.ts`, for every Live target:

- The credential the caller sent is replaced wherever it appears in the
  body (plain, URL-encoded, JSON-escaped), whatever the field is called.
- In any `http(s)://` URL inside the body (JSON string values, XML and
  plain text, also with PHP-escaped `\/`), a query parameter named `key` or
  matching the sensitive-name rule has its value replaced. This also covers
  keys of other tenants or other APIs in configured URLs.

Unit tests: `tests/unit/live-passthrough.test.ts` ("keys inside URLs ...").
Real check: `tests/e2e/live-real.spec.ts` asserts no secret-named field and
no secret URL parameter keeps a value. Residual risk unchanged otherwise: a
secret under an unrecognized name, outside a URL query, is still shown.

## Blocking requirements for future Live enablement

Each item here blocks one operation from the Live allowlist
(`src/server/playground/allowlist.ts#LIVE_POLICIES`) until it passes
validation. Demo mode is unaffected by these requirements: its data is
synthetic by construction.

**Status after Phase 10 (2026-10-08, user decision above):** for reads, the
field-allowlist / review requirements in SEC-REQ-01, -02, -03, -04, -07, -11
to -21 and -23 to -30 are superseded by pass-through + redaction; those reads
are Live. Still in force: SEC-REQ-05 (Auth Token, not in the portal),
SEC-REQ-06 (Dial), SEC-REQ-09 (AI Analysis), SEC-REQ-10 (AI Logs, blocked as
call content), SEC-REQ-22 (DISA), and SEC-REQ-27 (no writes in Live). The
entries below are kept as the record of each risk.

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

### SEC-REQ-05 — OpenAPI Auth Token (BLOCKING, exclusion not allowlist, open)

**Phase 8E (2026-10-01): not reachable from the customer portal.** The resource needs an administrative (global) API Key and was removed from every customer-facing page, search result, route, Demo set and example (`source-docs/portal-exclusions.json`). This requirement stays recorded and applies again if the resource is ever added back; it is not closed.

Recorded 2026-09-26. Evidence: `source-docs/openapi/auth-token.md`.

`POST/DELETE /auth/token` mints or resets a real login token/password-substitute for a web user or extension identity. This is credential issuance, not data exposure, so a field allowlist does not apply. Must never be reachable from Demo or Live, categorically, not merely allowlist-gated. Closing needs explicit user approval and is out of scope for the standard Live-enablement checklist.

### SEC-REQ-06 — OpenAPI Dial (BLOCKING, action-authorization decision, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/dial.md`.

`POST /dial` originates a real phone call, with caller-ID override and dialplan-variable injection. Never Live- or Demo-reachable without a separate, explicit business/security decision outside the standard read-allowlist pattern.

### SEC-REQ-07 — OpenAPI CDR response fields (BLOCKING, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/cdrs.md`.

Field names are documented (`clid`, `src`/`dst`/`realsrc`, `pincode`, `cc_cost`/`cc_country`/`cc_network`/`cc_buy`) but no response example exists, so envelope/types are unconfirmed. Before Live: confirm response schema, then a default-deny allowlist excluding `pincode` and billing-cost fields absent a business decision.

### SEC-REQ-08 — OpenAPI Simple CDR response fields (CLOSED for `simplecdrs-list` Live, Phase 9, 2026-10-08)

Recorded 2026-09-26. Evidence: `source-docs/openapi/simplecdrs.md`, `source-docs/observed/openapi/probe-2026-09-26.masked.json`.

Caller PII fields (`sc_calleridnum`, `sc_calleridname`, `sc_dialednum`) were documented by name only. **Closed by user decision 2026-10-08** for the single operation `openapi/simplecdrs-list`: the response schema was confirmed by the 2026-09-26 probe (12 fields) and is enforced as a default-deny allowlist; the caller PII is shown in full to the holder of the key (their own tenant's data) and is never logged or stored by the portal. See "Phase 9 — Open API Live pilot". The baseline's `BLOCK LIVE` mark is kept as recorded history; `tests/unit/phase8-readiness.test.ts` carries the explicit exemption. Any other operation that touches this data remains blocked.

### SEC-REQ-09 — OpenAPI AI Analysis (BLOCK LIVE outright, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/aianalysis.md`.

`GET /aianalysis` returns full call transcripts, AI summaries and sentiment data — call **content**, not just metadata. Schema and a worked example are both confirmed. This is content exposure; a field allowlist alone does not address the risk. Any future Live consideration needs a distinct privacy/consent decision, not just allowlisting.

### SEC-REQ-10 — OpenAPI AI Logs `ai_talk` field (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/ailogs.md`.

`GET /ailogs` returns `ai_talk`, conversation text with the AI service; the page itself warns it "can contain sensitive conversation content" (`ai-logs.md:89`). Accepts read-only keys. Before Live: explicit product sign-off on whether `ai_talk` is includable at all, separate from the mechanical field allowlist.

### SEC-REQ-11 — OpenAPI Tenant response schema (REVIEW REQUIRED, open)

**Phase 8E (2026-10-01): not reachable from the customer portal.** The resource needs an administrative (global) API Key and was removed from every customer-facing page, search result, route, Demo set and example (`source-docs/portal-exclusions.json`). This requirement stays recorded and applies again if the resource is ever added back; it is not closed.

Recorded 2026-09-26. Evidence: `source-docs/openapi/tenants.md`. No response example exists; `te_billingcode` is business-sensitive. Confirm schema before any Live read; writes excluded from Live regardless.

### SEC-REQ-12 — OpenAPI User (BLOCKING, open)

**Phase 8E (2026-10-01): not reachable from the customer portal.** The resource needs an administrative (global) API Key and was removed from every customer-facing page, search result, route, Demo set and example (`source-docs/portal-exclusions.json`). This requirement stays recorded and applies again if the resource is ever added back; it is not closed.

Recorded 2026-09-26. Evidence: `source-docs/openapi/users.md`.

Create/update writes `us_password` (a real login password) plus 2FA/IP-filter security-control fields directly. No response schema is documented, so whether GET echoes `us_password` or these controls is unconfirmed. Given this object underlies the Auth Token identity resolution (SEC-REQ-05), treat as high sensitivity; likely excluded from Live entirely pending a business decision, not just field-allowlisted.

### SEC-REQ-13 — OpenAPI User Profile (REVIEW REQUIRED, open)

**Phase 8E (2026-10-01): not reachable from the customer portal.** The resource needs an administrative (global) API Key and was removed from every customer-facing page, search result, route, Demo set and example (`source-docs/portal-exclusions.json`). This requirement stays recorded and applies again if the resource is ever added back; it is not closed.

Recorded 2026-09-26. Evidence: `source-docs/openapi/userprofiles.md`.

Controls privilege/authorization assignment for Users; a write vulnerability has systemic (privilege-escalation) impact. No response schema documented. Confirm schema and treat any Live read cautiously given the privilege-control role.

### SEC-REQ-14 — OpenAPI Provider (BLOCK LIVE, open)

**Phase 8E (2026-10-01): not reachable from the customer portal.** The resource needs an administrative (global) API Key and was removed from every customer-facing page, search result, route, Demo set and example (`source-docs/portal-exclusions.json`). This requirement stays recorded and applies again if the resource is ever added back; it is not closed.

Recorded 2026-09-26. Evidence: `source-docs/openapi/providers.md`.

Create/update writes two distinct secrets directly: the trunk SIP/PJSIP registration password and `pr_smspassword` (SMS gateway credential). No GET example exists. By analogy with Extension (whose single-object GET is documented to include technology data, where the secret is stored — SEC-REQ-03; the exact returned fields are still unknown there too), assume GET may echo these until a response schema proves otherwise.

### SEC-REQ-15 — OpenAPI Voicemail (BLOCK LIVE, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/voicemails.md`.

Create/update writes a real mailbox password directly — the same class of finding as the already-blocking Proxy API VOICEMAIL exposure (A-77, SEC-REQ-02), in a different API family. Confirm the password is excluded from any GET response before Live.

### SEC-REQ-16 — OpenAPI DID (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/dids.md`.

No response schema documented. The Proxy API's own `info-dids` (A-53) joined the DID row with the entire tenant row including recording credentials and billing code — a different API family, not carried over as evidence, but a direct precedent to check for once an OpenAPI DID response schema is available.

### SEC-REQ-17 — OpenAPI Setting (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/settings.md`.

`se_code`/`se_value` is a generic, unenumerated key/value slot — risk depends entirely on which settings a real PBX stores here. Before Live: enumerate actual `se_code` values in use and apply a default-deny allowlist by code, not just by response field name.

### SEC-REQ-18 — OpenAPI Media File `me_data` (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/mediafiles.md`.

Create accepts a base64 audio payload (`data_base64`→`me_data`). Whether GET returns this payload is unconfirmed; if so, both a bandwidth and content-sensitivity concern. Confirm before Live.

### SEC-REQ-19 — OpenAPI Paging Group `pa_pin` (BLOCK LIVE, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/paginggroups.md`. Raised from REVIEW REQUIRED to BLOCK LIVE in the Stage C review (user decision, 2026-09-26) for consistency.

Create/update writes a PIN (`pin`→`pa_pin`) directly; the page doesn't describe what it protects. No GET example exists. It follows the same rule as SEC-REQ-14/15/20/26: a write of a credential/PIN plus an undocumented GET means BLOCK LIVE until a response schema shows the PIN is excluded.

### SEC-REQ-20 — OpenAPI Conference Room `meetme` PINs (BLOCK LIVE, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/conferencerooms.md`.

Create/update writes a nested `meetme` object containing `pin` and a separate `adminpin` directly. The page does not describe what `adminpin` permits; by name it grants administrator access to a live conference. No GET example exists; assume GET returns the `meetme` object until a response schema proves otherwise (same precaution as SEC-REQ-03/14).

### SEC-REQ-21 — OpenAPI Tenant Variable (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/tenantvariables.md`.

Same generic key/value risk as Setting (SEC-REQ-17): enumerate the "allowed variable" (`tv_al_id`) definitions before Live and allowlist by definition, not just by field name.

### SEC-REQ-22 — OpenAPI DISA PIN (BLOCK LIVE, exclusion not allowlist, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/disas.md`.

`ds_pin` grants outbound dialing access through the tenant's trunk — a fraud/cost risk on write alone, independent of whether it is ever readable. Treat like Dial/Auth Token (SEC-REQ-05/06): categorically excluded from Live, not a standard field-allowlist case.

### SEC-REQ-23 — OpenAPI Campaign state (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/campaigns.md`.

Writing `state` (e.g. `ACTIVE`) starts/stops real automated outbound dialing — an operational side effect beyond ordinary CRUD. No response schema documented. Confirm schema before any Live read; state-changing writes excluded from Live regardless of read-allowlist status.

### SEC-REQ-24 — OpenAPI Campaign Number response fields (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/campaignnumbers.md`.

Target phone numbers and per-number call-outcome fields (`billsec`, `lastattempt`, `attempts`) — customer PII plus call-outcome metadata, but no credential, PIN or billing-cost field (unlike CDR, SEC-REQ-07). Confirm response schema before Live.

### SEC-REQ-25 — OpenAPI Phone Book Entry (REVIEW REQUIRED, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/phonebookentries.md`.

Holds real contact PII (name, phone, email) via a flexible values/fields/details write shape. No response schema documented. Before Live: confirm schema and scope any allowlist to the phone book's own declared layout.

### SEC-REQ-26 — OpenAPI Provisioning Phone (BLOCK LIVE, open)

Recorded 2026-09-26. Evidence: `source-docs/openapi/provisioningphones.md`.

Create/update writes two credential-shaped fields directly: `ph_password` and `ph_http_password` (with `ph_http_user`). The page does not describe what either authenticates. No GET example exists; assume GET may echo both until a response schema proves otherwise.

### SEC-REQ-27 — OpenAPI writes excluded from Live by default (cross-cutting, BLOCK LIVE, open)

Recorded 2026-09-26 (Stage C review, user decision). Applies to every OpenAPI resource.

Every OpenAPI `POST`, `PATCH`, `PUT` and `DELETE` stays out of the Live Playground, and out of any Demo path that could send a request. **Amended 2026-10-01 (Phase 8C, user decision):** an OpenAPI write may be *simulated* in Demo, under all of these conditions: (1) its fixture set is built only from the vendor's documented example responses and the observed generic error envelope (no invented bodies; a write with no documented response stays "Demo data not available"); (2) the simulation is local (`demoProvider`, `src/components/playground/executor.ts`) and never reaches `/api/playground` or any upstream host; (3) only APIs listed in `DEMO_WRITE_APIS` (`src/content/demo/index.ts`, currently `openapi` only) qualify, so Proxy writes stay Reference-only in the UI and in the executor, even if a fixture were added by mistake; (4) Live never sends a write of any API: blocked in the UI, in `use-playground.ts` `send`, in `liveProvider` itself (`endpoint_not_allowed`, no fetch), and on the server (GET-only allowlist). Enforced by `tests/unit/executor.test.ts` ("liveProvider and writes", the write-Demo cases) and `tests/unit/openapi-coverage.test.ts` (no write on the Live allowlist; `isDemoSimulatedWrite` only for fixtured writes). The Proxy precedent (writes Reference-only in the UI and in the executor) is unchanged. Enabling any single write operation needs its own explicit security decision; it is not part of the read-allowlist checklist. This rule also covers write-side risks that don't warrant a per-resource entry of their own: Cron Job and Flow (they change call routing), Feature Code and Short Number (dialing behavior), Campaign state (SEC-REQ-23), and Music On Hold `application` (SEC-REQ-30). Documentation and code samples for writes are unaffected.

### SEC-REQ-28 — OpenAPI tenant isolation for Live (cross-cutting, BLOCK LIVE, open)

Recorded 2026-09-26 (Stage C review, user decision). Evidence: `source-docs/openapi/_common.md` §2–3; `overview-and-examples.md:18` (a global key "can list tenant-scoped objects across tenants when no tenant parameter is supplied").

Any future OpenAPI Live path must:
1. Use a tenant-scoped key only, read-only where the operation allows. Never a global key.
2. Have the server set and enforce `tenant`. The browser never picks a tenant outside the caller's own.
3. Reject `global=1`, `%` tenant wildcards, and any omitted-tenant request (the cross-tenant search that AI Logs and the reporting pages document).
4. Exclude global-key-only resources (Tenant, User, User Profile, Routing Profile, Provider, Auth Token) from Live entirely.

Phase 8E (2026-10-01): items 3 and 4 also hold for documentation — `global=1`, the global-key wording and the six global-key-only resources are no longer shown in the customer portal at all (`source-docs/portal-exclusions.json`). The rules above are unchanged.

### SEC-REQ-29 — OpenAPI Custom Destination `extended_infos` (REVIEW REQUIRED, open)

Recorded 2026-09-26 (Stage C review, user decision). Evidence: `source-docs/openapi/customdestinations.md`.

`extended_infos` (`ce_name`/`ce_value`) is an unenumerated key/value store. Its valid names depend on a `cu_ct_id` type whose enumeration isn't documented. It is the same risk class as SEC-REQ-17/21. Before Live: enumerate the custom types and their extended names, then allowlist by name, not just by field.

### SEC-REQ-30 — OpenAPI Music On Hold `application`/`streamengine` (REVIEW REQUIRED, open)

Recorded 2026-09-26 (Stage C review, user decision). Evidence: `source-docs/openapi/musiconholds.md`, `music-on-hold.md:15`.

Both are raw, free-form fields with no documented meaning. In Asterisk MOH configuration, `application` can name an external program the server runs. That is domain knowledge, not documented MiRTA behavior. Before Live: establish their semantics from the spec or the vendor. Writes are excluded by SEC-REQ-27; a read would expose the configured value.

### Phase 8B probe observations (2026-09-26)

These come from a single masked, structure-only probe on one test PBX (`source-docs/DOCS_AUDIT.md` §14; `source-docs/observed/openapi/probe-2026-09-26.masked.json`). Only field names and value-type classes were stored, so "populated" means a non-empty value was present; the value itself was never recorded. No label changes. Every entry below stays open. The Reference examples built from this probe (`src/content/observed.ts`) show `SYNTHETIC_SECRET` or a synthetic placeholder for these fields, never an observed value.

- **SEC-REQ-19 (confirmed exposure):** `pa_pin` is returned, populated, by both the Paging Group list and the single read.
- **SEC-REQ-20 (confirmed exposure):** the Conference Room single read returns `related.meetme.pin` and `related.meetme.adminpin`, both populated. List rows did not include `related`.
- **SEC-REQ-22 (confirmed exposure):** `ds_pin` is returned, populated, by both the DISA list and the single read.
- **SEC-REQ-26 (partly observed):** `ph_mac` is returned, populated, by the list and the single read. `ph_password` and `ph_http_password` were **not** returned; `ph_http_user` was returned, empty. One observation doesn't prove the passwords are always excluded.
- **SEC-REQ-15 (partly observed):** the Voicemail list and single read returned no `password` field. They did return `email` (populated, PII) and `imapuser` (null). As with SEC-REQ-26, this is one observation, not proof of exclusion.
- **SEC-REQ-18 (partly observed):** the Media File single read did **not** return `me_data`. It did return `me_voiceapiusername` and `me_voiceapihost`, which no official page documents. Their names suggest a TTS-service account, so review them before any Live read.
- **SEC-REQ-03 (still unresolved):** the probed extension was a virtual extension. Its single read carries the technology row under `tech_details.virtualextension` (`ve_securitypin` present, empty). No SIP/PJSIP row was observed, so whether a GET returns the technology secret remains UNKNOWN. `ex_email` and the other `ex_*email` fields are returned (empty on this extension).

## Customer portal exclusions (Phase 8E, 2026-10-01)

User decision (`docs/phases/08E-customer-change-brief.md`, brief item 3): content that requires an administrative API Key is not part of the customer-facing portal.

- Removed: 27 OpenAPI operations (Tenant, User, User Profile, Routing Profile, Provider, Auth Token) and 35 Proxy API `MANAGEDB` operations (Admin key), the ManageDB guide, the Admin/global sections of both authentication guides, the `global=1` parameter, global-key examples, and the global/Admin wording on customer resources.
- Source of truth: `source-docs/portal-exclusions.json`. The approved baseline inventories are unchanged; tests (`tests/unit/helpers/exclusions.ts`, `openapi-coverage`, `proxy-coverage`, `phase8-readiness`, `customer-copy`) and the status scripts reconcile the baseline against it.
- Enforcement: `tests/unit/customer-copy.test.ts` fails if any excluded operation or guide is reachable through the content registry, search index or `related` links, or if global/Admin key wording returns to customer-visible copy (verbatim API error bodies in Demo are the only exception).
- Not a security control: removing documentation does not change what the real API accepts. The Live boundary is unchanged (Live allowlist: the three approved Proxy reads; no Open API operation).

## Open action items

### Phase 8B OpenAPI probe key rotation (2026-09-26, not yet done)

The Phase 8B Stage 2 probe (masked, structure-only, GET-only) used a
user-supplied tenant-scoped TEST OpenAPI key, passed only as a process
environment variable to a throwaway scratchpad script. The key was
shared in the chat transcript (same method as Phase 6/7). Only masked
shapes were stored (`source-docs/observed/openapi/probe-2026-09-26.masked.json`,
verified to contain neither the key nor the tenant). **Rotate this key.**
Whether the key was read-only was not confirmed; the script only ever
issued GET requests.

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

## Security review — Phase 8 Stage 6 (2026-10-02, Opus 5.5)

Scope: `main (be23fb2)...phase/open-api-review` (Phase 8, 8A-8E). Manual
review plus the `security-review` skill as a second pass. **No high or
medium findings.**

Verified:

- **Live boundary unchanged.** No diff since `main` in `src/server/**`,
  `src/app/api/**`, `src/lib/playground-protocol.ts` or `next.config.ts`.
  The allowlist is server-only, hard-wired to `proxyApi` and GET-only, so Live
  still reaches only `proxy/info-extensions`, `proxy/info-agents` and
  `proxy/cdr-get`. `liveAvailable` comes from `listLiveTargetIds()` on the
  server, behind `PLAYGROUND_LIVE_ENABLED`. The 8E edits to Proxy content
  change only wording and examples; auth (`query`/`key`) and paths are
  unchanged.
- **Writes are never sent.** `send()` (`use-playground.ts`) and `liveProvider`
  refuse writes in Live. `isDemoSimulatedWrite` needs a write fixture set, and
  Open API has none.
- **Demo isolation.** `demoProvider` makes no network request, and there is
  no Live-to-Demo fallback. Fixtures use only synthetic values (`TESTTENANT`,
  `SYNTHETIC_SECRET`, 555 numbers, `demo@example.com`). The masked probe file
  holds only type descriptors and error codes.
- **Credentials.** The request preview and cURL mask the credential for
  query, header and Bearer auth. Secret-named body fields become
  `<REDACTED>`. None of the 491 query/path parameters is secret-named. Only
  `?endpoint=` is read from the URL, so no field is pre-filled from a link.
- **HTML sinks.** Four `dangerouslySetInnerHTML` sinks: a constant theme
  script, and shiki HTML generated on the server from static content.
  `InlineMarkup` builds React elements.
- **Exposure.** `.next/static` and the prerendered HTML contain no excluded
  admin operation ids, `ManageDB`, `MiRTA`, `CANISTRACCI` or `srv02`
  (positive-control strings were found, so the scan works).

Low / accepted (each needs a user decision before any change):

- **L-1 (FIXED, Stage 6 remediation) Vendor example that looks real:** `src/content/proxy/misc.ts:127`
  `phonebook-add` `{ NAME: "Ross", PHONE1: "3564732920" }`. Pre-existing on
  `main`; it now also appears in the Playground request preview and body
  defaults, and ships in 8 prerendered pages. Option: replace it with
  synthetic values, as the Open API examples do.
- **L-2 (FIXED) Defense in depth:** `src/content/examples.ts` and
  `src/content/observed.ts` have no `import "server-only"`. Their data is
  masked or synthetic, so nothing is exposed today.
- **L-3 Self-only:** a path value the user types is substituted raw inside
  the double-quoted URL of the copied cURL (`$(...)` would expand when
  pasted). Only the user can enter it. Accepted unless the user decides
  otherwise.

Still open from earlier phases: TEST API key rotation (Phase 8B), no CSP,
the shared rate-limit bucket and the Origin-vs-Host check (Phase 5,
deployment decisions).

Stage 6 remediation (2026-10-02): L-1 and L-2 fixed; L-3 accepted (self-only).
See `docs/DECISIONS.md` "Phase 8 Stage 6 — remediation done". Residual: raw
internal references remain in client JS chunks (never rendered).
