# QUEUE

**Purpose:** "Manage queue agents" (Doc line 240).
**Method:** GET (`basis: example_url`).
**Source:** Site lines 136–139; Doc lines 240–255.

## Parameters (Doc lines 241–255)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | not stated (Doc: "tenant for the queue") | tenant code | |
| `number` | not stated (alternative to `id`) | queue number, or `NONE` where applicable | |
| `id` | not stated (alternative to `number`) | queue id | |
| `uniqid` | optional | any | "use this as unique id for the log record" |
| `extension` | optional | number/username, or `NONE` where applicable | agent to add/delete |
| `action` | not stated | `list`, `add`, `del`, `clean`, `log` | list/add/delete-one/delete-all agents, or write a custom log entry |
| `order` | optional | numeric | agent's position in the agent list |
| `type` | optional | `NF` (Not Following), `AD` (Additional Destinations), `NFR` (Not Following with Ring), `ADR` (Additional Destinations with Ring) | agent type |
| `event` | optional | any | custom log event name (with `action=log`) |
| `data1`…`data5` | optional | any | payload for a custom log event (with `action=log`) |

## Examples

### Get the list of agents — `action=list` (Site, line 137)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=QUEUE&tenant=DEMO&action=list&number=9200
```

### Add an agent to a queue — `action=add` (Site, line 139)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=QUEUE&tenant=DEMO&action=add&number=9200&extension=103
```

Response for either: not documented.

## Source
Site lines 136–139; Doc lines 240–255.
