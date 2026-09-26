# MiRTA PBX OpenAPI — Common Contract

Cross-resource behavior. Each claim carries an evidence state (`README.md`).
"Wrapper Lnn" means `docs/mirta-openapi-claude-reference.md` line nn. That
file is structure/policy only, so every wrapper-only claim here is
**UNKNOWN** until an official page or the spec confirms it.

## 1. Base path and spec discovery

| Item | Value | State | Evidence |
|---|---|---|---|
| Spec format | OpenAPI 3.0.3 JSON | DOCUMENTED (truncated) | chapter snippet `overview-and-examples`: "exposes configuration and reporting APIs as an OpenAPI 3.0.3 JSON ..." |
| Base path | wrapper claims `/pbx/openapi.php` (L14) | UNKNOWN | the wrapper itself is inconsistent: L31-35 use `/openapi.php/…` without `/pbx` (OA-01) |
| Spec URLs | wrapper claims `GET /pbx/openapi.php`, `?spec=1`, `/openapi.json`, `/swagger.json` (L17-20) | UNKNOWN | — |
| Spec requires auth? | not stated anywhere | UNKNOWN | U-18 |
| 1com host serves it? | never checked | UNKNOWN | U-17 |

## 2. Authentication

| Item | Value | State | Evidence |
|---|---|---|---|
| Key transports | wrapper claims query `key=`, header `X-API-Key`, `Authorization: Bearer` (L23-26, L276-279) | UNKNOWN | — |
| Preferred transport | wrapper *recommends* `X-API-Key` (L239). This is a project security preference (a credential in the URL gets logged), not an API fact. | policy | adopted as a project rule regardless of the API's options |
| Key kinds | wrapper claims: tenant read-only, tenant writable/full, global/admin (L270-274) | UNKNOWN | the Proxy API has comparable kinds (`../proxy-api/_common.md`), but that is **not** evidence for OpenAPI |
| Write needs writable key | wrapper claims (L28, L295) | UNKNOWN | — |
| System objects reject tenant keys (Tenant, User, User Profile, Routing Profile) | wrapper claims (L499) | UNKNOWN | the official snippets say only that these objects are "managed at syste[m]..." (truncated) |
| API-key IP filtering | wrapper claims, for AI Logs (L480) | UNKNOWN | — |
| Error on wrong key kind | wrapper claims `read_only_api_key` (L510) | UNKNOWN | — |

## 3. Tenant and global scope

| Item | Value | State | Evidence |
|---|---|---|---|
| Per-object scope wording | "tenant-scoped" / "managed at system…" / "normally tenant…" | DOCUMENTED (truncated) | chapter snippets, one per resource (README coverage index). The wording after "normally tenant…" is cut off, so any global alternative is not shown. |
| Tenant parameter | wrapper claims `?tenant=TENANTCODE` (L31-35) | UNKNOWN | — |
| `global=yes` edits | wrapper claims, for 8 resource types with a global key (L484-497) | UNKNOWN | — |
| Cross-tenant `%` / omitted tenant | wrapper claims, for AI Logs with a global key (L479) | UNKNOWN | — |

## 4. CRUD conventions

| Item | Value | State | Evidence |
|---|---|---|---|
| List / Get / Create / Update / Delete | wrapper claims `GET`/`GET {id}`/`POST`/`PATCH {id}`/`DELETE {id}` on `/<plural>` (L287-293) | UNKNOWN | — |
| PUT | not mentioned by the wrapper | UNKNOWN | — |
| Not every resource supports every method | wrapper (L37) | UNKNOWN in general; DOCUMENTED for CDR and Simple CDR ("GET only") | chapter snippets `cdr`, `simple-cdr` |
| Lookup by alternate key (e.g. `/extensions/number/100`) | wrapper claims (L216) | UNKNOWN | — |
| Path aliases (singular, underscore forms) | wrapper claims, for User Profile and Campaign Number (L440-444, L457-461) | UNKNOWN | — |
| Legacy query form `?object=…&action=list` | wrapper claims, for AI Logs (L474) | UNKNOWN | — |
| Request body format | wrapper claims JSON (L219) | UNKNOWN | — |
| Field aliases (`number`→`ex_number` etc.) | wrapper claims (L171-181 and per resource) | UNKNOWN | — |
| Destination aliases (`EXT-NOANSWER` etc.) | wrapper claims (L197-205, L363-373, L399-402) | UNKNOWN | cf. the Proxy ManageDB destination tags (`../proxy-api/managedb.md`), which are not evidence here |

## 5. Filters, pagination, formats, dates

| Item | Value | State |
|---|---|---|
| Pagination | not described anywhere | UNKNOWN |
| Filters | wrapper: "filters per resource spec" (L334-335) | UNKNOWN |
| Output formats | wrapper claims JSON/CSV, for AI Logs (L161, L470) | UNKNOWN; "sup..." in the official AI Logs snippet is cut off |
| Date format | wrapper claims `YYYY-MM-DD HH:MM:SS`, for AI Logs (L472) | UNKNOWN |
| Default date range | wrapper claims "current day", for AI Logs (L161) | UNKNOWN |

## 6. Error model

| Item | Value | State |
|---|---|---|
| Error body | wrapper claims "JSON errors" (L503) | UNKNOWN |
| Error codes | wrapper lists `missing_api_key`, `invalid_api_key`, `tenant_not_found`, `tenant_required`, `invalid_json`, `missing_required_field`, `read_only_api_key`, `method_not_allowed`, `not_found` (L504-512) | UNKNOWN |
| HTTP statuses per error | not stated | UNKNOWN |

Project rule (adopted from wrapper L514): preserve the actual HTTP status
and error body. Never merge distinct server errors into one invented
error.

## 7. Safe testing policy (project policy, adopted)

- **No real call** is made unless the user explicitly authorizes it and
  supplies a TEST key and tenant. The key never enters chat or disk (Proxy
  Stage 4 method: in-process environment only, masked output, self-tested
  masker).
- **GET/read:** allowed only after authorization. Evidence is sanitized
  before commit.
- **POST/PUT/PATCH/DELETE and actions (Dial, Auth Token, any `action=`):**
  - never run just to learn behavior
  - explicit per-operation user approval
  - isolated test tenant/object only
  - the expected mutation is stated beforehand
  - cleanup is verified
- Documentation is never authorization to call or mutate the PBX.

## 8. Live security policy (project policy, adopted)

- **Credentials:** kept server-side. Never in browser bundles, Demo
  fixtures, examples or Git.
- **Responses:** Live responses pass through an explicit per-operation
  **field allowlist**, default deny. A name-based blacklist is not
  sufficient.
  - Proxy `QUEUELOGS` (A-55, SEC-REQ-01) repeated every value under a
    bare numeric key that name-based redaction cannot match.
  - Every OpenAPI response schema is checked for the same shape.
- **Tenant isolation:** preserved on every call.
- **Operations:** only explicitly approved ones are exposed. Documenting
  an operation does not enable it.
- **Demo:** synthetic data only. It never contacts the PBX, and never
  replaces a Live failure silently.
- Each sensitive response gets a `SEC-REQ-0n` entry in
  `../../docs/SECURITY.md` before any Live consideration.
