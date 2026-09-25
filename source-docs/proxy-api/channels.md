# CHANNELS

**Purpose:** "Show the channels for the selected tenant" (Doc line 82).
**Method:** GET (`basis: example_url`).
**Source:** Doc lines 82–87. No Site example.

## Parameters (Doc lines 83–84)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | optional | tenant code | "show channels for the tenant" |

## Example (Doc, line 87)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?reqtype=CHANNELS&tenant=TENANTNAME&key=apikey
```
The only Doc-only reqtype with a full example URL besides `simplecdrs`.
Response: not documented.

## Source
Doc lines 82–87.
