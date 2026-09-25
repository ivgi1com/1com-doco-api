# HANGUP

**Purpose:** "Hangup a channel" (Doc line 225) / Site: "Hangup a call by
extension".
**Method:** GET (`basis: example_url`).
**Source:** Site lines 128–129; Doc lines 225–229 (see note below).

## Parameters

| Param | Required | Accepted values | Description | Source |
|---|---|---|---|---|
| `tenant` | optional (Doc) | tenant code | "tenant for the channel to hangup" | Doc 227 |
| `channel` | not stated | channel identifier | "channel to hangup" | Doc 228 |
| `extension` | optional (Doc: "optional, extension to hangup") | extension number | Site example uses this alone (no `channel`) | Doc 229, Site |

**Source defect (Doc)**: line 229 in the raw Doc export reads
`"extension - optional, extension to hangupMEDIAFILE    - Manage media files"`
— the last word of HANGUP's own text (`hangup`) runs directly into the
next reqtype's heading (`MEDIAFILE`) with no line break in between. This
looks like a missing newline in the source document itself, not an
extraction artifact (confirmed against the raw `.txt` export). See
`mediafile.md` for where that reqtype's own text resumes.

## Examples

### Site (line 129)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=HANGUP&extension=103-DEMO&tenant=DEMO
```

### Doc's own reference URL (line 237)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?tenant=TENANT&key=??????&reqtype=HANGUP&extension=205
```

Response for either: not documented.

## Source
Site lines 128–129; Doc lines 225–229, 237.
