# Documentation Audit — Proxy API

Status: **§1–6 below (the MiRTA-sourced audit) are superseded as of
2026-09-25 — see §10.** The authoritative documentation source is now the
1com Site + linked Doc, normalized in `proxy-api/*.md`
(`proxy-api/README.md` for conventions, `raw/SOURCES.md` for the
snapshot). §1–6 and their `proxy-api/*.yaml` files (now removed) are kept
below only as a record of the earlier audit; do not treat their content
as current. §7–9 (observed Live-endpoint behavior) remain **current and
unaffected** — they describe real, tested requests, independent of which
documentation source backs them.

## Historical: Phase 3 audit (MiRTA PBX `proxyapi.php`, superseded 2026-09-25)

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
  the source → U-01. **Resolved 2026-09-25 (Phase 4):** the user gave the
  fixed 1com production host, `https://pbx6webserver.1com.co.il/pbx/proxyapi.php`.
  Note the path differs from the vendor's own `/mirtapbx/proxyapi.php` — this
  is a 1com deployment detail, not a documentation error in the vendor page.
  Only the 1com path is used anywhere in the portal (`src/content/proxy-api.ts`).

### Missing documentation

- **A-02 (High) No error model.** No error responses, codes, HTTP statuses,
  or failure formats appear anywhere on the page → U-04.
- **A-03 (High) Responses essentially undocumented.** One operation has a
  real output sample. `format` is described as "plain, json, xml, and csv,
  depending on the request", but per-operation support and the default are
  not stated. There is no JSON response sample anywhere → U-11. **Resolved
  2026-09-25 (Phase 4), for INFO EXTENSIONS only:** the user supplied a
  sanitized real response (`source-docs/observed/info-extensions.json`,
  extension names replaced with placeholders before commit). It shows the
  response is a JSON object keyed by `ex_id`, not an array — a fact observed
  from this capture, not stated by the vendor page. `evidence:
  "observed-sanitized"` in `proxy-api.ts`; this remains OBSERVED, not
  DOCUMENTED, and Demo mode never replays it. The other 38 reqtypes still
  have no response sample.
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

## 7. Phase 5 — first real Live call (2026-09-25)

A-40 — `INFO info=EXTENSIONS` default output is plain text, not JSON
(DOCUMENTED ≠ OBSERVED)

- Request: through the portal's Live proxy, `tenant=demo`, user's own key,
  no `format` parameter (the allowlist does not include `format`).
- Observed: upstream HTTP 200, `content-type: text/html; charset=UTF-8`,
  152 bytes, a pipe-delimited table with header row
  `Number|Name|Tech|State|Username|Password` and one row per extension.
  (Row values are real tenant data and are not recorded here.)
- Conflicts with: the portal's published response for this endpoint
  (`src/content/proxy-api.ts`, from the U-11 capture), which is a JSON
  object keyed by `ex_id` with fields `ex_id`, `ex_name`, `ex_number`.
  Both field sets and format differ.
- Likely cause (not verified): the common `format` parameter
  (`_common.yaml`: plain, json, xml, csv; default not_documented). The
  U-11 capture was probably taken with `format=json`, and the default is
  probably `plain`. Not tested, since `format` is outside the U-08
  allowlist.
- Security note: the plain output has a `Password` column (empty for every
  row on this tenant). Whether other tenants/keys return SIP credentials
  here, and whether JSON output includes them, is not_documented.
- Status: open. Nothing silently changed; `verification.tested` stays
  `false` pending a user decision.
- Follow-up (same day, `format` now allowlisted, all calls via the proxy,
  structure only recorded):
  - no `format` ≡ `format=plain`: the pipe table above.
  - `format=json`: `application/json`, a JSON **array** (not an object keyed
    by `ex_id`), one item per extension, **148 fields per item**: the full
    extension configuration record. It includes credential fields
    (`password`, `ex_webpassword`, non-empty for some rows), 2FA params
    (`ex_2fa_param1..3`), `ex_lockpin`, PII (`ex_email`, `ex_alertemail`,
    `ex_mailbox`, `ex_notes`, `ex_emergencynotes`) and network rules
    (`ex_permit`, `ex_ipfilter`). Server-side redaction removed the non-empty
    credential values before anything reached the browser.
  - `format=xml`, `format=csv`: HTTP 200, 0-byte body (apparently
    unsupported for this operation; not documented either way).
  - The U-11 capture (object keyed by `ex_id`, 3 fields) matches **neither**
    real format. It may have been reshaped before it was supplied (unknown).
    The published response schema in `proxy-api.ts` is therefore unverified.

## 8. Phase 5 adjustment — probes for additional Live endpoints (2026-09-25)

Direct structure-only probes against `https://pbx6webserver.1com.co.il/pbx/proxyapi.php`,
`tenant=demo`, user's own key, from a local script (not the portal, not
committed). Only status, content type, sizes and character classes were
recorded; no values.

A-41 — `AGENT action=LISTQUEUES` returns an empty body in every case tested
(OBSERVED; indistinguishable from failure)

- Candidates: the demo tenant's 3 extensions, taken from `INFO/EXTENSIONS`
  (`username`, format `<n>-demo`); each with `format=json`.
- Observed for every call: HTTP 200, 0-byte body. Default and `format=plain`:
  `text/html; charset=UTF-8`. `format=json`: `application/json`.
- Controls also 0 bytes: a nonexistent extension (`99999-demo`), and no
  `extension` at all. Adding `queue=3698` (documented only for PAUSE; user-
  approved experiment) changed nothing.
- So "not an agent", "invalid input" and "no data" cannot be told apart. No
  response structure was observed; a JSON field allowlist cannot be derived.
- Unknown: whether the demo tenant has any queue agents, whether the key has
  permission for `AGENT`, and what a non-empty response looks like.

A-42 — `CDR action=GET field=userfield` returns the raw field value as text,
ignoring `format` (OBSERVED; not documented)

- Real uniqueid (user-supplied, `pbx43-…` form): HTTP 200, 9-byte body, one
  line, no delimiter, not JSON, for all three of default / `format=json` /
  `format=plain`. Content type follows `format` (`application/json` for json,
  `text/html; charset=UTF-8` otherwise), but the body is identical.
