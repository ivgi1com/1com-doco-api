# Tenant Variable

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-21)

## Purpose

A tenant-scoped named variable/value pair, similar in shape to Setting but tenant-only (no `global=1`) and with a `locked` flag (`tenantvariables.md:3` → source `tenant-variable.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/tenant-variable (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/tenant-variable.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `tenantvariable` | DOCUMENTED `:7` |
| Primary path | `/tenantvariables` | DOCUMENTED `:7` |
| Path aliases | `/variable`, `/variables`, `/tenantvariable`, `/tenantvariables`, `/tenant_variable`, `/tenant_variables` | DOCUMENTED `:7` |
| ID field | `tv_id` | DOCUMENTED `:7` |
| Label field | `tv_value` | DOCUMENTED `:7` |
| Primary source table | `tv_tenantvariables` | DOCUMENTED `:7` |
| Required on create | `tv_al_id` | DOCUMENTED `:7` |

Note: the required-create field is `tv_al_id` (an "allowed-variable ID" foreign key, by naming convention — not confirmed by prose), not the label field `tv_value` — the second object seen (after Condition) where the required field differs from the label field.

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`). Unlike Setting, this object has **no** `global=1` option documented.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /tenantvariables?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /tenantvariables/{tv_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /tenantvariables?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /tenantvariables/{tv_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /tenantvariables/{tv_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /tenantvariables (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `variable_id` → `tv_al_id` | **yes** | references an "allowed variable" definition | DOCUMENTED `:7`, `:15` |
| `value` → `tv_value` | no | | DOCUMENTED `:15` |
| `comment` → `tv_comment` | no | | DOCUMENTED `:15` |
| `locked` → `tv_locked` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"variable_id":1,"value":"demo-value","comment":"Demo variable value"}' \
  "https://pbx.example.com/pbx/openapi.php/tenantvariables?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Request Schema

Field table above.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- Like Setting, `tv_value` is a generic value slot whose actual content depends on which "allowed variable" (`tv_al_id`) it's attached to — the risk profile is not assessable generically.
- `locked` suggests some variables are protected from ordinary changes, implying at least some are more sensitive than others.
- → **SEC-REQ-21**: REVIEW REQUIRED, same reasoning as Setting (SEC-REQ-17): enumerate the "allowed variable" definitions before any Live exposure and apply a default-deny allowlist by `tv_al_id`, not just by response field name.

## Demo Considerations

Not fixturable: no response shape documented, and the generic value-slot nature makes any invented example potentially misleading.

## Live Considerations

Not a Live candidate until SEC-REQ-21 is resolved.

## Unknowns

- GET response shape.
- The full enumeration of "allowed variable" (`tv_al_id`) definitions and what each one controls.
- Whether `locked` variables reject writes with a specific error, or silently no-op.

## Conflicts

None found. (Wrapper's Tenant Variable claims, W:110/320, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
