# Condition

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A call-flow branching object (e.g. time/weektime conditions) with up to 20 numbered outcome destinations plus true/false destinations (`conditions.md:3` → source `condition.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/condition (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/condition.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `condition` | DOCUMENTED `:7` |
| Primary path | `/conditions` | DOCUMENTED `:7` |
| Path aliases | `/conditions` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `co_id` | DOCUMENTED `:7` |
| Label field | `co_name` | DOCUMENTED `:7` |
| Primary source table | `co_conditions` | DOCUMENTED `:7` |
| Required on create | `co_type` | DOCUMENTED `:7` |

Note: the required-create field is `co_type`, not the label field `co_name` — the only tenant object seen so far where the required field differs from the name/label field.

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /conditions?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /conditions/{co_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /conditions?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /conditions/{co_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /conditions/{co_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /conditions (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `type` → `co_type` | **yes** | example value `"WEEKTIME"` | DOCUMENTED `:7`, `:15`, `:53` |
| `name` → `co_name` | no | | DOCUMENTED `:15` |
| `timezone` → `co_timezone` | no | e.g. `Europe/Rome` | DOCUMENTED `:15`, `:54` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Office Hours","type":"WEEKTIME","timezone":"Europe/Rome"}' \
  "https://pbx.example.com/pbx/openapi.php/conditions?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

### Extended rows (`:435-456`)

A distinct PATCH body form for condition types needing additional values:

```json
{
  "extended_infos": [
    {"ce_type": "weekday", "ce_value": "mon-fri"},
    {"ce_type": "hours", "ce_value": "09:00-18:00"}
  ]
}
```

This example (weekday + hours) implies `WEEKTIME` conditions configure their schedule through `extended_infos`, but the field is not formally specified beyond this one example.

## Aliases / Accepted Values

- `co_type`: `"WEEKTIME"` observed (not stated exhaustive — other condition types plausibly exist, UNKNOWN).

**Destination fields**, one string or an array (`:21`, condensed — 22 destination types, each with its own PATCH example, `:83-433`):

| Destination type | Accepted aliases |
|---|---|
| `CONDITION` | `condition`, `true`, `yes`, `destination` |
| `NOTCONDITION` | `notcondition`, `false`, `no`, `notdestination` |
| `CONDITION1` through `CONDITION20` | `condition[N]`, `destination[N]`, `destinationmvv[N]` (N = 1–20) |

Same alias-key-or-`destinations`-object pattern as Extension. Note the true/false semantic pairing (`CONDITION`/`NOTCONDITION` aliased to `true`/`yes` and `false`/`no` respectively) — the clearest boolean-branch naming of any destination-alias table seen.

## Request Schema

Field table above; 22 destination types plus `extended_infos` as described.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

No credential- or PII-shaped field documented. Status held at UNKNOWN pending schema confirmation.

## Demo Considerations

Not fixturable yet: no response shape documented, and the full `co_type` enum is unconfirmed.

## Live Considerations

Plausible read candidate once a response schema exists.

## Unknowns

- GET response shape.
- Full `co_type` enum (only `WEEKTIME` observed).
- `extended_infos`' full valid `ce_type` set beyond `weekday`/`hours`.

## Conflicts

None found. (Wrapper's Condition claims, W:100/310, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
