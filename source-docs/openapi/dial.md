# Dial

## Status

- Evidence: DOCUMENTED (official page, full request/response example)
- Scope: Tenant (full key)
- Access: Mutating (originates a real call)
- Security review: **BLOCK LIVE** (SEC-REQ-06)

## Purpose

Originates a call between a source extension and a destination number. Documented as "the OpenAPI equivalent of `proxyapi.php?reqtype=DIAL`", using the same PBX dialplan contexts (`dial.md:3`). Proxy and OpenAPI are separate API families; this cross-reference is recorded as the official page's own statement, not carried over as OpenAPI evidence.

## Official Sources

- https://manual.mirtapbx.com/books/api/page/dial (rev #3, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/dial.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Primary path | `/dial` | DOCUMENTED `:10` |
| Path aliases | none documented | — |

## Authentication and Scope

- Tenant context is required, and a **full** API key is required. "Read-only API keys cannot originate calls" (`:5`).
- Tenant parameter: `tenant=<code or name>` (`:13`).

## Operations

### POST /dial

| Parameter | Location | Required | Type | Description | Evidence |
|---|---|---:|---|---|---|
| `tenant` | query | yes | string | tenant code or tenant name | DOCUMENTED `:13` |
| `key` | query | no, if using headers | string | full API key | DOCUMENTED `:13` |

**Request body (JSON):**

| Field | Required | Description | Evidence |
|---|---:|---|---|
| `source` | yes | source extension; aliases `exten`, `?exten` | DOCUMENTED `:17` |
| `dest` | yes | destination number; alias `phone` | DOCUMENTED `:17` |
| `dialtimeout` | no | originate timeout in seconds, default `30` | DOCUMENTED `:17` |
| `timeout` | no | sets dialplan variable `SETTIMEOUT` | DOCUMENTED `:17` |
| `sourceclid` | no | sets `SETSOURCECLID` | DOCUMENTED `:17` |
| `destclid` | no | sets `SETDESTCLID` | DOCUMENTED `:17` |
| `logqueueoutbound` | no | sets `SETLOGQUEUEOUTBOUND` | DOCUMENTED `:17` |
| `recording` | no | sets `SETRECORDING` | DOCUMENTED `:17` |
| `autoanswer` | no | sets `AUTOANSWER` | DOCUMENTED `:17` |
| `nofollow` | no | sets `SETNOFOLLOWEXTENSION` | DOCUMENTED `:17` |
| `account` | no | peer account name to set as `SETPEERNAME`; `SOURCE` resolves it from the source extension | DOCUMENTED `:17`, `:57` |
| `server` | no | PBX node peer name, used when the source/destination registration server cannot be found | DOCUMENTED `:17`, `:58` |
| `var` | no | comma-separated custom variables, e.g. `campaign=summer,lead=42` | DOCUMENTED `:17` |
| `vars` | no | custom variables as a JSON object; tenant-prefixed, listed in `VARLIST` | DOCUMENTED `:17` |

- Value types for the `SET*`-named fields (booleans? strings `"yes"`/`"no"`?) are UNKNOWN beyond the `recording: "yes"` example.

```bash
curl -X POST "https://pbx.example.com/pbx/openapi.php/dial?tenant=TESTTENANT" \
  -H "X-API-Key: TEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "100",
    "dest": "5550100",
    "dialtimeout": 30,
    "sourceclid": "100",
    "recording": "yes",
    "vars": {"campaign": "summer", "lead": "42"}
  }'
```

**Response:**

```json
{
  "Response": "Success",
  "Message": "Originate successfully queued",
  "ID": "originate-tracking-id",
  "source": "100",
  "dest": "5550100",
  "server": "pbx-node-1",
  "node": "PBX Node 1"
}
```

(`:43-51`, normalized)

- Capitalized keys (`Response`, `Message`, `ID`) mixed with lowercase (`source`, `dest`, `server`, `node`) — as documented, not a transcription error.
- Whether a failed originate returns a different `Response` value, and what values it can take besides `"Success"`, is UNKNOWN. No failure example is shown.
- HTTP status: UNKNOWN.

## Request Schema

Full field table above (`:17`).

## Response Schema

Full example above (`:43-51`). No documented failure shape.

## Aliases / Accepted Values

- `source`: aliases `exten`, `?exten` (`:17`). The literal `?exten` form (with a leading `?`) is as documented; its meaning is not explained.
- `dest`: alias `phone` (`:17`).
- `source=ACCOUNT` resolves the source extension number from the `account` peer name (`:56`).
- `account=SOURCE` resolves the peer name from the source extension (`:57`).
- "The endpoint returns JSON only" (`:59`).

## Security Notes

- **This endpoint places a real phone call.** It is the single most consequential mutating operation documented so far.
- `sourceclid`/`destclid` let the caller override caller-ID presentation.
- `vars`/`var` can inject arbitrary tenant-prefixed dialplan variables.
- → **SEC-REQ-06**: Dial must never be Live- or Demo-reachable without a separate, explicit security and business decision. It is call-origination, not data exposure — the SEC-REQ pattern used for read allowlists does not apply; this is an action-authorization decision.

## Demo Considerations

Not a Demo candidate: a real call cannot be simulated without misrepresenting behavior, and no fixture is meaningful for an origination side effect.

## Live Considerations

Never exposed without a separate, explicit approval process outside the scope of this documentation baseline.

## Unknowns

- Failure response shape and `Response` values other than `"Success"`.
- HTTP status codes.
- Value types/format for the `SET*` boolean-like fields.
- The meaning of the `?exten` alias form.
- Any per-tenant rate limiting on origination.

## Conflicts

None found. (The wrapper's claims for Dial, W:88/137-141/333, match: path, POST, tenant full key, `source`/`dest` required.)

## Verification Notes

DOCUMENTED from rev #3. No call has been made, and none should be without explicit per-task authorization (instructions §10).
