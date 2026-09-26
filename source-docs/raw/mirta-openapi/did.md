# DID

The **DID** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectd"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`did`</td></tr><tr><td>Primary path</td><td>`/dids`</td></tr><tr><td>ID field</td><td>`di_id`</td></tr><tr><td>Label field</td><td>`di_number`</td></tr><tr><td>Primary source table</td><td>`di_dids`</td></tr><tr><td>Required on create</td><td>`di_number`</td></tr><tr><td>Path aliases</td><td>`/dids`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/dids?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/dids?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`number`</td><td>`di_number`</td></tr><tr><td>`country`</td><td>`di_country`</td></tr><tr><td>`area`</td><td>`di_area`</td></tr><tr><td>`comment`</td><td>`di_comment`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`DID`</td><td>`destination`, `did`</td></tr><tr><td>`DID-UNCONDITIONAL`</td><td>`unconditional`</td></tr><tr><td>`DID-SMS`</td><td>`sms`</td></tr><tr><td>`DID-FAXSUCCESS`</td><td>`faxsuccess`, `fax_success`</td></tr></tbody></table>

## Examples

### List DIDs

Returns the dids visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/dids?tenant=CANISTRACCI"
```

### Get DID

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI"
```

### Create DID

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "number": "+15551234567",
  "country": "US",
  "area": "212",
  "comment": "Docs API inbound DID"
}' \
  "https://pbx.example.com/pbx/openapi.php/dids?tenant=CANISTRACCI"
```

### Edit DID

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "comment": "Docs API DID updated"
}' \
  "https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete DID

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI"
```

### DID Destination

Updates the `DID` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "destination": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI"
```

### DID UNCONDITIONAL Destination

Updates the `DID-UNCONDITIONAL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "unconditional": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI"
```

### DID SMS Destination

Updates the `DID-SMS` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "sms": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI"
```

### DID FAXSUCCESS Destination

Updates the `DID-FAXSUCCESS` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "faxsuccess": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/dids/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>