# IVR

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

An interactive voice response menu: prompt media file, timeouts, and per-digit call-flow destinations (`ivrs.md:3` → source `ivr.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/ivr (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/ivr.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `ivr` | DOCUMENTED `:7` |
| Primary path | `/ivrs` | DOCUMENTED `:7` |
| Path aliases | `/ivrs` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `iv_id` | DOCUMENTED `:7` |
| Label field | `iv_name` | DOCUMENTED `:7` |
| Primary source table | `iv_ivrs` | DOCUMENTED `:7` |
| Required on create | `iv_name` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /ivrs?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /ivrs/{iv_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /ivrs?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /ivrs/{iv_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /ivrs/{iv_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /ivrs (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `iv_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `mediafile_id` → `iv_me_id` | no | references a Media File object | DOCUMENTED `:15` |
| `timeout` → `iv_timeout` | no | | DOCUMENTED `:15` |
| `digit_timeout` → `iv_digittimeout` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo IVR","mediafile_id":22,"timeout":5,"digit_timeout":3}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

**Destination fields**, one string or an array, for every DTMF key plus special conditions (`:21`, condensed — 19 destination types total, each documented individually on the page with its own PATCH example, `:89-407`):

| Destination type | Accepted aliases |
|---|---|
| `IVR_0`–`IVR_9` | `ivr_<n>`, `key_<n>`, `<n>` |
| `IVR_STAR` | `ivr_star`, `key_star`, `star` |
| `IVR_SHARP` | `ivr_sharp`, `key_sharp`, `sharp` |
| `IVR_WRONG` | `ivr_wrong`, `wrong` |
| `IVR_TIMEOUT` | `ivr_timeout`, `timeout` |
| `IVR_HANGUP` | `ivr_hangup`, `hangup` |
| `IVR_FEATURE` | `ivr_feature`, `feature` |
| `IVR_EXTENSION` | `ivr_extension`, `extension` |
| `IVR_MEDIAFILE` | `ivr_mediafile`, `mediafile` |
| `IVR_OPTIONSMEDIAFILE` | `ivr_optionsmediafile`, `optionsmediafile` |
| `CUSTOMIVR_<name>` (e.g. `CUSTOMIVR_SUPPORT`) | `customivr_<name>` | "Custom IVR destination names matching CUSTOMIVR_* are also accepted" (`:25`) |

Same alias-key-or-`destinations`-object pattern as Extension.

## Request Schema

Field table above; 19 destination types as described.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

No credential- or PII-shaped field documented for this object itself. `mediafile_id` references a Media File object, whose own content (audio) is out of scope here. Status held at UNKNOWN pending confirmation of the response schema, not because a specific risk was found.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Plausible read candidate once a response schema exists; no blocker identified so far.

## Unknowns

- GET response shape.
- `timeout`/`digit_timeout` units (assumed seconds by naming convention, not stated).
- Whether `wrong`/`timeout`/`hangup` destinations have implicit defaults if unset.

## Conflicts

None found. (Wrapper's IVR claims, W:98/308, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
