# Short Number

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

An internal short-dial number mapped to a destination string (`shortnumbers.md:3` → source `short-number.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/short-number (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/short-number.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `shortnumber` | DOCUMENTED `:7` |
| Primary path | `/shortnumbers` | DOCUMENTED `:7` |
| Path aliases | `/shortnumbers`, `/short_numbers`, `/short_number` | DOCUMENTED `:7` |
| ID field | `sn_id` | DOCUMENTED `:7` |
| Label field | `sn_number` | DOCUMENTED `:7` |
| Primary source table | `sn_shortnumbers` | DOCUMENTED `:7` |
| Required on create | `sn_number` | DOCUMENTED `:7` |

## Authentication and Scope

"Normally tenant-scoped. With a global API key, use `global=1`..." (`:3`) — one of the 8 `global=1`-capable resources.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /shortnumbers?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:82-83` |
| Get by ID | `GET /shortnumbers/{sn_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /shortnumbers?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /shortnumbers/{sn_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /shortnumbers/{sn_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /shortnumbers (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `number` → `sn_number` | **yes** | e.g. `"901"` | DOCUMENTED `:7`, `:15`, `:46` |
| `destination`/`destnumber` → `sn_destnumber` | no | two aliases; e.g. `"EXT-100"` | DOCUMENTED `:15`, `:47`, `:62` |
| `comment` → `sn_comment` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"number":"901","destination":"EXT-100","comment":"Demo shortcut"}' \
  "https://pbx.example.com/pbx/openapi.php/shortnumbers?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN. Edit example shows a queue-style destination value `"QUEUE-700"` (`:62`), implying `sn_destnumber` accepts the same destination-string convention used elsewhere (e.g. `EXT-`, `QUEUE-` prefixes), though this page doesn't itself enumerate destination types the way object pages with a "Destination Fields" section do.

## Aliases / Accepted Values

`destination`/`destnumber` → `sn_destnumber` (both alias the same field, unlike the usual destination-type-table convention — here it's a single plain field, not a per-type table).

## Request Schema

Three fields, as above.

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
- The full set of destination-string prefixes `sn_destnumber` accepts (only `EXT-` and `QUEUE-` shown, no explicit type table on this page unlike sibling objects).

## Conflicts

None found. (Wrapper's Short Number claims, W:117/327, match: path and "tenant/global" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
