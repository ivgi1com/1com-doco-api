# VOICEMAIL

**Purpose:** "Get info about voicemails" (Doc line 311).
**Method:** GET (`basis: example_url`).
**Source:** Site lines 140–150; Doc lines 311–319 (and a near-duplicate
block, lines 352–360 — see note).

**Source defect (Doc)**: the Doc repeats a whole block of reqtypes
(QUEUERESET, REBOOT, RESPONSEPATH, SETFLOW, TRANSFER, VOICEMAIL,
COUNTCALLS) a second time (lines 320–361), word-for-word identical for
VOICEMAIL. No new information in the second copy.

## Parameters (Doc lines 312–319)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | optional (Doc) | tenant code | "tenant for the voicemails" |
| `mailbox` | optional | mailbox number | "show info about a specific mailbox" |
| `msgid` | optional | message id | |
| `action` | not stated | `list`, `messages`, `message`, `delete` | list all voicemails / list messages for a mailbox / get a message binary / delete a message |

## Examples

### Get all voicemails for a tenant — `action=list` (Site, line 142)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=DEMO&action=list
```

### Get info about voicemails in a mailbox — `action=messages` (Site, line 144)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=DEMO&mailbox=102&action=messages
```

### Get the binary audio for a message — `action=message` (Site, line 146)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=DEMO&mailbox=102&action=message&msgid=1475685709-00000004
```

### Mark a message as read — `action=markread` (Site, line 148)
```
GET https://DEMO.1com.com/1com/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=DEMO&action=markread&msgid=1543267778-00000007
```
Note: `markread`/`markunread` are **not** in the Doc's `action` list
(`list`/`messages`/`message`/`delete`) — two more undocumented-by-the-Doc
action values, evidenced only by the Site.

### Mark a message as not read — `action=markunread` (Site, line 150)
```
GET https://DEMO.1com.com/1com/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=DEMO&action=markunread&msgid=1543267778-00000007
```

Response for any of the above: not documented.

## Source
Site lines 140–150; Doc lines 311–319, 352–360 (duplicate).
