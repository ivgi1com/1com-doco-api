# Dial

The **Dial** endpoint originates a call between a source extension and a destination number. It is the OpenAPI equivalent of `proxyapi.php?reqtype=DIAL` and uses the same PBX dialplan contexts.

The endpoint requires a tenant context and a full API key. Read-only API keys cannot originate calls.

## Endpoint

```
POST https://pbx.example.com/pbx/openapi.php/dial?tenant=CANISTRACCI
```

<table id="bkmrk-parameterrequireddes"><thead><tr><th>Parameter</th><th>Required</th><th>Description</th></tr></thead><tbody><tr><td>`tenant`</td><td>Yes</td><td>Tenant code or tenant name.</td></tr><tr><td>`key`</td><td>No, if using headers</td><td>Full API key. The key can also be sent with `X-API-Key` or `Authorization: Bearer`.</td></tr></tbody></table>

## Request Body

<table id="bkmrk-fieldrequireddescrip"><thead><tr><th>Field</th><th>Required</th><th>Description</th></tr></thead><tbody><tr><td>`source`</td><td>Yes</td><td>Source extension. Compatibility aliases are `exten` and `?exten`.</td></tr><tr><td>`dest`</td><td>Yes</td><td>Destination number. Compatibility alias is `phone`.</td></tr><tr><td>`dialtimeout`</td><td>No</td><td>Originate timeout in seconds. Defaults to `30`.</td></tr><tr><td>`timeout`</td><td>No</td><td>Sets the dialplan variable `SETTIMEOUT`.</td></tr><tr><td>`sourceclid`</td><td>No</td><td>Sets `SETSOURCECLID`.</td></tr><tr><td>`destclid`</td><td>No</td><td>Sets `SETDESTCLID`.</td></tr><tr><td>`logqueueoutbound`</td><td>No</td><td>Sets `SETLOGQUEUEOUTBOUND`.</td></tr><tr><td>`recording`</td><td>No</td><td>Sets `SETRECORDING`.</td></tr><tr><td>`autoanswer`</td><td>No</td><td>Sets `AUTOANSWER`.</td></tr><tr><td>`nofollow`</td><td>No</td><td>Sets `SETNOFOLLOWEXTENSION`.</td></tr><tr><td>`account`</td><td>No</td><td>Peer account name to set as `SETPEERNAME`. Use `SOURCE` to resolve it from the source extension.</td></tr><tr><td>`server`</td><td>No</td><td>PBX node peer name to use when the source or destination registration server cannot be found.</td></tr><tr><td>`var`</td><td>No</td><td>Comma-separated custom variables, for example `campaign=summer,lead=42`.</td></tr><tr><td>`vars`</td><td>No</td><td>Custom variables as a JSON object. Variables are tenant-prefixed and listed in `VARLIST`.</td></tr></tbody></table>

## Example

```
curl -X POST "https://pbx.example.com/pbx/openapi.php/dial?tenant=CANISTRACCI" \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "100",
    "dest": "39055123456",
    "dialtimeout": 30,
    "sourceclid": "100",
    "recording": "yes",
    "vars": {
      "campaign": "summer",
      "lead": "42"
    }
  }'
```

## Response

The response includes the Asterisk manager originate result, the generated originate ID, and the selected PBX node.

```
{
  "Response": "Success",
  "Message": "Originate successfully queued",
  "ID": "6867c1c5.12345678",
  "source": "100",
  "dest": "39055123456",
  "server": "pbx-node-1",
  "node": "PBX Node 1"
}
```

## Compatibility Notes

- `source=ACCOUNT` resolves the source extension number from the `account` peer name.
- `account=SOURCE` resolves the peer name from the source extension and sets `SETPEERNAME`.
- If a source or destination registration server is found, that node is used. If no registration server is found, pass `server` with the node peer name.
- The endpoint returns JSON only.