- Nonexistent uniqueid, malformed uniqueid (`zzz`), and no uniqueid: HTTP 200,
  0-byte body (identical to each other). A missing CDR is therefore an empty
  200, not an error.
- The body is the userfield content itself (free-form customer data), so the
  body differs from every control. Its value was not recorded.
- Consequence for the Live proxy: `projectJsonFields` passes non-JSON text
  through unchanged, and `redactSensitive` has nothing to match on a
  single undelimited line. The portal would show the raw userfield value.
  `format` has no effect, so it should not be exposed for this operation.

A-43 — `INFO info=agents` (user-supplied; not exemplified in the source,
which only names "agents" in the INFO purpose line) returns a keyed object of
positional records (OBSERVED)

- Request (user-supplied): `tenant=demo&format=json&reqtype=INFO&info=agents&queue=3698`.
- `format=json`: HTTP 200, `application/json`, 271 bytes. A JSON **object
  keyed by agent id** (shape `<ext>-<tenant-ish suffix>`), 2 entries. Each
  value is an object with **numeric string keys** `0,1,2,4,5,6,7,8,10,11`
  (sparse: no `3`, no `9`), i.e. a PHP positional row. No field names.
  Observed values (agent ids masked): `0`="0", `1`="available",
  `2`="UNAVAILABLE", `4`–`8`="" (empty), `10` and `11` = the agent id.
  Field meanings are not documented; the above are values only.
- Default format ≡ `format=plain`: `text/html`, 40 bytes, one line,
  `<agent-id>:<State>|<agent-id>:<State>|` (trailing `|`, no header row).
- `info=AGENTS` (uppercase) returns the identical body (case-insensitive, cf. A-08).
- No `queue` parameter: identical body to `queue=3698` on this tenant (either
  the only queue, or `queue` is ignored when absent: not determinable here).
- Nonexistent `queue=999999`: HTTP 200, body `null` (4 bytes). Not an error status.
- `format=xml`, `format=csv`: HTTP 200, 0-byte body.
- `AGENT action=LISTQUEUES` (A-41) is superseded by this operation for the
  Live Playground, at the user's direction.

## 10. 1com source rebuild (2026-09-25) — new source, old-vs-new conflicts, ambiguities

The user directed a reset of the documentation baseline: discard §1–6's
MiRTA-sourced normalization and rebuild from 1com's own documentation —
the Site (`sites.google.com/1com.co.il/1com-api/בית`) plus its linked
Google Doc (parameter reference for "missing operations"). Both are
authoritative; where they disagree with each other or with themselves, no
winner is picked here — see `unresolved.md` for the items needing a user
decision. Full per-operation detail lives in `proxy-api/*.md`; this
section is the audit-level summary.

### 10.1 New-source completeness

