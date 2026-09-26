# Campaign Number

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-24)

## Purpose

A single target phone number within a Campaign, with call disposition, attempt count, and last-attempt/talk-time tracking (`campaignnumbers.md:3` → source `campaign-number.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/campaign-number (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/campaign-number.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `campaignnumber` | DOCUMENTED `:7` |
| Primary path | `/campaignnumbers` | DOCUMENTED `:7` |
| Path aliases | `/campaignnumber`, `/campaignnumbers`, `/campaign_number`, `/campaign_numbers` | DOCUMENTED `:7` |
| ID field | `cn_id` | DOCUMENTED `:7` |
| Label field | `cn_number` | DOCUMENTED `:7` |
| Primary source table | `cn_campaignnumbers` | DOCUMENTED `:7` |
| Required on create | `cn_ca_id`, `cn_number` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /campaignnumbers?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /campaignnumbers/{cn_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /campaignnumbers?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /campaignnumbers/{cn_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /campaignnumbers/{cn_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### GET /campaignnumbers — filter by parent campaign (`:78-86`)

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers?tenant=TESTTENANT&campaign_id=44"
```

"Filters the list by the parent campaign ID. The aliases `caid` and `cn_ca_id` are also accepted" (`:80`) — a third alias for the same filter, beyond `campaign_id`, not shown in the field-alias table itself.

### POST /campaignnumbers (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `campaign_id` → `cn_ca_id` | **yes** | parent Campaign reference | DOCUMENTED `:7`, `:15` |
| `number` → `cn_number` | **yes** | | DOCUMENTED `:7`, `:15` |
| `description` → `cn_description` | no | | DOCUMENTED `:15` |
| `disposition` → `cn_disposition` | no | e.g. `"CALLBACK"` | DOCUMENTED `:15`, `:62` |
| `attempts` → `cn_attempts` | no | | DOCUMENTED `:15`, `:63` |
| `lastattempt` → `cn_lastattempt` | no | | DOCUMENTED `:15` |
| `billsec` → `cn_billsec` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"campaign_id":44,"number":"+15550100","description":"Demo campaign target"}' \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

- Filter aliases for the parent campaign: `campaign_id`, `caid`, `cn_ca_id` (`:80`).
- `disposition`: `"CALLBACK"` observed (not stated exhaustive — likely mirrors CDR-style dispositions like `ANSWERED`/`NO ANSWER`/`BUSY`/`FAILED`, but not confirmed on this page).

## Request Schema

Field table above.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- `cn_number` is a target phone number for outbound dialing — PII, and directly tied to campaign call activity.
- `billsec`/`lastattempt`/`attempts` are call-outcome metadata, similar sensitivity to CDR fields.
- → **SEC-REQ-24**: REVIEW REQUIRED, consistent with the CDR/Simple CDR treatment (SEC-REQ-07/08) — this is effectively per-target call-outcome data.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Reads only, pending SEC-REQ-24.

## Unknowns

- GET response shape.
- Full `disposition` enum.
- Whether `campaign_id` referencing a non-existent Campaign is validated at create time.

## Conflicts

None found. (Wrapper's Campaign Number claims, W:114/324/446-461, match: path, ID, label, table, required-create fields, path aliases.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
