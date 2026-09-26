# Extension

## Status

- Evidence: DOCUMENTED (official page). Response schemas are UNKNOWN: prose only, no schema or example.
- Scope: Tenant
- Access: Mixed (read and write)
- Security review: **BLOCK LIVE** (SEC-REQ-03)

## Purpose

A tenant's phone extensions: their number, name and technology (SIP, PJSIP, CUSTOM, VIRTUAL), the per-technology row, and call-forwarding destinations (`extension.md:3`, `:25-27`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/extension (rev #17, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/extension.md`. All line citations below refer to this file.
- Overview objects table: `overview-and-examples.md:38`.
- Spec: not available (U-18).

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `extension` | DOCUMENTED `:7` |
| Primary path | `/extensions` | DOCUMENTED `:7` |
| Path aliases | `/extensions` (no other alias listed) | DOCUMENTED `:7` |
| Lookup by number | `/extensions/number/<number>` | DOCUMENTED `:49-56`; ov:32 |
| ID field | `ex_id` | DOCUMENTED `:7` |
| Label field | `ex_number` | DOCUMENTED `:7` |
| Primary source table | `ex_extensions` | DOCUMENTED `:7` |
| Required on create | `number` or `ex_number` | DOCUMENTED `:7`; ov:38 |

## Authentication and Scope

- Tenant-scoped. Tenant API keys must send `tenant=<code>` (`:3`). The Overview lists the scope as "Tenant API key" (ov:38).
- Writes need a writable (full) key. A read-only key gets `read_only_api_key` on a write (`:3`, `:455`).
- A global key listing across tenants with no `tenant` falls under the general rule (`_common.md` §2). The Extension page itself does not mention global keys: UNKNOWN for this resource.
- `global=1`: not listed for Extension (ov:38), so not supported as far as documented.

## Operations

All paths are under `https://<pbx>/pbx/openapi.php`. `{ex_id}` is local notation: the official examples use the placeholders `EXTENSION_ID` / `OBJECT_ID`, and the page names the ID field `ex_id`.

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /extensions?tenant=` | DOCUMENTED `:11`, `:31-38` |
| Get by ID | `GET /extensions/{ex_id}?tenant=` | DOCUMENTED `:11`, `:40-47` |
| Get by number | `GET /extensions/number/{number}?tenant=` | DOCUMENTED `:49-56` |
| Create | `POST /extensions?tenant=` | DOCUMENTED `:11`, `:58-143` |
| Update | `PATCH /extensions/{ex_id}?tenant=` | DOCUMENTED `:11`, `:145-164` |
| Delete | `DELETE /extensions/{ex_id}?tenant=` | DOCUMENTED `:11`, `:166-174` |
| PUT | not documented | — |

### GET /extensions (list)

**Purpose:** "Returns extension ID, number, name, and technology for the tenant" (`:33`).

| Parameter | Location | Required | Type | Description | Evidence |
|---|---|---:|---|---|---|
| `tenant` | query | yes, for tenant keys | string | tenant code | DOCUMENTED `:3` |
| `key` / `X-API-Key` / `Authorization: Bearer` | query / header | one of them | string | API key | DOCUMENTED ov:18 |

- Filters, pagination and sorting: none documented (UNKNOWN).
- **Response:** described in prose as ID, number, name and technology.
  - The exact JSON field names are UNKNOWN (plausibly `ex_id`, `ex_number`, `ex_name`, `ex_tech`, but not stated).
  - The envelope (array vs object) is UNKNOWN.
  - The status code is UNKNOWN.

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=TESTTENANT"
```

### GET /extensions/{ex_id} and GET /extensions/number/{number}

**Purpose:**
- By ID: reads one extension "and includes related technology data" (`:42`).
- By number: "Keep the tenant parameter when the same number may exist in multiple tenants" (`:51`).

| Parameter | Location | Required | Type | Description | Evidence |
|---|---|---:|---|---|---|
| `ex_id` | path | yes | UNKNOWN (examples use `EXTENSION_ID` / `OBJECT_ID`) | internal ID | DOCUMENTED `:11`, `:46` |
| `number` | path (`/number/{number}`) | yes | string | extension number | DOCUMENTED `:55` |
| `tenant` | query | yes, for tenant keys | string | | DOCUMENTED `:3` |

