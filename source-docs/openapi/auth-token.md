# Auth Token

## Status

- Evidence: DOCUMENTED (official page, full request/response examples)
- Scope: Admin/System (always requires a global full key)
- Access: Mutating (generate, reset — no read operation)
- Security review: **BLOCK LIVE** (SEC-REQ-05)

## Purpose

Generates or resets a temporary login token for a web user or extension web identity, usable in place of the password on the MiRTA PBX login page (`auth-token.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/auth-token (rev #9, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/auth-token.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Primary path | `/auth/token` | DOCUMENTED `:9` |
| Path aliases | none documented | — |
| ID field / Label field | n/a (not an object; acts on a resolved user identity) | — |

## Authentication and Scope

- **Always requires the global full API key.** Tenant keys and read-only keys are rejected (`:7`).
- The token is returned only once, at generation time (`:7`).
- The user value is resolved in this order (`:13`, `:15`):

| Identity type | Matched field |
|---|---|
| Web user | `us_users.us_username` |
| Extension web user | `ex_extensions.ex_webuser` |
| SIP extension username | `sipfriends.name`, when `ex_webuser` is empty |
| PJSIP endpoint ID | `ps_endpoints.id`, when `ex_webuser` is empty |

This resolution order matches the legacy ProxyAPI token feature (`:13`).

## Operations

| Operation | Method and path | API key | Evidence |
|---|---|---|---|
| Generate token | `POST /auth/token` | `GLOBAL_API_KEY` | DOCUMENTED `:9` |
| Reset token | `DELETE /auth/token` | `GLOBAL_API_KEY` | DOCUMENTED `:9` |
| GET | not documented | — | — |

### POST /auth/token (generate)

**Purpose:** create a new login token for a resolved user identity.

**Body (JSON):**

| Field | Required | Type | Description | Evidence |
|---|---:|---|---|---|
| `user` | yes | string | value resolved through the identity table above | DOCUMENTED `:25` |
| `validity` | yes | `"ONCE"` or a date/time string | `ONCE` = single-use token; a date/time string = valid until that time | DOCUMENTED `:19` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"user":"100","validity":"ONCE"}' \
  "https://pbx.example.com/pbx/openapi.php/auth/token"
```

Expiring token example (`:41-47`, tenant/user normalized):

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"user":"api.operator","validity":"2026-06-30 23:59:59"}' \
  "https://pbx.example.com/pbx/openapi.php/auth/token"
```

**Response:**

```json
{
  "token": "generated-token-value",
  "user": "100",
  "target_type": "WEBPASSWORD"
}
```

(`:31-37`)

- `target_type` value shown: `WEBPASSWORD`. Other values are UNKNOWN.
- HTTP status: UNKNOWN.

### DELETE /auth/token (reset)

**Purpose:** clears the stored token hash and validity for the resolved user identity (`:51`).

**Body (JSON):**

| Field | Required | Type | Evidence |
|---|---:|---|---|
| `user` | yes | string | DOCUMENTED `:57` |

```bash
curl -X DELETE -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"user":"100"}' \
  "https://pbx.example.com/pbx/openapi.php/auth/token"
```

**Response:**

```json
{
  "reset": true,
  "user": "100",
  "target_type": "WEBPASSWORD"
}
```

(`:61-68`)

## Request Schema

Both operations: JSON body `{ "user": string, ... }`, plus `validity` for POST. Fully documented above; nothing else is accepted (UNKNOWN if it is).

## Response Schema

Both documented in full above. No pagination, no arrays, no nesting.

## Aliases / Accepted Values

- `validity`: `"ONCE"`, or a parseable date/time string (example format `YYYY-MM-DD HH:MM:SS`).
- No field aliases documented for `user`.

## Security Notes

- **This is a credential-issuance endpoint.** A generated token substitutes for a user's login password (`:3`).
- "Only the generated token value is returned. MiRTA PBX stores a SHA-256 hash of the token" (`:73`) — the plaintext token is not retrievable afterward, but the API response itself carries it once.
- Generating a new token replaces any previous token for that identity (`:75`) — a side effect on unrelated sessions.
- This is unlike every other resource: instead of exposing existing PBX data, it **mints a working credential**.
- → **SEC-REQ-05**: this operation must never be reachable from Demo or Live. It is a write-and-credential-mint action, categorically excluded from browser-facing exposure, not merely allowlist-gated.

## Demo Considerations

Not a Demo candidate. Any fixture would either be inert (fine) or teach users to expect a real token-minting flow from a documentation portal, which is misleading. Exclude from Demo scope entirely, pending a user decision (do not decide silently — flagged in Unresolved below is not needed since instructions already forbid Live/Demo unless explicitly built later).

## Live Considerations

Never exposed. See Security Notes / SEC-REQ-05.

## Unknowns

- Whether a tenant-scoped variant exists.
- `target_type` values other than `WEBPASSWORD`.
- HTTP status codes.
- Token format/length.
- Rate limiting or expiry defaults when `validity` is omitted (the field is documented as required, so "omitted" may simply be invalid).

## Conflicts

None found.

## Verification Notes

DOCUMENTED from rev #9. No call has been made, and none should be — see Security Notes.
