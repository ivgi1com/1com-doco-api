# MiRTA PBX OpenAPI — Claude Reference

> Source: MiRTA PBX official API manual, OpenAPI chapter.
> Purpose: structured source-of-truth reference for Claude/AI-assisted development.
> OpenAPI version documented by MiRTA: 3.0.3.
> This file intentionally does not contain real API keys, tenant credentials, or customer data.

## Source
Official manual: https://manual.mirtapbx.com/books/api/chapter/openapi

## Core contract

### Base endpoint
`/pbx/openapi.php`

The specification is documented as available through:
- `GET /pbx/openapi.php`
- `GET /pbx/openapi.php?spec=1`
- `GET /pbx/openapi.php/openapi.json`
- `GET /pbx/openapi.php/swagger.json`

### Authentication
The API key may be supplied as:
- query parameter: `key=...`
- header: `X-API-Key: ...`
- bearer token: `Authorization: Bearer ...`

Tenant API keys require tenant scoping. Global/admin keys have broader scope. Write operations require an appropriate writable/full key. Never expose keys in frontend code or committed examples.

### Common REST patterns
- List: `GET /openapi.php/<objects>?tenant=TENANTCODE`
- Get: `GET /openapi.php/<objects>/<ID>?tenant=TENANTCODE`
- Create: `POST /openapi.php/<objects>?tenant=TENANTCODE`
- Update: `PATCH /openapi.php/<objects>/<ID>?tenant=TENANTCODE`
- Delete: `DELETE /openapi.php/<objects>/<ID>?tenant=TENANTCODE`

Not every resource supports every method. Reporting/live endpoints are often read-only.

## OpenAPI chapter index

The official OpenAPI chapter currently contains 38 pages/resources:

1. Overview and Examples
2. Extension State
3. Auth Token
4. Dial
5. CDR
6. Simple CDR
7. Extension
8. Tenant
9. User
10. User Profile
11. Routing Profile
12. Provider
13. Voicemail
14. IVR
15. Custom Destination
16. Condition
17. Hunt List
18. DID
19. Queue
20. Setting
21. Media File
22. Music On Hold
23. Paging Group
24. Conference Room
25. Flow
26. Tenant Variable
27. DISA
28. Caller ID Blacklist
29. Campaign
30. Campaign Number
31. Cron Job
32. Feature Code
33. Short Number
34. Phone Book
35. Phone Book Entry
36. Provisioning Phone
37. AI Analysis
38. AI Logs

## High-level endpoint catalog

| Resource | Typical path | Scope / behavior |
|---|---|---|
| Extension State | `/extensions/state` | Read-only live state; tenant + number/ext |
| Auth Token | `/auth/token` | Token generation/reset; privileged |
| Dial | `/dial` | POST originate; tenant full key; source + dest |
| CDR | `/cdrs` | GET-only reporting |
| Simple CDR | `/simplecdrs` | GET-only reporting |
| Extension | `/extensions` | Tenant-scoped configuration; CRUD |
| Tenant | tenant resource | Admin/system scope |
| User | user resource | Admin/system scope |
| User Profile | user-profile resource | Admin/system scope |
| Routing Profile | routing-profile resource | Admin/system scope |
| Provider | provider resource | System/admin scope |
| Voicemail | voicemail resource | Tenant-scoped |
| IVR | IVR resource | Tenant-scoped |
| Custom Destination | custom-destination resource | Tenant/global depending on request |
| Condition | condition resource | Tenant-scoped |
| Hunt List | hunt-list resource | Tenant-scoped |
| DID | DID resource | Tenant-scoped |
| Queue | queue resource | Tenant-scoped |
| Setting | setting resource | Tenant/global |
| Media File | media-file resource | Tenant/global |
| Music On Hold | MOH resource | Tenant/global |
| Paging Group | paging-group resource | Tenant-scoped |
| Conference Room | conference-room resource | Tenant-scoped |
| Flow | flow resource | Tenant-scoped |
| Tenant Variable | tenant-variable resource | Tenant-scoped |
| DISA | DISA resource | Tenant-scoped |
| Caller ID Blacklist | blacklist resource | Tenant/global |
| Campaign | campaign resource | Tenant-scoped |
| Campaign Number | campaign-number resource | Tenant-scoped |
| Cron Job | cron-job resource | Tenant/global |
| Feature Code | feature-code resource | Tenant/global |
| Short Number | short-number resource | Tenant/global |
| Phone Book | phone-book resource | Tenant-scoped |
| Phone Book Entry | phone-book-entry resource | Tenant-scoped |
| Provisioning Phone | provisioning-phone resource | Tenant-scoped |
| AI Analysis | `/aianalysis` | GET-only; requires uniqueid |
| AI Logs | `/ailogs` | GET-only; JSON/CSV; defaults to current day |

