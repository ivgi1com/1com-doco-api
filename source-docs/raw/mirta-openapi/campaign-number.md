# Campaign Number

The **Campaign Number** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectc"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`campaignnumber`</td></tr><tr><td>Primary path</td><td>`/campaignnumbers`</td></tr><tr><td>ID field</td><td>`cn_id`</td></tr><tr><td>Label field</td><td>`cn_number`</td></tr><tr><td>Primary source table</td><td>`cn_campaignnumbers`</td></tr><tr><td>Required on create</td><td>`cn_ca_id`, `cn_number`</td></tr><tr><td>Path aliases</td><td>`/campaignnumber`, `/campaignnumbers`, `/campaign_number`, `/campaign_numbers`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/campaignnumbers?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/campaignnumbers/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/campaignnumbers?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/campaignnumbers/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/campaignnumbers/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`campaign_id`</td><td>`cn_ca_id`</td></tr><tr><td>`number`</td><td>`cn_number`</td></tr><tr><td>`description`</td><td>`cn_description`</td></tr><tr><td>`disposition`</td><td>`cn_disposition`</td></tr><tr><td>`attempts`</td><td>`cn_attempts`</td></tr><tr><td>`lastattempt`</td><td>`cn_lastattempt`</td></tr><tr><td>`billsec`</td><td>`cn_billsec`</td></tr></tbody></table>

## Examples

### List Campaign Numbers

Returns the campaign numbers visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers?tenant=CANISTRACCI"
```

### Get Campaign Number

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Campaign Number

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "campaign_id": 44,
  "number": "+15557654321",
  "description": "Docs API campaign target"
}' \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers?tenant=CANISTRACCI"
```

### Edit Campaign Number

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "disposition": "CALLBACK",
  "attempts": 1
}' \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Campaign Number

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers/OBJECT_ID?tenant=CANISTRACCI"
```

### List Campaign Numbers for One Campaign

Filters the list by the parent campaign ID. The aliases caid and cn\_ca\_id are also accepted.

```
curl -X GET \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaignnumbers?tenant=CANISTRACCI&campaign_id=44"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>