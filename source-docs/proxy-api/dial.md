# DIAL

**Purpose:** "Dial a number and connect to another number" (Doc line 187) /
Site heading: "Call an extension and then dial a number".
**Method:** GET (`basis: example_url`).
**Source:** Site lines 117–127; Doc lines 187–206.

## Parameters (Doc lines 188–200)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | not stated (Doc: "tenant where to place the call") | tenant code | |
| `source` \| `?exten` | not stated | number, or `ACCOUNT` | "first number to dial - use ACCOUNT to use the number associated with the account chosen". The `?exten` alternate name and its leading `?` are unexplained — UNRESOLVED |
| `dest` \| `phone` | not stated | number | number to connect |
| `var` | optional | `name=value` | "variables to set, will be prefixed tenant code" |
| `account` | optional | account name, or `SOURCE` | "account name to simulate the call from - use SOURCE to use the account associated with the source number choosen" (sic) |
| `dialtimeout` | optional | seconds | dial timeout |
| `timeout` | optional | seconds | max call duration |
| `sourceclid` | optional | CLID | CLID for dialing source number |
| `destclid` | optional | CLID | CLID for dialing dest number |
| `recording` | optional | `yes`, `no`, `yeschange`, `nochange` | sets call recording |
| `server` | optional | server name | specific server to dial from |
| `autoanswer` | optional | `yes` | require source phone to auto-answer |

## Examples

### Basic (Site, line 118)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=DIAL&source=402&dest=9922323232&tenant=DEMO&account=source
```
**Response** (Site line 120 — a documented response sample, pipe-delimited):
```
Success|Originate successfully queued|15a4cfe6429054|
```
Note (Site line 123): the third field ("15a4cfe6429054") is a call id; it
"will be contained in the 'OriginateID' field in the cdr table", and can
be passed to `INFO&info=recording&id=<callid>` (see `info.md`).

### With a `var` (Site, lines 125–127)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=DIAL&source=402&dest=9922323232&tenant=DEMO&account=402-DEMO&var=callid%3D453131
```
Notes: `%3D` is URL-encoded `=` (Site line 126). The variable becomes
available in the dial plan as `"TENANTCODE-variable"` — in this example,
`DEMO-callid` (Site line 127).

### Reference (Doc, line 205 — a parameter list, no response shown)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?dest=$NUMBER&tenant=TENANTNAME&key=APIKEY&reqtype=DIAL&account=source&source=???&sourceclid=07377777
```

## Source
Site lines 117–127; Doc lines 187–206.