## Confirmed special endpoints

### Extension State
`GET /pbx/openapi.php/extensions/state?tenant=TENANT&number=100`

Required:
- `tenant`
- `number`, or compatibility alias `ext`
- API key via supported authentication mechanism

This queries live registration/call-state behavior rather than merely the cached extension state.

### Dial
`POST /pbx/openapi.php/dial?tenant=TENANT`

Documented as an originate operation. Requires a tenant full/writable API key and request values including:
- `source`
- `dest`

### CDR
`GET /pbx/openapi.php/cdrs`

Read-only reporting endpoint.

### Simple CDR
`GET /pbx/openapi.php/simplecdrs`

Read-only reporting endpoint.

### AI Analysis
`GET /pbx/openapi.php/aianalysis`

Read-only. Requires `uniqueid`.

### AI Logs
`GET /pbx/openapi.php/ailogs`

Read-only. Supports JSON or CSV and is documented as defaulting to the current day.

## Extension resource — confirmed detail

Primary path: `/extensions`
ID field: `ex_id`
Label/number field: `ex_number`
Primary table: `ex_extensions`
Required on create: `number` or `ex_number`

Accepted aliases documented by MiRTA include:
- `number` -> `ex_number`
- `name` -> `ex_name`
- `tech` -> `ex_tech`
- `sipusername` -> `username`
- `mailbox` -> `ex_mailbox`
- `email` -> `ex_email`
- `password` -> technology secret/password
- `callgroups` -> `ex_callgroup`
- `pickupgroups` -> `ex_pickupgroup`
- `realextensions` -> virtual extension mappings

Supported technologies documented:
- SIP
- PJSIP
- CUSTOM
- VIRTUAL

Nested technology structures may include:
- `sipfriends`
- `ps_endpoints`
- `ps_aors`
- `ps_auths`
- `ce_customextensions`
- `ve_virtualextensions`

Extension destination aliases documented include:
- unconditional -> `EXT-UNCONDITIONAL`
- onnoanswer/noanswer/no_answer -> `EXT-NOANSWER`
- onbusy/busy -> `EXT-BUSY`
- onoffline/offline -> `EXT-OFFLINE`
- oncondition/condition -> `EXT-ONCONDITION`
- dialbyname/dial_by_name -> `EXT-DIALBYNAME`
- onlyallowcall/only_allow_call -> `EXT-ONLYALLOWCALL`
- donotcall/do_not_call -> `EXT-DONOTCALL`

