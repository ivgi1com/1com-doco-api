# Queue

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A call queue with member extensions, penalties, and per-state destinations (full, timeout, no free member, abandoned call, etc.) (`queues.md:3` → source `queue.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/queue (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/queue.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `queue` | DOCUMENTED `:7` |
| Primary path | `/queues` | DOCUMENTED `:7` |
| Path aliases | `/queues` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `qu_id` | DOCUMENTED `:7` |
| Label field | `qu_name` | DOCUMENTED `:7` |
| Primary source table | `qu_queues` | DOCUMENTED `:7` |
| Required on create | **not listed** in the Object Summary table | DOCUMENTED (absence) `:7` |

Note: unlike every other object processed so far, this page's Object Summary table has no "Required on create" row at all. The Overview's own resource matrix says "No required create field listed" for Queue (`overview-and-examples.md:38`) — consistent with this page.

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /queues?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /queues/{qu_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /queues?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /queues/{qu_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /queues/{qu_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /queues (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `qu_name` | not stated required | | DOCUMENTED `:15` |
| `number` → `qu_number` | not stated required | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Accounting Queue","number":"700"}' \
  "https://pbx.example.com/pbx/openapi.php/queues?tenant=TESTTENANT"
```

### PATCH /queues/{qu_id} — Members and allowed members

Two distinct write shapes beyond plain field updates:

**Members** (`:242-263`): replaces the member list.
```json
{"members": [{"extension_id": 45, "penalty": 0}, {"extension_id": 46, "penalty": 1}]}
```
"Use extension IDs and optional member fields such as penalty when needed."

**Allowed members** (`:265-280`): controls which extensions may be used as members.
```json
{"allowed_members": [45, 46, 47]}
```

### GET, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

**Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `QUEUE-FULL` | `full` |
| `QUEUE-TIMEOUT` | `timeout_destination`, `timeout` |
| `QUEUE-EXITKEY` | `exitkey` |
| `QUEUE-ONCALLBACK` | `oncallback` |
| `QUEUE-NOBODYHOME` | `nobodyhome` |
| `QUEUE-NOFREEMEMBER` | `nofreemember` |
| `QUEUE-PERIODICANNOUNCE` | `periodicannounce` |
| `QUEUE-BEFORERINGING` | `beforeringing` |
| `QUEUE-ONAUTOPAUSE` | `onautopause` |
| `QUEUE-ONABANDONEDCALL` | `onabandonedcall` |

Same alias-key-or-`destinations`-object pattern as Extension.

## Request Schema

Field table above; 10 destination types plus members/allowed_members write shapes.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

No credential- or PII-shaped field documented. `members`/`allowed_members` reference internal extension IDs, not sensitive by themselves. Status held at UNKNOWN pending schema confirmation.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Plausible read candidate once a response schema exists.

## Unknowns

- GET response shape.
- Whether any field is actually required on create (the page documents none as required — worth confirming against the spec, since an empty object create seems unlikely to succeed in practice).
- `penalty` value range/meaning.

## Conflicts

None found. (Wrapper's Queue claims, W:103/313/339-373, match: path, ID, label, table, destination aliases; wrapper's "No required create field listed" for Queue, W:313, is consistent with this page having none.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
