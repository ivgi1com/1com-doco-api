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
- Official pages: **all 38 captured 2026-09-26** (plus a fresh chapter
  index) in `mirta-openapi/`. The table is at the end of this section.
- OpenAPI 3.0.3 spec JSON: **not supplied**. It is optional (an extra
  check, per `../../docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md` §2.2).

When captured, snapshots go under `mirta-openapi/`, with fetch
time/method, URL, HTTP status and as-fetched/committed hashes in a table
here. Redact before commit (session tokens, keys, real data), as above.

**Retired local wrapper (historical only, not a source of truth; removed from the working tree 2026-09-26, its claims checked against the official pages first, see DOCS_AUDIT.md section 13.1):**

| File | Origin | SHA-256 (committed blob) | Status |
|---|---|---|---|
| `docs/mirta-openapi-claude-reference.md` @ `5395552`. The user removed it from the tree on 2026-09-26 (commit `a3d8046`); read it with `git show 5395552:docs/mirta-openapi-claude-reference.md`. Its policy role is now covered by `docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md`. | added by the user, commit `5395552` (2026-09-26 00:14 +0300); no fetch date, hash or raw capture of its own sources | `5762244077cadde2dadff5b267d2f63f300705b0e2e70927b64fce47bb48f409` | **retired**. Not cited as evidence anywhere. Policy role superseded by `docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md`; API facts come only from `mirta-openapi/` snapshots. It describes itself as "not a verbatim mirror of all 38 web pages" (its L259). |

### Official page snapshots — `mirta-openapi/` (2026-09-26)

**Pages:**
- Source: `https://manual.mirtapbx.com/books/api/page/<slug>` for each
  page, captured as HTML plus the BookStack Markdown export
  (`<slug>/export/markdown`).
- Chapter index: `https://manual.mirtapbx.com/books/api/chapter/openapi`,
  saved as `chapter-openapi.html`.
- **Page list unchanged** from the 2026-09-24 index snapshot: the same 38
  slugs, same order.

**Rate limiting:** the Markdown export is limited (`x-ratelimit-limit: 4`,
`retry-after` ≈ 27 s). 30 of the 38 exports first returned HTTP 429 and
were re-fetched a few minutes later, following `retry-after`. The final
status of every file is 200, and no 429 body was kept.

**Redaction (HTML only):** the anonymous-session CSRF
`<meta name="token" content="…">` is replaced with
`REDACTED-SESSION-CSRF-TOKEN`. There is no other change, hence the two
HTML hashes. The Markdown exports carry no token and are unchanged. All
files are LF-only, so committed-blob hashes equal the "committed" column.

**Content scan (done before commit):**
- Every example value is vendor-fictional: `example.com` emails,
  `198.51.100.x` (RFC 5737) IPs, `555`-range and `…123456` numbers, MAC
  `001122334455`, placeholder secrets (`change-this-secret`,
  `TENANT_API_KEY`, `GLOBAL_API_KEY`, `1234`).
- The Overview page states: "The examples use fictional IDs, numbers,
  names, and keys" (`mirta-openapi/overview-and-examples.md:36`).
- The vendor's example tenant code `CANISTRACCI` (and `CAN%`) is kept
  verbatim in raw evidence as vendor-declared fictional. Normalized local
  docs use `TESTTENANT`.
- No real credentials or customer data were found.

**Revisions:** BookStack revision numbers and created/updated dates are
taken from each page's HTML. Re-fetch and compare hashes/revisions to
detect upstream changes.

Fetched: 2026-09-26T08:29:02Z (index + HTML) and minutes later (Markdown exports, rate-limited retries), via curl -sSL -A "Mozilla/5.0", no authentication. All HTTP 200.

