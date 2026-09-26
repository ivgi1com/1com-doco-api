# Short Number

The **Short Number** object is supported by the MiRTA PBX OpenAPI endpoint. This object is normally tenant-scoped. With a global API key, use `global=1` to manage the shared/global record set. Tenant writes still require `tenant=CANISTRACCI`.

## Object Summary

<table id="bkmrk-propertyvalueobjects"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`shortnumber`</td></tr><tr><td>Primary path</td><td>`/shortnumbers`</td></tr><tr><td>ID field</td><td>`sn_id`</td></tr><tr><td>Label field</td><td>`sn_number`</td></tr><tr><td>Primary source table</td><td>`sn_shortnumbers`</td></tr><tr><td>Required on create</td><td>`sn_number`</td></tr><tr><td>Path aliases</td><td>`/shortnumbers`, `/short_numbers`, `/short_number`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/shortnumbers?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/shortnumbers/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/shortnumbers?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/shortnumbers/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/shortnumbers/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`number`</td><td>`sn_number`</td></tr><tr><td>`destination`</td><td>`sn_destnumber`</td></tr><tr><td>`destnumber`</td><td>`sn_destnumber`</td></tr><tr><td>`comment`</td><td>`sn_comment`</td></tr></tbody></table>

## Examples

### List Short Numbers

Returns the short numbers visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/shortnumbers?tenant=CANISTRACCI"
```

### Get Short Number

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/shortnumbers/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Short Number

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "number": "901",
  "destination": "EXT-100",
  "comment": "Docs API shortcut"
}' \
  "https://pbx.example.com/pbx/openapi.php/shortnumbers?tenant=CANISTRACCI"
```

### Edit Short Number

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "destination": "QUEUE-700"
}' \
  "https://pbx.example.com/pbx/openapi.php/shortnumbers/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Short Number

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/shortnumbers/OBJECT_ID?tenant=CANISTRACCI"
```

### List Global Short Numbers

Uses the shared/global record set for object types that support global rows.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/shortnumbers?global=1"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>