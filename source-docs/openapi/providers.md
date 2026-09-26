# Provider

## Status

- Evidence: DOCUMENTED (official page, richest field/alias set so far). Response schema UNKNOWN.
- Scope: Admin/System (global key; read-only global key can list/read)
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-14)

## Purpose

A SIP trunk/provider object (SIP or PJSIP), with realtime peer/endpoint configuration, caller ID overrides, and SMS gateway settings (`providers.md:3` → source `provider.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/provider (rev #14, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/provider.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `provider` | DOCUMENTED `:7` |
| Primary path | `/providers` | DOCUMENTED `:7` |
| Path aliases | `/provider`, `/providers` | DOCUMENTED `:7` |
| ID field | `pr_id` | DOCUMENTED `:7` |
| Label field | `pr_name` | DOCUMENTED `:7` |
| Primary source table | `pr_providers` | DOCUMENTED `:7` |
| Required on create | `pr_name` | DOCUMENTED `:7` |

## Authentication and Scope

- "Providers are global system objects and always require a global API key" (`:19`).
- "Readonly global API keys can list and read providers, but create, update, and delete require the full global API key" (`:20`) — the clearest per-resource statement of the read/write key split found so far.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /providers` | DOCUMENTED `:11` |
| Get by ID | `GET /providers/{pr_id}` | DOCUMENTED `:11` |
| Create | `POST /providers` | DOCUMENTED `:11` |
| Update | `PATCH /providers/{pr_id}` | DOCUMENTED `:11` |
| Delete | `DELETE /providers/{pr_id}` | DOCUMENTED `:11` |
| PUT | not documented | — |

`{pr_id}` local notation; official examples use `OBJECT_ID`.

### POST /providers (create)

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `pr_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `peername` / `peer_name` → `pr_peername` | no | two aliases | DOCUMENTED `:15` |
| `tech` → `pr_tech` | not stated | `SIP` or `PJSIP` (examples) | DOCUMENTED `:15`, `:58`, `:116` |
| `host` → `pr_host` | not stated | | DOCUMENTED `:15` |
| `disabled` → `pr_disabled` | no | | DOCUMENTED `:15` |
| `penalty` → `pr_penalty` | no | | DOCUMENTED `:15` |
| `realtime` / `use_realtime` → `pr_userealtime` | no | two aliases | DOCUMENTED `:15` |
| `calleridmod_id` → `pr_ca_id` | no | | DOCUMENTED `:15` |
| `callerid`/`caller_id`/`callerid_number`/`caller_id_number` → `pr_callerid` | no | **four** aliases for one field | DOCUMENTED `:15` |
| `calleridname`/`callerid_name`/`caller_id_name` → `pr_calleridname` | no | three aliases | DOCUMENTED `:15` |
| `did_mod_id` → `pr_did_ca_id` | no | | DOCUMENTED `:15` |
| `max_out_channels` → `pr_maxoutchannels` | no | | DOCUMENTED `:15` |
| `ignore_sip_cause` → `pr_ignoresipcause` | no | | DOCUMENTED `:15` |
| `ignore_busy` → `pr_ignorebusy` | no | | DOCUMENTED `:15` |
| `sms_protocol` → `pr_smsprotocol` | no | | DOCUMENTED `:15` |
| `sms_url` → `pr_smsurl` | no | | DOCUMENTED `:15` |
| `sms_user` → `pr_smsuser` | no | | DOCUMENTED `:15` |
| `sms_password` → `pr_smspassword` | no | **secret** | DOCUMENTED `:15` |
| `canreinvite` → chan_sip realtime `sipfriends.canreinvite` | no | direct-media control, chan_sip only | DOCUMENTED `:15`, `:25` |
| `direct_media` → PJSIP `ps_endpoints.direct_media` | no | direct-media control, PJSIP only | DOCUMENTED `:15`, `:25` |
| `username`, `password`, `transport`, `codecs`, `qualify`, `qualifyfreq`, `nat`, `sendrpid` | not in alias table | used directly in examples (realtime peer/endpoint fields) | DOCUMENTED `:61-73`, `:118-129`, `:144` |

- `password` in the create example is the **trunk registration secret** (`:62`), separate from `sms_password`.

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{
    "name":"Demo PJSIP Provider","peername":"demo-pjsip-provider","tech":"PJSIP",
    "realtime":"on","host":"198.51.100.20","username":"demo-trunk",
    "password":"SYNTHETIC_SECRET","transport":"UDP","codecs":["ulaw","alaw"],
    "qualify":"yes","qualifyfreq":60,"direct_media":"no",
    "callerid":"+15550100","callerid_name":"Demo Provider"
  }' \
  "https://pbx.example.com/pbx/openapi.php/providers"
```

### Important Notes (page-level, `:17-25`)

- SIP providers manage the related `sipfriends` realtime row when realtime is enabled.
- PJSIP providers manage `ps_endpoints`, `ps_aors`, `ps_auths`, and `ps_endpoint_id_ips` when realtime is enabled.
- Changing a provider's technology removes old realtime rows before creating rows for the new technology — a **destructive side effect** of a technology change.
- `callerid`/`callerid_name` override extension-derived caller ID for calls routed through the provider.

### GET, PATCH, DELETE

Standard patterns. PATCH examples show partial updates including realtime credential rotation (`:140-151`, `password: "new-secret"`). Response UNKNOWN for GET.

## Request Schema

Full alias/field table above — the richest of any object documented so far (25+ fields).

## Response Schema

UNKNOWN — no GET example shown for this object either.

## Aliases / Accepted Values

- `tech`: `SIP`, `PJSIP` (examples only).
- Extensive alias table above (`:15`).

## Security Notes

- **`password` (create/PATCH examples) is the trunk's registration secret.** The page says SIP providers "manage the related sipfriends realtime row" (`:21`); where the PJSIP secret is stored (e.g. `ps_auths`) is not stated.
- **`sms_password` → `pr_smspassword`** is a second, distinct secret (SMS gateway credential).
- If GET ever returns these nested realtime rows, this would leak trunk and SMS credentials. Extension's single-object GET is documented to "include related technology data" (`extension.md:42`), though its exact fields are also unknown; Provider's page says nothing about GET contents.
- → **SEC-REQ-14**: BLOCK LIVE. By analogy with Extension, assume Provider's GET may return realtime/auth data until a response schema proves otherwise — do not treat the absence of an explicit response example as absence of risk.

## Demo Considerations

Not fixturable: no response shape documented, and real secrets are plausibly involved.

## Live Considerations

Not a Live candidate without SEC-REQ-14 resolution and an explicit allowlist proven to exclude `password`/`sms_password`/realtime auth rows.

## Unknowns

- GET response shape (list and single) — critically, whether it echoes secrets.
- Full realtime schema for `ps_endpoints`/`ps_aors`/`ps_auths`/`ps_endpoint_id_ips`/`sipfriends`.
- Whether `disabled: ""` (used in the PATCH example, `:86`) means "false" or is a different sentinel than a boolean.

## Conflicts

None found. (Wrapper's Provider claims, W:96/306, match: path and global/admin scope.)

## Verification Notes

DOCUMENTED from rev #14. No call has been made.
