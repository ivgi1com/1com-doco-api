# Conference Room

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-20)

## Purpose

A conference room (Asterisk `meetme`) with a join PIN and separate admin PIN, plus scheduling and rating fields (`conferencerooms.md:3` → source `conference-room.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/conference-room (rev unspecified in extract; updated per SOURCES.md). Snapshot: `source-docs/raw/mirta-openapi/conference-room.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `conferenceroom` | DOCUMENTED `:7` |
| Primary path | `/conferencerooms` | DOCUMENTED `:7` |
| Path aliases | `/conference`, `/conferences`, `/conferencerooms`, `/conference_rooms`, `/conference_room` | DOCUMENTED `:7` |
| ID field | `cr_id` | DOCUMENTED `:7` |
| Label field | `cr_name` | DOCUMENTED `:7` |
| Primary source table | `cr_conferencerooms` | DOCUMENTED `:7` |
| Required on create | `cr_name`, `cr_number` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /conferencerooms?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /conferencerooms/{cr_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /conferencerooms?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /conferencerooms/{cr_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /conferencerooms/{cr_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /conferencerooms (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `cr_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `number` → `cr_number` | **yes** | | DOCUMENTED `:7`, `:15` |
| `hosted` → `cr_hosted` | no | e.g. `"yes"` | DOCUMENTED `:15`, `:52` |
| `rate_id` → `cr_rrid` | no | | DOCUMENTED `:15` |
| `startdate` → `starttime` (raw) | no | | DOCUMENTED `:15` |
| `enddate` → `endtime` (raw) | no | | DOCUMENTED `:15` |
| `request_pin_mediafile_id` → `cr_requestpinmeid` | no | media file played to request the PIN | DOCUMENTED `:15` |
| `meetme` (nested object) | no | see below | DOCUMENTED `:53-58` |

**Nested `meetme` object** (not in the top-level alias table; documented only via example, `:53-58`, `:72-75`):

| Field | Notes |
|---|---|
| `pin` | **join PIN** |
| `adminpin` | **admin/moderator PIN** |
| `opts` | Asterisk MeetMe options string, e.g. `"T"` |
| `adminopts` | Asterisk MeetMe admin options string, e.g. `"AaT"` |

"The API creates and updates the related meetme row. If confno is not supplied, the conference number is combined with the tenant code" (`:19`) — `confno` itself is not otherwise documented as a request field.

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "name":"Demo Conference","number":"840","hosted":"yes",
    "meetme":{"pin":"SYNTHETIC_PIN_1","adminpin":"SYNTHETIC_PIN_2","opts":"T","adminopts":"AaT"}
  }' \
  "https://pbx.example.com/pbx/openapi.php/conferencerooms?tenant=TESTTENANT"
```

### PATCH — updating PINs (`:63-77`)

```json
{"meetme": {"pin": "SYNTHETIC_PIN_3", "adminpin": "SYNTHETIC_PIN_4"}}
```

### GET, DELETE

Standard patterns; response UNKNOWN.

## Request Schema

Top-level fields plus the nested `meetme` object, both above.

## Response Schema

UNKNOWN — no GET example on the page.

## Aliases / Accepted Values

- `opts`/`adminopts`: Asterisk MeetMe option-letter strings (e.g. `T` = allow duration timer, `A` = admin mode, per Asterisk convention — **not confirmed by this page itself**, so the specific letter meanings are UNKNOWN here even though the strings are documented).

## Security Notes

- **`meetme.pin` and `meetme.adminpin` are join/admin credentials for the conference room.** The admin PIN grants moderator control (mute/kick/lock) over a live conference — a significant privilege if leaked.
- These are directly analogous to Extension's technology secret and Voicemail's mailbox password — a third confirmed pattern of "create/update writes a real secret" in this API.
- → **SEC-REQ-20**: BLOCK LIVE. Assume GET returns the `meetme` object (including PINs) until proven otherwise, following the same precautionary logic as Extension/Provider — this API has now shown that nested related-object data is a recurring documented behavior even where GET examples are missing.

## Demo Considerations

Not fixturable: no response shape documented, and PIN exposure is unconfirmed.

## Live Considerations

Not a Live candidate until SEC-REQ-20 is resolved and PINs are confirmed excluded from any read response.

## Unknowns

- GET response shape — specifically whether `meetme.pin`/`adminpin` are ever returned.
- `confno`'s exact role and whether it's directly settable.
- Full `opts`/`adminopts` letter-code meanings (Asterisk MeetMe convention, not documented on this page).

## Conflicts

None found. (Wrapper doesn't cover Conference Room beyond the resource matrix row, W:108/318, which matches: path, scope, create fields.)

## Verification Notes

DOCUMENTED. No call has been made.
