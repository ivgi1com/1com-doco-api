# Music On Hold

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A music-on-hold class: playlist of media files, volume, randomization, and streaming engine settings (`musiconholds.md:3` → source `music-on-hold.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/music-on-hold (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/music-on-hold.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `musiconhold` | DOCUMENTED `:7` |
| Primary path | `/musiconholds` | DOCUMENTED `:7` |
| Path aliases | `/moh`, `/music`, `/musiconholds`, `/music_on_hold`, `/music_on_holds` | DOCUMENTED `:7` |
| ID field | `mu_id` | DOCUMENTED `:7` |
| Label field | `mu_name` | DOCUMENTED `:7` |
| Primary source table | `mu_musiconholds` | DOCUMENTED `:7` |
| Required on create | `mu_name` | DOCUMENTED `:7` |

## Authentication and Scope

"Normally tenant-scoped. With a global API key, use `global=1`..." (`:3`) — one of the 8 `global=1`-capable resources.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /musiconholds?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:90-91` |
| Get by ID | `GET /musiconholds/{mu_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /musiconholds?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /musiconholds/{mu_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /musiconholds/{mu_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /musiconholds (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `mu_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `custom` → `mu_custom` | no | e.g. `"yes"` | DOCUMENTED `:15`, `:53` |
| `volume` → `mu_volume` | no | numeric, can be negative (example: `0`, later `-3`) | DOCUMENTED `:15`, `:54`, `:70` |
| `randomizeorder` → `mu_randomizeorder` | no | | DOCUMENTED `:15` |
| `streamengine` → `mu_streamengine` | no | | DOCUMENTED `:15` |
| `format` → `format` (raw) | no | e.g. `"slin"` | DOCUMENTED `:15`, `:56` |
| `application` → `application` (raw) | no | | DOCUMENTED `:15` |
| `mode` → `mode` (raw) | no | e.g. `"playlist"` | DOCUMENTED `:15`, `:55` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Music On Hold","custom":"yes","volume":0,"mode":"playlist","format":"slin"}' \
  "https://pbx.example.com/pbx/openapi.php/musiconholds?tenant=TESTTENANT"
```

### PATCH /musiconholds/{mu_id} — Entries and default (`:110-131`)

A distinct write shape replacing the playlist entries and marking a default:

```json
{
  "entries": [{"me_id": 22, "order": 1}, {"me_id": 23, "order": 2}],
  "default": true
}
```

### GET, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

**Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `MUSICONHOLD` | `mediafile`, `mediafiles`, `destination` |

Same alias-key-or-`destinations`-object pattern as Extension. Example: `{"mediafile": [22]}` (`:103` — a media file ID, not the `EXT-`-style string convention used elsewhere).

## Request Schema

Field table above, plus the `entries`/`default` write shape.

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
- Full `mode` enum (only `"playlist"` observed).
- Relationship between `default: true` and the `global=1` scope (is "default" per-tenant or per-global-set?).

## Conflicts

None found. (Wrapper's Music On Hold claims, W:106/316, match: path and "tenant/global" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