Example patterns:
```bash
# List
curl -H "X-API-Key: TENANT_API_KEY"   "https://pbx.example.com/pbx/openapi.php/extensions?tenant=TENANT"

# Get by ID
curl -H "X-API-Key: TENANT_API_KEY"   "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=TENANT"

# Get by number
curl -H "X-API-Key: TENANT_API_KEY"   "https://pbx.example.com/pbx/openapi.php/extensions/number/100?tenant=TENANT"

# Create
curl -X POST -H "X-API-Key: TENANT_API_KEY" -H "Content-Type: application/json"   -d '{"number":"100","name":"Demo User","tech":"PJSIP","password":"SYNTHETIC_SECRET"}'   "https://pbx.example.com/pbx/openapi.php/extensions?tenant=TENANT"

# Update
curl -X PATCH -H "X-API-Key: TENANT_API_KEY" -H "Content-Type: application/json"   -d '{"name":"Updated Demo User"}'   "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=TENANT"

# Delete
curl -X DELETE -H "X-API-Key: TENANT_API_KEY"   "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=TENANT"
```

## Security and implementation rules for Claude

1. Treat the official MiRTA OpenAPI manual/specification as authoritative over old project assumptions.
2. Never invent undocumented fields, methods, response structures, aliases, or permissions.
3. If this reference conflicts with the live OpenAPI specification from the target PBX, stop and document the discrepancy.
4. Never commit API keys, tokens, passwords, tenant secrets, customer numbers, recordings, or real customer data.
5. Keep credentials server-side.
6. For browser-facing Live functionality, expose only explicitly approved fields; use response allowlists for objects that can contain secrets.
7. Demo mode must use synthetic data only.
8. Read-only and mutating operations must be clearly distinguished.
9. Do not test POST/PATCH/DELETE against a real PBX without explicit approval and an appropriate test tenant.
10. Prefer `X-API-Key`/server-side authentication over putting credentials into URLs or frontend code.
11. Preserve tenant isolation.
12. Validate HTTP method, scope, required fields, optional fields, and response schema against the exact resource page/spec before implementation.

## How Claude should use this reference

Before implementing an OpenAPI operation:
1. Locate the resource in this index.
2. Consult the corresponding official MiRTA resource page or the PBX OpenAPI JSON specification for exact fields.
3. Determine authentication scope and tenant requirements.
4. Determine whether the operation is read-only or mutating.
5. Record required/optional parameters and request body schema.
6. Record expected response schema and errors.
7. Implement with server-side credential handling.
8. For Demo, construct synthetic fixtures matching the verified schema.
9. For Live, apply explicit response-field security policy before returning data to the browser.
10. Add contract/security tests.

## Important completeness note

This file is a structured Claude-oriented reference/index derived from the official OpenAPI chapter and verified documentation surfaced from the official manual. It is **not a verbatim mirror of all 38 web pages**. For exact per-field schemas on each resource, Claude must consult the corresponding official page or, preferably, the OpenAPI 3.0.3 JSON document exposed by the target MiRTA PBX. This avoids freezing undocumented assumptions into the project.


---

# Expanded Endpoint Contract Tables

This section expands the catalog into implementation-oriented contracts. Values below are intended to be checked against the current official MiRTA resource page/OpenAPI JSON before code is changed.

## Authentication matrix

| Credential | Read tenant resources | Write tenant resources | System objects | Global resources |
|---|---:|---:|---:|---:|
| Tenant read-only key | Yes, own tenant | No | No | No |
| Tenant writable/full key | Yes, own tenant | Yes | No | No |
| Global/Admin key | Yes | According to key permissions | Yes | Yes where supported |

Accepted authentication transports:
- `X-API-Key: <key>` header
- `Authorization: Bearer <key>`
- `key=<key>` query parameter

For application development, credentials should stay on the server. Do not embed them in browser bundles, Demo fixtures, documentation examples, or Git.

## Standard CRUD contract

For configuration objects that support CRUD:

| Operation | Method | Pattern |
|---|---|---|
| List | GET | `/pbx/openapi.php/<plural>?tenant=<TENANT>` |
| Get | GET | `/pbx/openapi.php/<plural>/<ID>?tenant=<TENANT>` |
| Create | POST | `/pbx/openapi.php/<plural>?tenant=<TENANT>` |
| Update | PATCH | `/pbx/openapi.php/<plural>/<ID>?tenant=<TENANT>` |
| Delete | DELETE | `/pbx/openapi.php/<plural>/<ID>?tenant=<TENANT>` |

