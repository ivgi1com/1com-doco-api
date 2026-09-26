# MiRTA PBX OpenAPI — Source Normalization (baseline started 2026-09-26)

Evidence-based record of what the **official MiRTA PBX OpenAPI
documentation and specification** establish about `openapi.php`. This is
audit data, not portal content: nothing here is implemented, and nothing
is enabled in Demo or Live. Documentation and Live authorization are
separate decisions (`../../docs/SECURITY.md`).

**Accuracy over completeness.** A gap stays `UNKNOWN`. It is never filled
by inference from another resource or from the wrapper.

## Authority (user decision, 2026-09-26; `../../docs/DECISIONS.md`)

1. **Authoritative:** the official MiRTA OpenAPI documentation
   (`manual.mirtapbx.com/books/api/chapter/openapi` and its pages) and the
   OpenAPI 3.0.3 specification, as supplied by the user. Snapshots go in
   `../raw/mirta-openapi/`, hashed in `../raw/SOURCES.md`.
   - Where the two disagree, both are recorded and the conflict is logged
     in `../DOCS_AUDIT.md` §13. No winner is picked without a user decision.
2. **Structure/policy only, not evidence:**
   `../../docs/mirta-openapi-claude-reference.md` (the "wrapper").
   - Its organization, security rules, testing policy, verification states
     and checklist are adopted.
   - Its technical claims (paths, fields, aliases, auth, errors) are
     recorded as `UNKNOWN — wrapper claims …` until an official source
     confirms them.
   - When the official source differs, the official value is written here
     and the difference is logged as an `OA-` item.
3. This differs from the Proxy API precedent. For Proxy, 1com's own
   documentation outranks MiRTA (`../proxy-api/README.md`). 1com publishes
   no OpenAPI documentation, so for OpenAPI the official MiRTA material is
   the authority.
   - Differences specific to 1com's install, if a spec from 1com's PBX is
     supplied, are recorded as per-install differences, never merged
     silently.

## Evidence states

| State | Meaning |
|---|---|
| `DOCUMENTED` | Stated directly by an official MiRTA page or the spec. Cite file and line/JSON pointer. |
| `OBSERVED` | Seen in an explicitly authorized real call (sanitized evidence in `../observed/`). |
| `DOCUMENTED+OBSERVED` | Both, and they agree. |
| `CONFLICT` | Observed behavior contradicts the documentation. Stop and report. |
| `UNKNOWN` | Not established. A wrapper claim alone is always `UNKNOWN`. |

- **Truncated official text** (the chapter index's ~100-character preview
  snippets) is `DOCUMENTED` only for the words actually shown. Nothing is
  extrapolated past the `...`.

## Current evidence inventory

| Source | Status | What it establishes |
|---|---|---|
| `../raw/api-book-openapi-chapter.html` (fetched 2026-09-24) | official, **index only** | The 38 page titles and URLs (37 resources plus the overview) and one truncated preview sentence per page. No paths, methods, fields, auth or errors. |
| Official resource pages | **not yet captured** | Stage B |
| OpenAPI 3.0.3 spec JSON | **not yet supplied** | Stage B |
| Wrapper | structure/policy only | Nothing technical, by rule |
| Real calls | **none** | No test key or tenant authorized for OpenAPI |

**Not established:**
- Whether 1com's PBX host serves `/pbx/openapi.php` at all.
- Which MiRTA version or spec revision 1com runs.

Both are tracked in `../unresolved.md` U-17 and U-18.

## Layout

- `_common.md` — base path and spec endpoints, authentication, key kinds,
  tenant/global scope, CRUD conventions, filters/pagination/formats, error
  model, safe-testing policy, Live security policy.
- `<resource>.md` — one per resource. **Created only when official
  evidence for that resource exists** (no empty stubs). Named after the
  official path plural once `DOCUMENTED` (e.g. `extensions.md`), otherwise
  after the official page slug.
- `resources.json` — machine-readable inventory of the same coverage
  index, for later coverage tests (mirrors `../proxy-api/operations.json`).

## Per-resource file template

```markdown
# <Resource title>

## Quick card
| | Value | State |
|---|---|---|
| Purpose | | |
| Primary path / aliases | | |
| Methods | GET list · GET one · POST · PATCH · PUT · DELETE · actions (each marked separately; never assumed from another resource) | |
| Tenant required | | |
| Key level | read-only / writable-full / global-admin | |
| Global mode (`global=yes`) | | |
| Mutating | | |
| Response sensitivity | none / PII / credential-bearing / nested rows / positional duplicates | |
| Demo suitability | | |
| Live prerequisites | | |

## Identity
Object name, table, ID field, label field, official page URL, spec JSON pointer.

## Operations
### <METHOD> <path>
- Parameters: name | in (path/query/header) | required | type | aliases | allowed values | default | state
- Filters / pagination / date formats / output formats
- Request body (writes): required, optional, aliases, types, nesting, validation, destinations
- Response: structure, field types, arrays/objects, pagination metadata, empty result, success status
- Errors
- Examples: synthetic only, and only where the schema is established

## Security
Credential or PII fields; nested DB rows; numeric/positional duplicate keys.
Anything sensitive → `SEC-REQ-0n` in `docs/SECURITY.md` (Live requires an explicit field allowlist).

## Sources · Open questions
```

