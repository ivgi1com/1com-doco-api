# Custom Destination

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; no obvious credential fields)

## Purpose

A configurable call-flow destination object (privacy handling, callback, channel splitting, random/weighted routing) that can be tenant-scoped or shared globally (`customdestinations.md:3` → source `custom-destination.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/custom-destination (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/custom-destination.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `customdestination` | DOCUMENTED `:7` |
| Primary path | `/customdestinations` | DOCUMENTED `:7` |
| Path aliases | `/custom`, `/customs`, `/customdestinations`, `/custom_destinations`, `/custom_destination` | DOCUMENTED `:7` |
| ID field | `cu_id` | DOCUMENTED `:7` |
| Label field | `cu_name` | DOCUMENTED `:7` |
| Primary source table | `cu_customs` | DOCUMENTED `:7` |
| Required on create | `cu_name`, `cu_ct_id` | DOCUMENTED `:7` |

## Authentication and Scope

- "Normally tenant-scoped. With a global API key, use `global=1` to manage the shared/global record set. Tenant writes still require `tenant=`" (`:3`).
- This is one of the 8 resources the Overview lists as accepting `global=1` (`_common.md` §3).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /customdestinations?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:87-88` |
| Get by ID | `GET /customdestinations/{cu_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /customdestinations?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /customdestinations/{cu_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /customdestinations/{cu_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /customdestinations (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `cu_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `type_id`/`custom_type_id` → `cu_ct_id` | **yes** | two aliases; selects the custom-destination type (e.g. privacy, callback, split, random) | DOCUMENTED `:7`, `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Custom Destination","type_id":1}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations?tenant=TESTTENANT"
```

Global list example (`:87-88`):

```bash
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/customdestinations?global=1"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

### Extended data (`:539-556`)

A distinct PATCH body form, for custom types that need extra parameters:

```json
{
  "extended_infos": [
    {"ce_name": "DOCS_VARIABLE", "ce_value": "example"}
  ]
}
```

"Adds or replaces custom destination extended rows when the custom type uses extra parameters." Field names (`ce_name`, `ce_value`) are generic key/value pairs; the actual allowed names depend on the selected `cu_ct_id` type, which is not itself enumerated on this page.

## Aliases / Accepted Values

**Destination fields**, one string or an array (`:21`, condensed — 28 destination types documented individually, `:91-537`):

| Destination type | Accepted aliases |
|---|---|
| `PRIVACY-DONTCALL` | `privacy_dontcall`, `dontcall` |
| `PRIVACY-TORTURE` | `privacy_torture`, `torture` |
| `CTONANSWER` | `onanswer` |
| `CALLBACK-CONNECTED` | `callback_connected` |
| `CTONCALLERHANGUP` | `caller_hangup` |
| `SPLITCHANNELACTION-CALLER` | `split_caller` |
| `SPLITCHANNELACTION-CALLED` | `split_called` |
| `RANDOMDESTINATION` through `RANDOMDESTINATION20` | `randomdestination[N]`, `random_destination[N]` (N = 1–20; the bare `RANDOMDESTINATION` has no numeric suffix) |

Same alias-key-or-`destinations`-object pattern as Extension.

**`cu_ct_id` (custom-destination type):** its enumeration of type IDs and what each type means (privacy vs callback vs split vs random) is **not documented on this page** — UNKNOWN which numeric ID maps to which behavior.

## Request Schema

Field table above; 28 destination types plus `extended_infos` as described.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

No credential- or PII-shaped field documented. `PRIVACY-DONTCALL`/`PRIVACY-TORTURE` are call-treatment behaviors (not data exposure). Status held at UNKNOWN pending schema confirmation, not because a specific risk was found. The `global=1` list (shared across all tenants) does raise a cross-tenant visibility question once a response schema exists — note for the final review.

## Demo Considerations

Not fixturable yet: no response shape documented, and `cu_ct_id`'s type enumeration is unknown.

## Live Considerations

Plausible read candidate once a response schema exists; the `global=1` cross-tenant listing needs its own scope decision separate from a per-tenant read.

## Unknowns

- GET response shape.
- `cu_ct_id` type enumeration (what each numeric type ID means).
- Full mapping of `ce_name`/`ce_value` valid keys per custom type.

## Conflicts

None found. (Wrapper's Custom Destination claims, W:99/309, match: path and "tenant/global depending on request" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
