# DID

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-16)

## Purpose

A tenant's inbound phone number (DID) with country/area metadata and destination routing for voice, SMS and fax (`dids.md:3` → source `did.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/did (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/did.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `did` | DOCUMENTED `:7` |
| Primary path | `/dids` | DOCUMENTED `:7` |
| Path aliases | `/dids` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `di_id` | DOCUMENTED `:7` |
| Label field | `di_number` | DOCUMENTED `:7` |
| Primary source table | `di_dids` | DOCUMENTED `:7` |
| Required on create | `di_number` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /dids?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /dids/{di_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /dids?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /dids/{di_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /dids/{di_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /dids (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `number` → `di_number` | **yes** | | DOCUMENTED `:7`, `:15` |
| `country` → `di_country` | no | | DOCUMENTED `:15` |
| `area` → `di_area` | no | | DOCUMENTED `:15` |
| `comment` → `di_comment` | no | | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"number":"+15550100","country":"US","area":"212","comment":"Demo inbound DID"}' \
  "https://pbx.example.com/pbx/openapi.php/dids?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN.

## Aliases / Accepted Values

**Destination fields**, one string or an array (`:21`):

| Destination type | Accepted aliases |
|---|---|
| `DID` | `destination`, `did` |
| `DID-UNCONDITIONAL` | `unconditional` |
| `DID-SMS` | `sms` |
| `DID-FAXSUCCESS` | `faxsuccess`, `fax_success` |

Same alias-key-or-`destinations`-object pattern as Extension.

## Request Schema

Field table above; 4 destination types as described.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- `di_number` is a phone number — customer PII/business identifier at minimum, and directly comparable to the Proxy API's `info-dids` finding (A-53), where the JSON response joined the DID row with the **entire tenant row**, including `te_recordingpassword`, `te_recordinguser`, `te_recordinghost`, `te_billingcode`.
- This is a **different API family** (OpenAPI vs Proxy), so that finding is not carried over as evidence — but it is a directly relevant precedent for what to check once a response schema becomes available: does OpenAPI's DID GET join any tenant-level fields?
- → **SEC-REQ-16**: REVIEW REQUIRED. Establish the response schema first and specifically check for any joined tenant/credential fields before considering Live, given the exact precedent in the sibling API.

## Demo Considerations

Not fixturable yet: no response shape documented.

## Live Considerations

Not a Live candidate until SEC-REQ-16 is resolved (response schema + join check).

## Unknowns

- GET response shape — critically, whether it joins any tenant-level data (per the Proxy precedent above).
- Whether `number` accepts multiple formats (E.164 only, or also local formats) — the example uses `+15550100` but no format constraint is documented.

## Conflicts

None found. (Wrapper's DID claims, W:102/312/375-402, match: path, ID, label, table, required-create field, path alias, destination aliases.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
