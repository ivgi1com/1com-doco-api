# Provisioning Phone

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-26)

## Purpose

A phone provisioning record: MAC address, model, filename, a password, and an HTTP user/password pair (`:3`, `:15`). The page does not describe what the HTTP credentials authenticate.

## Official Sources

- https://manual.mirtapbx.com/books/api/page/provisioning-phone (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/provisioning-phone.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `provisioningphone` | DOCUMENTED `:7` |
| Primary path | `/provisioningphones` | DOCUMENTED `:7` |
| Path aliases | `/phone`, `/phones`, `/provisioningphones`, `/provisioning_phones`, `/provisioning_phone` | DOCUMENTED `:7` |
| ID field | `ph_id` | DOCUMENTED `:7` |
| Label field | `ph_name` | DOCUMENTED `:7` |
| Primary source table | `ph_phones` | DOCUMENTED `:7` |
| Required on create | `ph_name`, `ph_mac` | DOCUMENTED `:7` |

## Authentication and Scope

Tenant-scoped; tenant keys require `tenant=`; writes need a writable key (`:3`).

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /provisioningphones?tenant=` | DOCUMENTED `:11` |
| Get by ID | `GET /provisioningphones/{ph_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /provisioningphones?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /provisioningphones/{ph_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /provisioningphones/{ph_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /provisioningphones (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `ph_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `mac` → `ph_mac` | **yes** | e.g. `"001122334455"` | DOCUMENTED `:7`, `:15`, `:47` |
| `model_id` → `ph_pm_id` | no | phone model reference | DOCUMENTED `:15`, `:48` |
| `password` → `ph_password` | no | **secret** (device provisioning password) | DOCUMENTED `:15` |
| `filename` → `ph_filename` | no | e.g. `"demo-001122334455.cfg"` | DOCUMENTED `:15`, `:49` |
| `http_user` → `ph_http_user` | no | | DOCUMENTED `:15`, `:63` |
| `http_password` → `ph_http_password` | no | **secret** (purpose not described; name implies HTTP authentication) | DOCUMENTED `:15`, `:64` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Desk Phone","mac":"001122334455","model_id":1,"filename":"demo-001122334455.cfg"}' \
  "https://pbx.example.com/pbx/openapi.php/provisioningphones?tenant=TESTTENANT"
```

PATCH example setting HTTP credentials (`:58-66`):

```bash
curl -X PATCH -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"http_user":"phone-user","http_password":"SYNTHETIC_SECRET"}' \
  "https://pbx.example.com/pbx/openapi.php/provisioningphones/OBJECT_ID?tenant=TESTTENANT"
```

### GET, DELETE

Standard patterns; response UNKNOWN.

## Request Schema

Field table above.

## Response Schema

UNKNOWN — no GET example on the page.

## Security Notes

- **Two distinct secrets are writable here**: `ph_password` and `ph_http_password` (with `ph_http_user`). The page does not describe either one's purpose; both are credential-shaped by name, and the example uses `"change-this-password"` (`:64`).
- `ph_mac` is a hardware identifier — a lower-sensitivity but still device-identifying field.
- This follows the same pattern already confirmed on Extension, Provider, Voicemail, Conference Room: **objects whose create/update writes real secrets, with GET behavior unconfirmed but presumptively risky**.
- → **SEC-REQ-26**: BLOCK LIVE. Assume GET may echo `ph_password`/`ph_http_password` until a response schema proves otherwise (no GET example exists).

## Demo Considerations

Not fixturable: no response shape documented, and secrets are directly involved.

## Live Considerations

Not a Live candidate until SEC-REQ-26 is resolved.

## Unknowns

- GET response shape — specifically whether `ph_password`/`ph_http_password` are ever returned.
- MAC address format validation (colon-separated vs bare 12-hex, as shown).
- Relationship between this object and the actual config file serving mechanism (out of scope of this page).

## Conflicts

None found. (Wrapper's Provisioning Phone claims, W:120/330, match: path and tenant scope.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
