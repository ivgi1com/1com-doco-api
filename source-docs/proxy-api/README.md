# Proxy API Source Normalization (rebuilt 2026-09-25)

Normalized, structured record of what 1com's own documentation states about
`proxyapi.php`. This is **audit data** (DOCUMENTED state only), not portal
content — see `DOCUMENTED -> IMPLEMENTED -> TESTED -> VERIFIED` in
`CLAUDE.md`. Nothing here has been implemented, tested, or verified against
a real request unless a file says otherwise (Live-endpoint observed
behavior is in `../DOCS_AUDIT.md` §7–9, cited per file where it overlaps).

## Source (authoritative, 2026-09-25)

Two files, **both authoritative**, evidence in `../raw/`:

- **Site** — `../raw/1com-site.html` (+ `1com-site-extracted.txt` for
  reading). A single Google Sites page, ~80 full request-URL examples
  covering INFO, DIAL, HANGUP, AGENT, MEDIAFILE, QUEUE, VOICEMAIL,
  COUNTCALLS, RECORDINGS (= `INFO&info=recording`), PHONEBOOK, FAX,
  RESPONSEPATH, and 20 ManageDB object operations. No formal parameter
  reference — purpose is read from the example URLs and the handful of
  prose lines between them.
- **Doc** — `../raw/1com-doc.txt` (Google Doc, linked from the Site as
  "ניתן להתעדכן בפעולות חסרות גם במסמך זה" — "missing operations can also
  be updated in this document"). A parameter reference: for each
  `reqtype`, a short purpose line and an "Additional parameters" list with
  required/optional wording. Thinner on examples — one full request URL
  (`simplecdrs`), one response fragment (`DIAL`'s call-id line), the rest
  are parameter lists only.

Where the two disagree, both are recorded and the conflict is flagged
UNRESOLVED — see "Known ambiguities" in `../raw/SOURCES.md` and
`../DOCS_AUDIT.md` §10. No winner is picked without a user decision.

The prior MiRTA PBX vendor-manual source (Phase 3, `../raw/proxyapi-legacy.*`)
is **superseded** and kept only as historical evidence for the three
Live-endpoint operations already implemented and observed
(`info-extensions`, `info-agents`, `cdr-get` — see "Live endpoints" below).

## Layout

- `_common.md` — base URL (multiple forms seen; flagged ambiguous), key
  types, common parameters (`reqtype`, `tenant`, `key`, `format`,
  `callback`), the `HELP` reqtype, the `jsondata`/`values` POST
  conventions, the ManageDB destination-tag table.
- `<reqtype>.md` — one file per reqtype either source documents (lowercase
  file name, matching the old convention). Operations (sub-actions,
  `info=`/`action=`/`subreqtype=`/`object=` values) are nested inside.
- `managedb.md` — one file for `reqtype=MANAGEDB`, with one section per
  `object=` value (the Site documents 9: CUSTOMTYPES, CUSTOM, PHONE,
  MEDIAFILE, HUNTLIST, EXTENSION, CONFERENCE, ROUTINGPROFILE (implied,
  `object` value not shown in the one example), DID, DESTINATION, IVR,
  CONDITION).

## Conventions

- **Required column**: `yes` (Doc states it plainly), `optional` (Doc
  says "optional"), or `not stated` (appears only in an example — never
  inferred as required or optional from that alone).
- **Method**: recorded with a basis — `example_url` (GET is the natural
  reading of a bare URL; the source never states a method), or
  `example_curl_post`/`stated_jsondata` (an explicit curl/PHP example
  posts `jsondata=` or `values=`, or the request updates/creates/deletes
  a record, which needs a body).
- **Source refs**: cite by heading text + line range in the extracted
  evidence file (`1com-site-extracted.txt` / `1com-doc.txt`), not by
  anchor id — unlike the old MiRTA docs, the Site's `#h.xxxxxxxx` anchors
  are Google's internal per-heading ids with no stable text mapping
  recoverable from a static fetch, so citing them would be unverifiable.
  Line numbers are pinned to the committed evidence files and will not
  shift as long as those files are unchanged.
- **UNRESOLVED**: an explicit marker for anything the two sources
  contradict, or where the source itself is internally
  inconsistent/malformed (see `../raw/SOURCES.md`'s ambiguity list). Never
  silently resolved; needs a user decision, tracked as a `U-nn` in
  `../unresolved.md`.
- Example values (`TENANT`/`TENANTNAME`/`DEMO`/`DEVEL`, `APIKEY`, sample
  numbers) are the source's own placeholders/redacted keys, copied as
  evidence. They are **not** fixtures — Demo fixtures are a separate,
  later decision (see `CLAUDE.md` §Demo mode invariants).
- `category` is `not_documented` everywhere: neither source groups
  reqtypes into categories.

## Live endpoints already implemented (`src/content/proxy-api.ts`)

Three operations are already implemented, tested against the real host,
and live in the portal's Playground: `info-extensions` (`INFO&info=EXTENSIONS`),
`info-agents` (`INFO&info=AGENTS`), `cdr-get`
(`reqtype=CDR&action=GET`). Their `src/content/proxy-api.ts` comments cite
the now-removed `info.yaml`/`cdr.yaml`/`_common.yaml` files by name — those
citations are now stale (see the Findings section of the completion
report). Re-mapping them against this rebuilt source, and deciding whether
anything about their documented behavior changes, is **out of scope for
this rebuild** and not done here.

Specifically:
- `info=EXTENSIONS` and `info=AGENTS` **are** in the Doc's `info` value
  list (Doc lines 133, 122; `info.md`). Neither source gives an example
  or a response sample; observed behavior is in `../DOCS_AUDIT.md` A-40,
  A-43. (An earlier version of this file said otherwise; that was wrong.)
- `reqtype=CDR` (standalone, `action=GET`/`UPDATE` on one CDR row's
  `userfield`) does not appear in either new source at all. See
  `cdr-standalone.md` for what's carried forward as historical-only.

## How to answer common questions from this documentation

- **What parameters does operation X accept?** Open `<reqtype>.md`, find
  the operation's heading, read its parameter table.
- **Which parameters are required?** The table's "Required" column;
  `not stated` means genuinely unknown, not optional.
- **What `reqtype` does it use?** The file name / the `# REQTYPE` heading.
- **Does it need `info`, `action`, or another selector?** The operation's
  "Discriminator" line names the exact query key (`info=`, `action=`,
  `subreqtype=`, `object=`) and value.
- **What should the request look like?** The "Examples" section, or if
  none exists, the parameter table plus `_common.md`'s base-URL note.
- **What does the response look like?** The "Response" line under the
  example — either an observed sample or `not documented`.
- **What source supports this definition?** The "Source" line at the
  bottom of each operation, with file + line range.