## Conventions

- **Synthetic examples only:**
  - host `pbx.example.com`, key `TEST_API_KEY`, tenant `TESTTENANT`
  - numbers `555-01xx`, names prefixed `Demo`, secrets `SYNTHETIC_SECRET`
  - no real keys, tenants, numbers, names, emails, recordings, caller IDs
    or production IDs, in examples or in raw snapshots (raw snapshots are
    redacted before commit)
- **Mutation policy:** POST/PUT/PATCH/DELETE and action endpoints (Dial,
  Auth Token) are never executed without explicit, per-operation user
  approval (`_common.md` "Safe testing policy").
- **Citations:**
  - pages: `raw/mirta-openapi/<slug>.<ext>:<line>`
  - spec: `raw/mirta-openapi/<spec file>#/paths/~1extensions/get`
  - chapter snippets: `raw/api-book-openapi-chapter.html` + slug

## Coverage index

Status as of Stage A. Nothing is verified yet.

- **Official page** and **Snippet**: `DOCUMENTED`, from the chapter
  index. Snippets are cut off where shown with `...`.
- **Path**, **Methods** and **Key level**: `UNKNOWN` unless stated. The
  wrapper's claim is shown in *italics* for orientation only.
- **Sensitivity watch**: a reason to scrutinize the schema, not a finding.
- **Snippet prefix omitted:** the object-page snippets (rows 7–36) all
  begin with the same sentence, "The <Title> object is supported by the
  MiRTA PBX OpenAPI endpoint." That sentence is dropped from the table.