Writes require a writable key. Tenant-scoped objects require tenant context for tenant keys.

## Resource matrix

| Resource | Primary path | Scope | ID | Label / required-create fields | Mode |
|---|---|---|---|---|---|
| Extension | `/extensions` | Tenant | `ex_id` | `ex_number`; create: `number` or `ex_number` | CRUD |
| Tenant | `/tenants` | Admin/system | tenant ID | See exact resource schema | CRUD/admin |
| User | `/users` | Admin/system | user ID | See exact resource schema | CRUD/admin |
| User Profile | `/userprofiles` | Global | `up_id` | `up_name`; create: `up_name` | CRUD |
| Routing Profile | `/routingprofiles` | Admin/system | profile ID | See exact resource schema | CRUD/admin |
| Provider | `/providers` | System/admin | provider ID | See exact resource schema | CRUD/admin |
| Voicemail | `/voicemails` | Tenant | voicemail ID | See exact resource schema | CRUD |
| IVR | `/ivrs` | Tenant | IVR ID | See exact resource schema | CRUD |
| Custom Destination | `/customdestinations` | Tenant/global | object ID | See exact resource schema | CRUD |
| Condition | `/conditions` | Tenant | condition ID | See exact resource schema | CRUD |
| Hunt List | `/huntlists` | Tenant | `hu_id` | `hu_name`; create: `hu_name` | CRUD |
| DID | `/dids` | Tenant | `di_id` | `di_number`; create: `di_number` | CRUD |
| Queue | `/queues` | Tenant | `qu_id` | `qu_name`; aliases `name`, `number` | CRUD |
| Setting | `/settings` | Tenant/global | setting ID | See exact resource schema | CRUD |
| Media File | `/mediafiles` | Tenant/global | media ID | See exact resource schema | CRUD |
| Music On Hold | `/musiconholds` | Tenant/global | object ID | create includes `mu_name` | CRUD |
| Paging Group | `/paginggroups` | Tenant | object ID | create includes `pa_name`, `pa_number` | CRUD |
| Conference Room | `/conferencerooms` | Tenant | object ID | create includes `cr_name`, `cr_number` | CRUD |
| Flow | `/flows` | Tenant | object ID | create includes `fl_name` | CRUD |
| Tenant Variable | `/tenantvariables` | Tenant | object ID | create includes `tv_al_id` | CRUD |
| DISA | `/disas` | Tenant | object ID | create includes `ds_name` | CRUD |
| Caller ID Blacklist | `/calleridblacklists` | Tenant/global | object ID | create includes `bl_callerid` | CRUD |
| Campaign | `/campaigns` | Tenant | object ID | create includes `ca_name` | CRUD |
| Campaign Number | `/campaignnumbers` | Tenant | `cn_id` | create: `cn_ca_id`, `cn_number` | CRUD |
| Cron Job | `/cronjobs` | Tenant/global | object ID | create includes `cr_name` | CRUD |
| Feature Code | `/featurecodes` | Tenant/global | object ID | create includes `fe_code` | CRUD |
| Short Number | `/shortnumbers` | Tenant/global | object ID | create includes `sn_number` | CRUD |
| Phone Book | `/phonebooks` | Tenant | object ID | create includes `pb_name` | CRUD |
| Phone Book Entry | `/phonebookentries` | Tenant | object ID | create: `phonebook_id` + at least one value | CRUD |
| Provisioning Phone | `/provisioningphones` | Tenant | object ID | create: `ph_name`, `ph_mac` | CRUD |
| Extension State | `/extensions/state` | Tenant | — | `tenant` + `number`/`ext` | Read/live |
| Auth Token | `/auth/token` | Privileged | — | Verify exact action/schema | Special |
| Dial | `/dial` | Tenant writable | — | `source`, `dest` | POST/action |
| CDR | `/cdrs` | Reporting | record ID/uniqueid where supported | filters per resource spec | Read-only |
| Simple CDR | `/simplecdrs` | Reporting | — | filters per resource spec | Read-only |
| AI Analysis | `/aianalysis` | Tenant/reporting | — | `uniqueid` | Read-only |
| AI Logs | `/ailogs` | Tenant/reporting | row ID | date/filter parameters | Read-only |

