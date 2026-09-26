# Extension State

The **Extension State** endpoint returns live call-state information for one extension. It is a read-only OpenAPI endpoint and supports `GET` only.

This endpoint checks the extension registration server and queries Asterisk manager for the active channel, matching the purpose of `proxyapi.php?reqtype=info&info=extstate`. The regular extension `GET` endpoint still returns the cached `st_states` value.

## Endpoint

```
GET https://pbx.example.com/pbx/openapi.php/extensions/state?tenant=CANISTRACCI&number=100
```

<table id="bkmrk-parameterrequireddes"><thead><tr><th>Parameter</th><th>Required</th><th>Description</th></tr></thead><tbody><tr><td>`tenant`</td><td>Yes</td><td>Tenant code or tenant name.</td></tr><tr><td>`number`</td><td>Yes, unless `ext` is used</td><td>Extension number to check.</td></tr><tr><td>`ext`</td><td>Yes, unless `number` is used</td><td>Compatibility alias for `number`.</td></tr><tr><td>`key`</td><td>No, if using headers</td><td>API key. The key can also be sent with `X-API-Key` or `Authorization: Bearer`.</td></tr></tbody></table>

## Examples

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/state?tenant=CANISTRACCI&number=100"

curl -H "Authorization: Bearer TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/state?tenant=CANISTRACCI&ext=100"
```

## Response

When an active matching channel is found, the endpoint returns the live channel fields used to identify the call and the other party.

```
{
  "UniqueID": "1717240000.42",
  "LinkedID": "1717240000.42",
  "Connected Line ID": "39055123456",
  "Connected Line ID Name": "Customer",
  "Context": "authenticated",
  "Extension": "39055123456",
  "Direction": "IN",
  "OtherParty": "39055123456"
}
```

When the extension exists but no registration server is available, the endpoint returns:

```
{
  "UniqueID": "KO",
  "LinkedID": "Extension not registered",
  "Connected Line ID": "",
  "Connected Line ID Name": "",
  "Context": "",
  "Extension": "",
  "Direction": "",
  "OtherParty": ""
}
```

## Notes

- The endpoint requires a tenant context, even when using a global API key.
- If the extension is registered but has no active channel, the live fields are returned empty.
- The response is always JSON.