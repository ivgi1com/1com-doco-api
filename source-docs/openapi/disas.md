# DISA

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-22)

## Purpose

A Direct Inward System Access object: a PIN-gated entry point that grants outbound dialing access, with caller ID and timeout controls (`disas.md:3` → source `disa.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/disa (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/disa.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `disa` | DOCUMENTED `:7` |
| Primary path | `/disas` | DOCUMENTED `:7` |
| Path aliases | `/disa`, `/disas` | DOCUMENTED `:7` |
| ID field | `ds_id` | DOCUMENTED `:7` |
| Label field | `ds_name` | DOCUMENTED `:7` |
| Primary source table | `ds_disas` | DOCUMENTED `:7` |
| Required on create | `ds_name` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /disas?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /disas/{ds_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /disas?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /disas/{ds_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /disas/{ds_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /disas (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `ds_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `mediafile_id` → `ds_me_id` | no | prompt played on entry | DOCUMENTED `:15` |
| `pin` → `ds_pin` | no | **access PIN, grants outbound dialing** | DOCUMENTED `:15`, `:48` |
| `outbound` → `ds_outbound` | no | e.g. `"yes"` | DOCUMENTED `:15`, `:49` |
| `blockcid` → `ds_blockcid` | no | | DOCUMENTED `:15` |
| `calleridnum` → `ds_calleridnum` | no | | DOCUMENTED `:15` |
| `calleridname` → `ds_calleridname` | no | | DOCUMENTED `:15` |
| `digitstimeout` → `ds_digitstimeout` | no | | DOCUMENTED `:15` |
| `responsetimeout` → `ds_responsetimeout` | no | | DOCUMENTED `:15` |
| `looponattempt` → `ds_looponattempt` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo DISA","mediafile_id":22,"pin":"SYNTHETIC_PIN","outbound":"yes"}' \
  "https://pbx.example.com/pbx/openapi.php/disas?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Request Schema

Field table above.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- **`pin` grants outbound dialing access to the PBX** — arguably the single most operationally dangerous credential documented so far, since a leaked DISA PIN allows an outside caller to place calls (and incur cost/fraud) through the tenant's trunk, not merely to view configuration.
- → **SEC-REQ-22**: BLOCK LIVE outright. Even if a response schema later shows the PIN is not echoed on GET, the write side (create/update a DISA PIN) is itself high-risk and should never be Live-reachable without a distinct, explicit fraud-risk review — this is closer to Dial/Auth Token in severity than to a typical configuration object.

## Demo Considerations

Not fixturable: no response shape documented, and the object's purpose (granting real dialing access) makes even a synthetic fixture potentially misleading about what the real feature does.

## Live Considerations

Not a Live candidate. See Security Notes — treat like Dial/Auth Token, not like a standard CRUD object.

## Unknowns

- GET response shape — whether `ds_pin` is ever returned.
- Full accepted values for `blockcid`, `looponattempt`.

## Conflicts

None found. (Wrapper's DISA claims, W:111/321, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
