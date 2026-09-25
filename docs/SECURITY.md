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

- **Allowed hosts/endpoints/methods**: `allowlist.ts` hard-codes exactly one
  target (`proxy/info-extensions`, `GET`), resolved from the content model
  and asserted against a fixed origin set at module load — not
  env-configurable, so no deployment config can widen it.
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