| Page slug | Revision | Created (UTC) | Updated (UTC) | HTML SHA-256 as fetched | HTML SHA-256 committed | MD SHA-256 (as fetched = committed) |
|---|---|---|---|---|---|---|
| `chapter-openapi` | — | 2026-06-06 07:05:44 UTC | 2026-06-06 07:31:54 UTC | `0c13c368035166bbcc1a4b771451433a20d24c9e2d26cad7e9e9a5d3511e1145` | `bac853e64b01076e83964a1c00bed291fc67705b3dc6db5fef14fe442c55a71f` | n/a (index page, no export) |
| `overview-and-examples` | #21 | 2026-06-02 21:58:37 UTC | 2026-08-26 09:19:26 UTC | `5a7150c2503bd7e8e93d9552af83ef2c9477ecad2047867e5839cca96a8704be` | `620251a3804711a8dde3068a9e552ebfd76bea30b58c18ca85f43135c1a93894` | `d689e57fe1a636881e74decba58d8f1b5cc9d2074c2a36338ef3df9ad864b258` |
| `extension-state` | #4 | 2026-07-03 14:09:21 UTC | 2026-07-03 14:11:24 UTC | `c576cd4c45b5df006592be6e3f178f01c75d57b2b5677c0f5a481ad24017dab6` | `c8861e909a60f3f73d149d9117c42e8a036f22969c343979cb36e695c668db0f` | `b244357e394b63ec8c6052c3eb449eca95a2113f756ab534f0e4429f47620aee` |
| `auth-token` | #9 | 2026-06-10 06:33:28 UTC | 2026-07-03 14:09:24 UTC | `90b0168aafba881a1e8eba30926f1d4f11ef7df4102f0cc2047ae6f79fb77f0a` | `6ae81b2f4796f0237046dcb4335484e649a848951396f219523d7b2a3a955b42` | `45c901250e68b958ab000c3c252252eccd7b4b32bccb14197668102e49d3db49` |
| `dial` | #3 | 2026-07-03 15:48:57 UTC | 2026-07-03 15:49:00 UTC | `d0d0dde91c10d84dc6dce210ca4b6e7ac17597150e51ec44cfa6b5945adf42eb` | `b0f8b119bf16d0e8786a52f32797de084e777a2039ad896249ca11014717811c` | `9df6636a005781f431cd976119d437f4df1ad2dd98675f1fb5594ca04002acd9` |
| `cdr` | #13 | 2026-06-06 08:14:40 UTC | 2026-07-03 15:49:00 UTC | `de451cbd18bbb6abe45b6eab439a21ddeb4823cda3d39d7dccaca5cba0a59412` | `06e689fec8ff29aa035454419b68981fce400640cf20e35bddba2d63784495a9` | `301952612329a7ae890afd33d1724a2178e89fcae722f7a633eeef6459a6c10b` |
| `simple-cdr` | #13 | 2026-06-06 08:14:42 UTC | 2026-07-03 15:49:01 UTC | `c675d71bfb9e4c6f9bf43d24e5a9dae2c37347a34f20a54e2aa2e1825d85211e` | `8a62ab952a2a3f19e381d8ee681ea228290b89a17f2ffd7615a1c9cf1a27358f` | `ff1379e72fe1c5d3bd78d3cd74fb11dbba33b985246a081e4ac95263710667b0` |
| `extension` | #17 | 2026-06-06 07:31:56 UTC | 2026-07-03 15:49:02 UTC | `12f0e083dd2acd66fde655f02648c8a66fdd9a351d2c35a96cfc94e46d210783` | `d88b63015bcb2b1d20e1c8c6ad6d784f5c0759a2e9e1c84957c58665745fc8b0` | `427011dc56b2a67aeaf1549297c82d7ecdfc80cfa3d2e12ae1695e1dd5b32a51` |
| `tenant` | #17 | 2026-06-06 07:31:58 UTC | 2026-07-03 15:49:02 UTC | `eff6a78392e46e71cbecd3772c678aba280255d130a6dc5d89af97b34e613c12` | `8b66849d8fd8ab42a63607dedc7c8c1b55cfada2421b7799ffe411cae69f9691` | `463d9da077460fdcfb872685398d631212524ba842fd2aba95a877567acc9511` |
| `user` | #17 | 2026-06-06 07:31:59 UTC | 2026-07-03 15:49:03 UTC | `4a324ef515de8b4eaac5a5dabc59d51418b965e1ad23eef65e727074612c13d8` | `52cb01dbae48f0580a1cf95f43f9688748a1934b457b02ecc4c53d3177288ba1` | `c43d154e22186fd0db2a6f6294832e8751b31ce00e0ab684db7098d9d39f0826` |
| `user-profile` | #17 | 2026-06-06 07:32:00 UTC | 2026-07-03 15:49:03 UTC | `7bab1bc541e515d605d5d99c02b403a8898b3ba739bb90a9d6f5a7b6ed18c1b9` | `355c58001be815dbfb370659f20b65060cb4c2354defc5d24b1422f41e2bc18f` | `e4eedd94e5f1e787618f315af58881d3fe892719a25415e35d4af3233338f6fe` |
| `routing-profile` | #17 | 2026-06-06 07:32:02 UTC | 2026-07-03 15:49:04 UTC | `334766835731f29ff39f8d24ff59590582ac3d9665dbe3516cadab18ddbe3e4a` | `0cc8a64364a037b9a7ae4b1f05c5fec18e8a447566f4ab7180cfe3da2ba3931c` | `c7f2ead65ba0483c2e20626b677ccc1ea6b5494bcf94cbceff1342906d3733f4` |
| `provider` | #14 | 2026-06-08 20:17:27 UTC | 2026-07-03 15:49:04 UTC | `e5b70f9b180a85501b313a313172a00983aae2307c0428cbac5ed611a3f31be7` | `6388df6ef169824cb800a2f1057f2b15e027c8d1125c6dc6479bc079aed8d25d` | `cd061092ca1beb179609e00923716773f682bc1aeeb15c2b00ac3afea8c9d70b` |
| `voicemail` | #18 | 2026-06-06 07:32:04 UTC | 2026-07-03 15:49:05 UTC | `08ee7976a1e3b17d6dcedd9492a13e283f74ae7b0680774924acbadca96a8903` | `2d7d2ea32e15c8f609f20691c1d48fbb95e85b2b90a4524cd3267565618922bd` | `c13a28d5d8350c609eb8ee64e1f81218d610ecd34f294ce199e3a51744c1550c` |
| `ivr` | #18 | 2026-06-06 07:32:05 UTC | 2026-07-03 15:49:06 UTC | `5a944351b26190d56879413e6904447ae1ca03176c0ace6ca9286a82ce7a4df6` | `3bfe4bfaf98c1860bbb5c74c61c4c97a8466556a77aa6ba9e4461cd735a8df43` | `36c091b39c8eb0f01483cb0b4277b1f3eb4320276b37428eddc8da997d004c61` |
| `custom-destination` | #18 | 2026-06-06 07:32:07 UTC | 2026-07-03 15:49:06 UTC | `eef8f7f23d6e9ee816f5c1e76cb95d76a77d5d933c3a1ff27fb2cd571208b5c9` | `2b9376067a682de67ac098d7f28a9161a01696789afc9a3bee64f05073307fcb` | `e8d30848a5af910676b39f2c8dd7f6172b146b4c5715a55c5ee2c407c416cb35` |
| `condition` | #18 | 2026-06-06 07:32:08 UTC | 2026-07-03 15:49:07 UTC | `041a1d414e61d3a7e29a22ef888eb4c779a6c652174958f2bde78766eec5ec16` | `59d425170c6753f7466b8d8ae0c22622e90d344d01550168e7c2d02ddf3324d1` | `676c338d9cb8c954e0e1d8ed4debd765f832d6118a8f610402ed1a5f5ffac4b6` |
| `hunt-list` | #18 | 2026-06-06 07:32:09 UTC | 2026-07-03 15:49:07 UTC | `a4d74113c717c8742ec73a8a2b9411ca04ee6f20dd657fbe83757a6e55db7971` | `7018dd2bfed776ec47b4efe97d3b8dce1e1bfa538324c3c197fd05a30063b120` | `ec7fac55fb0727eb5c902b784fe95c6e4e2db08274ea6df83d0893f17516f034` |
| `did` | #18 | 2026-06-06 07:32:11 UTC | 2026-07-03 15:49:08 UTC | `6551f2c5db01d342e6887adb690a8c49b959db44a3dc53237799f15866123147` | `120d189e7fb394eee8f713246afb3a3286d5a27d14742af5b5d2ac27c861e750` | `11678c89dabaa6c25e7a88d50bf0e0d829332a7791034b90f9b854507d2b7066` |
| `queue` | #18 | 2026-06-06 07:32:12 UTC | 2026-07-03 15:49:08 UTC | `c9d85abd09e048bf9e1a576c67ec1c3342ae8f7fb0d9c4be1708b53d57f6c3c2` | `e87d9058ac1c78b5aace8aafbd094188b0b99631df8d5311fc59bc62b8bb9b41` | `0e7d326bcb83da479f97119002704a59007111c7486902cf00e6d159ecfc6660` |
| `setting` | #18 | 2026-06-06 07:32:14 UTC | 2026-07-03 15:49:09 UTC | `282bd369d85d85e3102041aa2d2338367d1487771dc094503bdfeed2515faf38` | `74184486265e9112ddae6f6537265daea8f68890afd1102a8f37172e626db3ba` | `ef44e0b9fa20bc63626daa2ef2dc77230aa665a98aedcaf183e94a1c97604cfd` |
| `media-file` | #18 | 2026-06-06 07:32:15 UTC | 2026-07-03 15:49:09 UTC | `893a5f8112d975c41456d06b8403cb5754d68214b2cdbee235c042d2e0df1e18` | `5a893e1fa66d23cfe3299efcd925830ca5975556c0615d66a2f998f9ff7a949f` | `6ea701c1c8bc7f44337918b1c3353449d481d0c8982b6132f4252cadab373496` |
| `music-on-hold` | #18 | 2026-06-06 07:32:17 UTC | 2026-07-03 15:49:10 UTC | `876d7121f1e99c53b30aee88e2f7e068e9a6627e30524155c6418dae62d3fd09` | `d405d305992ad5ed2803ea95ecdfd65ee9cdfc420b41991a542a1bbaded71492` | `1820e7fa9fc08df82311df939869b458d49764a78d42cabba49211126d6d7ae2` |
| `paging-group` | #18 | 2026-06-06 07:32:18 UTC | 2026-07-03 15:49:10 UTC | `233ce0f84a78dd1e89e06a3154b881dbf1e1fe69b5e208be99876021952b2826` | `46ec2e156844f61e84c8ef5a0eaed9fceab8c319b7716a6ad0bd1637e5d85d92` | `dc0c841c201442ea29a1dd858985155c5124b6716958afeb262cf02ab97a1d0b` |
| `conference-room` | #18 | 2026-06-06 07:32:20 UTC | 2026-07-03 15:49:11 UTC | `f9922d09fdce12b55111f6fdea441181b03336cdb4f8855c5a94914a05e9a991` | `ed52110810b197ecfe6641c85cf6c755ca8b25952a44f1c8e39b342f6744d30b` | `da54867775931a51d82d1fa6df22480d4b9912bd33347799b32da0d762209d58` |
| `flow` | #18 | 2026-06-06 07:32:21 UTC | 2026-07-03 15:49:12 UTC | `60d0c1bbc0dd071847767def234deea5a67c88539488fddc6cbd5676068da138` | `4dea42e421758f5f38809618e064a1f8c95572e753783da71737ddf4895a3d21` | `91262467709a1a756f3f726e3660521d731ccbf655ccd145f9a96db5b5c8a2ad` |
| `tenant-variable` | #18 | 2026-06-06 07:32:22 UTC | 2026-07-03 15:49:12 UTC | `2888bbf28b432a3ffbb16f7a8cf668f588f964c081f0934e8ae6345e520980ed` | `cfbafd630a8d341f3669b90839e89b3e06a473049652eb336f1e85c63ce929b3` | `f04af5f657a33d057bfdd30792492162d70b92bdb17fdeeaa39041b33f1bfc06` |
| `disa` | #18 | 2026-06-06 07:32:24 UTC | 2026-07-03 15:49:13 UTC | `510336ae141ce7db19ed5a19ed40ffbfc82d523732e8dab00794670c1ec95cab` | `84d9b3a7d72656aad7a64123c82bbd19973c3c81cc2087c721627bdf90d90c35` | `32cd61be3c01aa061d60afbf783478851c554d57200bb37ba1a62ab5cb455af2` |
| `caller-id-blacklist` | #18 | 2026-06-06 07:32:25 UTC | 2026-07-03 15:49:13 UTC | `6ebccb1961b950a387ec00d378bd88b1effb0951f3bbfcc16a749c2000e4907c` | `4abf4890d139b1dc1ad455b867a86c8037265a4a9087cb63755f36bc5a516c0d` | `feed1349ec5f7a9bd9d76629209530a2b4ef6cd97d9e7ec5c865b9f14c34bb2a` |
| `campaign` | #18 | 2026-06-06 07:32:27 UTC | 2026-07-03 15:49:14 UTC | `7d9d8be52524f34316764b87b49f996a8522a24b651213457dcefd288cc29584` | `a6402b52ccf38fcd0cbe8fc8ef4748ad940b0e4a05231fbdce9b896347ed9316` | `31136f68d98fba7b2f4b2e07d1852a91847fc96da918e3bcf142622f6d16a87f` |
| `campaign-number` | #18 | 2026-06-06 07:32:28 UTC | 2026-07-03 15:49:14 UTC | `960955d230c98484b56cc8cbad5dd026807cb8882373ea9b26001ec7767ffbf0` | `d9ad2cc5140ffe19099c2f234fd014e6580789a718819141ea8ffb7089ad7e8c` | `2ff58ea4bc9e2d5b8126d036b6219ec9e9818202beebc354fc7d92aaab7fc690` |
| `cron-job` | #18 | 2026-06-06 07:32:30 UTC | 2026-07-03 15:49:15 UTC | `b10dbf0c82649309eed035b682f8ce4ff3523048fa5db9c27dac029ca0a6d0a0` | `e1a68159a342b75b926b4217b782be11f0ed8881f373e8b7fd809c6eccd8da2e` | `1be2f9d5586e5d24045714a07c5efd83d0f949b1659e9de05fc4dda79eb7346f` |
| `feature-code` | #18 | 2026-06-06 07:32:31 UTC | 2026-07-03 15:49:15 UTC | `a76db850e489526b9c6fdefe97712e8be5d2766be8348274a3091a4e292f8d4d` | `0d88a7c899adfb6fcfff7dc287f575ed6db1a3ee63c73b48203a94f03737f6cd` | `8592829bf3329c7c78db719865c7c5c15be6eecd458a0ab65f566de876c1f70f` |
| `short-number` | #18 | 2026-06-06 07:32:32 UTC | 2026-07-03 15:49:16 UTC | `e8d626e52d7540dcefa58ee3d3471612ff030c5ecc56887007bf40f1e38c57be` | `86d0154e3d4a4afda1fef01dda76fa273e44c1b8e21c9cad9426d257c89df203` | `4538cd168be07c7b78b27a96b4526d042e080e68572a28069fe1dcbb237a9dc9` |
| `phone-book` | #7 | 2026-06-29 18:38:55 UTC | 2026-07-03 15:49:16 UTC | `0dc716473a7571fe25536aac380e0e497344713151d35e394a07514d6b73f07e` | `3cc7bed83cdb946c46eef17b270734cde4fc7c5f0386da694df0724a5c91e480` | `7566dcdbcaefb934993ec5c717cc6ad1d03442e585f2ce225028a89860a1dc75` |
| `phone-book-entry` | #7 | 2026-06-29 18:38:56 UTC | 2026-07-03 15:49:17 UTC | `fd4caf76680af4ccd9b758cba4077767b0557fb02a461411ca4d59818b021534` | `79056cf08c3f003f55e7fdb8f001771371820fe6fb32cc8dfb944ee87feb4d41` | `d8d9b3d47082e5062d1093c7cdc4fbc91317748c5ee63f62d67c8a2322eb476a` |
| `provisioning-phone` | #18 | 2026-06-06 07:32:34 UTC | 2026-07-03 15:49:17 UTC | `70e136e4b18d3ecb778833c0ab6b7b4b0780dbf60fa568a0afa0914f603c471a` | `00b856a52588d378c8470b2d110db371b630eb3d12420fda486c7b2495808a83` | `8529a9058a4eff9acac8811ca832714f7f5bc3095c95baa63f98eed07fc5a354` |
| `ai-analysis` | #6 | 2026-06-24 20:54:20 UTC | 2026-07-03 15:49:18 UTC | `ff57d3e264b15a7ee4ec5e1fc87555af8d1c62397ab8ec53fdcedf1924b86842` | `a5ebf37397dace1b7948f04e59b30ea24552df3cd42f906b67a851c0404ecace` | `ce46c0f0f335509a17d70b12a93f7c8829c2b1a822d907825579b887598cdb98` |
| `ai-logs` | #3 | 2026-08-26 09:18:50 UTC | 2026-08-26 09:19:25 UTC | `fcdd5e13e544cc2aea0ec6023992892ffe1898eba52b22db45bb6fad279b2caf` | `00428404b4977ed656519cd5b1bfe4546f9138133e91e702128a952073c59e72` | `c16b3c93e0d73169459878a8f9ea8409d3b82a86f6b3735083a2402b65b143cb` |
