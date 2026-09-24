# Documentation Audit — Proxy API (MiRTA PBX `proxyapi.php`)

Status: **Phase 3 audit complete (DOCUMENTED state only).** Nothing was
implemented, called, tested, or verified. No live API requests were made
(Phase 3 decision, 2026-09-24).

- Source: https://manual.mirtapbx.com/books/api/page/old-proxyapi-legacy-proxy-api-reference-and-examples
  (BookStack revision #6, updated 2026-06-03). Snapshot + hashes: `raw/SOURCES.md`.
- Normalized data: `proxy-api/` (conventions in `proxy-api/README.md`).
- Inventory: `inventory.json`. Open questions needing a decision: `unresolved.md`.
- Anchors below (`bkmrk-…`) are heading ids in `raw/proxyapi-legacy.html`.

## 1. Summary

| Measure | Count |
|---|---|
| Pages in scope / processed | 1 / 1 |
| OpenAPI pages indexed (out of scope) | 38 |
| Reqtypes in the vendor table (= endpoints) | 39 |
| Reqtypes with at least one example | 16 |
| Reqtypes documented only by a one-line table row | 23 |
| Documented operations (reqtype + discriminator) | 103 (66 of them MANAGEDB) |
| Unique request-example URLs | 123 (+1 web-login URL) |
| `jsondata` payload examples | 23 |
| Operations with any actual response sample | 1 (RESPONSEPATH GETLAST; its XML variant is malformed) |
| Operations with documented errors | 0 |
| Operations with stated parameter types / requiredness | 0 |

Bottom line: the page is a **request-example catalogue**, not a reference.
It establishes what requests look like; it does not document responses,
errors, parameter contracts, or HTTP semantics. A portal built only from
this source cannot truthfully show response schemas, error handling, or
required/optional markers for any operation. Those must come from observed
behavior (Phase 4/5, under the Live-proxy security controls) or from the
vendor.

Correction of an earlier preliminary figure: a WebFetch summary used during
planning reported "28 request types" and "response examples for most"
endpoints. Both were wrong. The snapshot has 39 reqtypes, and nearly all
responses are undocumented.

## 2. Method

1. Captured the page (HTML and the vendor's Markdown export, which is
   content-identical: 125/125 example URLs match) and the OpenAPI chapter
   index. CSRF session tokens were redacted from the HTML before commit.
2. Parsed the reqtype table (authoritative list, 39 rows) and every example
   section. Wrote one YAML file per reqtype. The 23 table-only files were
   generated straight from the table HTML so the purpose text isn't
   hand-transcribed.
3. Automated cross-checks (scratch scripts, not committed):
   - all 41 YAML files parse
   - 169 anchor references all resolve to headings in the snapshot
   - the YAML file set equals the reqtype table exactly (39 = 39)
   - all 124 unique example URLs from the page appear verbatim in the YAML
   - all 23 `jsondata` payloads match the source JSON exactly
   - no verification flag other than `documented` is set
4. Manual spot-check of 5 reqtypes (seeded random pick: COUNTPEERS, CDR,
   PHONEBOOKS, MANAGEDB, CHECKAUTH) against the snapshot text. No
   discrepancies.
5. Secrets scan of `source-docs/`: the only `key=` value is the `APIKEY`
   placeholder, and there are no bearer tokens. The credential-shaped values
   are vendor placeholders (`hackmeifyoucan`, `1234567`, `5678`,
   `sha256(change-me)`).

## 3. Completeness matrix

Legend: Ex = request example(s); Body = request payload shown where the
operation needs one; Resp = response sample; Err = errors; Params =
parameter contract (type/required/allowed values). All Params/Err cells are
"no" for every reqtype, so those columns are omitted.

| Reqtype | Doc level | Ops | Body | Resp | Notable gaps |
|---|---|---|---|---|---|
| INFO | examples | 11 | n/a | template only (CDRS) | status/queues/agents sub-types absent; playrecording no example |
| MANAGEDB | examples | 66 (19 objects) | 3 writes missing | no | no response for any op; object/action lists not enumerated |
| VOICEMAIL | examples | 5 | n/a | no | delete absent |
| FAX | examples | 3 | partial | no | URL-only send variant has no document |
| DND | examples | 2 | n/a | no | value set undocumented |
| PHONEBOOK | examples | 2 | yes | no | delete/clean/dump absent |
| AGENT | examples | 2 | n/a | no | unpause/list/add/remove absent |
| QUEUE | examples | 2 | n/a | no | remove/clean/log absent |
| SETTING | examples | 2 | n/a | no | setting codes not listed |
| CDR | examples | 2 | n/a | no | updatable fields beyond userfield unknown |
| DIAL | examples | 1 | n/a | described, no sample | status query mentioned, absent |
| HANGUP | examples | 1 | n/a | no | by-channel absent |
| MEDIAFILE | examples | 1 | n/a | no | id vs objectid |
| RESPONSEPATH | examples | 1 | n/a | plain yes; XML malformed | other filters absent |
| COUNTCALLS | examples | 1 | n/a | no | — |
| AUTHTOKEN | examples | 1 | n/a | described, no sample | reset + expiring validity absent |
| COUNTPEERS, COUNTCHANNELS, CHANSIPPEERS, BLFS, FLOWS, CHANNEL, CHANNELS, GETCURRENTCALLS, PHONEBOOKS, ATXTRANSFER, CAMPAIGN, QUEUERESET, REBOOT, SETFLOW, SMS, TRANSFER, UNREGISTER, USERGROUP, VIRTUALEXT, LICENSEDAYS, BALANCE, CHECKAUTH, GETWEBRTCAUTH | table_only | 0 | — | — | everything beyond a one-line purpose |

## 4. Findings

Severity: **High** = blocks truthful publication or is a security concern;
**Med** = a developer would be misled or blocked; **Low** = cosmetic or
minor inconsistency.

### Lifecycle and scope

- **A-01 (High) Vendor marks the API legacy.** `bkmrk-overview`: "proxyapi.php
  is the legacy MiRTA PBX HTTP API." `bkmrk-security-notes`: "Prefer the
  OpenAPI endpoint for new integrations…". The user has decided Proxy goes
  first (2026-09-24); how the portal labels it is open → U-03.
- **A-34 (High) Production host unknown.** Every example uses
  `pbx.example.com/mirtapbx/proxyapi.php`. 1com's real host/path is not in
  the source → U-01.

### Missing documentation

- **A-02 (High) No error model.** No error responses, codes, HTTP statuses,
  or failure formats appear anywhere on the page → U-04.
- **A-03 (High) Responses essentially undocumented.** One operation has a
  real output sample. `format` is described as "plain, json, xml, and csv,
  depending on the request", but per-operation support and the default are
  not stated. There is no JSON response sample anywhere → U-11.
- **A-04 (High) 23 of 39 reqtypes are table-only.** No parameters, actions,
  examples, or responses (list in §3) → U-10. Related: FLOWS overlaps INFO
  `info=FLOW`, and HANGUP's by-channel form is mentioned but absent.
- **A-05 (Med) No parameter contracts.** No types, requiredness, allowed
  values, formats, or constraints for any parameter. Everything is inferred
  only from example values. The same concept uses different parameter names:
  extension is `ext` / `number` / `extension`, and the extension value is
  `103` in one place and `103-TENANTCODE` in another; mailbox is a number in
  VOICEMAIL but a folder name (`INBOX`) in MANAGEDB VOICEMAIL.
- **A-16 (Med) Write operations without payloads.** MANAGEDB `huntlist
  setextensions`, `routingprofile update`, and `mediafile updatebinary` (no
  upload mechanism) show a URL only. FAX send's URL-only variant carries no
  document.
- **A-36 (Low) `cache` and `language`** apply to "supported requests", which
  are never listed.
- **A-37 (Med) Binary responses** (recordings, voicemail audio, fax, media
  file): content types and codecs are not documented.
- **A-38 (Med) Actions named in the table but not exemplified.** AGENT
  unpause/list/add/remove; QUEUE remove/clean/log; VOICEMAIL delete;
  PHONEBOOK delete/clean/dump; INFO status/queues/agents; AUTHTOKEN reset.
  AGENT's example uses `LISTQUEUES`, which isn't in the table's action list.

### HTTP semantics

- **A-06 (High) HTTP method never stated.** Reads and most state-changing
  calls (DND set, SETTING SET, CDR UPDATE, QUEUE add, AGENT PAUSE, MANAGEDB
  delete) appear only as bare URLs, i.e. the GET reading. POST appears only
  for `jsondata` writes (stated convention) and for multipart FAX. Whether
  GET is accepted for writes, or POST for reads, is not documented. This
  matters for the Live-proxy method allowlist.
- **A-07 (Med) Inconsistent discriminators.** The sub-operation is selected
  by `info` (INFO), `action` (most), `subreqtype` (PHONEBOOK), or
  `object` + `action` (MANAGEDB).
- **A-08 (Med) Mixed-case enum values, case sensitivity undocumented.**
  `action=list|LIST|PAUSE|GET|get`, `info=SIMPLECDRS|variable|recording`,
  `object=TENANT|tenant`. PHONEBOOK queries `field=name` but the payload
  uses `NAME`.

### Contradictions and inconsistent examples

- **A-09 (Low) Object alias.** MANAGEDB create phone uses `object=phones`;
  every other phone operation uses `PHONE`/`phone`.
- **A-10 (Med) Headings that look like reqtypes.** `RECORDINGS` and
  `TRANSCRIPT` are INFO sub-types. The `PHONEBOOKS` section documents
  reqtype `PHONEBOOK`, not `PHONEBOOKS`.
- **A-11 (Med) SIMPLECDRS description mismatch.** The description says "the
  phone filter searches…" (text copied from CDRS), but the example uses
  `calleridnum`.
- **A-12 (Med) Malformed XML sample** (`bkmrk-getting-the-latest-o-2`):
  - `<?xml version="1.0">` is missing its `?`
  - `<ClientID>` and `<OrderNumber>` are closed by `</MemberNumber>`
  - `Manuel <7171345678>` contains unescaped angle brackets
  - the element set doesn't correspond to the plain-format columns
- **A-13 (Low)** RESPONSEPATH heading says agent 104; its URL filters 105.
- **A-14 (Med) DESTINATION replace** is headed "for a DID", but 3 of its 4
  examples target CONDITION/NOTCONDITION/`IVR_1`. The `typesrc` value set,
  including what `IVR_1` means, is undocumented.
- **A-15 (Low)** "Getting the hunt lists list" is actually `action=get` with
  an `objectid`. There's no list example.
- **A-17 (Med)** FAX send uses `number` in one example and `dest_number` in
  the other.
- **A-18 (High) Admin-key requirement contradicts itself.**
  `bkmrk-manage-db-%2F-media-fi` says "ManageDB requests require an
  administrator API key". `bkmrk-security-notes` says "MANAGEDB actions that
  require them" (i.e. only some do). Most MANAGEDB examples pass `tenant`,
  which suggests tenant scoping → U-09.
- **A-19 (Low) Invalid example values.**
  - `ph_mac: "AA:BB:CC:DD:EE:FF:00:11"` has 8 octets
  - `allow: "'alaw:20"` has a stray apostrophe
  - the XML declaration (A-12)
- **A-20 (Med)** `us_password: "sha256(change-me)"`: it's unclear whether a
  client sends a SHA-256 digest or plaintext.
- **A-21 (Low)** The extension credential field is `secret` for SIP and
  `password` for PJSIP, shown only by example.
- **A-22 (Low)** CDR UPDATE example sends `value=` (empty). Clear-vs-no-op
  is undocumented, as is which fields besides `userfield` can be updated.
- **A-23 (Med) Two "all tenants" mechanisms.** INFO DIDS omits `tenant`;
  INFO CDRS uses a raw `tenant=%` (unencoded `%` in a URL).
- **A-24 (Med)** CDRS combines `format=xml` with `template=Test_CSV`. The
  "sample output" is a server-side template definition, not output, and the
  template mechanism is undocumented.
- **A-25 (Med) Date filters.** `start`/`end` format (examples use
  YYYY-MM-DD), end inclusivity, and timezone are undocumented.
- **A-26 (Med)** MEDIAFILE passes both `id=19` and `objectid=3619`. Their
  meanings are undocumented; they coincide with the RESPONSEPATH example
  values.
- **A-27 (Med) AUTHTOKEN.**
  - the request example is duplicated
  - only `validity=ONCE` is shown, though "expiring" tokens are mentioned
  - the `reset` action is absent
  - the token is used as a password in a `login.php` query string
- **A-28 (Med) DIAL.**
  - the response ID is described but not shown
  - "query call status" has no operation
  - the follow-up recording example omits `tenant` and uses a different ID
    format (`15a4cfe6429054` vs `srv02-…`)
  - `account` meaning and multi-`var` syntax are undocumented
- **A-33 (Med) Destination tags.**
  - ID semantics per tag are undocumented (SPECIAL points at an internal
    `sp_specials` table)
  - LOGINQUEUE/LOGINADQUEUE (and the TOGGLE variants) have identical
    descriptions
  - the source says the list reflects "the current destination lookup code",
    so completeness is not asserted
- **A-35 (Low)** Heading style drifts: "DND /Set", "Manage DB / media files"
  vs "ManageDB".

### Security findings (inputs for Phase 5 Live proxy and `docs/SECURITY.md`)

- **A-29 (High) API key in the query string on every request,** including
  POST examples. Keys leak into web-server/proxy access logs, browser
  history, and Referer headers. No header-based alternative is documented.
  For the portal backend proxy this means:
  - it must inject the key server-side
  - it must strip or redact `key` (and `password` / AUTHTOKEN values) from
    every log, error message, and telemetry event, including upstream URLs
    echoed in errors

  The AUTHTOKEN login flow also places a credential in a URL.
- **A-30 (Med) JSONP `callback`** allows cross-origin script inclusion of
  JSON responses. The portal must never forward `callback`: block it in the
  proxy allowlist.
- **A-31 (High) High-impact operations exist in the catalogue.** This list
  is input for the Live allowlist and Demo-only decisions, not a
  recommendation to document or hide anything:
  - cost / toll fraud: DIAL, SMS, FAX send, CAMPAIGN
  - live-call disruption: HANGUP, TRANSFER, ATXTRANSFER
  - service disruption: REBOOT, UNREGISTER
  - irreversible: QUEUERESET, MANAGEDB delete
  - billing: BALANCE
  - PBX configuration / routing: MANAGEDB tenant/provider/route/
    routing-profile writes, DESTINATION replace, SETFLOW, VIRTUALEXT,
    USERGROUP
  - credentials: AUTHTOKEN (issues a login token for another user),
    CHECKAUTH (username/password oracle), GETWEBRTCAUTH
- **A-32 (Low) Example payloads contain credential-shaped placeholders and a
  real vendor domain.** Examples include `secret`/`password`
  `hackmeifyoucan`, voicemail `password: "1234567"`, conference
  `pin: "5678"`, and `email: test@mirtapbx.com`. Demo fixtures (Phase 6)
  must use their own clearly synthetic values on reserved domains
  (example.com). They must not copy these, and they must not render
  credential fields unmasked.
- **A-39 (High) MANAGEDB `filter=te_disabled='on'`** has the shape of a raw
  SQL WHERE fragment. Its grammar and escaping are undocumented. This audit
  makes no claim about server-side handling (not tested). Regardless: never
  pass free-form `filter` through the Live proxy.

## 5. Content-model fit (recorded for the Phase 4 decision; `src/content/types.ts` unchanged)

The current `Endpoint` type (Phase 2 draft) assumes REST, and the source
does not fit it:

| Model assumption | Proxy API reality | Consequence |
|---|---|---|
| Endpoint = `method` + `path` | One path; identity = `reqtype` + discriminator (`info` / `action` / `subreqtype` / `object`+`action`) | Needs an operation identity made of fixed query params; `id` slug derived from it (e.g. `info.extstate`) |
| One `HttpMethod` per endpoint | Method unstated (A-06); GET-by-URL, POST `jsondata`, multipart | `method` needs a "documented/assumed" basis, or allow several |
| `requestBody: Parameter[]` (JSON) | JSON **string inside a urlencoded form field** `jsondata`; sometimes an array; sometimes multipart | Body needs encoding + wrapper-field metadata, and array roots |
| `ResponseSpec.status` + JSON `example` | No statuses; formats plain / csv / xml / json / binary picked by a `format` query param | Response needs a media type/format dimension; `status` may be unknown |
| `ErrorSpec {status, code}` required | Nothing documented (A-02) | Errors must be allowed to be "not documented" |
| `Parameter.required: boolean` | Unknown for every parameter (A-05) | Needs a tri-state (required / optional / not documented) |
| `authentication {type, description}` | Query-param key with tenant / read-only / admin scopes; per-op scope unknown | Needs location + scope, and "unknown" |
| `Verification` booleans | Fits | — |
| `Lifecycle` includes `legacy` | Fits | — |

Options for Phase 4 (decision → U-07):

- **(a)** Extend the existing model: add an operation discriminator, a
  body-encoding field, a response format/media type, and tri-state
  required. Keep one API-neutral model; REST APIs (Open API later) simply
  don't use the discriminator.
- **(b)** Model each reqtype as a synthetic REST-like path
  (`/proxyapi.php#INFO/EXTSTATE`). No type changes, but it misrepresents the
  wire format.
- **(c)** A separate Proxy-specific model. This breaks the "one API-neutral
  model" architecture rule.

Recommendation: **(a)**.

Proposed grouping for navigation (the source has none; for the Phase 4
decision, not applied): Calls & channels; Extensions & presence; Queues &
agents; Voicemail; CDR & reporting; Phonebooks; Fax & SMS; Flows & response
paths; Campaigns; Authentication; Administration (MANAGEDB, BALANCE,
REBOOT, UNREGISTER, USERGROUP, LICENSEDAYS, SETTING).

## 6. Phase 4 endpoint candidates (recommendation only → U-06)

Criteria:
- read-only
- tenant-scoped (no admin key)
- simple parameters
- no cost or disruption
- exercises the non-REST model (reqtype + discriminator + `format`)

- **INFO `info=EXTENSIONS`** (recommended): read-only, tenant-scoped, and
  three documented variants (list / by id / by number) exercise optional
  parameters.
- INFO `info=EXTSTATE`: read-only and minimal, but has one parameter and an
  undocumented state vocabulary.
- DND `action=get`: minimal, but pairs with a write (`set`) that Live mode
  would have to exclude.

Every candidate lacks a response sample (A-03). Phase 4 needs a real,
sanitized response supplied through an approved route before any response
schema is published.