## Queue

Object:
- `queue`
- Path: `/queues`
- ID: `qu_id`
- Label: `qu_name`
- Source table: `qu_queues`
- Scope: tenant
- Writes: writable key required

Patterns:
```text
GET    /pbx/openapi.php/queues?tenant=TENANT
GET    /pbx/openapi.php/queues/OBJECT_ID?tenant=TENANT
POST   /pbx/openapi.php/queues?tenant=TENANT
PATCH  /pbx/openapi.php/queues/OBJECT_ID?tenant=TENANT
DELETE /pbx/openapi.php/queues/OBJECT_ID?tenant=TENANT
```

Aliases:
- `name` -> `qu_name`
- `number` -> `qu_number`

Destination aliases include:
- `full` -> `QUEUE-FULL`
- `timeout_destination` / `timeout` -> `QUEUE-TIMEOUT`
- `exitkey` -> `QUEUE-EXITKEY`
- `oncallback` -> `QUEUE-ONCALLBACK`
- `nobodyhome` -> `QUEUE-NOBODYHOME`
- `nofreemember` -> `QUEUE-NOFREEMEMBER`
- `periodicannounce` -> `QUEUE-PERIODICANNOUNCE`
- `beforeringing` -> `QUEUE-BEFORERINGING`
- `onautopause` -> `QUEUE-ONAUTOPAUSE`
- `onabandonedcall` -> `QUEUE-ONABANDONEDCALL`

## DID

Object:
- `did`
- Path: `/dids`
- ID: `di_id`
- Label: `di_number`
- Source table: `di_dids`
- Required create field: `di_number`
- Scope: tenant

Patterns:
```text
GET    /pbx/openapi.php/dids?tenant=TENANT
GET    /pbx/openapi.php/dids/OBJECT_ID?tenant=TENANT
POST   /pbx/openapi.php/dids?tenant=TENANT
PATCH  /pbx/openapi.php/dids/OBJECT_ID?tenant=TENANT
DELETE /pbx/openapi.php/dids/OBJECT_ID?tenant=TENANT
```

Aliases:
- `number` -> `di_number`
- `country` -> `di_country`

Documented destination examples include:
- `DID-UNCONDITIONAL` / alias `unconditional`
- `DID-SMS` / alias `sms`
- `DID-FAXSUCCESS` / alias `faxsuccess`

## Hunt List

Object:
- `huntlist`
- Path: `/huntlists`
- ID: `hu_id`
- Label: `hu_name`
- Source table: `hu_huntlists`
- Required create field: `hu_name`
- Scope: tenant

Patterns:
```text
GET    /pbx/openapi.php/huntlists?tenant=TENANT
GET    /pbx/openapi.php/huntlists/OBJECT_ID?tenant=TENANT
POST   /pbx/openapi.php/huntlists?tenant=TENANT
PATCH  /pbx/openapi.php/huntlists/OBJECT_ID?tenant=TENANT
DELETE /pbx/openapi.php/huntlists/OBJECT_ID?tenant=TENANT
```

## User Profile

Object:
- `userprofile`
- Primary path: `/userprofiles`
- ID: `up_id`
- Label: `up_name`
- Source table: `up_userprofiles`
- Required create field: `up_name`
- Scope: global/system
- Requires global API key

Aliases:
- `name` -> `up_name`
- `description` -> `up_description`

