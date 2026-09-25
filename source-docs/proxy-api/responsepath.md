# RESPONSEPATH

**Purpose:** "Get info from response path object" (Doc line 264).
**Method:** GET (`basis: example_url`).
**Source:** Site lines 197–223; Doc lines 264–276, 329–339 (duplicate,
narrower — see note).

**Source defect (Doc)**: RESPONSEPATH's parameter block appears twice in
the Doc (see `voicemail.md` for the wider duplicated-block note). The two
copies **differ**: the first copy (lines 264–276) lists `rrid` and an
`action=getid` value; the second copy (lines 329–339) has neither. Not
explained which is current — UNRESOLVED, both recorded below.

## Parameters (first copy, Doc lines 265–276 — includes `rrid`/`getid`)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | not stated (Doc: "tenant for the response path to query") | tenant code | |
| `id` | not stated | response path id | |
| `rrid` | not stated | response-path response id, or response-path unique id | **only in the first copy of the Doc block** |
| `filter` | optional | `queue`, `answer`, `uniqueid` | which field to filter on |
| `filterdata` | optional | value matching `filter`'s kind | the filter value |
| `action` | not stated | `list`, `getid`, `getlast` | list all responses / get one by `rrid` / get the latest |

The second copy (Doc lines 330–339) is identical except it omits `rrid`
and lists only `action`: `list`, `getlast` (no `getid`).

## Examples

### Getting the latest one for a given Response Path — `action=GETLAST` (Site, line 199)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=RESPONSEPATH&tenant=DEMO&id=19&action=GETLAST
```
**Response** (Site lines 200–208 — documented sample, pipe-delimited,
one row per response-path step):
```
UniqueID|Type|Type ID|Value|Type Name|Value Name
srv02-1509806457.625|START|0|2017-11-04 15:41:01||
srv02-1509806457.625|CALLERID|0|Susan <1132555678>||
srv02-1509806457.625|VARIABLE|85|36985||
srv02-1509806457.625|VARIABLE|144|56896||
srv02-1509806457.625|QUEUE|281|||
srv02-1509806457.625|ANSWER|0|105-DEMO||
srv02-1509806457.625|HANGUP|0|||
```
Column headers are inferred from the sample's own shape (`Type Name`/
`Value Name` are consistently empty in this sample) — not separately
documented.

### Filtered by agent — `filter=ANSWER&filterdata=104-DEMO` (Site, line 210)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=RESPONSEPATH&tenant=DEMO&id=19&action=GETLAST&filter=ANSWER&filterdata=104-DEMO
```
Response: not documented for this specific call (assumed same shape as
above, narrowed to the matching row).

### Filtered, XML format — `format=xml` (Site, lines 212–223)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=RESPONSEPATH&tenant=DEMO&id=19&action=GETLAST&filter=ANSWER&filterdata=105-DEMO&format=xml
```
**Response** (Site lines 214–223 — documented sample, but **malformed
XML** as given in the source: `<ClientID>` opens and `</MemberNumber>`
closes it, and `<OrderNumber>` similarly closes with `</MemberNumber>`
again. Reproduced verbatim, not corrected):
```xml
<?xml version="1.0">
<Result>
<Agent>105-DEMO</Agent>
<Status>NOT ACTIVE</Status>
<Queue>supportQ</Queue>
<ClientID>1234</MemberNumber>
<OrderNumber>11223344</MemberNumber>
<Caller>Manuel <7171345678></Caller>
<VoiceFile>3619</VoiceFile>
</Result>
```
Site's own caveat (line 213): *"Based on the xml format shown in the
manual, it returns something like:"* — i.e. even the source calls this an
approximation, not a guaranteed-exact sample.

## Source
Site lines 197–223; Doc lines 264–276, 329–339.
