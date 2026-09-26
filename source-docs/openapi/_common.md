# MiRTA PBX OpenAPI — Common Contract

Cross-resource behavior of `openapi.php`. Rules: `docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md`.

**Citations.**
- `ov:N` = `source-docs/raw/mirta-openapi/overview-and-examples.md` line N (BookStack rev #21, updated 2026-08-26). Other pages are cited as `<slug>.md:N` in the same folder.
- Corrections to earlier local assumptions are logged in `source-docs/DOCS_AUDIT.md` §13 (`OA-` items).

**States.** `DOCUMENTED` / `OBSERVED` / `DOCUMENTED+OBSERVED` / `CONFLICT` / `UNKNOWN`. Nothing here is `OBSERVED`: no OpenAPI call has been made.

## 1. Spec and base URL

| Item | Value | State | Evidence |
|---|---|---|---|
| Spec format | OpenAPI 3.0.3 JSON, describing paths, methods, auth schemes, request bodies and response schemas | DOCUMENTED | ov:3 |
| Base URL | `https://<pbx-host>/pbx/openapi.php` (vendor example host `pbx.example.com`) | DOCUMENTED | ov:10 |
| Spec URLs | `…/openapi.php`, `…/openapi.php?spec=1`, `…/openapi.php/openapi.json`, `…/openapi.php/swagger.json` | DOCUMENTED | ov:10-13 |
| Does fetching the spec need a key? | not stated | UNKNOWN | U-18 |
| Does 1com's PBX serve it, and which version? | not established | UNKNOWN | U-17, U-18 |
| Resource paths | `/pbx/openapi.php/<path>` (earlier local form without `/pbx` corrected, OA-01) | DOCUMENTED | ov:32, every resource page |

## 2. Authentication

| Item | Value | State | Evidence |
|---|---|---|---|
| Key transports | query `key=`, header `X-API-Key: <key>`, or `Authorization: Bearer <key>` | DOCUMENTED | ov:18, ov:21-27; `extension-state.md:13` |
| Key kinds | tenant full, tenant read-only, global full, global read-only | DOCUMENTED | `ai-logs.md:13` |
| Tenant keys need a tenant parameter | "Tenant API keys require a tenant parameter" | DOCUMENTED | ov:18 |
| Global keys | "can access global administration objects and can list tenant-scoped objects across tenants when no tenant parameter is supplied" | DOCUMENTED | ov:18 |
| Writes | "writes require a writable API key" (every object page's opening line) | DOCUMENTED | e.g. `extension.md:3` |
| Read-only key on a write | error `read_only_api_key`: "The key can read data but cannot create, update, or delete objects." | DOCUMENTED | e.g. `extension.md:455` |
| Required key kind for each object | the Overview's objects table; per-resource files carry it | DOCUMENTED | ov:38 |
| API-key IP filtering | an optional per-key allowed IP/network list; error `api_ip_not_allowed` | DOCUMENTED on the AI Logs page only. Whether it applies to other resources is UNKNOWN | `ai-logs.md` errors |

**Project preference, not an API fact:** use the `X-API-Key` header server-side. A key in the query string ends up in URLs and logs.

## 3. Tenant and global scope

| Item | Value | State | Evidence |
|---|---|---|---|
| Tenant parameter | `tenant=<tenant code>`. Some pages also accept the tenant **name** | DOCUMENTED | ov:22; `extension-state.md:13` ("Tenant code or tenant name"); `cdr.md:3` |
| Scope classes (Overview "Authentication scope" column) | "Tenant API key"; "Global API key"; "Global full API key"; "Tenant full API key"; "Tenant API key or global key"; "Tenant API key or global key with global=1"; "Tenant full or read-only API key, or global key" | DOCUMENTED | ov:38 |
| Global-level edit flag | **`global=1`** (24 occurrences across pages; no official page uses `global=yes`, which is incorrect, OA-08) | DOCUMENTED | ov:38 and object pages |
| Resources that accept `global=1` | Custom Destination, Setting, Media File, Music On Hold, Caller ID Blacklist, Cron Job, Feature Code, Short Number | DOCUMENTED | ov:38 |
| Global-key-only objects | Tenant, User, User Profile, Routing Profile, Provider ("Global API key"); Auth Token ("Global full API key") | DOCUMENTED | ov:38 |
| Tenant wildcards (`%`) and name lookup with a global key | documented on the four reporting pages only (CDR, Simple CDR, AI Analysis, AI Logs). AI Logs also allows omitting `tenant` to search all tenants. Not a general rule | DOCUMENTED per page | `cdr.md:15`, `simple-cdr.md:15`, `ai-analysis.md:66`, `ai-logs.md:16` |
| Extension State needs a tenant even with a global key | yes | DOCUMENTED | `extension-state.md:59` |

## 4. Endpoint conventions

| Pattern | Form | State | Evidence |
|---|---|---|---|
| List | `GET /pbx/openapi.php/<path>?tenant=…` | DOCUMENTED | ov:32 |
| Get by ID | `GET /pbx/openapi.php/<path>/<ID>?tenant=…` | DOCUMENTED | ov:32 |
| Create | `POST /pbx/openapi.php/<path>?tenant=…` | DOCUMENTED | ov:32 |
| Modify | `PATCH /pbx/openapi.php/<path>/<ID>?tenant=…` | DOCUMENTED | ov:32 |
| Delete | `DELETE /pbx/openapi.php/<path>/<ID>?tenant=…` | DOCUMENTED | ov:32 |
| PUT | never mentioned by any official page | UNKNOWN (not documented) | — |
| Coverage per object | "Most configuration objects support CRUD operations." CDR, Simple CDR, AI Analysis and AI Logs are read-only reporting endpoints. Supported methods are recorded **per resource** from its own page, never inferred | DOCUMENTED | ov:36 |
| Read-only endpoints on a write method | error `method_not_allowed` | DOCUMENTED | `cdr.md:3`, `simple-cdr.md:3`, `ai-analysis.md`, `ai-logs.md` |
| Request bodies | JSON with `Content-Type: application/json` in every write example | DOCUMENTED (examples) | e.g. `extension.md:63-81` |
| PATCH semantics | "Updates only the supplied … fields" (Extension) | DOCUMENTED per page | `extension.md:147` |
| Field aliases | a short request field (e.g. `number`) maps to a column (`ex_number`); documented per object | DOCUMENTED per page | e.g. `extension.md:15` |
| Destination fields | one destination string or an array such as `EXT-100` / `VOICEMAIL-100`; alias keys or a `destinations` object keyed by destination type | DOCUMENTED per page | `extension.md:19`, `extension.md:306` |

## 5. Response conventions

| Item | Value | State |
|---|---|---|
| Content type | JSON. Some endpoints also document CSV or XML/template output (per resource) | DOCUMENTED per page |
| Success HTTP status codes | **no official page states a status code** | UNKNOWN |
| List envelope (bare array vs wrapper object) | recorded per resource where examples exist | per resource |
| Pagination | **not documented anywhere** (no `limit`/`offset`/`page`) | UNKNOWN |
| Empty-result behavior | per resource where documented | per resource |

## 6. Errors

"Errors are returned as JSON with an error code and message" (ov:42).
- The JSON field names of the error body are **not shown on any page**, so they are UNKNOWN.
- No HTTP status for any error is documented, so those are UNKNOWN.
- Project rule: preserve the real status and error body. Never merge distinct errors into one.

| Code | Meaning (official wording) | Where documented |
|---|---|---|
| `missing_api_key` | No API key was supplied in the query string, `X-API-Key`, or bearer token. | ov:42; 35 resource pages |
| `invalid_api_key` | The supplied key does not match the tenant or global API key. | ov:42; 35 pages |
| `tenant_required` | A tenant code is required for tenant-scoped writes or tenant-key reads. | 34 resource pages. **Not** in ov:42's list, which says "include", so that list is not exhaustive (OA-09) |
| `read_only_api_key` | The key can read data but cannot create, update, or delete objects. | 31 pages |
| `missing_required_field` | A required create field is missing. | ov:42; 30 pages |
| `tenant_not_found` | The tenant parameter did not match any visible tenant. | ov:42; `ai-analysis.md`, `ai-logs.md` |
| `method_not_allowed` | The endpoint is read-only and only supports GET. | ov:42; CDR, Simple CDR, AI Analysis, AI Logs |
| `invalid_json` | (no per-page meaning given) | ov:42 only |
| `not_found` | (no per-page meaning given) | ov:42 only |
| `single_tenant_required` | Template output requires the request to resolve to exactly one tenant. | `cdr.md`, `simple-cdr.md` |
| `template_not_found` | The selected XML/template output template does not exist for the tenant. | `cdr.md`, `simple-cdr.md` |
| `uniqueid_required` | The request did not include a usable `uniqueid` value. | `ai-analysis.md` |
| `invalid_format` | The `format` value is not `json` or `csv`. | `ai-logs.md` |
| `api_ip_not_allowed` | IP filtering is enabled and the client address is not in the key's allowed IP or network list. | `ai-logs.md` |
| `admin_required` | A global API key is required. | `auth-token.md` |
| `missing_user` | The request body did not include a user value. | `auth-token.md` |
| `user_not_found` | No supported web user or extension identity matched the requested user value. | `auth-token.md` |
| `invalid_validity` | The validity value was not ONCE and could not be parsed as a date/time. | `auth-token.md` |

## 7. Examples convention

- **Official pages:** vendor-fictional values (ov:36): tenant `CANISTRACCI`, keys `TENANT_API_KEY` / `GLOBAL_API_KEY`, `example.com` emails, `198.51.100.x` IPs.
- **Local docs:** normalize them to `TESTTENANT`, `TEST_API_KEY`, `pbx.example.com`, `Demo User` and `555-01xx`, as required by the instructions §5.

## 8. Policies

Real-PBX testing, security review, and Demo vs Live all follow the instructions file (§§8–10). Summary:
- No call without explicit authorization and a test key/tenant.
- No mutation (POST/PATCH/PUT/DELETE, Dial, token generation/reset) without per-task approval.
- Browser-facing Live responses use a default-deny field allowlist. The Proxy `QUEUELOGS` lesson applies: values can also appear under numeric/positional duplicate keys.
