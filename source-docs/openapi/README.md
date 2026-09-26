# MiRTA PBX OpenAPI — Local Reference and Coverage Index

An evidence-based engineering reference for MiRTA PBX `openapi.php`. It is documentation only: nothing here is implemented, and nothing is enabled in Demo or Live.

- **Rules:** `docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md` (the permanent rulebook: evidence states, per-resource template §15, security review §8, testing policy §10, completion report §14).
- **Branch, phase and status:** `docs/CURRENT_STATUS.md` and `docs/SESSION_HANDOFF.md`, not this file.

## Sources and authority

1. **Official MiRTA OpenAPI pages (primary).**
   - The 38 pages of `https://manual.mirtapbx.com/books/api/chapter/openapi`.
   - Snapshots from 2026-09-26 are in `../raw/mirta-openapi/<slug>.{md,html}`, with revision numbers and hashes in `../raw/SOURCES.md`.
   - Citations: `<slug>.md:<line>` (`ov:` = the Overview page).
2. **PBX-generated OpenAPI 3.0.3 spec (an extra check, optional).**
   - Not available yet (`../unresolved.md` U-18).
   - When supplied, it strengthens field-level precision and is compared against the pages (instructions §11).
3. **The retired wrapper** (`git show 5395552:docs/mirta-openapi-claude-reference.md`).
   - Structure only; never evidence.
   - Its claims were checked against the official pages. Corrections are logged as `OA-` items in `../DOCS_AUDIT.md` §13.
- **Conflict rules:**
  - Official beats the wrapper.
  - Two official sources disagreeing is `CONFLICT`, recorded with both references. No winner is picked.
- 1com publishes no OpenAPI documentation, and nobody has checked whether 1com's PBX serves `openapi.php` (U-17).
- **Proxy API and OpenAPI are separate API families.** Official pages sometimes cross-reference Proxy operations. That is recorded, but no Proxy behavior is carried over.

## Files

- **`_common.md`**: base URL and spec URLs, authentication and key kinds, tenant/global scope and `global=1`, endpoint conventions, response conventions, and the full error-code table.
- **`<path>.md`**: one file per resource page, using the instructions §15 template.
  - Named after the documented primary path, e.g. `/extensions` → `extensions.md`, `/extensions/state` → `extensions-state.md`, `/auth/token` → `auth-token.md`.
  - A file exists only once its page has been processed.
- **`resources.json`**: the machine-readable form of the index below: one entry per official page, plus aggregate counts.
  - Regenerated from the snapshots and the per-page processing state.
  - The Overview's objects table (`overview-and-examples.md:38`) supplies each resource's documented primary path and authentication scope.

## Status definitions used in the index

- **Doc status:**
  - `DOCUMENTED`: path, methods, parameters and response shape are all established by the official page. HTTP status codes are excluded: no official page documents any.
  - `PARTIAL`: the page is processed, but a contract element (typically the response shape) is not established.
  - `UNKNOWN`: the page is not processed yet, or the page establishes nothing usable.
  - `CONFLICT`: official sources disagree.
- **Security review:** `PASS` / `REVIEW REQUIRED` / `BLOCK LIVE` / `UNKNOWN` (instructions §8). Anything other than PASS gets a `SEC-REQ-0n` in `docs/SECURITY.md`.
- **Methods = "not yet processed":** the Overview may name the path, but the page's own operations have not been transcribed. CRUD is never inferred.

## Coverage index

| Counter | Value |
|---|---|
| TOTAL OFFICIAL PAGES | 38 |
| PROCESSED PAGES | 38 |
| OVERVIEW/GENERAL PAGES | 1 |
| RESOURCE PAGES | 37 |
| UNIQUE RESOURCES | 37 |
| ENDPOINT PATHS (documented so far) | 37 |
| HTTP OPERATIONS (documented so far) | 128 |
| DOCUMENTED | 5 |
| PARTIAL | 32 |
| UNKNOWN | 0 |
| CONFLICT | 0 |

