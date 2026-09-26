# Paging Group

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-19; raised from REVIEW REQUIRED in the Stage C review for consistency)

## Purpose

An intercom/paging group: a set of extensions that can be paged together, with an optional PIN (`:3`, `:15`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/paging-group (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/paging-group.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `paginggroup` | DOCUMENTED `:7` |
| Primary path | `/paginggroups` | DOCUMENTED `:7` |
| Path aliases | `/paging`, `/pagings`, `/paginggroup`, `/paginggroups`, `/intercom`, `/intercoms` | DOCUMENTED `:7` |
| ID field | `pa_id` | DOCUMENTED `:7` |
| Label field | `pa_name` | DOCUMENTED `:7` |
| Primary source table | `pa_paginggroups` | DOCUMENTED `:7` |
| Required on create | `pa_name`, `pa_number` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /paginggroups?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /paginggroups/{pa_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /paginggroups?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /paginggroups/{pa_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /paginggroups/{pa_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /paginggroups (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `pa_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `number` → `pa_number` | **yes** | | DOCUMENTED `:7`, `:15` |
| `pin` → `pa_pin` | no | **PIN/secret** | DOCUMENTED `:15`, `:54` |
| `bidirectional` → `pa_bidirectional` | no | e.g. `"no"`/`"yes"` | DOCUMENTED `:15`, `:55`, `:69` |
| `checkinuse` → `pa_checkinuse` | no | | DOCUMENTED `:15` |
| `mediafile_id` → `pa_me_id` | no | | DOCUMENTED `:15` |
| `manualheader` → `pa_manualheader` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Paging Group","number":"830","pin":"1234","bidirectional":"no"}' \
  "https://pbx.example.com/pbx/openapi.php/paginggroups?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

**Destination fields**, one string or an array (`:19`, table `:21`):

| Destination type | Accepted aliases |
|---|---|
| `PAGING` | `extensions`, `peers`, `members`, `destination` |

Example: `{"extensions": [100, 101]}` (`:93-96`) — a list of raw extension numbers, distinguishing it from the `EXT-`-string convention used elsewhere.

## Request Schema

Field table above; 1 destination type as described.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- **`pin` → `pa_pin`** is a credential-shaped field written directly (example `"1234"`, `:54`). The page does not describe what it protects.
- → **SEC-REQ-19**: BLOCK LIVE. It follows the same rule as Voicemail, Conference Room, Provider and Provisioning Phone: a write of a credential/PIN plus an undocumented GET means BLOCK LIVE until a response schema shows `pa_pin` is excluded.

## Demo Considerations

Not fixturable: no response shape documented, and the PIN field's read-exposure is unconfirmed.

## Live Considerations

Not a Live candidate until SEC-REQ-19 is resolved.

## Unknowns

- GET response shape — specifically whether `pa_pin` is returned.
- Whether `extensions` accepts extension IDs or bare numbers consistently (the one example uses bare numbers `100`, `101`).

## Conflicts

None found. (Wrapper's Paging Group claims, W:107/317, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
