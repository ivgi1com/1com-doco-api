# Tenant

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN: no GET example shown.
- Scope: Admin/System (global key required)
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-11)

## Purpose

A tenant configuration object: name, code, billing code, timezone, and links to routing profiles (`tenants.md:3` → source `tenant.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/tenant (rev #17, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/tenant.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `tenant` | DOCUMENTED `:7` |
| Primary path | `/tenants` | DOCUMENTED `:7` |
| Path aliases | `/tenants` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `te_id` | DOCUMENTED `:7` |
| Label field | `te_name` | DOCUMENTED `:7` |
| Primary source table | `te_tenants` | DOCUMENTED `:7` |
| Required on create | `te_name`, `te_code` | DOCUMENTED `:7` |

## Authentication and Scope

"Managed at system scope and requires a global API key" (`:3`). Per `_common.md` §2, a global read-only key can read but writes need `read_only_api_key` avoidance (not stated per-page beyond the standard error table, `:80`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /tenants` | DOCUMENTED `:11` |
| Get by ID | `GET /tenants/{te_id}` | DOCUMENTED `:11` |
| Create | `POST /tenants` | DOCUMENTED `:11` |
| Update | `PATCH /tenants/{te_id}` | DOCUMENTED `:11` |
| Delete | `DELETE /tenants/{te_id}` | DOCUMENTED `:11` |
| PUT | not documented | — |

`{te_id}` is local notation; the official examples use the placeholder `OBJECT_ID`.

### GET /tenants (list), GET /tenants/{te_id}

No parameters beyond the API key. Response: UNKNOWN (no example shown).

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/tenants"
```

### POST /tenants (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `te_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `code` → `te_code` | **yes** | | DOCUMENTED `:7`, `:15` |
| `billingcode` / `billing_code` → `te_billingcode` | no | two aliases for the same field | DOCUMENTED `:15` |
| `timezone` → `te_timezone` | no | e.g. `Europe/Rome` | DOCUMENTED `:15`, `:48` |
| `routing_profile_id` → `te_rp_id` | no | | DOCUMENTED `:15` |
| `campaign_routing_profile_id` → `te_campaign_rp_id` | no | | DOCUMENTED `:15` |
| `fax_routing_profile_id` → `te_fax_rp_id` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Tenant","code":"TESTTENANT","timezone":"Europe/Rome"}' \
  "https://pbx.example.com/pbx/openapi.php/tenants"
```

### PATCH /tenants/{te_id}

Accepts the same fields, plus an example showing an undocumented raw field `te_payment_type` used directly (not through the alias table) (`:62-63`) — the API accepts source-table field names in addition to aliases, per the create note "Use the short aliases shown above or the source field names" (`:39`).

### DELETE /tenants/{te_id}

"Check references before deleting configuration used by routing or reporting" (`:70`) — no cascading-delete behavior is documented; this is a caution note, not a stated mechanism.

## Request Schema

Field table above. Both alias and raw source-table field names are accepted (`:39`).

## Response Schema

UNKNOWN for every operation — no example given anywhere on the page.

## Aliases / Accepted Values

Alias table above (`:15`). `timezone` accepts IANA zone strings (example: `Europe/Rome`).

## Security Notes

- `te_billingcode` is business-sensitive (billing identifier).
- No credential-shaped field is documented for Tenant itself.
- Delete has no documented safety check beyond a prose warning — a Live delete (if ever considered) would need its own confirmation step, out of scope for a read-only Live allowlist.
- → **SEC-REQ-11**: response schema must be established (spec or authorized read) before any Live read exposure; writes excluded from Live regardless, per instructions §9.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Reads only, pending SEC-REQ-11. Writes never Live.

## Unknowns

- GET response shape (list and single).
- HTTP status codes.
- Full set of fields beyond the 7 aliased ones (e.g. does `te_payment_type` have documented values?).
- Delete cascade/reference-check behavior.

## Conflicts

None found. (Wrapper's Tenant claims, W:92/302, path and system scope match.)

## Verification Notes

DOCUMENTED from rev #17. No call has been made.
