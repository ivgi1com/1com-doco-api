# Phone Book

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **UNKNOWN** (pending schema; container object, not directly PII itself — see Phone Book Entry)

## Purpose

A phone-book container defining which columns (layout) its entries expose, and whether extensions/short numbers are auto-included (`phonebooks.md:3` → source `phone-book.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/phone-book (rev #7, updated 2026-06-29). Snapshot: `source-docs/raw/mirta-openapi/phone-book.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `phonebook` | DOCUMENTED `:7` |
| Primary path | `/phonebooks` | DOCUMENTED `:7` |
| Path aliases | `/phonebook`, `/phonebooks`, `/phone_book`, `/phone_books` | DOCUMENTED `:7` |
| ID field | `pb_id` | DOCUMENTED `:7` |
| Label field | `pb_name` | DOCUMENTED `:7` |
| Primary source table | `pb_phonebooks` | DOCUMENTED `:7` |
| Required on create | `pb_name` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /phonebooks?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /phonebooks/{pb_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /phonebooks?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /phonebooks/{pb_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /phonebooks/{pb_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /phonebooks (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `pb_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `include_extensions`/`includeext` → `pb_includeext` | no | two aliases | DOCUMENTED `:15` |
| `include_short_numbers`/`includeshortnum` → `pb_includeshortnum` | no | two aliases | DOCUMENTED `:15` |
| `layout`/`items` → `pl_phonebooklayouts` | no | two aliases; array of phone-book item codes | DOCUMENTED `:15`, `:55-61` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Phone Book","include_extensions":"no","include_short_numbers":"no","layout":["NAME","PHONE1","PHONE2","EMAIL","ROUTING"]}' \
  "https://pbx.example.com/pbx/openapi.php/phonebooks?tenant=TESTTENANT"
```

### PATCH — Replace layout (`:96-113`)

A distinct write shape replacing `pl_phonebooklayouts` rows for the phone book:

```json
{"layout": ["NAME", "PHONE1", "EMAIL", "ROUTING"]}
```

### GET, DELETE

Standard patterns; response UNKNOWN.

## Important Notes (`:17-21`)

- "The layout field replaces the phone book field layout. Values can be phone book item codes such as `NAME`, `PHONE1`, `EMAIL`, and `ROUTING`, or `pi_phonebookitems` IDs."
- "When layout is omitted on create, the API creates the default layout `NAME`, `PHONE1`, `PHONE2`, `EMAIL`, `ROUTING`."
- "Deleting a phone book removes its layout rows, entries, entry details, and phone assignment rows" — a **documented cascading delete**, unlike every other object's generic "check references" caution.

## Aliases / Accepted Values

- `layout` items: `NAME`, `PHONE1`, `PHONE2`, `EMAIL`, `ROUTING` observed (not stated exhaustive — other `pi_phonebookitems` codes plausibly exist).

## Request Schema

Field table above, plus the layout-array write shape.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

The Phone Book container itself holds only structural metadata (name, layout, inclusion flags), not contact data directly — actual contact PII lives in Phone Book Entry (`phonebookentries.md`). No credential-shaped field here.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Plausible read candidate once a response schema exists.

## Unknowns

- GET response shape.
- Full `pi_phonebookitems` code enumeration beyond the 5 observed.
- Cascading-delete confirmation (documented in prose; not independently verified).

## Conflicts

None found. (Wrapper's Phone Book claims, W:118/328, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #7. No call has been made.
