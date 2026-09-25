# INFO

**Purpose:** "Get info about system" (Doc line 117). Discriminator param:
`info`.
**Method:** GET (`basis: example_url`).
**Source:** Site lines 97–154, 189–222; Doc lines 117–153.

## `info` values documented by the Doc (line 119–149)

`queues`, `queue`, `agents`, `agentsconnected`, `agentsdelay`,
`outdialed`, `call`, `inforecording`, `recording`, `playrecording`,
`voicemail`, `voicemailtranscript`, `dids`, `extensions`, `extstate`,
`config`, `cdrs`, `simplecdrs`, `queuelogs`, `balance`. One-line purpose
each, reproduced per operation below where the Site also has an example;
the rest are `info.md`-only (Doc-only, no Site example) — see "Doc-only
info values" at the end.

Shared optional params (Doc lines 150–153): `id` (id of object requested),
`queue` (queue id, for agents info or queue logs), `start`/`end`
(start/end date-time for cdrs or queue logs).

---

## `info=SIMPLECDRS` — get the list of calls (simple call history source)

**Doc purpose** (line 140): "get the list of calls using the simple call
history source, you can use wildcard % for the tenant code."

| Param | Required | Accepted values | Description | Source |
|---|---|---|---|---|
| `tenant` | not stated | tenant code, or `%` for all | wildcard supported | Doc 140 |
| `id`, `uniqueid`, `calleridnum`, `calleridname`, `disposition`, `direction`, `whoanswered` | not stated | — | filters; Doc line 141 lists these as "Further parameters available" | Doc 141 |
| `phone` | not stated | number(s), comma-separated | special filter across `whoanswered`, `calleridnum`, `dialednum` (Doc 142) | Doc 141–143 |
| `format` | optional | `csv`, `json` | Doc line 141 | Doc 141 |
| `start`, `end` | optional | date/time | Doc 152–153 | Doc |

Multi-value filters use a comma separator (Doc line 143).

### Example (Doc, line 145)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?info=simplecdrs&reqtype=INFO&tenant=TENANTNAME&key=APIKEY&phone=0737966610&start=2021-06-28&end=2021-06-29
```
Response: not documented.

### Example (Site, line 98)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=SIMPLECDRS&tenant=DEMO&calleridnum=103,104&start=2020-01-01&end=2020-12-31
```
Response: not documented.

---

## `info=CDRS` — get the list of calls

**Doc purpose** (line 136): "get the list of calls, you can use wildcard %
for the tenant code."

| Param | Required | Accepted values | Description | Source |
|---|---|---|---|---|
| `tenant` | not stated | tenant code, or `%` for all tenants | Doc 136; Site 193 uses a bare `%` (not percent-encoded as `%25`) — UNRESOLVED whether that's intentional | Doc/Site |
| `id`, `uniqueid`, `src`, `firstdst`, `direction`, `phone` | not stated | — | "Further parameters available", Doc line 137 | Doc 137 |
| `phone` | not stated | number(s), comma-separated | special filter across `whoanswered`/`calleridnum`/`dialednum` | Doc 138 |
| `format` | optional | `csv`, `xml` (Doc line 137) — Site examples also show plain (no `format`) | see `_common.md`'s format conflict | Doc/Site |
| `template` | optional | name of a server-defined XML output template (Configuration/Settings → XML Template) | Site 101 | Site |
| `start`, `end` | optional | date/time | Doc 152–153 | Doc |

### Example — plain (Site, line 100)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&tenant=DEMO&phone=103,104&start=2019-12-01&end=2022-12-31
```

### Example — `format=xml&template=Test_CSV` (Site, lines 101–106)
Template definition (not a response sample — Site is explicit the
template itself produces this text):
```
{row_loop}{$uniqueid},{$ID},{$te_id},{$realsrc},{$lastdst},{$start},{$duration},{$answer},{$direction},{$direction},{$disposition}
{/row_loop}
```
Note: `{$direction}` appears twice in the template; not explained.
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&tenant=DEMO&phone=103,104&start=2019-12-01&end=2022-12-31&format=xml&template=Test_CSV
```

### Example — CSV, one tenant (Site, line 191)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&format=csv&tenant=DEMO&start=2017-01-01&end=2017-02-01
```

### Example — CSV, all tenants (Site, line 193)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&format=csv&tenant=%&start=2017-01-01&end=2017-02-01
```
Note (Site line 194): *"when getting the CSV for a single tenant, the CSV
format used is the tenant one, when getting the CSV for multiple tenants,
the Admin format is used"* — two different, undocumented column layouts.

Response format: not documented (column names/order for either CSV
variant are not given).

---

## `info=DIDS` — get the list of DIDs

**Doc purpose** (line 132): "list of dids".

| Param | Required | Accepted values | Description | Source |
|---|---|---|---|---|
| `tenant` | not stated | tenant code; **omit for all tenants** | Site 108/110 | Site |

### Example — one tenant (Site, line 108)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=DIDS&tenant=DEMO
```

### Example — all tenants (Site, line 110)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=DIDS
```
Note: presumably needs an Admin key for the all-tenants form (per the
general Admin-key pattern in `_common.md`), but not stated for this
specific operation.

Response: not documented.

---

## `info=FLOW` (also seen as a bare "Flow" heading) — get the state of a flow / an extension

