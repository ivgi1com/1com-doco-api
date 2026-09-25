# Common — base URL, auth, shared parameters

Source: Site (`../raw/1com-site-extracted.txt` lines 93–96, 116)
+ Doc (`../raw/1com-doc.txt` lines 38–43).

## Base URL — UNRESOLVED (three forms observed)

The endpoint is `proxyapi.php`, but the host/path prefix differs across
examples in the **same** source with no explanation of when each applies:

| Form | Where seen | Count |
|---|---|---|
| `https://pbx6webserver.1com.co.il/pbx/proxyapi.php` | Visible text of every Site example, and every Doc example | most |
| `https://demo.1com.com/1com/proxyapi.php` | The Site's actual `<a href>` target for most of its examples (differs from the visible link text) | most Site links |
| `https://devel.1com.com/1com/proxyapi.php` | The Site's `<a href>` target for a handful of examples (INFO/variable, VOICEMAIL markread/markunread, ManageDB "Adding a SIP extension", "Update a routing profile") | 5 links |

The Site's own prose (line 96) says: *"please note the URL on the demo
server is slightly different than on production servers - 1com/pbx"* —
i.e. it explicitly acknowledges two host families (a demo host using
`/1com/` and a production host using `/pbx/`) but never states which one a
real integration should target, or what determines `demo` vs `devel`.
**Not resolved here** — see `../unresolved.md`.

## Tenant placeholder — same ambiguity

The Site's visible link *text* uses `tenant=DEMO` throughout; the actual
`href` targets (pointing at `demo.1com.com`/`devel.1com.com`) use
`tenant=DEVEL`. Both `DEMO` and `DEVEL` are placeholders, not necessarily
real tenant codes — but which one (if either) matches the demo host is
not stated.

## Authentication

- `key` — the Admin API key or a Tenant API key (Doc line 41). The Site
  (line 94) adds: generated per tenant on the Configuration/Settings
  page; two kinds exist — **Read/Write** and **read-only**.
  - ManageDB: "Any ManageDB action requires an admin key" (Site line 225)
    — the only reqtype-specific key-scope statement found in either
    source.
- `tenant` — "Sometime optional if the Admin API key is used, otherwise
  provide the tenant code" (Doc line 40; sic — "Sometime"). Several
  per-reqtype notes repeat "optional if using the Admin API key, returns
  only X from the selected tenant" (COUNTPEERS, COUNTCHANNELS, PEERS —
  Doc lines 62–74) — i.e. omitting `tenant` with an Admin key returns
  cross-tenant data; supplying it scopes to one tenant.

## Common parameters (Doc lines 38–43)

| Name | Required | Accepted values | Description |
|---|---|---|---|
| `reqtype` | yes | see each `<reqtype>.md` | Request type |
| `tenant` | see above | tenant code | Tenant selector |
| `key` | yes | API key | Admin or Tenant key |
| `format` | optional | `json`, `plain` (Doc) — but see below | Output format |
| `callback` | optional | function name | Cross-domain JSONP callback; **requires `format=json`** |

**`format` — UNRESOLVED, conflicts with per-operation values.** The Doc's
common-parameters block states only `json`/`plain`. But:
- `info.md`'s `cdrs` operation documents `format(csv,xml)`.
- `info.md`'s `simplecdrs` operation documents `format(csv,json)`.
- The Site's own CDR/QUEUELOGS CSV examples use `format=csv`.
- The Site's RESPONSEPATH example uses `format=xml`.
- The Site's AGENT/LISTQUEUES example uses `format=json`.

So `format`'s accepted-value set is at minimum operation-specific, and the
common-parameters line's `json`/`plain` is incomplete at best, wrong at
worst. Not reconciled — see `../unresolved.md`.

## The `HELP` reqtype

