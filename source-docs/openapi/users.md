# User

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN: no GET example shown.
- Scope: Admin/System (global key required)
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-12)

## Purpose

A web-login user account: username, description, email, profile, password, 2FA/IP settings, and tenant/routing-profile/restriction relations (`users.md:3` → source `user.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/user (rev #17, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/user.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `user` | DOCUMENTED `:7` |
| Primary path | `/users` | DOCUMENTED `:7` |
| Path aliases | `/user`, `/users`, `/nuser`, `/nusers`, `/us_user`, `/us_users` | DOCUMENTED `:7` |
| ID field | `us_id` | DOCUMENTED `:7` |
| Label field | `us_username` | DOCUMENTED `:7` |
| Primary source table | `us_users` | DOCUMENTED `:7` |
| Required on create | `us_username` | DOCUMENTED `:7` |

## Authentication and Scope

Managed at system scope, requires a global API key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /users` | DOCUMENTED `:11` |
| Get by ID | `GET /users/{us_id}` | DOCUMENTED `:11` |
| Create | `POST /users` | DOCUMENTED `:11` |
| Update | `PATCH /users/{us_id}` | DOCUMENTED `:11` |
| Delete | `DELETE /users/{us_id}` | DOCUMENTED `:11` |
| PUT | not documented | — |

`{us_id}` is local notation; official examples use `OBJECT_ID`.

### GET /users (list), GET /users/{us_id}

No parameters beyond the API key. Response: UNKNOWN.

### POST /users (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `username` → `us_username` | **yes** | | DOCUMENTED `:7`, `:15` |
| `name` → `us_username` | no | second alias for the **same** source field as `username` | DOCUMENTED `:15` |
| `description` → `us_description` | no | | DOCUMENTED `:15` |
| `email` → `us_email` | no | | DOCUMENTED `:15` |
| `profile_id` / `userprofile_id` → `us_up_id` | no | two aliases | DOCUMENTED `:15` |
| `password` → `us_password` | no (per alias table; example always includes it) | **secret** | DOCUMENTED `:15` |
| `use_ldap` → `us_useldap` | no | | DOCUMENTED `:15` |
| `ip_filter` → `us_ipfilter` | no | | DOCUMENTED `:15` |
| `two_factor_type` → `us_2fatype` | no | | DOCUMENTED `:15` |
| `never_expire` → `us_neverexpire` | no | | DOCUMENTED `:15` |
| `dynamic_ip` → `us_dynamicip` | no | | DOCUMENTED `:15` |
| `tenant_ids` | no (example only) | array of tenant IDs; not in the alias table but used in the create example | DOCUMENTED `:51-53` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"username":"demo-user","description":"Demo API user","email":"demo@example.com","profile_id":2,"password":"SYNTHETIC_SECRET","tenant_ids":[1]}' \
  "https://pbx.example.com/pbx/openapi.php/users"
```

### PATCH /users/{us_id}

Same fields, plus:
- an undocumented raw field `force_change: true` used directly in the edit example (`:68`) — not in the alias table.
- **Relation-replacement PATCH** (`:83-103`): `tenant_ids`, `routingprofile_ids`, `allowed_userprofile_ids` — replaces (not merges) the user's tenant/routing-profile/allowed-profile relations.
- **Restriction PATCH** (`:105-125`): `queue_restrictions`, `extension_restrictions`, `provider_restrictions` — arrays of IDs restricting the user to those queues/extensions/providers.

### DELETE /users/{us_id}

"Check references before deleting" — prose caution only, no documented cascade behavior.

## Request Schema

See field tables above. Two documented write "shapes" beyond plain field updates: relation-replacement and restriction-list PATCH bodies.

## Response Schema

UNKNOWN — no GET example anywhere on the page.

## Aliases / Accepted Values

Full alias table above (`:15`). `two_factor_type`/`us_2fatype` values not enumerated (UNKNOWN).

## Security Notes

- **`password` writes `us_password` directly** — this endpoint sets a real login password.
- `ip_filter`, `two_factor_type`, `never_expire`, `dynamic_ip` are security-control fields for the account itself.
- `email` is PII.
- A GET response, if it returns `us_password` or the 2FA/IP-filter configuration in plaintext, would be a credential/security-control leak — **unconfirmed either way, since no response schema is documented**.
- → **SEC-REQ-12**: BLOCK LIVE until a response schema is established and confirmed not to include `us_password` or 2FA secrets, given this object's high sensitivity (a web-login account, MiRTA's `POST /auth/token` explicitly mints tokens against these same identities).

## Demo Considerations

Not fixturable: no response shape documented, and the object represents a real login account.

## Live Considerations

Not a Live candidate until SEC-REQ-12 is resolved. Given the credential/account nature, this should probably remain out of Live scope entirely regardless of allowlisting, pending a business decision — flagged for the final review.

## Unknowns

- Full response shape (list and single) — is `us_password` ever returned?
- `two_factor_type` enum values.
- Cascade behavior on delete.
- Whether `name`/`username` being two aliases for one field means the last one wins, or a conflict is rejected.

## Conflicts

None found. (Wrapper's User claims, W:93/303, path and system scope match.)

## Verification Notes

DOCUMENTED from rev #17. No call has been made.
