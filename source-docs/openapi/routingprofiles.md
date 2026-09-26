# Routing Profile

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Admin/System (global key required)
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; likely PASS given low apparent sensitivity)

## Purpose

A named routing configuration (e.g. voice/fax/campaign routing) referenced by Tenant (`routingprofiles.md:3` → source `routing-profile.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/routing-profile (rev #17, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/routing-profile.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `routingprofile` | DOCUMENTED `:7` |
| Primary path | `/routingprofiles` | DOCUMENTED `:7` |
| Path aliases | `/routingprofiles`, `/routing_profiles`, `/routing_profile` | DOCUMENTED `:7` |
| ID field | `rp_id` | DOCUMENTED `:7` |
| Label field | `rp_name` | DOCUMENTED `:7` |
| Primary source table | `rp_routingprofiles` | DOCUMENTED `:7` |
| Required on create | `rp_name` | DOCUMENTED `:7` |

## Authentication and Scope

Managed at system scope, requires a global API key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /routingprofiles` | DOCUMENTED `:11` |
| Get by ID | `GET /routingprofiles/{rp_id}` | DOCUMENTED `:11` |
| Create | `POST /routingprofiles` | DOCUMENTED `:11` |
| Update | `PATCH /routingprofiles/{rp_id}` | DOCUMENTED `:11` |
| Delete | `DELETE /routingprofiles/{rp_id}` | DOCUMENTED `:11` |
| PUT | not documented | — |

`{rp_id}` local notation; official examples use `OBJECT_ID`.

### POST /routingprofiles (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `rp_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `description` → `rp_description` | no | | DOCUMENTED `:15` |
| `type` → `rp_type` | no | example value `"VOICE"` | DOCUMENTED `:15`, `:48` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Voice Routing","description":"Demo outbound routing","type":"VOICE"}' \
  "https://pbx.example.com/pbx/openapi.php/routingprofiles"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN; delete has only a prose reference-check caution.

## Request Schema

Field table above.

## Response Schema

UNKNOWN — no GET example shown.

## Aliases / Accepted Values

`type`: `"VOICE"` observed (Tenant's aliases include `campaign_routing_profile_id` and `fax_routing_profile_id`, implying at least `CAMPAIGN` and `FAX` types plausibly exist — **not confirmed on this page**, so left UNKNOWN rather than inferred).

## Security Notes

Nothing credential- or PII-shaped documented. Lowest apparent sensitivity of the admin/system objects processed so far, but response schema is still unconfirmed, so status stays UNKNOWN pending that.

## Demo Considerations

Not fixturable: no response shape documented.

## Live Considerations

Reads plausible once a response schema exists; no obvious blocker found, but not yet PASS without confirmation.

## Unknowns

- GET response shape.
- Full `type` enum (VOICE confirmed; CAMPAIGN/FAX suspected from Tenant's field names only, not confirmed here).

## Conflicts

None found. (Wrapper's Routing Profile claims, W:95/305, match: path and global scope.)

## Verification Notes

DOCUMENTED from rev #17. No call has been made.
