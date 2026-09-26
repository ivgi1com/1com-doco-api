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
- **Not a source:** the former local wrapper (`mirta-openapi-claude-reference.md`) is retired and not a source of truth. It survives in Git history only as historical context. Every claim it made was checked against the official pages before it was removed, and corrections are logged as `OA-` items in `../DOCS_AUDIT.md` §13.
- **Conflict rule:** two official sources disagreeing is `CONFLICT`, recorded with both references. No winner is picked.
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
| PROCESSED PAGES | 3 |
| OVERVIEW/GENERAL PAGES | 1 |
| RESOURCE PAGES | 37 |
| UNIQUE RESOURCES | 37 |
| ENDPOINT PATHS (documented so far) | 4 |
| HTTP OPERATIONS (documented so far) | 7 |
| DOCUMENTED | 1 |
| PARTIAL | 1 |
| UNKNOWN | 35 |
| CONFLICT | 0 |

| # | Page (official) | Type | Primary path | Methods | Auth scope (Overview) | Doc status | Security review | File | Unresolved |
|---|---|---|---|---|---|---|---|---|---|
| 1 | [Overview and Examples](https://manual.mirtapbx.com/books/api/page/overview-and-examples) | overview | — | — | — | DOCUMENTED | n/a | `_common.md` | — |
| 2 | [Extension State](https://manual.mirtapbx.com/books/api/page/extension-state) | resource | `/extensions/state` | GET | — | DOCUMENTED | REVIEW REQUIRED | `extensions-state.md` | SEC-REQ-04 |
| 3 | [Auth Token](https://manual.mirtapbx.com/books/api/page/auth-token) | resource | `/auth/token` | not yet processed | Global full API key | UNKNOWN | UNKNOWN | — | — |
| 4 | [Dial](https://manual.mirtapbx.com/books/api/page/dial) | resource | `/dial` | not yet processed | Tenant full API key | UNKNOWN | UNKNOWN | — | — |
| 5 | [CDR](https://manual.mirtapbx.com/books/api/page/cdr) | resource | `/cdrs` | not yet processed | Tenant API key or global key; GET only | UNKNOWN | UNKNOWN | — | — |
| 6 | [Simple CDR](https://manual.mirtapbx.com/books/api/page/simple-cdr) | resource | `/simplecdrs` | not yet processed | Tenant API key or global key; GET only | UNKNOWN | UNKNOWN | — | — |
| 7 | [Extension](https://manual.mirtapbx.com/books/api/page/extension) | resource | `/extensions` | GET, POST, PATCH, DELETE | Tenant API key | PARTIAL | BLOCK LIVE | `extensions.md` | response schemas, SEC-REQ-03 |
| 8 | [Tenant](https://manual.mirtapbx.com/books/api/page/tenant) | resource | `/tenants` | not yet processed | Global API key | UNKNOWN | UNKNOWN | — | — |
| 9 | [User](https://manual.mirtapbx.com/books/api/page/user) | resource | `/users` | not yet processed | Global API key | UNKNOWN | UNKNOWN | — | — |
| 10 | [User Profile](https://manual.mirtapbx.com/books/api/page/user-profile) | resource | `/userprofiles` | not yet processed | Global API key | UNKNOWN | UNKNOWN | — | — |
| 11 | [Routing Profile](https://manual.mirtapbx.com/books/api/page/routing-profile) | resource | `/routingprofiles` | not yet processed | Global API key | UNKNOWN | UNKNOWN | — | — |
| 12 | [Provider](https://manual.mirtapbx.com/books/api/page/provider) | resource | `/providers` | not yet processed | Global API key | UNKNOWN | UNKNOWN | — | — |
| 13 | [Voicemail](https://manual.mirtapbx.com/books/api/page/voicemail) | resource | `/voicemails` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 14 | [IVR](https://manual.mirtapbx.com/books/api/page/ivr) | resource | `/ivrs` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 15 | [Custom Destination](https://manual.mirtapbx.com/books/api/page/custom-destination) | resource | `/customdestinations` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 16 | [Condition](https://manual.mirtapbx.com/books/api/page/condition) | resource | `/conditions` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 17 | [Hunt List](https://manual.mirtapbx.com/books/api/page/hunt-list) | resource | `/huntlists` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 18 | [DID](https://manual.mirtapbx.com/books/api/page/did) | resource | `/dids` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 19 | [Queue](https://manual.mirtapbx.com/books/api/page/queue) | resource | `/queues` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 20 | [Setting](https://manual.mirtapbx.com/books/api/page/setting) | resource | `/settings` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 21 | [Media File](https://manual.mirtapbx.com/books/api/page/media-file) | resource | `/mediafiles` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 22 | [Music On Hold](https://manual.mirtapbx.com/books/api/page/music-on-hold) | resource | `/musiconholds` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 23 | [Paging Group](https://manual.mirtapbx.com/books/api/page/paging-group) | resource | `/paginggroups` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 24 | [Conference Room](https://manual.mirtapbx.com/books/api/page/conference-room) | resource | `/conferencerooms` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 25 | [Flow](https://manual.mirtapbx.com/books/api/page/flow) | resource | `/flows` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 26 | [Tenant Variable](https://manual.mirtapbx.com/books/api/page/tenant-variable) | resource | `/tenantvariables` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 27 | [DISA](https://manual.mirtapbx.com/books/api/page/disa) | resource | `/disas` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 28 | [Caller ID Blacklist](https://manual.mirtapbx.com/books/api/page/caller-id-blacklist) | resource | `/calleridblacklists` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 29 | [Campaign](https://manual.mirtapbx.com/books/api/page/campaign) | resource | `/campaigns` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 30 | [Campaign Number](https://manual.mirtapbx.com/books/api/page/campaign-number) | resource | `/campaignnumbers` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 31 | [Cron Job](https://manual.mirtapbx.com/books/api/page/cron-job) | resource | `/cronjobs` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 32 | [Feature Code](https://manual.mirtapbx.com/books/api/page/feature-code) | resource | `/featurecodes` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 33 | [Short Number](https://manual.mirtapbx.com/books/api/page/short-number) | resource | `/shortnumbers` | not yet processed | Tenant API key or global key with global=1 | UNKNOWN | UNKNOWN | — | — |
| 34 | [Phone Book](https://manual.mirtapbx.com/books/api/page/phone-book) | resource | `/phonebooks` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 35 | [Phone Book Entry](https://manual.mirtapbx.com/books/api/page/phone-book-entry) | resource | `/phonebookentries` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 36 | [Provisioning Phone](https://manual.mirtapbx.com/books/api/page/provisioning-phone) | resource | `/provisioningphones` | not yet processed | Tenant API key | UNKNOWN | UNKNOWN | — | — |
| 37 | [AI Analysis](https://manual.mirtapbx.com/books/api/page/ai-analysis) | resource | `/aianalysis` | not yet processed | Tenant API key or global key; GET only | UNKNOWN | UNKNOWN | — | — |
| 38 | [AI Logs](https://manual.mirtapbx.com/books/api/page/ai-logs) | resource | `/ailogs` | not yet processed | Tenant full or read-only API key, or global key; GET only | UNKNOWN | UNKNOWN | — | — |
