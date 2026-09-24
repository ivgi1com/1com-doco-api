# Source Snapshots (evidence)

Local evidence copies of the vendor documentation audited in Phase 3.
These are MiRTA PBX's text, kept only as audit evidence — see
`../unresolved.md` U-02 before reusing any of it in the public portal.
Normalized files under `../proxy-api/` cite these by BookStack anchor id
(`bkmrk-…`).

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