Two distinct Site examples share the "INFO - Flow" heading:

### Get the state of a flow (Site, line 112)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=FLOW&id=61&tenant=DEMO
```
Params: `id` (flow id), `tenant`.

### Get the state of an extension — `info=EXTSTATE` (Site, line 114)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=EXTSTATE&ext=500&tenant=DEMO
```
Params: `ext` (extension number), `tenant`. Doc purpose (line 134): "get
the state of the extensions, including the number speaking with."

Note: this is `info=EXTSTATE`, a **different `info` value** from `FLOW`,
despite sharing the Site's "INFO - Flow" section heading — the heading
groups them, the query params don't. `id` is used for FLOW; `ext` for
EXTSTATE.

Response for either: not documented.

---

## `info=variable` — get the value of a variable

Doc has no explicit entry for this (not in the `info` value list at
line 119–149); only a Site example exists.

### Example (Site, line 116)
```
GET https://DEMO.1com.com/1com/proxyapi.php?key=APIKEY&reqtype=INFO&info=variable&id=61&tenant=DEMO
```
Note: this example's *visible* URL already uses the `1com.com/1com` host
form (not `pbx6webserver.../pbx`) — the only Site example where the
display text itself (not just the hidden href) uses the alternate host.
Params: `id` (variable id), `tenant`. Response: not documented.

---

## `info=recording` — get/play a recording

Doc entries (lines 128–129): `recording` ("get the recording for the
call, you can use the unique id or the originated id"), `playrecording`
("play the recording for the call..."), and separately `inforecording`
("get the metadata associated to the recording for the call").

### Example — via a DIAL-returned call id (Site, line 122)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=recording&id=15a4cfe6429054
```
(`id` here is the call id returned by a prior DIAL request — see `dial.md`.)

### Example — "RECORDINGS" section (Site, line 154)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=recording&id=srv02-1531779475.48&tenant=DEMO
```
Note (Site line 155): *"Based on your browser settings, you can force the
browser to play the recording using the 'playrecording' info parameter"* —
i.e. `info=playrecording` with the same `id`/`tenant` forces inline
playback vs. download. Response: audio binary (implied, not a documented
content-type).

---

## `info=QUEUELOGS` — get the queue log for a tenant

Doc purpose (line 148): "get the list of calls processed by queue."

| Param | Required | Accepted values | Description | Source |
|---|---|---|---|---|
| `tenant` | not stated | tenant code | | Site |
| `format` | optional | `csv` (Site example) | see `_common.md` format conflict | Site |
| `start`, `end` | optional | date/time | Doc 152–153 | Doc |
| `queue` | optional | queue id | Doc 151: "queue id requested for agents info or queue logs" | Doc |

### Example — CSV (Site, line 196)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=QUEUELOGS&format=csv&tenant=DEMO&start=2017-10-01&end=2017-12-01
```
Response: not documented (CSV column layout not given).

---

## Doc-only `info` values (no Site example; purpose lines only, Doc 120–131, 135, 149)

| `info` value | Purpose (Doc's own wording) |
|---|---|
| `queues` | list of queues |
| `queue` | info about the queue based on id |
| `agentsconnected` | info about the agents in all or selected queue, but only if currently connected |
| `agentsdelay` | info about the agents delay in answering in all or selected queue |
| `outdialed` | info about the calls dialed out by extensions |
| `call` | info about the call originated with the api using the returned id or unique id |
| `inforecording` | get the metadata associated to the recording for the call (unique id or originated id) |
| `voicemail` | get the voicemail message for the call (id of the `voicemail_messages` table) |
| `voicemailtranscript` | get the voicemail message transcript for the call (id of the `voicemail_messages` table) |
| `config` | get info about configured tenant |
| `balance` | get the credit available |

No examples, no response samples, no parameter specifics beyond the
shared `id`/`queue`/`start`/`end` block for any of these.

## `info=EXTENSIONS` — list of extensions, including state

**Doc purpose** (line 133): "extensions (list of extensions, including state)".
No Site example.

| Param | Required | Accepted values | Description | Source |
|---|---|---|---|---|
| `tenant` | see `_common.md` | tenant code | | Doc 40 |
| `format` | optional | see `_common.md` format conflict | | Doc 42 |
| `id` | optional | object id | shared INFO param (Doc 150); meaning for this operation not stated | Doc 150 |

Response: not documented by the source. Observed behavior (Live-tested,
not from this source): `../DOCS_AUDIT.md` A-40.

---

## `info=AGENTS` — agents in all or a selected queue

**Doc purpose** (line 122): "info about the agents in all or selected queue".
Related values: `agentsconnected` (only currently connected agents),
`agentsdelay` (answer-delay info). No Site example.

| Param | Required | Accepted values | Description | Source |
|---|---|---|---|---|
| `tenant` | see `_common.md` | tenant code | | Doc 40 |
| `queue` | optional | queue id | "id of queue requested for agents info or queue logs" | Doc 151 |
| `format` | optional | see `_common.md` format conflict | | Doc 42 |

Response: not documented by the source. Observed behavior (Live-tested,
not from this source): `../DOCS_AUDIT.md` A-43.

Correction note (2026-09-25): the first version of this file wrongly said
`extensions`/`agents` were absent from the Doc's `info` list. Both are
listed (Doc lines 122, 133). Fixed; U-16 closed as a documentation error.
