# DISA

The **DISA** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectd"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`disa`</td></tr><tr><td>Primary path</td><td>`/disas`</td></tr><tr><td>ID field</td><td>`ds_id`</td></tr><tr><td>Label field</td><td>`ds_name`</td></tr><tr><td>Primary source table</td><td>`ds_disas`</td></tr><tr><td>Required on create</td><td>`ds_name`</td></tr><tr><td>Path aliases</td><td>`/disa`, `/disas`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/disas?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/disas/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/disas?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/disas/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/disas/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`ds_name`</td></tr><tr><td>`mediafile_id`</td><td>`ds_me_id`</td></tr><tr><td>`pin`</td><td>`ds_pin`</td></tr><tr><td>`outbound`</td><td>`ds_outbound`</td></tr><tr><td>`blockcid`</td><td>`ds_blockcid`</td></tr><tr><td>`calleridnum`</td><td>`ds_calleridnum`</td></tr><tr><td>`calleridname`</td><td>`ds_calleridname`</td></tr><tr><td>`digitstimeout`</td><td>`ds_digitstimeout`</td></tr><tr><td>`responsetimeout`</td><td>`ds_responsetimeout`</td></tr><tr><td>`looponattempt`</td><td>`ds_looponattempt`</td></tr></tbody></table>

## Examples

### List DISAs

Returns the disas visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/disas?tenant=CANISTRACCI"
```

### Get DISA

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/disas/OBJECT_ID?tenant=CANISTRACCI"
```

### Create DISA

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API DISA",
  "mediafile_id": 22,
  "pin": "2468",
  "outbound": "yes"
}' \
  "https://pbx.example.com/pbx/openapi.php/disas?tenant=CANISTRACCI"
```

### Edit DISA

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "pin": "1357"
}' \
  "https://pbx.example.com/pbx/openapi.php/disas/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete DISA

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/disas/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>