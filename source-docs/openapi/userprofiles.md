# User Profile

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Admin/System (global key required)
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-13)

## Purpose

A permission-profile object assigned to Users, defining a set of privileges (`userprofiles.md:3` → source `user-profile.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/user-profile (rev #17, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/user-profile.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `userprofile` | DOCUMENTED `:7` |
| Primary path | `/userprofiles` | DOCUMENTED `:7` |
| Path aliases | `/userprofile`, `/userprofiles`, `/user_profile`, `/user_profiles` | DOCUMENTED `:7` |
| ID field | `up_id` | DOCUMENTED `:7` |
| Label field | `up_name` | DOCUMENTED `:7` |
| Primary source table | `up_userprofiles` | DOCUMENTED `:7` |
| Required on create | `up_name` | DOCUMENTED `:7` |

## Authentication and Scope

Managed at system scope, requires a global API key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /userprofiles` | DOCUMENTED `:11` |
| Get by ID | `GET /userprofiles/{up_id}` | DOCUMENTED `:11` |
| Create | `POST /userprofiles` | DOCUMENTED `:11` |
| Update | `PATCH /userprofiles/{up_id}` | DOCUMENTED `:11` |
| Delete | `DELETE /userprofiles/{up_id}` | DOCUMENTED `:11` |
| PUT | not documented | — |

`{up_id}` local notation; official examples use `OBJECT_ID`.

### GET /userprofiles (list), GET /userprofiles/{up_id}

No parameters beyond the API key. Response: UNKNOWN.

### POST /userprofiles (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `up_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `description` → `up_description` | no | | DOCUMENTED `:15` |
| `reserved` → `up_reserved` | no | meaning not explained | DOCUMENTED `:15` |
| `userpanel` / `user_panel` / `extension_user_profile` → `up_userpanel` | no | three aliases for one field | DOCUMENTED `:15` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Profile","description":"Demo documentation profile","user_panel":"yes"}' \
  "https://pbx.example.com/pbx/openapi.php/userprofiles"
```

### PATCH /userprofiles/{up_id}

Same fields, plus a distinct **privilege-replacement PATCH** (`:77-98`):

```json
{
  "privileges": [
    {"id": 1, "param1": "read"},
    {"id": 2, "param1": "write"}
  ]
}
```

"Replaces the profile privilege list. Privilege IDs must exist in the system privilege table" (`:79`). The `param1` field's accepted values are shown as `"read"`/`"write"` only in this one example — not stated as exhaustive.

### DELETE /userprofiles/{up_id}

Prose caution only ("check references").

## Request Schema

Field tables above, plus the privilege-array body.

## Response Schema

UNKNOWN — no GET example shown. The `privileges` array's own read shape (does GET return it?) is also UNKNOWN.

## Aliases / Accepted Values

Alias table above. `param1`: `"read"`, `"write"` observed in the one example (not stated exhaustive).

## Security Notes

- This object controls **authorization** (privileges) for Users. A response or write vulnerability here has systemic impact (privilege escalation), not just data exposure.
- No credential-shaped field.
- → **SEC-REQ-13**: response schema must be established before any Live read; given the privilege-control role, treat any Live consideration cautiously even for reads (could reveal the full permission model to a browser client).

## Demo Considerations

Not fixturable: no response shape documented.

## Live Considerations

Not a Live candidate until SEC-REQ-13 is resolved.

## Unknowns

- GET response shape.
- Full `param1` value enum.
- The system privilege table's own id→meaning mapping (not documented at all).
- `up_reserved`'s meaning.

## Conflicts

None found. (Wrapper's User Profile claims, W:94/304/424-444, match: path, ID, label, table, required-create field, path aliases, global scope.)

## Verification Notes

DOCUMENTED from rev #17. No call has been made.