Path aliases:
- `/userprofile`
- `/userprofiles`
- `/user_profile`
- `/user_profiles`

## Campaign Number

Object:
- `campaignnumber`
- Primary path: `/campaignnumbers`
- ID: `cn_id`
- Label: `cn_number`
- Source table: `cn_campaignnumbers`
- Required create fields: `cn_ca_id`, `cn_number`
- Scope: tenant

Path aliases:
- `/campaignnumber`
- `/campaignnumbers`
- `/campaign_number`
- `/campaign_numbers`

## AI Logs

Read-only endpoint.

Patterns:
```text
GET /pbx/openapi.php/ailogs?tenant=TENANT
GET /pbx/openapi.php/ailogs?tenant=TENANT&format=csv
GET /pbx/openapi.php/ailogs/export?tenant=TENANT
GET /pbx/openapi.php/ailogs?tenant=TENANT&start=YYYY-MM-DD%20HH:MM:SS&end=YYYY-MM-DD%20HH:MM:SS
GET /pbx/openapi.php/ailogs/ROW_ID?tenant=TENANT
GET /pbx/openapi.php?object=ailogs&action=list&tenant=TENANT
```

Tenant behavior:
- Tenant key: restricted to its tenant.
- Global key: can target a tenant, use `%` where documented, or omit tenant for cross-tenant search according to key permissions.
- If API-key IP filtering is enabled, the request must originate from an allowed address/network.

## Global-editable resource rule

With an appropriate global key, `global=yes` is documented for global-level edits of:
- settings
- custom destinations
- media files
- music on hold
- caller ID blacklist
- cron jobs
- feature codes
- short numbers

Example:
```text
/pbx/openapi.php/featurecodes?global=yes
```

Tenant, User, User Profile, and Routing Profile are administrative/system objects and reject ordinary tenant API keys.

## Standard errors

The API returns JSON errors. Documented/common codes include:
- `missing_api_key`
- `invalid_api_key`
- `tenant_not_found`
- `tenant_required`
- `invalid_json`
- `missing_required_field`
- `read_only_api_key`
- `method_not_allowed`
- `not_found`

Claude must preserve the actual HTTP status and API error body when diagnosing an endpoint; do not normalize distinct server errors into one invented application error.

## Contract-verification checklist

For every endpoint added to the application, Claude must record:

```text
Resource:
Official page:
Primary path:
HTTP methods:
Scope:
Authentication:
Tenant required:
Global mode supported:
ID field:
Required create fields:
Accepted aliases:
Query parameters:
Request JSON:
Response shape:
Sensitive response fields:
Known errors:
Read/write classification:
Demo fixture:
Live response allowlist:
Verification status:
```

Verification status must be one of:
- `DOCUMENTED` — confirmed from current official MiRTA documentation/spec.
- `OBSERVED` — confirmed from an explicitly authorized test call.
- `DOCUMENTED+OBSERVED` — both agree.
- `CONFLICT` — documentation and observed behavior disagree; stop and report.
- `UNKNOWN` — not established; do not guess.

## Safe testing policy

For GET/read endpoints, an authorized test tenant/key may be used to verify actual response schemas. Sanitize all evidence before committing it.

For POST/PATCH/PUT/DELETE or action endpoints such as Dial:
- do not execute merely to learn behavior;
- require explicit user approval;
- use only an isolated test tenant/object;
- state the expected mutation before execution;
- verify cleanup/rollback where applicable.

## Claude implementation rule

The web manual is human-readable documentation. The PBX-provided OpenAPI 3.0.3 JSON is the preferred machine-readable contract for exhaustive field-level implementation.

When a target PBX is available, Claude should retrieve its OpenAPI specification using an authenticated/approved server-side workflow and generate the final endpoint inventory from `paths`, `parameters`, `requestBody`, `responses`, and component schemas. The local reference should then record any version-specific differences instead of silently assuming every MiRTA installation exposes an identical contract.