| # | Resource | Official page | Official snippet (truncated) | Path | Methods | Mutating | Sensitivity watch | File |
|---|---|---|---|---|---|---|---|---|
| 1 | Overview and Examples | `overview-and-examples` | "exposes configuration and reporting APIs as an OpenAPI 3.0.3 JSON ..." | n/a | n/a | n/a | — | `_common.md` |
| 2 | Extension State | `extension-state` | "returns live call-state information for one extension. It is a read-..." | UNKNOWN *(`/extensions/state`)* | UNKNOWN *(GET)* | not stated ("read-..." is cut off) | call state | — |
| 3 | Auth Token | `auth-token` | "generates or resets temporary login tokens for web users and extension we..." | UNKNOWN *(`/auth/token`)* | UNKNOWN | **yes** (DOCUMENTED: "generates or resets") | **login tokens** | — |
| 4 | Dial | `dial` | "originates a call between a source extension and a destination number. It is th..." | UNKNOWN *(`/dial`)* | UNKNOWN *(POST)* | **yes** (DOCUMENTED: "originates a call") | phone numbers | — |
| 5 | CDR | `cdr` | "a read-only reporting endpoint. It supports GET only; create, update, and de..." | UNKNOWN *(`/cdrs`)* | GET only (DOCUMENTED) | no (DOCUMENTED) | call records, numbers | — |
| 6 | Simple CDR | `simple-cdr` | "a read-only reporting endpoint. It supports GET only; create, update,..." | UNKNOWN *(`/simplecdrs`)* | GET only (DOCUMENTED) | no (DOCUMENTED) | call records, numbers | — |
| 7 | Extension | `extension` | "This object is tenant-scoped..." | UNKNOWN *(`/extensions`)* | UNKNOWN *(CRUD)* | UNKNOWN | **SIP secrets, web passwords, PINs, 2FA, email, nested tech rows** (Proxy A-40/A-55 precedent) | — |
| 8 | Tenant | `tenant` | "This object is managed at syste..." | UNKNOWN *(`/tenants`)* | UNKNOWN | UNKNOWN | tenant config | — |
| 9 | User | `user` | "This object is managed at system ..." | UNKNOWN *(`/users`)* | UNKNOWN | UNKNOWN | **user credentials** | — |
| 10 | User Profile | `user-profile` | "This object is managed at..." | UNKNOWN *(`/userprofiles`)* | UNKNOWN | UNKNOWN | permissions | — |
| 11 | Routing Profile | `routing-profile` | "This object is managed..." | UNKNOWN *(`/routingprofiles`)* | UNKNOWN | UNKNOWN | — | — |
| 12 | Provider | `provider` | "This object is managed at sys..." | UNKNOWN *(`/providers`)* | UNKNOWN | UNKNOWN | **trunk credentials** | — |
| 13 | Voicemail | `voicemail` | "This object is tenant-scoped..." | UNKNOWN *(`/voicemails`)* | UNKNOWN | UNKNOWN | **mailbox PIN, IMAP credentials** (Proxy A-77 precedent), email | — |
| 14 | IVR | `ivr` | "This object is tenant-scoped. Tena..." | UNKNOWN *(`/ivrs`)* | UNKNOWN | UNKNOWN | — | — |
| 15 | Custom Destination | `custom-destination` | "This object is norm..." | UNKNOWN *(`/customdestinations`)* | UNKNOWN | UNKNOWN | — | — |
| 16 | Condition | `condition` | "This object is tenant-scoped..." | UNKNOWN *(`/conditions`)* | UNKNOWN | UNKNOWN | — | — |
| 17 | Hunt List | `hunt-list` | "This object is tenant-scoped..." | UNKNOWN *(`/huntlists`)* | UNKNOWN | UNKNOWN | — | — |
| 18 | DID | `did` | "This object is tenant-scoped. Tena..." | UNKNOWN *(`/dids`)* | UNKNOWN | UNKNOWN | numbers; possible tenant-row join with recording credentials (Proxy A-53 precedent) | — |
| 19 | Queue | `queue` | "This object is tenant-scoped. Te..." | UNKNOWN *(`/queues`)* | UNKNOWN | UNKNOWN | — | — |
| 20 | Setting | `setting` | "This object is normally tenant..." | UNKNOWN *(`/settings`)* | UNKNOWN | UNKNOWN | **may hold secrets** | — |
| 21 | Media File | `media-file` | "This object is normally ten..." | UNKNOWN *(`/mediafiles`)* | UNKNOWN | UNKNOWN | audio content | — |
| 22 | Music On Hold | `music-on-hold` | "This object is normally ..." | UNKNOWN *(`/musiconholds`)* | UNKNOWN | UNKNOWN | — | — |
| 23 | Paging Group | `paging-group` | "This object is tenant-sco..." | UNKNOWN *(`/paginggroups`)* | UNKNOWN | UNKNOWN | — | — |
| 24 | Conference Room | `conference-room` | "This object is tenant-..." | UNKNOWN *(`/conferencerooms`)* | UNKNOWN | UNKNOWN | **room PINs** | — |
| 25 | Flow | `flow` | "This object is tenant-scoped. Ten..." | UNKNOWN *(`/flows`)* | UNKNOWN | UNKNOWN | — | — |
| 26 | Tenant Variable | `tenant-variable` | "This object is tenant-..." | UNKNOWN *(`/tenantvariables`)* | UNKNOWN | UNKNOWN | **may hold secrets** | — |
| 27 | DISA | `disa` | "This object is tenant-scoped. Ten..." | UNKNOWN *(`/disas`)* | UNKNOWN | UNKNOWN | **DISA PIN** | — |
| 28 | Caller ID Blacklist | `caller-id-blacklist` | "This object is nor..." | UNKNOWN *(`/calleridblacklists`)* | UNKNOWN | UNKNOWN | caller numbers | — |
| 29 | Campaign | `campaign` | "This object is tenant-scoped...." | UNKNOWN *(`/campaigns`)* | UNKNOWN | UNKNOWN | — | — |
| 30 | Campaign Number | `campaign-number` | "This object is tenant-..." | UNKNOWN *(`/campaignnumbers`)* | UNKNOWN | UNKNOWN | customer numbers | — |
| 31 | Cron Job | `cron-job` | "This object is normally tenan..." | UNKNOWN *(`/cronjobs`)* | UNKNOWN | UNKNOWN | — | — |
| 32 | Feature Code | `feature-code` | "This object is normally t..." | UNKNOWN *(`/featurecodes`)* | UNKNOWN | UNKNOWN | — | — |
| 33 | Short Number | `short-number` | "This object is normally t..." | UNKNOWN *(`/shortnumbers`)* | UNKNOWN | UNKNOWN | — | — |
| 34 | Phone Book | `phone-book` | "This object is tenant-scope..." | UNKNOWN *(`/phonebooks`)* | UNKNOWN | UNKNOWN | — | — |
| 35 | Phone Book Entry | `phone-book-entry` | "This object is tenant..." | UNKNOWN *(`/phonebookentries`)* | UNKNOWN | UNKNOWN | **contact PII** | — |
| 36 | Provisioning Phone | `provisioning-phone` | "This object is tena..." | UNKNOWN *(`/provisioningphones`)* | UNKNOWN | UNKNOWN | **MACs, provisioning credentials** | — |
| 37 | AI Analysis | `ai-analysis` | "returns transcript, AI summary, and sentimental analysis data for record..." | UNKNOWN *(`/aianalysis`)* | UNKNOWN *(GET)* | not stated | **call transcripts** | — |
| 38 | AI Logs | `ai-logs` | "exports records from ai_ailogs. It is a read-only OpenAPI endpoint that sup..." | UNKNOWN *(`/ailogs`)* | UNKNOWN *(GET)* | no (DOCUMENTED: "read-only") | AI conversation content | — |

**Totals:**
- 37 resources plus 1 overview page.
- Resource files created so far: 0.
- Path `DOCUMENTED`: 0/37. Methods `DOCUMENTED`: 2/37 (CDR, Simple CDR, "GET only").
