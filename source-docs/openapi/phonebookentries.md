# Phone Book Entry

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-25)

## Purpose

A single contact row inside a Phone Book, with values keyed by phone-book item code (e.g. `NAME`, `PHONE1`, `EMAIL`) (`phonebookentries.md:3` → source `phone-book-entry.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/phone-book-entry (rev #7, updated 2026-06-29). Snapshot: `source-docs/raw/mirta-openapi/phone-book-entry.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `phonebookentry` | DOCUMENTED `:7` |
| Primary path | `/phonebookentries` | DOCUMENTED `:7` |
| Path aliases | `/phonebookentry`, `/phonebookentries`, `/phonebook_entry`, `/phonebook_entries`, `/phonebookcontact`, `/phonebookcontacts`, `/phonebook_contact`, `/phonebook_contacts` | DOCUMENTED `:7` |
| ID field | `pe_id` | DOCUMENTED `:7` |
| Label field | `pe_id` (same as ID field — this object has no separate name/label field) | DOCUMENTED `:7` |
| Primary source table | `pe_phonebookentries` | DOCUMENTED `:7` |
| Required on create | `phonebook_id`, and **at least one value** | DOCUMENTED `:7` |

Note: this is the only object so far whose label field equals its ID field, and the only one whose "required on create" is a conditional ("at least one value") rather than a specific field name.

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /phonebookentries?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /phonebookentries/{pe_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /phonebookentries?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /phonebookentries/{pe_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /phonebookentries/{pe_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### GET /phonebookentries — filter by parent phone book (`:90-97`)

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries?tenant=TESTTENANT&phonebook_id=12"
```

"Filters the phone book entry list by parent `phonebook_id`. The aliases `pbid` and `pe_pb_id` are also accepted" (`:92`).

### POST /phonebookentries (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `phonebook_id`/`pbid` → `pe_pb_id` | **yes** | two aliases; parent Phone Book reference | DOCUMENTED `:7`, `:15` |
| `values`/`fields` → `pd_phonebookdetails` keyed by `pi_code` | **at least one** | two aliases for the same mechanism | DOCUMENTED `:7`, `:15`, `:19` |
| `details` → `pd_phonebookdetails` rows | alternative form | detail rows directly | DOCUMENTED `:15`, `:20` |
| Top-level item codes (`NAME`, `PHONE1`, `PHONE2`, `EMAIL`, `ROUTING`, ...) | alternative form | sent directly as top-level keys | DOCUMENTED `:15`, `:20` |

"Send values as a `values` or `fields` object, as top-level item codes, or as detail rows containing `pi_id` or `pi_code` and a value" (`:20`) — **three equivalent request shapes** for the same underlying data.

"Sending an empty string or null for a value clears that field from the entry" (`:21`).

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"phonebook_id":12,"values":{"NAME":"Demo Contact","PHONE1":"+15550100","EMAIL":"demo@example.com","ROUTING":"EXT-100"}}' \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries?tenant=TESTTENANT"
```

### PATCH — Clear a value (`:100-113`)

```json
{"values": {"EMAIL": ""}}
```
"Removes the EMAIL detail row for the selected entry while leaving other values unchanged."

### GET, DELETE

Standard patterns; response UNKNOWN.

## Request Schema

Three equivalent write shapes for entry values, as described above.

## Response Schema

UNKNOWN — no GET example on the page.

## Aliases / Accepted Values

- Parent filter: `phonebook_id`, `pbid`, `pe_pb_id`.
- Value item codes: `NAME`, `PHONE1`, `PHONE2`, `EMAIL`, `ROUTING` (from the Phone Book layout example; the full `pi_phonebookitems` enumeration is not given on either page).

## Security Notes

- **This object holds actual contact PII**: names, phone numbers, email addresses.
- Unlike Phone Book (the container), this is the object whose response, if returned via a Live read, would expose real contact data across a tenant's phone book.
- → **SEC-REQ-25**: REVIEW REQUIRED. Establish the response schema before any Live consideration, and apply a default-deny allowlist scoped to the phone book's own declared layout (since arbitrary `pi_code` values could theoretically hold more than the 5 commonly seen ones).

## Demo Considerations

Not fixturable yet: no response shape documented. If ever built, use only obviously synthetic names/numbers/emails (already the project convention).

## Live Considerations

Not a Live candidate until SEC-REQ-25 is resolved.

## Unknowns

- GET response shape — specifically, is it a flat object of resolved item-code→value pairs, or a raw `pd_phonebookdetails` row array?
- Full `pi_phonebookitems` code enumeration.
- Whether `details`-form entries (`pi_id`/`pi_code` + value) can express something `values`/`fields` cannot.

## Conflicts

None found. (Wrapper's Phone Book Entry claims, W:119/329, match: path and tenant scope; create requirement description matches "`phonebook_id` + at least one value".)

## Verification Notes

DOCUMENTED from rev #7. No call has been made.
