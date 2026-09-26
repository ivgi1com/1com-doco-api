# Campaign

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-23)

## Purpose

An outbound dialing campaign: type/tech, schedule, caller ID, state, queue routing, message, and attached binary/fax files (`campaigns.md:3` → source `campaign.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/campaign (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/campaign.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `campaign` | DOCUMENTED `:7` |
| Primary path | `/campaigns` | DOCUMENTED `:7` |
| Path aliases | `/campaign`, `/campaigns` | DOCUMENTED `:7` |
| ID field | `ca_id` | DOCUMENTED `:7` |
| Label field | `ca_name` | DOCUMENTED `:7` |
| Primary source table | `ca_campaigns` | DOCUMENTED `:7` |
| Required on create | `ca_name` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /campaigns?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /campaigns/{ca_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /campaigns?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /campaigns/{ca_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /campaigns/{ca_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /campaigns (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `ca_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `type` → `ca_type` | no | e.g. `"VOICE"` | DOCUMENTED `:15`, `:53` |
| `tech` → `ca_tech` | no | e.g. `"PJSIP"` | DOCUMENTED `:15`, `:54` |
| `datestart` → `ca_datestart` | no | | DOCUMENTED `:15` |
| `dateend` → `ca_dateend` | no | | DOCUMENTED `:15` |
| `condition_id` → `ca_co_id` | no | references a Condition object | DOCUMENTED `:15` |
| `callerid` → `ca_callerid` | no | | DOCUMENTED `:15`, `:55` |
| `calleridname` → `ca_calleridname` | no | | DOCUMENTED `:15` |
| `state` → `ca_state` | no | e.g. `"PAUSED"`, `"ACTIVE"` | DOCUMENTED `:15`, `:56`, `:70` |
| `queue_id` → `ca_qu_id` | no | references a Queue object | DOCUMENTED `:15` |
| `message` → `ca_message` | no | | DOCUMENTED `:15` |
| `confirmmessage_id` → `ca_confirmmessage_me_id` | no | references a Media File object | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Campaign","type":"VOICE","tech":"PJSIP","callerid":"+15550100","state":"PAUSED"}' \
  "https://pbx.example.com/pbx/openapi.php/campaigns?tenant=TESTTENANT"
```

### PATCH — Binary/fax file references (`:117-134`)

A distinct write shape for attaching files:

```json
{"binary_files": [{"name": "demo-script.txt", "data_base64": "BASE64_TEXT_DATA"}]}
```

"Adds binary or fax-related files to the campaign. Use complete base64 data in production integrations" (`:119`) — the official example's base64 payload is a short, complete text string (not truncated, unlike Media File's).

### GET, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

- `type`: `"VOICE"` observed.
- `tech`: `"PJSIP"` observed.
- `state`: `"PAUSED"`, `"ACTIVE"` observed (not stated exhaustive).

**Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `CAMPAIGN-ONCONNECT` | `onconnect`, `on_connect` |
| `CAMPAIGN-DONOTCALL` | `donotcall`, `do_not_call` |

Note the `CAMPAIGN-DONOTCALL` example uses a numeric value `[22]` (`:111`) rather than an `EXT-`-style string — likely a Custom Destination ID reference, consistent with Custom Destination's own `PRIVACY-DONTCALL` type.

## Request Schema

Field table above; 2 destination types plus `binary_files`.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- `callerid`/`calleridname` are outbound caller-ID presentation values.
- `binary_files`/`data_base64` can carry uploaded scripts or fax content — similar bandwidth/content concern as Media File's `data_base64`.
- The object controls **automated outbound dialing** (`state: ACTIVE`) — a write to this object has an operational side effect (starts/stops a dialing campaign), even though it isn't a single-call action like Dial.
- → **SEC-REQ-23**: REVIEW REQUIRED. Establish the response schema, and treat write access (especially `state`) with the same caution as other action-triggering fields, even though the object itself is a standard CRUD resource.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Reads only, pending SEC-REQ-23; state-changing writes (pause/activate a real campaign) should never be Live regardless of read allowlist status.

## Unknowns

- GET response shape.
- Full `type`/`tech`/`state` enums.
- Whether `queue_id`/`condition_id`/`confirmmessage_id` references are validated against existing objects at write time.

## Conflicts

None found. (Wrapper's Campaign claims, W:113/323, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
