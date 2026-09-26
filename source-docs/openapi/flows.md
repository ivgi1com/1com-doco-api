# Flow

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A call-flow "state" toggle object (e.g. open/closed) with a single destination, driven by a stored variable value (`flows.md:3` → source `flow.md:3`). This is likely the OpenAPI equivalent of Proxy's `SETFLOW` operation, but the two API families are separate; no Proxy behavior is carried over as evidence.

## Official Sources

- https://manual.mirtapbx.com/books/api/page/flow (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/flow.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `flow` | DOCUMENTED `:7` |
| Primary path | `/flows` | DOCUMENTED `:7` |
| Path aliases | `/flow`, `/flows` | DOCUMENTED `:7` |
| ID field | `fl_id` | DOCUMENTED `:7` |
| Label field | `fl_name` | DOCUMENTED `:7` |
| Primary source table | `fl_flows` | DOCUMENTED `:7` |
| Required on create | `fl_name` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /flows?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /flows/{fl_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /flows?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /flows/{fl_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /flows/{fl_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /flows (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `fl_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `comment` → `fl_comment` | no | | DOCUMENTED `:15` |
| `number` → `fl_number` | no | | DOCUMENTED `:15` |
| `value` → `fl_value` | no | e.g. `"open"`/`"closed"` | DOCUMENTED `:15`, `:55`, `:69` |
| `variable_name` → `fl_variable_name` | no | e.g. `"DOCS_FLOW_STATE"` | DOCUMENTED `:15`, `:54` |
| `monitor_type` → `fl_monitor_type` | no | | DOCUMENTED `:15` |
| `monitor_type_id` → `fl_monitor_type_id` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Flow","number":"850","variable_name":"DEMO_FLOW_STATE","value":"open"}' \
  "https://pbx.example.com/pbx/openapi.php/flows?tenant=TESTTENANT"
```

### PATCH — State change (`:100-112`)

A distinct write shape for setting the current state, with three accepted aliases:

```json
{"status": "open"}
```

"Sets the current flow state using one of the accepted state aliases: `status`, `state`, or `st_state`" (`:102`).

### GET, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

- State-change aliases: `status`, `state`, `st_state` (`:102`).
- **Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `FLOW` | `destination`, `destinations` |

Note: `destinations` is itself listed as an *alias of* the `FLOW` destination type here, distinct from every other object's convention where `destinations` is a wrapper *object* holding multiple destination-type keys. This may be a page-specific naming collision — flagged, not resolved.

## Request Schema

Field table above, plus the state-change and destination write shapes.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

No credential- or PII-shaped field documented. Status held at UNKNOWN pending schema confirmation.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Plausible read candidate once a response schema exists.

## Unknowns

- GET response shape.
- Whether `destinations` as a `FLOW`-type alias conflicts with or replaces the generic `destinations`-wrapper-object convention used elsewhere.
- Full `value`/state enum beyond `open`/`closed`.

## Conflicts

None found. (Wrapper's Flow claims, W:109/319, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
