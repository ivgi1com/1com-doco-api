# Voicemail

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-15)

## Purpose

A tenant voicemail mailbox: number, name, email, password, and call-flow destinations (`voicemails.md:3` → source `voicemail.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/voicemail (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/voicemail.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `voicemail` | DOCUMENTED `:7` |
| Primary path | `/voicemails` | DOCUMENTED `:7` |
| Path aliases | `/voicemails` (no other alias listed) | DOCUMENTED `:7` |
| ID field | `uniqueid` | DOCUMENTED `:7` |
| Label field | `mailbox` | DOCUMENTED `:7` |
| Primary source table | `voicemail` | DOCUMENTED `:7` |
| Required on create | `mailbox` | DOCUMENTED `:7` |

Note: unlike every other object documented so far, the ID field is the bare name `uniqueid`, and the source table is also bare (`voicemail`), not prefixed (e.g. `vm_...`). This is as documented, not a transcription simplification.

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /voicemails?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /voicemails/{uniqueid}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /voicemails?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /voicemails/{uniqueid}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /voicemails/{uniqueid}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

`{uniqueid}` local notation; official examples use `OBJECT_ID`.

### POST /voicemails (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `number` → `mailbox` | **yes** | | DOCUMENTED `:7`, `:15` |
| `name` → `fullname` | no | | DOCUMENTED `:15` |
| `email` | not in alias table; used directly in example | | DOCUMENTED `:54` |
| `password` | not in alias table; used directly in example | **secret**, mailbox PIN | DOCUMENTED `:55` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"number":"240","name":"Demo Mailbox","email":"demo@example.com","password":"1234"}' \
  "https://pbx.example.com/pbx/openapi.php/voicemails?tenant=TESTTENANT"
```

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN; delete has only a prose reference-check caution.

## Aliases / Accepted Values

**Field aliases** (`:15`): `name`→`fullname`, `number`→`mailbox`.

**Destination fields**, one string or an array (`:19`, table `:21`):

| Destination type | Accepted aliases |
|---|---|
| `VOICEMAIL-OPERATOR` | `operator`, `voicemail_operator` |
| `VOICEMAIL-FOLLOW` | `follow`, `voicemail_follow` |
| `VOICEMAIL-BROADCAST` | `broadcast`, `voicemail_broadcast` |

Same alias-key-or-`destinations`-object pattern as Extension (see `extensions.md`): each can be set via its alias key directly, or nested inside a `destinations` object.

## Request Schema

Field table above; destinations as described.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- **`password` sets a real mailbox PIN**, directly analogous to the Proxy API's VOICEMAIL list `imapuser`/`imappassword` exposure (A-77, SEC-REQ-02) that is already a blocking Proxy finding.
- `email` is PII.
- If GET echoes the mailbox password (unconfirmed — no schema shown), this repeats the exact Proxy precedent in a new API family.
- → **SEC-REQ-15**: BLOCK LIVE until a response schema is confirmed not to include the mailbox password, matching the caution already established for Proxy VOICEMAIL.

## Demo Considerations

Not fixturable: no response shape documented. If ever built, treat the mailbox password the same way the Proxy Demo treats `imapuser`/`imappassword`: fixed at `null`, never a real-looking value.

## Live Considerations

Not a Live candidate until SEC-REQ-15 is resolved.

## Unknowns

- GET response shape.
- Whether password is returned in cleartext, hashed, or omitted from reads.
- HTTP status codes.

## Conflicts

None found. (Wrapper's Voicemail claims, W:97/307, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
