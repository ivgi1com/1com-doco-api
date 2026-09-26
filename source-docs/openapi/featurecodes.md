# Feature Code

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A dialable feature code (e.g. `*880`) mapped to a single destination (`featurecodes.md:3` → source `feature-code.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/feature-code (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/feature-code.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `featurecode` | DOCUMENTED `:7` |
| Primary path | `/featurecodes` | DOCUMENTED `:7` |
| Path aliases | `/feature`, `/features`, `/featurecodes`, `/feature_codes`, `/feature_code` | DOCUMENTED `:7` |
| ID field | `fe_id` | DOCUMENTED `:7` |
| Label field | `fe_code` | DOCUMENTED `:7` |
| Primary source table | `fe_features` | DOCUMENTED `:7` |
| Required on create | `fe_code` | DOCUMENTED `:7` |

## Authentication and Scope

"Normally tenant-scoped. With a global API key, use `global=1`..." (`:3`) — one of the 8 `global=1`-capable resources.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /featurecodes?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:87-88` |
| Get by ID | `GET /featurecodes/{fe_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /featurecodes?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /featurecodes/{fe_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /featurecodes/{fe_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /featurecodes (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `code` → `fe_code` | **yes** | e.g. `"*880"` | DOCUMENTED `:7`, `:15`, `:52` |
| `comment` → `fe_comment` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"code":"*880","comment":"Demo feature code"}' \
  "https://pbx.example.com/pbx/openapi.php/featurecodes?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

**Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `FEATURE` | `destination`, `feature` |

Same alias-key-or-`destinations`-object pattern as Extension (unlike Flow/Cron Job, here `destinations` is not itself listed as an alias).

## Request Schema

Two fields plus the destination type.

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
- Full set of valid feature code prefixes/patterns (only `*880` shown as an example).

## Conflicts

None found. (Wrapper's Feature Code claims, W:116/326, match: path and "tenant/global" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
