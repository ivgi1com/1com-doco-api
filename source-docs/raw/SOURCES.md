# Source Snapshots (evidence)

## Current authoritative source (2026-09-25 rebuild)

`../proxy-api/*.md` is normalized from the two files below. **Both are
authoritative**; where they disagree, `../proxy-api/README.md` and
`../DOCS_AUDIT.md` §10 record the conflict and pick no winner.

Fetched: 2026-09-25T16:27:45Z, via `curl -sSL -A "Mozilla/5.0"`, no
authentication.

| File | URL | HTTP | SHA-256 (as fetched) | SHA-256 (committed) |
|---|---|---|---|---|
| `1com-site.html` | https://sites.google.com/1com.co.il/1com-api/בית | 200 | `fc6fe4b317f360d457dbd2af851602822630b9614ad903fab3ee42ce50122cbf` | `e613a49150b97c49281cc3f694c7c425c75966c5f6bfb47f3c4a13ef7c5e5e06` |
| `1com-doc.txt` | https://docs.google.com/document/d/1P5tvOV6nDkc8BzEWzYNSKQTuNWv5gpWA6ThlYlFRKfQ/export?format=txt (linked from the Site under "ניתן להתעדכן בפעולות חסרות גם במסמך זה") | 200 | `15c014d7c94b564049473137b413a69d09ea7337ff26eed7e0a2fc089e2bc612` | same |
| `1com-site-extracted.txt` | derived: `1com-site.html` with script/style stripped and tags removed by a local Node one-liner (not a vendor export) | n/a | n/a | n/a — regenerable from `1com-site.html`, kept for convenience/diffing |

Redaction: `1com-site.html` embeds two distinct API keys in its example
URLs (`reqtype=…&key=…`) — one used in most examples, one used only in
the `reqtype=HELP` example. Both were replaced (with
`REDACTED-EXAMPLE-API-KEY-1` and `REDACTED-EXAMPLE-API-KEY-2`
respectively) before commit — no other change, hence the two hashes.
Their actual values are intentionally not reproduced anywhere in this
repository, including here. Whether
either key is currently live/active is unknown; they are public on the
source page regardless, but were not reproduced here beyond what redaction
required. `1com-doc.txt` contains no key material (its examples use
literal `??????` placeholders) and needed no redaction — "as fetched" and
"as committed" hashes match. Neither file embeds a session/CSRF token
(checked; none found), unlike the MiRTA snapshot below.

Page metadata: the Site has no visible revision/update date in its
rendered text ("Page updated" footer renders via client-side JS, not
present in the static HTML fetch). The linked Doc's export carries no
revision metadata either. Re-fetch and compare hashes to detect upstream
changes.

Known ambiguities already visible in these two files (do not silently
resolve — see `../DOCS_AUDIT.md` §10 and `../unresolved.md`):
- Host: page body text reads `pbx6webserver.1com.co.il/pbx`, but the
  Site's actual `<a href>` targets are `demo.1com.com/1com` (most) and
  `devel.1com.com/1com` (a few) — three different hosts across one page.
- Tenant placeholder: `DEMO` in the visible text vs `DEVEL` in the link
  targets, for the same examples.
- `format`: the Doc's common-parameters section says `format` is
  `json` or `plain`; the Site's own CDR/QUEUELOGS examples use
  `format=csv` and `format=xml`, and `simplecdrs`'s doc line lists
  `format(csv,json)`. Not reconciled.
- The Doc repeats a block of reqtypes (QUEUERESET…COUNTCALLS) twice with
  minor differences (e.g. RESPONSEPATH's `rrid`/`getid` params appear in
  only one copy).
- HANGUP's and MEDIAFILE's parameter blocks run together with no
  separating blank line in the Doc — ambiguous where one ends.
- The Doc's XML response sample is malformed: `<ClientID>…</MemberNumber>`
  (mismatched closing tag).
- `PAUSECAMPAIGN` is listed twice in the Doc's destination-tag table, the
  second time described as "Unpause" (likely a copy/paste error for
  `UNPAUSECAMPAIGN`, but not stated).
- A destination tag is spelled `VOICMEAIL` (sic) in the Doc's tag table.
- DIAL/SMS source parameter is documented as `source|?exten` in the Doc —
  the `?` is not explained.
- "Update a routing profile" (ManageDB) has no `tenant` parameter in its
  example, unlike every sibling ManageDB example.
- The `CDR` reqtype (used by the portal's existing `cdr-get` Live
  endpoint, `action=GET`) is not documented in either new source file.

## Historical evidence (MiRTA PBX vendor page, Phase 3 — superseded)

