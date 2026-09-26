# Tenant Variable

The **Tenant Variable** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectt"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`tenantvariable`</td></tr><tr><td>Primary path</td><td>`/tenantvariables`</td></tr><tr><td>ID field</td><td>`tv_id`</td></tr><tr><td>Label field</td><td>`tv_value`</td></tr><tr><td>Primary source table</td><td>`tv_tenantvariables`</td></tr><tr><td>Required on create</td><td>`tv_al_id`</td></tr><tr><td>Path aliases</td><td>`/variable`, `/variables`, `/tenantvariable`, `/tenantvariables`, `/tenant_variable`, `/tenant_variables`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/tenantvariables?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/tenantvariables/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/tenantvariables?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/tenantvariables/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/tenantvariables/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`variable_id`</td><td>`tv_al_id`</td></tr><tr><td>`value`</td><td>`tv_value`</td></tr><tr><td>`comment`</td><td>`tv_comment`</td></tr><tr><td>`locked`</td><td>`tv_locked`</td></tr></tbody></table>

## Examples

### List Tenant Variables

Returns the tenant variables visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/tenantvariables?tenant=CANISTRACCI"
```

### Get Tenant Variable

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/tenantvariables/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Tenant Variable

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "variable_id": 1,
  "value": "docs-value",
  "comment": "Docs API variable value"
}' \
  "https://pbx.example.com/pbx/openapi.php/tenantvariables?tenant=CANISTRACCI"
```

### Edit Tenant Variable

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "value": "docs-updated-value"
}' \
  "https://pbx.example.com/pbx/openapi.php/tenantvariables/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Tenant Variable

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/tenantvariables/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>