Site line 95: *"The latest syntax for the operations can be retrieved by
proxyapi itself"* — `reqtype=HELP` (with `key`).
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=HELP
```
No further detail (response shape, whether it needs a specific key type)
is given by either source. `not documented` beyond this one line.

## The Doc's own worked examples (intro section, lines 6–33)

Before the reqtype reference, the Doc opens with three worked examples in
Hebrew/English, using literal `?????` placeholders instead of `APIKEY`/
`TENANTCODE` (kept verbatim below, since that is genuinely how the source
writes them — not a redaction on this project's part):

### חיפוש ID של שיחה ("search for a call's ID") — an `INFO&info=cdrs` variant (Doc line 8)
```
https://pbx6webserver.1com.co.il/pbx/proxyapi.php?tenant=?????&key=???????&reqtype=INFO&info=cdrs&phone=????????/????????
```
Note: `phone` here shows a `/`-separated pair in the placeholder, unlike
the comma-separated form documented elsewhere for `phone`/`calleridnum`
(`info.md`) — UNRESOLVED whether `/` is a second accepted separator or
just how the placeholder was typed.

### שליפת קובץ הקלטה ("retrieve a recording file") — an `INFO&info=recording` variant (Doc line 17)
```
https://pbx6webserver.1com.co.il/pbx/proxyapi.php?tenant=?????&key=?????????&reqtype=INFO&info=recording&id=pbx6.1com.co.il-1482260315.2690122
```

### שליפת נתונים מלאים על שיחה ("retrieve full data about a call") — `INFO&info=CDRS` by `id`, CSV (Doc line 19)
```
https://pbx6webserver.1com.co.il/pbx/proxyapi.php?tenant=TENANT&key=APIKEY&reqtype=INFO&info=CDRS&id=UNIQUEID&format=csv
```
Note: uses `id=UNIQUEID` rather than the `phone`/`start`/`end` filters
shown elsewhere for `CDRS` (`info.md`) — looking up a single known call by
its unique id.

### חיוג ("dialing") — a DIAL example (Doc line 33)
```
https://pbx6webserver.1com.co.il/pbx/proxyapi.php?dest=$NUMBER&tenant=ophir&key=??????&reqtype=DIAL&account=source&source=???
```
Note: `tenant=ophir` — unlike every other example in either source, this
is **not** an obvious placeholder (`TENANT`/`TENANTNAME`/`DEMO`/`DEVEL`);
it reads as a real tenant/customer name. Reproduced as-is (it is the
source's own public text, not something captured by this project), but
flagged: do not treat `ophir` as a synthetic Demo-fixture value, and do
not reuse it as if it were a placeholder like the others.

## POST conventions (write operations)

Two related conventions appear across ManageDB and PHONEBOOK examples, one
form differing by field name:

- **`jsondata`** — used by every ManageDB write example (add/update/replace
  a custom destination, phone, media file, hunt-list extensions,
  extension, conference, routing profile, DID, or destination list). PHP
  pattern: build an associative array (or, for `DESTINATION`/`replace`
  and hunt-list `setextensions`, a plain indexed array of tag strings —
  see `managedb.md`), then POST
  `jsondata=urlencode(json_encode($array))`.
- **`values`** — used only by PHONEBOOK's `add` sub-request (`phonebook.md`):
  `values=urlencode(json_encode($array))`. Same encoding, different field
  name; not explained why PHONEBOOK diverges from the ManageDB convention.
- **Multipart file upload** — FAX's `send` action and ManageDB
  `MEDIAFILE`/`updatebinary` both POST a raw file via a PHP
  `CURLOPT_POSTFIELDS` array with a `filename => '@path'` entry (old-style
  cURL `@`-prefixed file upload), not `jsondata`.

Method is `not stated` explicitly for any of these — inferred as POST
only because a GET query string cannot carry a JSON body or a file
(`method.basis: stated_jsondata` / `example_curl_multipart`).

## Destination tags (ManageDB `DESTINATION`, `HUNTLIST` extension lists)

Full table (Site lines 434–486) reproduced in `managedb.md`'s Destinations
section, including two source defects noted there (`VOICMEAIL` misspelling,
duplicated `PAUSECAMPAIGN` row).
