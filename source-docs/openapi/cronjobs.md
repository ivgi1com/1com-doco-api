# Cron Job

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A scheduled task that fires a single destination on a cron-style schedule (`cronjobs.md:3` → source `cron-job.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/cron-job (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/cron-job.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `cronjob` | DOCUMENTED `:7` |
| Primary path | `/cronjobs` | DOCUMENTED `:7` |
| Path aliases | `/cronjob`, `/cronjobs`, `/cron_job`, `/cron_jobs` | DOCUMENTED `:7` |
| ID field | `cr_id` | DOCUMENTED `:7` |
| Label field | `cr_name` | DOCUMENTED `:7` |
| Primary source table | `cr_cronjobs` | DOCUMENTED `:7` |
| Required on create | `cr_name` | DOCUMENTED `:7` |

## Authentication and Scope

"Normally tenant-scoped. With a global API key, use `global=1`..." (`:3`) — one of the 8 `global=1`-capable resources.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /cronjobs?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:91-92` |
| Get by ID | `GET /cronjobs/{cr_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /cronjobs?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /cronjobs/{cr_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /cronjobs/{cr_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /cronjobs (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `cr_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `type` → `cr_type` | no | e.g. `"CALL"` | DOCUMENTED `:15`, `:53` |
| `node_id` → `cr_no_id` | no | PBX node reference | DOCUMENTED `:15` |
| `active` → `cr_active` | no | e.g. `"yes"`/`"no"` | DOCUMENTED `:15`, `:54`, `:71` |
| `once` → `cr_once` | no | | DOCUMENTED `:15` |
| `minute`, `hour`, `day`, `month`, `year`, `weekday` → `cr_minute`, `cr_hour`, `cr_day`, `cr_month`, `cr_year`, `cr_weekday` | no | standard cron schedule fields | DOCUMENTED `:15`, `:55-56` |
| `timezone` → `cr_timezone` | no | e.g. `"Europe/Rome"` | DOCUMENTED `:15`, `:57` |
| `run` → `cr_run` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Nightly Job","type":"CALL","active":"yes","minute":"0","hour":"2","timezone":"Europe/Rome"}' \
  "https://pbx.example.com/pbx/openapi.php/cronjobs?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

- `type`: `"CALL"` observed.

**Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `CRONJOB` | `destination`, `destinations` |

Same naming pattern noted on Flow: `destinations` appears as an alias of the single destination type here, not as the generic wrapper-object convention.

## Request Schema

Field table above; standard cron schedule fields plus 1 destination type.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

No credential- or PII-shaped field documented. A cron job can trigger arbitrary destinations on a schedule, which is an automation/business-logic concern rather than a data-exposure one. Status held at UNKNOWN pending schema confirmation.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Plausible read candidate once a response schema exists; writes (a cron job triggers real actions on schedule) warrant the same caution as other action-configuring objects.

## Unknowns

- GET response shape.
- Full `type` enum.
- Cron field value formats/ranges (standard cron syntax assumed, not explicitly stated).

## Conflicts

None found. (Wrapper's Cron Job claims, W:115/325, match: path and "tenant/global" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