| # | Page (official) | Type | Primary path | Methods | Auth scope (Overview) | Doc status | Security review | File | Unresolved |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [Overview and Examples](https://manual.mirtapbx.com/books/api/page/overview-and-examples) | overview | — | — | — | DOCUMENTED | n/a | `_common.md` | — |
| 2 | [Extension State](https://manual.mirtapbx.com/books/api/page/extension-state) | resource | `/extensions/state` | GET | — | DOCUMENTED | REVIEW REQUIRED | `extensions-state.md` | SEC-REQ-04 |
| 3 | [Auth Token](https://manual.mirtapbx.com/books/api/page/auth-token) | resource | `/auth/token` | POST, DELETE | Global full API key | DOCUMENTED | BLOCK LIVE | `auth-token.md` | SEC-REQ-05 |
| 4 | [Dial](https://manual.mirtapbx.com/books/api/page/dial) | resource | `/dial` | POST | Tenant full API key | DOCUMENTED | BLOCK LIVE | `dial.md` | SEC-REQ-06 |
| 5 | [CDR](https://manual.mirtapbx.com/books/api/page/cdr) | resource | `/cdrs` | GET | Tenant API key or global key; GET only | PARTIAL | BLOCK LIVE | `cdrs.md` | response schema, SEC-REQ-07 |
| 6 | [Simple CDR](https://manual.mirtapbx.com/books/api/page/simple-cdr) | resource | `/simplecdrs` | GET | Tenant API key or global key; GET only | PARTIAL | BLOCK LIVE | `simplecdrs.md` | response schema, SEC-REQ-08 |
| 7 | [Extension](https://manual.mirtapbx.com/books/api/page/extension) | resource | `/extensions` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | BLOCK LIVE | `extensions.md` | response schema, SEC-REQ-03 |
| 8 | [Tenant](https://manual.mirtapbx.com/books/api/page/tenant) | resource | `/tenants` | GET, POST, PATCH, DELETE | Global API key | PARTIAL | REVIEW REQUIRED | `tenants.md` | response schema, SEC-REQ-11 |
| 9 | [User](https://manual.mirtapbx.com/books/api/page/user) | resource | `/users` | GET, POST, PATCH, DELETE | Global API key | PARTIAL | BLOCK LIVE | `users.md` | response schema, SEC-REQ-12 |
| 10 | [User Profile](https://manual.mirtapbx.com/books/api/page/user-profile) | resource | `/userprofiles` | GET, POST, PATCH, DELETE | Global API key | PARTIAL | REVIEW REQUIRED | `userprofiles.md` | response schema, SEC-REQ-13 |
| 11 | [Routing Profile](https://manual.mirtapbx.com/books/api/page/routing-profile) | resource | `/routingprofiles` | GET, POST, PATCH, DELETE | Global API key | PARTIAL | UNKNOWN | `routingprofiles.md` | response schema |
| 12 | [Provider](https://manual.mirtapbx.com/books/api/page/provider) | resource | `/providers` | GET, POST, PATCH, DELETE | Global API key | PARTIAL | BLOCK LIVE | `providers.md` | response schema, SEC-REQ-14 |
| 13 | [Voicemail](https://manual.mirtapbx.com/books/api/page/voicemail) | resource | `/voicemails` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | BLOCK LIVE | `voicemails.md` | response schema, SEC-REQ-15 |
| 14 | [IVR](https://manual.mirtapbx.com/books/api/page/ivr) | resource | `/ivrs` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | UNKNOWN | `ivrs.md` | response schema |
| 15 | [Custom Destination](https://manual.mirtapbx.com/books/api/page/custom-destination) | resource | `/customdestinations` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | UNKNOWN | `customdestinations.md` | response schema, cu_ct_id enum |
| 16 | [Condition](https://manual.mirtapbx.com/books/api/page/condition) | resource | `/conditions` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | UNKNOWN | `conditions.md` | response schema |
| 17 | [Hunt List](https://manual.mirtapbx.com/books/api/page/hunt-list) | resource | `/huntlists` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | UNKNOWN | `huntlists.md` | response schema |
| 18 | [DID](https://manual.mirtapbx.com/books/api/page/did) | resource | `/dids` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | REVIEW REQUIRED | `dids.md` | response schema, SEC-REQ-16 |
| 19 | [Queue](https://manual.mirtapbx.com/books/api/page/queue) | resource | `/queues` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | UNKNOWN | `queues.md` | response schema |
| 20 | [Setting](https://manual.mirtapbx.com/books/api/page/setting) | resource | `/settings` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | REVIEW REQUIRED | `settings.md` | response schema, SEC-REQ-17 |
| 21 | [Media File](https://manual.mirtapbx.com/books/api/page/media-file) | resource | `/mediafiles` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | REVIEW REQUIRED | `mediafiles.md` | response schema, SEC-REQ-18 |
| 22 | [Music On Hold](https://manual.mirtapbx.com/books/api/page/music-on-hold) | resource | `/musiconholds` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | UNKNOWN | `musiconholds.md` | response schema |
| 23 | [Paging Group](https://manual.mirtapbx.com/books/api/page/paging-group) | resource | `/paginggroups` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | REVIEW REQUIRED | `paginggroups.md` | response schema, SEC-REQ-19 |
| 24 | [Conference Room](https://manual.mirtapbx.com/books/api/page/conference-room) | resource | `/conferencerooms` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | BLOCK LIVE | `conferencerooms.md` | response schema, SEC-REQ-20 |
| 25 | [Flow](https://manual.mirtapbx.com/books/api/page/flow) | resource | `/flows` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | UNKNOWN | `flows.md` | response schema |
| 26 | [Tenant Variable](https://manual.mirtapbx.com/books/api/page/tenant-variable) | resource | `/tenantvariables` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | REVIEW REQUIRED | `tenantvariables.md` | response schema, SEC-REQ-21 |
| 27 | [DISA](https://manual.mirtapbx.com/books/api/page/disa) | resource | `/disas` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | BLOCK LIVE | `disas.md` | response schema, SEC-REQ-22 |
| 28 | [Caller ID Blacklist](https://manual.mirtapbx.com/books/api/page/caller-id-blacklist) | resource | `/calleridblacklists` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | UNKNOWN | `calleridblacklists.md` | response schema |
| 29 | [Campaign](https://manual.mirtapbx.com/books/api/page/campaign) | resource | `/campaigns` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | REVIEW REQUIRED | `campaigns.md` | response schema, SEC-REQ-23 |
| 30 | [Campaign Number](https://manual.mirtapbx.com/books/api/page/campaign-number) | resource | `/campaignnumbers` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | REVIEW REQUIRED | `campaignnumbers.md` | response schema, SEC-REQ-24 |
| 31 | [Cron Job](https://manual.mirtapbx.com/books/api/page/cron-job) | resource | `/cronjobs` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | UNKNOWN | `cronjobs.md` | response schema |
| 32 | [Feature Code](https://manual.mirtapbx.com/books/api/page/feature-code) | resource | `/featurecodes` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | UNKNOWN | `featurecodes.md` | response schema |
| 33 | [Short Number](https://manual.mirtapbx.com/books/api/page/short-number) | resource | `/shortnumbers` | GET, POST, PATCH, DELETE | Tenant API key or global key with global=1 | PARTIAL | UNKNOWN | `shortnumbers.md` | response schema |
| 34 | [Phone Book](https://manual.mirtapbx.com/books/api/page/phone-book) | resource | `/phonebooks` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | UNKNOWN | `phonebooks.md` | response schema |
| 35 | [Phone Book Entry](https://manual.mirtapbx.com/books/api/page/phone-book-entry) | resource | `/phonebookentries` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | REVIEW REQUIRED | `phonebookentries.md` | response schema, SEC-REQ-25 |
| 36 | [Provisioning Phone](https://manual.mirtapbx.com/books/api/page/provisioning-phone) | resource | `/provisioningphones` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | BLOCK LIVE | `provisioningphones.md` | response schema, SEC-REQ-26 |
| 37 | [AI Analysis](https://manual.mirtapbx.com/books/api/page/ai-analysis) | resource | `/aianalysis` | GET | Tenant API key or global key; GET only | DOCUMENTED | BLOCK LIVE | `aianalysis.md` | SEC-REQ-09 |
| 38 | [AI Logs](https://manual.mirtapbx.com/books/api/page/ai-logs) | resource | `/ailogs` | GET | Tenant full or read-only API key, or global key; GET only | DOCUMENTED | REVIEW REQUIRED | `ailogs.md` | SEC-REQ-10 |
