# Setting

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-17)

## Purpose

A generic tenant or global key/value configuration setting (`settings.md:3` → source `setting.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/setting (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/setting.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `setting` | DOCUMENTED `:7` |
| Primary path | `/settings` | DOCUMENTED `:7` |
| Path aliases | `/settings` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `se_id` | DOCUMENTED `:7` |
| Label field | `se_code` | DOCUMENTED `:7` |
| Primary source table | `se_settings` | DOCUMENTED `:7` |
| Required on create | `se_code` | DOCUMENTED `:7` |

## Authentication and Scope

"Normally tenant-scoped. With a global API key, use `global=1` to manage the shared/global record set. Tenant writes still require `tenant=`" (`:3`) — one of the 8 `global=1`-capable resources.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /settings?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:81-82` |
| Get by ID | `GET /settings/{se_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /settings?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /settings/{se_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /settings/{se_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /settings (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `code` → `se_code` | **yes** | e.g. `"API_DOCS_EXAMPLE"` | DOCUMENTED `:7`, `:15`, `:46` |
| `value` → `se_value` | no | e.g. `"enabled"`/`"disabled"` | DOCUMENTED `:15`, `:47`, `:61` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"code":"DEMO_SETTING","value":"enabled"}' \
  "https://pbx.example.com/pbx/openapi.php/settings?tenant=TESTTENANT"
```

Global list (`:81-82`):

```bash
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/settings?global=1"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Request Schema

Two fields only: `code` (required) and `value` (a free string).

## Response Schema

UNKNOWN — no GET example on the page.

## Aliases / Accepted Values

No enum for `se_code` is documented — it is a free-form settings key, meaning the object can hold **arbitrary named configuration values**, some of which may themselves be sensitive (e.g. an API URL, a feature flag, or potentially a stored credential-like value) depending on what `se_code`/`se_value` pairs the PBX itself defines internally.

## Security Notes

- Because `se_code`/`se_value` are generic key/value pairs with no documented enumeration, this object is a **potential catch-all for sensitive configuration** — its risk profile can't be assessed generically; it depends entirely on which settings a given PBX stores here.
- The `global=1` list is shared across all tenants once its schema is confirmed.
- → **SEC-REQ-17**: REVIEW REQUIRED. Before any Live exposure (even reads), enumerate what `se_code` values actually exist on a real system (via spec or authorized observation) and apply a default-deny allowlist by `se_code`, not just by response field — a name-only field allowlist is insufficient if the risk is in specific *values* under a generic key/value shape.

## Demo Considerations

Not fixturable: no response shape documented, and the generic key/value nature makes any invented example potentially misleading about real settings.

## Live Considerations

Not a Live candidate until SEC-REQ-17 is resolved.

## Unknowns

- GET response shape.
- The full enumeration of `se_code` values a PBX may hold.
- Whether any settings are write-once, read-protected, or system-reserved.

## Conflicts

None found. (Wrapper's Setting claims, W:104/314, match: path and "tenant/global" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