**Response:**
- Fields are UNKNOWN. The page says only that the technology row is included (`:42`).
- The regular extension `GET` returns the **cached** `st_states` value; live state is `/extensions/state` (`extension-state.md:5`).

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/number/100?tenant=TESTTENANT"
```

### POST /extensions (create)

**Purpose:** create an extension of one technology (`:58-143`).
**Body:** JSON (`Content-Type: application/json`).

| Field | Required | Type | Notes | Evidence |
|---|---:|---|---|---|
| `number` (alias of `ex_number`) | **yes** (or `ex_number`) | string | | DOCUMENTED `:7`, `:15` |
| `name` → `ex_name` | no | string | | DOCUMENTED `:15` |
| `tech` → `ex_tech` | not stated | enum `SIP`, `PJSIP`, `CUSTOM`, `VIRTUAL` | | DOCUMENTED `:15`, `:25` |
| `password` → "technology secret/password" | not stated | string | **secret** | DOCUMENTED `:15` |
| `sipusername` → `username` | no | string | if omitted, the API generates `<number>-<tenantcode>` | DOCUMENTED `:15`, `:26` |
| `mailbox` → `ex_mailbox` | not stated | UNKNOWN | | DOCUMENTED `:15` |
| `email` → `ex_email` | not stated | string | PII | DOCUMENTED `:15` |
| `callgroups` → `ex_callgroup` | not stated | array of integers (example) | | DOCUMENTED `:15`, `:156` |
| `pickupgroups` → `ex_pickupgroup` | not stated | array of integers (example) | | DOCUMENTED `:15`, `:159` |
| `realextensions` → `virtual_items` | for VIRTUAL (per example) | array of integers ("real extension IDs") | | DOCUMENTED `:15`, `:127`, `:137` |
| `sipfriends` | no | object | SIP (chan_sip) peer fields, e.g. `host`, `nat` | DOCUMENTED `:27`, `:97-100` |
| `ps_endpoints` | no | object | PJSIP endpoint, e.g. `transport`, `direct_media` | DOCUMENTED `:27`, `:72-75` |
| `ps_aors` | no | object | PJSIP AOR, e.g. `max_contacts`, `remove_existing` | DOCUMENTED `:27`, `:76-79` |
| `ps_auths` | no | object | PJSIP auth. Fields not shown (UNKNOWN). Treated as credential-bearing for security review only; that is an assumption, not documented | DOCUMENTED `:27` (name only) |
| `ce_customextensions` | for CUSTOM (per example) | object | e.g. `ce_peername`, `ce_destination` | DOCUMENTED `:27`, `:117-120` |
| `ve_virtualextensions` | no | object | fields not shown (UNKNOWN) | DOCUMENTED `:27` (name only) |
| destination aliases (see below) | no | string or array | | DOCUMENTED `:19-21` |

- The full column list of `ex_extensions` and of the nested tech tables is UNKNOWN (no schema).
- **Response:** UNKNOWN (not shown).

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"number":"100","name":"Demo User","tech":"PJSIP","password":"SYNTHETIC_SECRET","ps_aors":{"max_contacts":1}}' \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=TESTTENANT"
```

### PATCH /extensions/{ex_id} (update)

- "Updates only the supplied extension fields" (`:147`). Accepts the same fields and aliases as create.
- Destinations can be set either by alias key or through a `destinations` object keyed by destination type (`:306-322`).
- **Response:** UNKNOWN.

```bash
curl -X PATCH -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo User - Desk","destinations":{"EXT-NOANSWER":["VOICEMAIL-100"]}}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=TESTTENANT"
```

### DELETE /extensions/{ex_id}

- "Deletes the extension, its technology row, and extension destinations" (`:168`). This is a cascading delete.
- **Response:** UNKNOWN.

## Aliases / Accepted Values

**Field aliases:** listed in the create table above (`:15`).

**Destination fields** accept one destination string or an array of them (e.g. `EXT-100`, `VOICEMAIL-100`) (`:19`):

| Destination type | Accepted aliases |
|---|---|
| `EXT-UNCONDITIONAL` | `unconditional` |
| `EXT-NOANSWER` | `onnoanswer`, `noanswer`, `no_answer` |
| `EXT-BUSY` | `onbusy`, `busy` |
| `EXT-OFFLINE` | `onoffline`, `offline` |
| `EXT-ONCONDITION` | `oncondition`, `condition` |
| `EXT-DIALBYNAME` | `dialbyname`, `dial_by_name` |
| `EXT-ONLYALLOWCALL` | `onlyallowcall`, `only_allow_call` |
| `EXT-DONOTCALL` | `donotcall`, `do_not_call` |

(`:21`)

**The full list of destination-string prefixes** (`EXT-`, `VOICEMAIL-`, "or another supported destination type") is UNKNOWN.

## Request Schema

- No formal schema on the page. The tables above are assembled from the alias table, the notes and the examples.

## Response Schema

- UNKNOWN for every operation.
- Documented in prose only:
  - the list returns ID, number, name and technology;
  - get-one adds the technology data.

## Security Notes

- **Get by ID / by number:**
  - The response "includes related technology data" (`:42`).
  - For PJSIP that is `ps_auths` and for SIP it is `sipfriends`. Those tables hold the technology secret that the `password` field writes to (`:15`).
  - Treat the response as **credential-bearing** until a schema proves otherwise.
- **List:** ID, number, name and technology, but the exact fields are unconfirmed (REVIEW REQUIRED).
- **PII:** `ex_email`, names.
- **Proxy precedent:**
  - The Proxy API's `INFO EXTENSIONS` JSON carried web passwords, tokens and 2FA data (DOCS_AUDIT A-40).
  - Proxy `QUEUELOGS` duplicated every value under numeric keys (A-55).
  - These are different API families, so not evidence here, but the same risk class.
- → **SEC-REQ-03** (`docs/SECURITY.md`): a default-deny response allowlist before any Live exposure.

## Demo Considerations

- Suitable for Demo only after a response schema is established (spec or authorized observation). Until then, any fixture would invent fields.
- Use synthetic values only.
- Never include `password` or technology-secret fields in a fixture, not even as `null`, unless the schema shows them.

## Live Considerations

- **Reads:** Live only under SEC-REQ-03, with an explicit field allowlist and tenant-scoped keys.
- **Writes** (create, update, and the cascading delete) change PBX configuration. Not a Live candidate without a separate security decision.

## Unknowns

- All response fields, envelopes and status codes.
- Filters and pagination on the list.
- Which create fields are required per `tech` (beyond `number`).
- The fields inside `ps_auths` and `ve_virtualextensions`.
- The full list of destination prefixes.
- Global-key behavior for this object.
- The type of `ex_id`.

## Conflicts

- None between official sources.
- Correction to an earlier local assumption (OA-10): `realextensions` maps to `virtual_items` (`:15`), not a generic "virtual extension mapping".

## Verification Notes

- DOCUMENTED from rev #17 only.
- No spec is available and no call has been made.
- Re-verify against the spec's `paths./extensions` and its component schemas when one is supplied.