The three files below are MiRTA PBX's own documentation text, audited in
Phase 3 and used to build the now-removed `../proxy-api/*.yaml` files.
**Superseded** by the 1com source above as of the 2026-09-25 rebuild —
kept only as historical evidence, still cited by
`../DOCS_AUDIT.md` A-40..A-43 (observed Live-endpoint behavior) and by
`../unresolved.md` U-02. Normalized content that used to cite these by
BookStack anchor id (`bkmrk-…`) has been rewritten against the 1com
source; see `../proxy-api/README.md`.

Fetched: 2026-09-24T20:05Z, via `curl -sSL`, no authentication.

| File | URL | HTTP | SHA-256 (as fetched) | SHA-256 (committed) |
|---|---|---|---|---|
| `proxyapi-legacy.html` | https://manual.mirtapbx.com/books/api/page/old-proxyapi-legacy-proxy-api-reference-and-examples | 200 | `19db0cc2900ba2c6ca93d455cadb55d997924a6a7ada982d4d334f74e486b910` | `aeb5608fc59d2d2674b7732c19e86699120d737736c415da854c3a98f2df4af5` |
| `proxyapi-legacy.md` | …/old-proxyapi-legacy-proxy-api-reference-and-examples/export/markdown | 200 | `01052b6589f72fe0abcbdf2f7d4e60c061719dba77dbe173285de36e9d4f518c` | same |
| `api-book-openapi-chapter.html` | https://manual.mirtapbx.com/books/api/chapter/openapi | 200 | `1137ef16041b904b05434b968d07ba0fa4bf01a63a6164349dad9b82e5ef234f` | `760b24a36217fdfd2c0bd69dafc309d43658d9708d577590c96ae87b14fa9b9a` |

Redaction: both HTML files embedded an anonymous-session CSRF token
(`<meta name="token" content="…">`). Its value was replaced with
`REDACTED-SESSION-CSRF-TOKEN` before commit (no other change), hence the two
hashes. Page content is unaffected. A fresh re-fetch will match neither hash
exactly, because the token differs per session; compare with the token line
redacted the same way.

Line endings: hashes are of the LF bytes (as stored in Git). With
`core.autocrlf=true` a Windows checkout rewrites these files to CRLF, so
verify with `git show HEAD:source-docs/raw/<file> | sha256sum`, not the working copy.

Page metadata (from `proxyapi-legacy.html`): BookStack "Revision #6",
created 2026-06-02 21:58:35 UTC, updated 2026-06-03 10:21:49 UTC. The
public revisions list returned no rows (likely login-gated), so earlier
revisions were not inspected.

`proxyapi-legacy.html` is authoritative for anchors; `proxyapi-legacy.md`
is the vendor's own Markdown export of the same revision, kept for easier
diffing if the page changes. To detect upstream changes, re-fetch and
compare hashes.

## MiRTA PBX OpenAPI (authoritative for OpenAPI; baseline started 2026-09-26)

Normalized in `../openapi/` (conventions and authority rule:
`../openapi/README.md`). User decision 2026-09-26: the **official MiRTA
OpenAPI documentation and spec are authoritative for OpenAPI**. This is
independent of the Proxy decision above; 1com publishes no OpenAPI
documentation.

**Official evidence captured so far:**
- `api-book-openapi-chapter.html` (table in the historical section above).
  - It is superseded **for Proxy** only. For OpenAPI it is current official
    evidence, but it is an **index only**: 38 page titles/URLs plus one
    truncated (~100-character) preview snippet per page.
  - Its URLs and snippets seed `../openapi/README.md`'s coverage index and
    `../openapi/resources.json`.
- Official resource pages: **none captured yet**.
- OpenAPI 3.0.3 spec JSON: **not supplied yet**.

When captured, snapshots go under `mirta-openapi/`, with fetch
time/method, URL, HTTP status and as-fetched/committed hashes in a table
here. Redact before commit (session tokens, keys, real data), as above.

**Structure/policy input, not evidence:**

| File | Origin | SHA-256 (committed blob) | Status |
|---|---|---|---|
| `../../docs/mirta-openapi-claude-reference.md` | added by the user, commit `5395552` (2026-09-26 00:14 +0300); no fetch date, hash or raw capture of its own sources | `5762244077cadde2dadff5b267d2f63f300705b0e2e70927b64fce47bb48f409` | **wrapper**: organization, security/testing policy and verification states are adopted. Every technical claim is `UNKNOWN` until officially confirmed. It describes itself as "not a verbatim mirror of all 38 web pages" (its L259). |
