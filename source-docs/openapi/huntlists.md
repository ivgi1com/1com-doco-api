# Hunt List

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A ring-group / hunt-list object: a set of member extensions rung together with a ring strategy and timeout destination (`huntlists.md:3` → source `hunt-list.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/hunt-list (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/hunt-list.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `huntlist` | DOCUMENTED `:7` |
| Primary path | `/huntlists` | DOCUMENTED `:7` |
| Path aliases | `/huntlists` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `hu_id` | DOCUMENTED `:7` |
| Label field | `hu_name` | DOCUMENTED `:7` |
| Primary source table | `hu_huntlists` | DOCUMENTED `:7` |
| Required on create | `hu_name` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /huntlists?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /huntlists/{hu_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /huntlists?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /huntlists/{hu_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /huntlists/{hu_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /huntlists (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `hu_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `number` → `hu_number` | no | | DOCUMENTED `:15` |
| `type` → `hu_type` | no | example value `"RINGALL"` | DOCUMENTED `:15`, `:54` |
| `ringtime` → `hu_ringtime` | no | seconds (inferred from example value `20`; unit not explicitly stated) | DOCUMENTED `:15`, `:55` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Hunt List","number":"820","type":"RINGALL","ringtime":20}' \
  "https://pbx.example.com/pbx/openapi.php/huntlists?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

- `hu_type`: `"RINGALL"` observed (not stated exhaustive).

**Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `HUNTLIST` | `extensions`, `members`, `huntlist` |
| `HUNTLIST-TIMEOUT` | `timeout`, `huntlist_timeout` |

Same alias-key-or-`destinations`-object pattern as Extension. The `HUNTLIST` destination's aliases (`extensions`, `members`) suggest it holds the member list, but its value shape (array of extension refs, presumably) is not explicitly specified beyond the generic destination-field convention.

## Request Schema

Field table above; 2 destination types as described.

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
- Full `hu_type` enum (only `RINGALL` observed — other ring strategies, e.g. sequential/hunt-order, plausibly exist).
- `ringtime` unit (assumed seconds, not stated).
- The exact value shape the `HUNTLIST` destination expects for its member list.

## Conflicts

None found. (Wrapper's Hunt List claims, W:101/311, match: path, ID, label, table, required-create field, path alias.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
