# Hunt List

The **Hunt List** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjecth"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`huntlist`</td></tr><tr><td>Primary path</td><td>`/huntlists`</td></tr><tr><td>ID field</td><td>`hu_id`</td></tr><tr><td>Label field</td><td>`hu_name`</td></tr><tr><td>Primary source table</td><td>`hu_huntlists`</td></tr><tr><td>Required on create</td><td>`hu_name`</td></tr><tr><td>Path aliases</td><td>`/huntlists`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/huntlists?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/huntlists?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`hu_name`</td></tr><tr><td>`number`</td><td>`hu_number`</td></tr><tr><td>`type`</td><td>`hu_type`</td></tr><tr><td>`ringtime`</td><td>`hu_ringtime`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`HUNTLIST`</td><td>`extensions`, `members`, `huntlist`</td></tr><tr><td>`HUNTLIST-TIMEOUT`</td><td>`timeout`, `huntlist_timeout`</td></tr></tbody></table>

## Examples

### List Hunt Lists

Returns the hunt lists visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/huntlists?tenant=CANISTRACCI"
```

### Get Hunt List

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Hunt List

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Hunt List",
  "number": "820",
  "type": "RINGALL",
  "ringtime": 20
}' \
  "https://pbx.example.com/pbx/openapi.php/huntlists?tenant=CANISTRACCI"
```

### Edit Hunt List

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ringtime": 25
}' \
  "https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Hunt List

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI"
```

### Hunt List Destination

Updates the `HUNTLIST` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "extensions": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI"
```

### Hunt List TIMEOUT Destination

Updates the `HUNTLIST-TIMEOUT` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "timeout": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/huntlists/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>