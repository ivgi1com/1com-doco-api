# Caller ID Blacklist

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; caller-number PII only, no credentials)

## Purpose

A blocked caller ID entry with a reason and insertion timestamp (`calleridblacklists.md:3` → source `caller-id-blacklist.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/caller-id-blacklist (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/caller-id-blacklist.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `calleridblacklist` | DOCUMENTED `:7` |
| Primary path | `/calleridblacklists` | DOCUMENTED `:7` |
| Path aliases | `/calleridblacklist`, `/calleridblacklists`, `/callerid_blacklist`, `/callerid_blacklists`, `/blacklist`, `/blacklists` | DOCUMENTED `:7` |
| ID field | `bl_id` | DOCUMENTED `:7` |
| Label field | `bl_callerid` | DOCUMENTED `:7` |
| Primary source table | `bl_blacklists` | DOCUMENTED `:7` |
| Required on create | `bl_callerid` | DOCUMENTED `:7` |

## Authentication and Scope

"Normally tenant-scoped. With a global API key, use `global=1`..." (`:3`) — one of the 8 `global=1`-capable resources.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /calleridblacklists?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:81-82` |
| Get by ID | `GET /calleridblacklists/{bl_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /calleridblacklists?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /calleridblacklists/{bl_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /calleridblacklists/{bl_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /calleridblacklists (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `callerid` → `bl_callerid` | **yes** | phone number being blocked | DOCUMENTED `:7`, `:15` |
| `reason` → `bl_reason` | no | | DOCUMENTED `:15` |
| `inserted` → `bl_inserted` | no (read-audit field, per naming) | insertion timestamp, by naming convention — not explicitly described | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"callerid":"+15550100","reason":"Demo blocked caller"}' \
  "https://pbx.example.com/pbx/openapi.php/calleridblacklists?tenant=TESTTENANT"
```

Global list (`:81-82`):

```bash
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/calleridblacklists?global=1"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Request Schema

Field table above.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- `bl_callerid` is a phone number — PII, but not a credential.
- No credential-shaped field documented.
- Status held at UNKNOWN pending schema confirmation, not because a specific risk was found — this is one of the lower-sensitivity objects in the catalog so far.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Plausible read candidate once a response schema exists — likely one of the easier objects to eventually allowlist, given the low field sensitivity.

## Unknowns

- GET response shape.
- Whether `inserted` is settable or server-managed only (its "no" required-status is inferred from naming, not stated).

## Conflicts

None found. (Wrapper's Caller ID Blacklist claims, W:112/322, match: path and "tenant/global" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