| Measure | Count |
|---|---|
| Reqtypes documented by the Site (examples) | ~19 (INFO, DIAL, HANGUP, AGENT, MEDIAFILE, QUEUE, VOICEMAIL, COUNTCALLS, PHONEBOOK, FAX, RESPONSEPATH, MANAGEDB with 9 objects) |
| Reqtypes documented by the Doc (parameter lists) | 28 (see `proxy-api/README.md`'s list) |
| Reqtypes documented by neither Site nor Doc, but present in either the old 40-file set or a currently-implemented Live endpoint | see 10.3 |
| New reqtype not in the old 40-file set at all | 1 (`PEERS` — `proxy-api/peers.md`) |
| Response samples in the new source | 3 (DIAL's call-id line; RESPONSEPATH GETLAST plain and its malformed XML variant) — same order of magnitude as the old source's 1 |
| Stated parameter requiredness | still mostly absent; the Doc says "optional" for some params but leaves most `not stated` |

### 10.2 Ambiguities carried into `unresolved.md` as new U-items

Full text of each in `raw/SOURCES.md`'s "Known ambiguities" list and the
per-file notes in `proxy-api/`. Summary:

- Three different base-URL host forms appear across the same source
  (`pbx6webserver.1com.co.il/pbx`, `demo.1com.com/1com`,
  `devel.1com.com/1com`), with a `DEMO`/`DEVEL` tenant-placeholder
  mismatch riding along with it. `_common.md`.
- `format`'s accepted values conflict across the common-parameters block
  (`json`/`plain`) and several per-operation notes (`csv`/`xml`/`json`).
  `_common.md`.
- The Doc duplicates a whole reqtype block (QUEUERESET…COUNTCALLS) with
  a difference in RESPONSEPATH's params between the two copies (`rrid`/
  `getid` in one, not the other). `responsepath.md`, `voicemail.md`.
- HANGUP's and MEDIAFILE's Doc text run together with no line break.
  `hangup.md`.
- The RESPONSEPATH XML sample is malformed (mismatched closing tags) —
  same defect class as the old source's one response sample, coincidentally.
  `responsepath.md`.
- `PAUSECAMPAIGN` listed twice in the destination-tag table, second time
  described as "Unpause". `managedb.md`.
- A destination tag spelled `VOICMEAIL`. `managedb.md`.
- DIAL/SMS's `source|?exten` parameter name/meaning. `dial.md`, `sms.md`.
- ManageDB "Update a routing profile" and "Updating a DID" examples have
  no `tenant`, unlike every sibling ManageDB example. `managedb.md`.
- AGENT's `action=LISTQUEUES` (Site) isn't in the Doc's `pause`/`unpause`
  list. `agent.md`.
- VOICEMAIL's `markread`/`markunread` actions (Site) aren't in the Doc's
  `list`/`messages`/`message`/`delete` list. `voicemail.md`.
- FAX's Site example uses `number=`; the Doc's parameter table names it
  `dest_number=`. `fax.md`.

### 10.3 Reqtypes absent from the new source

**Genuinely undocumented by either new file** (not carried forward as
`.md` files, per `proxy-api/README.md`'s "one file per reqtype either
source documents" rule):

| Reqtype | Old purpose (MiRTA source, for continuity only) | Relevance |
|---|---|---|
| `CDR` (standalone, `action=GET`/`UPDATE`) | Get/update one field on a CDR row | **Used by the already-implemented `cdr-get` Live endpoint.** Kept as `proxy-api/cdr-standalone.md`, explicitly marked historical-only. |
| `AUTHTOKEN` | Generate/reset auth tokens | — |
| `CHECKAUTH` | Validate a username/password | — |
| `CHANSIPPEERS` | List chan_sip peers | New source's `PEERS` (10.1) may or may not be its successor — UNRESOLVED, see `peers.md`. |
| `DND` | Get/set do-not-disturb | — |
| `GETCURRENTCALLS` | Show current calls for a phone/tenant | — |
| `GETWEBRTCAUTH` | Authenticate an extension for WebRTC | — |
| `LICENSEDAYS` | Days before license expiration | — |
| `SETTING` | Get/set tenant settings | — |
| `USERGROUP` | Manage tenant/user group assignment | — |
| `PHONEBOOKS` (plural) | Was already flagged in the old audit as not a real distinct reqtype (its section only ever documents `PHONEBOOK`, singular) | Confirmed again — not a real gap, just a recurring heading typo. No `.md` file. |

Correction (2026-09-25): an earlier version of this section also listed
`info=EXTENSIONS` and `info=AGENTS` as absent. That was wrong — the Doc
lists both (lines 122, 133). They are documented as purpose lines only
(no example, no response sample); `info.md` now has proper entries. U-16
is closed as a documentation error. `src/content/proxy-api.ts` still
cites the removed `info.yaml` for them (stale citation, unchanged).

### 10.4 Scope note

Re-mapping the 3 already-implemented Live endpoints, and specifying the 7
Demo Playground examples, against this rebuilt source is explicitly
**out of scope** for this rebuild, per the user's request. `src/` was not
touched.

## 11. Real-API verification of the 5 Demo operations (2026-09-25)

Direct requests to `https://pbx6webserver.1com.co.il/pbx/proxyapi.php` with a
user-supplied TEST key on a test tenant, from a local script (not the portal,
not committed). GET only. Output was structure-only (field names, types,
value masks, counts); no values, key or tenant were recorded. Enum-like
fields were read as distinct values only when they were letters-only.
Scope: INFO `SIMPLECDRS`, `QUEUELOGS`, `EXTENSIONS`, `AGENTS`, `DIDS`.

A-48 — Errors are HTTP 200 with a fixed text body (OBSERVED; undocumented)

- Bad key, missing `tenant`, and a nonexistent tenant all return HTTP 200 and
  the same 46-byte body: `Too bad... you mistaken the security api key.`
- Content type follows `format` (`application/json` for `format=json`) even
  though the body is not JSON.
- Unknown `info` value: HTTP 200, 0-byte body.

A-49 — `SIMPLECDRS` (OBSERVED)

- `format=json`: array of records. Each record has 11 named fields —
  `sc_te_id`, `tenantcode`, `sc_start`, `sc_direction`, `sc_calleridnum`,
  `sc_calleridname`, `sc_dialednum`, `sc_disposition`, `sc_duration`,
  `sc_uniqueid`, `sc_whoanswered` — plus the same 11 values under positional
  keys `"0"`..`"10"` (22 keys). All values are strings; `sc_start` is
  `YYYY-MM-DD HH:MM:SS`.
- Observed enums: `sc_direction` ∈ {IN, OUT, LOCAL};
  `sc_disposition` ∈ {ANSWERED, NO ANSWER, FAILED, CONGESTION}.
- No match (date range without calls, nonexistent `phone`): HTTP 200,
  `application/json`, **0-byte body** (not `[]`).
- `format=csv`: header row of the 11 named fields, comma-delimited,
  values with spaces quoted.
- Default ≡ `format=plain`: pipe-delimited; the header lists all 22 keys
  (positional and named interleaved) and is **not** followed by a line break
  before the first row; each data row carries every value twice plus a
  trailing `|`. Malformed as a table.
- `phone` and `direction` filters narrow results (`direction=in` matched
  `IN`, so case-insensitive). Filter names are the Doc's; response fields are
  `sc_`-prefixed.
- No `start`/`end`: returned 1 row where 2020→today returned 77. The default
  range is not documented and was not determined.

A-50 — `QUEUELOGS` returns no observable data on the test tenant (OBSERVED)

- Every date range tried (7 days, 2026, 2020→today, 2015), with and without
  `queue` (including a real queue id and a nonexistent one):
  `format=json` → HTTP 200, `application/json`, the single byte `]`
  (invalid JSON); default and `format=csv` → 0-byte body.
- Structure is therefore unknown. Demo for this operation is blocked until a
  tenant/queue with queue-log data is supplied (user decision, 2026-09-25).
- **Update, 2026-09-25 — one record supplied by the user** (pasted into the
  session, `format=json`; tenant and request params not stated). Redacted
  copy: `source-docs/observed/info-queuelogs.json`. Observed:
  - JSON array of records. Each record has 156 named fields, each duplicated
    under a bare positional key `"0"`..`"155"` (same pattern as SIMPLECDRS,
    A-49).
  - Fields 0–8 are the queue log itself: `time` (`YYYY-MM-DD HH:MM:SS`),
    `qu_name`, `callerid`, `disposition`, `agent`, `holdtime`, `calltime`,
    `origpos`, `callid` (`<host>-<epoch>.<seq>`, same shape as
    `sc_uniqueid`).
  - Fields 9–155 are `ex_id`..`ex_pinlocked`: the full extension row,
    evidently joined on the answering agent (see A-55).
  - The one record is `disposition=ABANDONED`, `agent`/`calltime` null, and
    every `ex_*` field null. Non-null values are strings.
  - The paste was truncated before the first key; key `"0"` = `time` is
    inferred from the positional pattern.
- Still unobserved: answered-call records (and so what the `ex_*` block
  holds when non-null), other `disposition` values, `format=csv` and
  default with data, and whether `queue`/`start`/`end` filter as named.
- Demo (user decision, 2026-09-25): reproduce the full 156-key shape with
  every `ex_*` null; offer only the observed cases (this ABANDONED record
  in json, plus the two empty results above). Everything else shows
  "Not simulated".

A-51 — `EXTENSIONS` (OBSERVED; confirms A-40)

- `format=json`: array of records, 148 named fields each (no positional
  duplicates), including credential/PII fields (`password`, `ex_webpassword`
  64-char hash, `ex_2fa_*`, `ex_email`). Two fields are `null`
  (`ex_lastcostalert`, `ex_lastofflinealert`); the rest are strings.
- Default: pipe-delimited, header `Number|Name|Tech|State|Username|Password`.
- Observed enums: `ex_tech` = SIP; `st_state` = UNAVAILABLE.

A-52 — `AGENTS` (OBSERVED; confirms A-43, one type detail)

- As A-43. Addition: in `format=json` the value at key `"0"` is a JSON
  **number**; all other positions are strings. Position `1` = `available`,
  position `2` = `UNAVAILABLE` on this tenant.
- Nonexistent `queue`: body `null`.

A-53 — `DIDS` (OBSERVED)

- `format=json`: array of records, 348 keys each: 174 positional plus 174
  named. Named keys are the DID row (`di_*`, 50 fields) joined with the
  **entire tenant row** (`te_*`), which includes `te_recordingpassword`,
  `te_recordinguser`, `te_recordinghost`, `te_billingcode`.
- Default ≡ `format=plain`: pipe-delimited, 11 columns, header
  `Country|Area|Number|Tenant|Comment|Recording|Faxstation ID|FAX Email|Max Channels|Recording EMail|SMS Email`.
- `format=csv`: 0-byte body.
- Observed enums: `di_recording` ∈ {yes, ""}; `di_fax` = no.

### 11.1 Demo decisions (user, 2026-09-25)

- QUEUELOGS: get real data first (A-50) before building its Demo.
- Shape: EXTENSIONS Demo mirrors the Live view (the 6 allowlisted fields);
  DIDS Demo mirrors the plain-format columns' `di_*` equivalents only — no
  `te_*` block, no credential fields.
- Reproduce faithfully: 0-byte empty result, the auth-error text,
  SIMPLECDRS positional duplicate keys, and `plain`/`csv` where observed.
- All Demo values synthetic; Live allowlist unchanged.

A-54 — `SIMPLECDRS` default/plain format is malformed and only partially
decoded (OBSERVED; found while building Demo fixtures, 2026-09-25)

- With calls present, the first line already mixes what look like field
  labels and a first data row with no line break in between (unlike
  `EXTENSIONS`/`DIDS`, whose default/plain first line is a clean header).
  The masked capture shows a repeating `<digit(s)>|<letters_with_underscore>`
  pattern consistent with the same 22-key shape seen in `format=json`
  (11 named fields duplicated under bare positional keys "0".."10"), i.e.
  the positional key and the field name appear to be interleaved into the
  header row itself, and each following row repeats every value twice.
- This is a partial read from masked structure only (no raw values were
  captured), so the exact layout is not established with confidence.
- Consequence: this format is **not simulated** in Demo for this operation
  (`src/content/demo/proxy.ts`) — `json` and `csv`, both cleanly understood,
  are offered instead. Re-running the probe with a header-safe capture of
  this specific response would resolve it, if ever needed.

A-55 — `QUEUELOGS` records embed the agent's full extension row, including
credential fields (OBSERVED shape; values not yet observed; SECURITY)

- Fields 9–155 of every QUEUELOGS record (A-50) are the `extensions` table
  row: the same `ex_*` names `EXTENSIONS` returns in `format=json` (A-51).
  They include credential/PII fields: `ex_webpassword`, `ex_token`,
  `ex_token_validity`, `ex_2fa_param1`..`ex_2fa_param3`, `ex_lockpin`,
  `ex_email`, `ex_alertemail`, `ex_webuser`.
- In the only record observed (ABANDONED, no agent) all are null. The join
  presumably fills them for an answered call; that is **inferred, not
  observed**.
- Each credential value would also appear a second time under its bare
  positional key (e.g. `"43"` = `ex_webpassword`, `"44"` = `ex_token`), which
  name-based redaction cannot match.
- Consequence: QUEUELOGS must not be added to the Live allowlist without a
  per-item output-field allowlist in `LIVE_POLICIES`
  (`src/server/playground/allowlist.ts`), as EXTENSIONS has, that drops the
  positional keys as well. It is not on the allowlist today. Demo is
  unaffected: every `ex_*` value there is null.
- Tracked as blocking requirement **SEC-REQ-01** in `docs/SECURITY.md`
  "Blocking requirements for future Live enablement".

## 12. Phase 7 Stage 4 — structure-only probe of the read operations (2026-09-26)

35 non-ManageDB read operations (excluding the 6 already characterised:
EXTENSIONS, AGENTS, DIDS, SIMPLECDRS, QUEUELOGS, CDR GET) were probed once
with the documented default format and once per documented `format` value,
plus one additional `format=json` call marked "undocumented variant" for
operations that don't document `json`. A user-supplied TEST key/tenant was
used, in-process only, never written to disk; the script masked every value
to its letter/digit shape before printing, scrubbed the key/tenant
longest-first (including URL-encoded and cased variants), and its own
self-test (fake secrets in values, keys, error text, CSV, XML and an echoed
URL) found zero leaks before the real run. A follow-up probe re-tested 6
ambiguous operations with `tenant` added, a longer timeout, or `tenant`
deliberately omitted. Six operations returned no data (empty body or
timeout) either run; those are recorded with the others below rather than
skipped, since "no data" is itself an observed fact.

A-56 — `INFO queues` / `INFO queue` (OBSERVED)

- `queues`: default is one line of pipe-delimited `<id>: <label>` pairs (no
  header), 38 entries on this tenant; one label contained a literal comma,
  which is why this project's own probe tooling mis-detected the line's
  separator — the wire format is pipe-delimited, not comma. `format=json`
  (undocumented): an object keyed by queue id, each value a short string
  (the queue name).
- `queue`: called with no `id` (none was supplied), it still returned one
  queue's full stats as a pipe-delimited row of 23 named fields
  (`AGENTSAVAILABLE`, `AGENTSPAUSED`, `AGENTSFREE`, `AGENTSONLINE`,
  `CALLSINQUEUE`, `SERVICELEVEL`, `FIRSTWAITING`, `SECONDWAITING`,
  `THIRDWAITING`, `CALLSONLINE`, `TALKTIME`, `HOLDTIME`, `ANSWEREDCALLS`,
  `CALLSRECEIVED`, `REALANSWEREDCALLS`, `TRANSFEREDCALLS`,
  `ABANDONEDCALLS`, `TIMEDOUTCALLS`, `QUEUECAR`, `EXITWITHKEYCALLS`,
  `MAXHOLDTIME`, `AVERAGETALKTIME`, `AVERAGEHOLDTIME`); `format=json`
  confirms the same 23 field names. **Not confirmed**: whether this is the
  tenant's only/first queue, a default, or `id` silently ignored when
  absent — no id-filtering behavior was observed.

A-57 — `INFO agentsconnected` / `INFO agentsdelay` (OBSERVED)

- `agentsconnected`: default is one line of pipe-delimited `<number>:<state>`
  pairs (38 on this tenant, no `queue` filter supplied). `format=json`
  (undocumented): an object keyed by a 10-digit number, each value itself an
  object keyed by a single digit (queue id, presumably) mapping to an
  integer. Field/key meanings are not documented; this is the raw observed
  shape only.
- `agentsdelay`: same two-level keyed-object shape in `format=json`
  (outer key a 3-digit id, inner key a single digit, value an integer,
  presumably an answer-delay count or seconds). Default is a pipe-delimited
  `<id>:<value>` line, 39 entries.
- Neither operation's `queue` filter was exercised (omitted, since it is
  undocumented as optional); both returned tenant-wide data without it.

A-58 — `INFO outdialed` (OBSERVED)

- Default (no format) is an empty 200 body. `format=json` (undocumented)
  returns an object keyed by a free-text device/extension identifier —
  **not always numeric**: some keys observed during this probe were
  human-readable device labels, including what appears to be a real
  person's name embedded in a device/system label on the test tenant. That
  value is not reproduced here or anywhere in the repo; it is a live-data
  characteristic of this operation worth flagging for any future Live
  consideration — unlike EXTENSIONS/AGENTS/DIDS, this key space is
  **not a stable, anonymous identifier**. Each value is `{ STATE: string }`.

A-59 — `INFO call` (OBSERVED — no data)

- Both format variants timed out (30 s) with no `id` supplied. The response
  shape for this operation remains completely undocumented; a real call id
  or a returned-by-DIAL id would be needed to observe it, and none was
  available during this probe.

A-60 — `INFO recording` / `playrecording` / `inforecording` (OBSERVED)

- All three return the identical plain-text error `No id specified` (14
  bytes, `text/html`) when `id` is omitted, for both the default and
  `format=json` request — `format` makes no difference to this error path.
  No binary/audio body or metadata shape was observed for any of the three
  (would need a real recording id).

A-61 — `INFO voicemailtranscript` (OBSERVED — no data)

- Empty 200 body (0 bytes, `text/plain`) for both format variants when `id`
  is omitted. Response shape with a real id is unknown.

A-62 — `INFO EXTSTATE` (OBSERVED; confirms the Phase 6 partial probe)

- Default/plain: a 2-byte whitespace-only body (`\r\n`), matching exactly
  the partial finding recorded during Phase 6 Step 1 (see
  `docs/SESSION_HANDOFF.md`'s "Earlier IN-PROGRESS checkpoint" history).
  `format=json`: `{ UniqueID: 2-letter string, LinkedID: string, ≤24 chars
  observed }` — also matches that partial finding, now confirmed complete.
  `ext` was omitted in this run (undocumented as optional); the response
  did not appear to depend on it.

A-63 — `INFO config` (OBSERVED)

- Default is a 7-field pipe-delimited positional row (values include two
  small integers and one that looks like a signed number, e.g. `-1`).
  `format=json` returns only **3** named fields: `maxchannels`,
  `maxextensions`, `maxdids` — a strict subset of the 7 positional values,
  not a full mirror. The other 4 positional fields' names/meanings are not
  established by either format.
- Note (carried from `info.ts`): a full probe of this operation risks
  surfacing tenant configuration fields not meant for display (by analogy
  with DIDS's joined tenant row, A-53) — treat with the same caution before
  ever adding it to Live.

A-64 — `INFO CDRS` (OBSERVED — no data on this tenant)

- Default, `format=csv` and `format=xml` all returned an empty 200 body (0
  bytes) — no CDR data on this tenant for the (unfiltered) query used.
  `format=json` (undocumented) returned a single byte, `]` — a
  malformed/truncated empty-array artifact, the same server-side pattern
  already seen for SIMPLECDRS (A-54) and QUEUELOGS (A-50) when they have no
  matching data. This appears to be a shared platform quirk across multiple
  reqtypes' JSON-empty-result path, not specific to one operation.

A-65 — `INFO balance` (OBSERVED)

- The response body is a **bare number** (e.g. `123.45`), not wrapped in a
  JSON object or array, identically for the default and `format=json`
  requests (`format` has no observed effect). 12 bytes on this tenant.

A-66 — `INFO FLOW` (OBSERVED — incomplete, no `id` supplied)

- Both default and `format=json` returned the same 11-byte plain-text word
  (a state-like string). Since no `id` was supplied, it is **not
  established** whether this is a real single-flow state, a default/first
  flow, or a fixed filler value when `id` is absent.

A-67 — `INFO variable` (OBSERVED — no data)

- Empty 200 body (0 bytes) for both format variants when `id` is omitted.

A-68 — `AGENT LISTQUEUES` (OBSERVED; refines A-41)

- Without `extension`, both format variants return the plain-text error
  `No extension specified` (paraphrased from a masked capture; exact
  wording not preserved by the probe's masking). This refines A-41's "no
  observable data" into a concrete, named-parameter validation error —
  the operation is reachable and responsive, it simply requires
  `extension`, which was not supplied by either the original probe or this
  one.

A-69 — `CHANNEL`, `COUNTCALLS`, `COUNTCHANNELS`, `HELP` all require an
undocumented `tenant` (OBSERVED)

- Without `tenant`, all four return the **identical** fixed error text (46
  bytes, `text/html`) — the same message across four independently
  documented reqtypes suggests a shared platform-level key/tenant guard,
  not a per-operation check. None of the four documents `tenant` as
  required; `COUNTCALLS` and `HELP` don't document it as a parameter at
  all, and `CHANNEL`'s only documented parameter is `channel`.
- With `tenant` supplied (follow-up probe): `COUNTCALLS` returns an empty
  200 body (0 bytes — plausibly "no calls in progress", not confirmed);
  `CHANNEL` returns an array of same-length, content-empty pairs (55 items
  on this tenant — plausibly an idle-channel enumeration, not confirmed);
  `HELP` returns a large (~24 KB) `text/html` page wrapped in `<pre>`/`<i>`
  tags, consistent with its documented purpose ("the latest syntax for the
  operations", `_common.md`) — the page's own text content was not
  captured (structure only: tags and byte count).
- `COUNTCHANNELS` is a partial exception: with `tenant` sent it instead
  returns `Wrong or missing tenant` (28 bytes) — different from the other
  three, suggesting it wants its other documented parameter (`nodename`)
  and/or an Admin key rather than a tenant key. Not resolved further; both
  variants of the error are now recorded rather than assumed to be the
  same.

A-70 — `COUNTPEERS` is slow (OBSERVED — timing)

- The initial probe (15 s timeout) timed out. A follow-up with a 30 s
  timeout succeeded, but only after **~23 seconds**. Response: default is a
  pipe-delimited `<node>:<count>` line (50 entries); `format=json` is an
  object keyed by node id, integer values.
- This exceeds this portal's own request timeout used elsewhere for Live
  proxying (`src/server/playground/allowlist.ts` / `docs/SECURITY.md`); if
  this operation is ever considered for Live, its latency — not just its
  data sensitivity — is a separate blocking concern.

A-71 — `PEERS` (OBSERVED)

- `format=json` gives the full field list: `node`, `Name`, `Host`, `Dyn`,
  `Forcerport`, `Comedia`, `ACL`, `Port`, `Status`, `Description`,
  `Realtime` — one object per peer, 41 peers observed on this tenant. The
  default's pipe-delimited table carries the same 11 columns in the same
  order.

A-72 — `BLFS` (OBSERVED)

- `format=json` gives the full field list: `st_extension`, `st_state`,
  `st_timestamp` — 518 records observed on this tenant. The default
  pipe-delimited line repeats each of these 3 fields under **both** a bare
  positional key and its name (6 values per line, not 4): position `0`
  mirrors `st_extension`, `1` mirrors `st_state`, `2` mirrors
  `st_timestamp` — the same positional-then-named pattern seen elsewhere
  (SIMPLECDRS, QUEUELOGS).
  - **Confirmed directly, not just inferred**, during Stage 7 remediation:
    the raw probe capture's default-format line splits into exactly 7
    pipe-delimited tokens (`fieldsLine1: 7`) — 3 positional/named pairs (6
    tokens) plus the expected trailing empty token from the line's closing
    `|`. This is a closed match to BLFS's 3 named fields; no positional key
    is left unaccounted for.
  - The `format=json` masked shape originally looked like a single
    positional key (`"<9>"`) because the Stage 4 probe's shape-summarizer
    collapses every single-digit-shaped key into one bucket — a masking
    artifact of the probe script, not evidence that only one positional
    key exists at runtime. The default-line token count above is
    unaffected by that bug and is the basis for the corrected count.

A-73 — `FLOWS` (OBSERVED)

- `format=json` gives the full field list, in this order: `fl_id`,
  `fl_te_id`, `fl_name`, `fl_comment`, `fl_number`, `fl_value`,
  `fl_value_for_unavailable`, `fl_value_for_inuse`,
  `fl_value_for_notinuse`, `fl_value_for_ringing`, `fl_variable_name`,
  `fl_monitor_type`, `fl_monitor_type_id`, `fl_monitor_parameter`,
  `st_extension`, `st_state`, `st_timestamp`, `st_peername` — 18 named
  fields, 5 flow records observed on this tenant. The default pipe-
  delimited line repeats every one of these 18 fields under both a bare
  positional key and its name (positional key `<n>` mirrors the named
  field at index `<n>` in the order above: `0`→`fl_id` … `17`→`st_peername`).
  - **Confirmed directly, not just inferred**, during Stage 7 remediation:
    the raw probe capture's default-format line splits into exactly 37
    pipe-delimited tokens (`fieldsLine1: 37`) — 18 positional/named pairs
    (36 tokens) plus the expected trailing empty token. This is a closed
    match to all 18 named fields; no positional key is left over and none
    is missing.
  - The `format=json` masked shape's two colliding buckets (one
    single-digit-shaped key, one double-digit-shaped key) are exactly what
    18 positional keys would produce under the same probe shape-summarizer
    bug (indices `0`-`9` collapse to the single-digit bucket, `10`-`17` to
    the double-digit bucket) — consistent with, not contradicting, the
    18-key count above.

A-74 — `MEDIAFILE GETAUDIO` / `VOICEMAIL messages` (OBSERVED — no data)

- Both return an empty 200 body (0 bytes) when their selecting parameter
  (`objectid`/`id` for MEDIAFILE, `mailbox` for VOICEMAIL messages) is
  omitted — unlike most other operations tested without their id, neither
  returns an error string.

A-75 — `PHONEBOOK query` / `QUEUE list` / `VIRTUALEXT list` (OBSERVED)

- Each returns an explicit, named-parameter error string when its selecting
  parameter is omitted: PHONEBOOK names `phonebook`/id, QUEUE names
  `id`/`number`, VIRTUALEXT names its extension-number parameter. Exact
  wording is only partially preserved by the probe's masking (common words
  survive; identifiers do not) but the pattern — a specific, named-field
  validation message, not a generic error — is consistent across all
  three.

A-76 — `RESPONSEPATH list` / `getid` / `getlast` (OBSERVED — no data)

- All three returned an empty 200 body (0 bytes) with no error text,
  regardless of the `id`/`filter`/`filterdata` values supplied (none) or
  `format` (including `format=xml` for `getlast`), on this tenant. This is
  consistent with the source's own lack of a response sample for `list`
  and `getid`; `getlast`'s vendor-sourced plain-text sample
  (`responsepath.md`, `evidence: "vendor"`) was not reproduced or
  contradicted here — this tenant simply had no matching data.

A-77 — `VOICEMAIL list` exposes a plaintext IMAP credential pair per mailbox
(OBSERVED; SECURITY)

- `format=json` returns one object per mailbox with roughly 60 fields,
  including `imapuser` and `imappassword` alongside personal fields
  (`fullname`, `email`) — 42 mailboxes observed on this tenant. Every value
  observed for `imapuser`/`imappassword` in this probe was `null`, so
  whether a populated mailbox exposes a real password here was **not**
  directly confirmed, but the field exists in the schema and its name is
  unambiguous.
- Default/plain is a much smaller 5-column pipe-delimited table (header:
  `Mailbox|Fullname|Email|Attach|` — the fifth column's header was empty in
  the observed capture) and does not include the IMAP fields.
- Consequence: same category of risk as A-55 (QUEUELOGS) — this operation
  must never be added to the Live allowlist without a field-level output
  allowlist that drops `imapuser`/`imappassword` (and re-checks the other
  ~55 fields for anything similarly sensitive, e.g. `serveremail`). Tracked
  as blocking requirement **SEC-REQ-02** in `docs/SECURITY.md`.
- Demo (Stage 5) must decide, with the user, how to represent these two
  fields — QUEUELOGS's precedent (A-55) is to keep the field in the
  documented schema but fix it at `null` in every fixture, never a
  synthetic-looking password value.

### 12.1 Not added to the allowlist / no Live change

Nothing in this stage adds any operation to
`src/server/playground/allowlist.ts#LIVE_POLICIES`. All 35 operations above
gain Reference-only response documentation (`evidence: "observed-sanitized"`,
`verification.tested = true`); none becomes newly available in the Live
Playground. `ManageDB` and the two `unclear` operations
(`info-voicemail`, `voicemail-message`) remain excluded from probing, per
the Stage 1 decision.

### 12.2 Stage 7 finding 4 — error/empty-only responses relabelled (2026-09-26)

The Stage 7 review found that several of §12's operations had their only
observation (a missing-parameter error, or an empty/no-data body) written
into `responses[0].description` as if it were the operation's normal
success result. Fixed by rewriting each description to lead with "Success
response not documented" (or the operation's own equivalent phrasing) and
present the observed error/empty body explicitly as the no-parameter case,
never as the success shape. Status stays 200 in every case (the response
viewer supports one example per status code, per the Stage 3
RESPONSEPATH-GETLAST precedent).

**Exactly 13 operations qualified**, guarded by
`tests/unit/proxy-coverage.test.ts` ("never presents an error/empty-body
probe observation as the endpoint's success response"):
`info-inforecording` (A-60), `info-voicemailtranscript` (A-61), `info-cdrs`
(A-64), `info-variable` (A-67), `agent-listqueues` (A-68), `countcalls`
(A-69), `countchannels` (A-69), `voicemail-messages` (A-74),
`phonebook-query` (A-75), `virtualext-list` (A-75), `queue-list` (A-75),
`responsepath-list` (A-76), `responsepath-getid` (A-76).

**Deliberately excluded**, on inspection of what each actually observed:
- `channel` (A-69) and `help` (A-69) each returned genuine non-empty,
  non-error data for one input alongside a separate error for another
  (e.g. `help` returns a real ~24 KB syntax page when `tenant` is
  supplied, and only errors when it's omitted) — their descriptions
  already qualify the data as unconfirmed ("plausibly...not confirmed")
  without presenting it as guaranteed success, so finding 4 doesn't apply
  to them the way it applies to a pure error/empty case.
- `info-recording`, `info-playrecording`, `mediafile-getaudio` (A-60,
  A-74) and `responsepath-getlast` (A-76) already keep their
  vendor-sourced response and fold the observed no-id/no-data error into
  a `notes` entry instead of a second same-status response — the pattern
  finding 4 asks for, already applied to these four during Stage 3/Stage
  4 authoring, before the review ran.

## 13. MiRTA PBX OpenAPI — documentation baseline (started 2026-09-26)

Scope: documentation only (`openapi/README.md`). **No OpenAPI call has
been made.** IDs use the `OA-` prefix so they don't collide with the
Proxy `A-` series.

- Authority: the official MiRTA OpenAPI pages and the spec.
- The wrapper `docs/mirta-openapi-claude-reference.md` supplies
  structure/policy only.
- Official evidence so far is the chapter index snapshot only
  (`raw/api-book-openapi-chapter.html`).

OA-01 — Wrapper base path is internally inconsistent (wrapper defect)
- L14, L17-20, L127-159 and L289-293 use `/pbx/openapi.php/…`.
- L31-35 ("Common REST patterns") use `/openapi.php/…` with no `/pbx`
  prefix.
- Neither is officially confirmed yet. Status: UNKNOWN; resolve from the
  official Overview page or the spec (`servers`/`paths`).

OA-02 — Wrapper resource paths: two inconsistent levels of detail, and no
official backing (wrapper defect)
- The "High-level endpoint catalog" (L92-120) gives vague paths ("tenant
  resource", "IVR resource", …).
- The "Resource matrix" (L302-330) gives specific plurals (`/tenants`,
  `/ivrs`, `/customdestinations`, …).
- No evidence in the repo supports either form. The official chapter
  snapshot has no paths.
- All 37 paths are recorded as UNKNOWN, with the wrapper's plural shown
  only as a claim (`openapi/resources.json` `path.wrapperClaim`).

OA-03 — Wrapper labels unverified content as "confirmed" (wrapper defect)
- The headings "Confirmed special endpoints" (L124) and "Extension
  resource — confirmed detail" (L163) cite no official page, line or spec
  pointer.
- The wrapper assigns no verification state to any item, although it
  defines them (L543-548).
- Treated as UNKNOWN like every other wrapper claim.

OA-04 — Wrapper provenance cannot be verified (wrapper defect)
- The wrapper carries no fetch date, page revision, hash or raw capture.
- By its own account it is "not a verbatim mirror of all 38 web pages"
  (L259).
- Recorded in `raw/SOURCES.md` as structure/policy input, not evidence.

OA-05 — Resource count wording (minor, wrapper)
- L41 says the chapter "contains 38 pages/resources".
- The official index has 38 pages, one of which is "Overview and
  Examples", so there are **37 resources plus 1 overview**. The official
  count stands.

OA-06 — Authority conflict between the wrapper's rule and the project
precedent (**decided**)
- The wrapper's rule 1 (L230) makes the MiRTA manual/spec authoritative.
- The 2026-09-25 Proxy baseline reset made 1com's own sources outrank
  MiRTA (`docs/DECISIONS.md` "Proxy API documentation baseline reset").
- Decided by the user on 2026-09-26: for OpenAPI, the official MiRTA
  documentation and spec are authoritative (1com publishes none). Proxy
  is unaffected. Recorded in `docs/DECISIONS.md`.

OA-07 — Stale or misleading OpenAPI references elsewhere in the repo
(recorded, **not fixed** in this docs-only task)
- `docs/DECISIONS.md` L194 says the 38 OpenAPI pages are indexed in
  `source-docs/inventory.json`. That file was removed in the 2026-09-25
  reset; `openapi/resources.json` now supersedes it.
- `src/content/proxy/shared.ts:25` (legacy-deprecation text) reads
  "OpenAPI-based Proxy API documentation is not yet available". This
  conflates the two APIs. It is application code and is out of scope
  here; fix it when OpenAPI implementation starts.

Facts established so far (DOCUMENTED, from truncated official snippets
only):
- The spec is OpenAPI 3.0.3 JSON.
- CDR and Simple CDR are read-only, "GET only".
- AI Logs is read-only and exports from `ai_ailogs`.
- Auth Token "generates or resets temporary login tokens".
- Dial "originates a call".
- Extension State returns live call-state for one extension.
- AI Analysis returns transcript/summary/sentiment data.
- Scope wording for each object ("tenant-scoped" / "managed at system…" /
  "normally tenant…").

Everything else is UNKNOWN. Full index: `openapi/README.md`.

### 13.1 After the official page snapshot (2026-09-26)

All 38 official pages were captured (`raw/SOURCES.md`; the page list is unchanged since 2026-09-24).

**Housekeeping:**
- The user retired the wrapper from the tree (commit `a3d8046`). It is cited as `git show 5395552:docs/mirta-openapi-claude-reference.md` ("W:<line>").
- The permanent rules are now `docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md`.

**Status of earlier items:**
- **OA-01 — resolved.** The official base is `/pbx/openapi.php`: `overview-and-examples.md:10-13` and every resource-page example. The wrapper's `/openapi.php/…` form without `/pbx` (W:31-35) was wrong.
- **OA-02 — resolved.**
  - The Overview's objects table (`overview-and-examples.md:38`) gives an official primary path for 36 resources.
  - The Extension State page gives the 37th (`/extensions/state`).
  - **All 37 of the wrapper's matrix plurals match the official paths exactly.** The vague catalog-level wording (W:92-120) was only imprecise.
- **OA-03, OA-04:** stand as records of the wrapper's provenance. They no longer matter, since every claim is now checked against official pages.
- **OA-05:** stands (37 resources + 1 overview = 38 pages).

**New items:**

OA-08 — Global-edit flag is `global=1`, not `global=yes` (**wrapper wrong**)
- The wrapper (W:484-497) documents `global=yes`, e.g. `/pbx/openapi.php/featurecodes?global=yes`.
- The official pages use `global=1` in all 24 occurrences (`overview-and-examples.md:38` and the object pages). No official page contains `global=yes`.
- Resources that accept it, per ov:38: Custom Destination, Setting, Media File, Music On Hold, Caller ID Blacklist, Cron Job, Feature Code, Short Number. This set matches the wrapper's list.

OA-09 — The Overview's error list is not exhaustive (a note, **not a conflict**)
- `overview-and-examples.md:42` says common errors "include" 8 codes and omits `tenant_required`.
- 34 resource pages document `tenant_required` ("A tenant code is required for tenant-scoped writes or tenant-key reads").
- The wrapper's list (W:504-512) had it. The wrapper was right here.
- Ten more page-specific codes exist, e.g. `single_tenant_required`, `admin_required`, `api_ip_not_allowed`. The full table is in `openapi/_common.md` §6.

OA-10 — Extension `realextensions` maps to `virtual_items` (**wrapper imprecise**)
- The wrapper's W:181 says "`realextensions` -> virtual extension mappings".
- `extension.md:15` gives the source field as `virtual_items`.

**Coverage and security:** `openapi/README.md` (coverage index) and `openapi/resources.json` (counts).

### 13.2 Stage C second-pass audit (2026-09-26)

Every resource file re-compared against its snapshot, plus `_common.md` against the Overview, the index against the chapter page, and all snapshot hashes against `raw/SOURCES.md` (38/38 match). The defects below were in local docs written during Stage B, not in the official pages. All are fixed.

OA-11 — Local transcription defects (fixed)
- `mediafiles.md`: `format` mapped to `format`; official is `me_format` (`media-file.md:15`). **Wrong.**
- `customdestinations.md`: "weighted" routing, and a link between `cu_ct_id` values and behaviors. Neither is on the page. **Invented**; now UNKNOWN.
- `conferencerooms.md`: `request_pin_mediafile_id` given a purpose the page doesn't state. **Invented.** Revision now given as #18.
- `ivrs.md`: 19 destination types → 20 (`ivr.md:21` includes `CUSTOMIVR_SUPPORT`); broken table row fixed.
- `auth-token.md`: added the omitted `:74` (a single-use token is cleared after login) and `:76` (doesn't manage API keys).
- `aianalysis.md`: added the omitted `:110` (unknown IDs omitted), `:111` (multi-recording merge) and `:113` (older installs return fewer fields). One Unknown narrowed.
- Citation fixes: `voicemails.md`, `paginggroups.md` (destination table is `:21`, sentence `:19`), and `_common.md` (`read_only_api_key` is also in ov:42).

OA-12 — Security rationale overstated the evidence (fixed)
- SEC-REQ-14 and SEC-REQ-20 called Extension's GET secret exposure a "confirmed pattern". The page documents that GET includes technology data (`extension.md:42`), not which fields. Now worded as an analogy.
- SEC-REQ-20: "admin PIN grants mute/kick/lock" isn't on the page (Asterisk domain knowledge). Now: purpose not described.
- SEC-REQ-26 / `provisioningphones.md`: "HTTP basic auth for config fetch" and "provisioning systems commonly serve back credentials" were inference. Now: purpose not described.
- None of these changes any label. Each still rests on a documented write of a credential-shaped field plus an undocumented GET.
- `openapi/README.md` said anything other than PASS gets a SEC-REQ, which contradicts 13 `UNKNOWN` resources that have none. Rule corrected, and a `W:<line>` legend added.

Security-label changes from the same review (user decisions, `docs/DECISIONS.md`): SEC-REQ-27 and SEC-REQ-28 are new cross-cutting rules; Paging Group is raised to BLOCK LIVE; Custom Destination (SEC-REQ-29) and Music On Hold (SEC-REQ-30) move from UNKNOWN to REVIEW REQUIRED.
