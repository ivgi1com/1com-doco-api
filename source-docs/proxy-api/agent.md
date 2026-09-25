# AGENT

**Purpose:** "Manipulate queue agent status" (Doc line 154).
**Method:** GET (`basis: example_url`).
**Source:** Site lines 130–133; Doc lines 154–164.

## Parameters (Doc lines 155–160)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | not stated (Doc: "name of the tenant") | tenant code | |
| `extension` | not stated | agent username or extension number | |
| `queue` | not stated | queue id | |
| `action` | not stated (Doc lists only two) | `pause`, `unpause` (Doc) — **but see below** | action to perform |
| `pausereason` | optional | free text | pause reason |

**`action` value conflict — UNRESOLVED.** The Doc's own list (line 159)
gives only `pause`/`unpause`. But the Site's second AGENT example (line
133) uses `action=LISTQUEUES`, which does not appear in the Doc's list at
all and returns a different kind of data (agent-to-queue info, not a
status change). Neither source explains `LISTQUEUES` further or states
whether other `action` values exist beyond these three.

## Examples

### Pause agent from queue (Site, line 131; case differs from Doc's example)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=AGENT&action=PAUSE&queue=281&extension=104-DEMO&tenant=DEMO&pausereason=Breakfast
```
(Doc's own reference example, line 164, uses lowercase `action=pause` —
casing is not documented as significant either way.)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?tenant=TENANT&key=APIKEY&reqtype=AGENT&action=pause&queue=162&extension=823
```

### Get info for agent in all the queues — `action=LISTQUEUES` (Site, line 133)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=AGENT&action=LISTQUEUES&extension=104-DEMO&tenant=DEMO&format=json
```
Response: not documented (for either action).

## Source
Site lines 130–133; Doc lines 154–164.
