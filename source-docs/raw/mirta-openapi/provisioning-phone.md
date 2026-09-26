# Provisioning Phone

The **Provisioning Phone** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectp"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`provisioningphone`</td></tr><tr><td>Primary path</td><td>`/provisioningphones`</td></tr><tr><td>ID field</td><td>`ph_id`</td></tr><tr><td>Label field</td><td>`ph_name`</td></tr><tr><td>Primary source table</td><td>`ph_phones`</td></tr><tr><td>Required on create</td><td>`ph_name`, `ph_mac`</td></tr><tr><td>Path aliases</td><td>`/phone`, `/phones`, `/provisioningphones`, `/provisioning_phones`, `/provisioning_phone`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/provisioningphones?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/provisioningphones/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/provisioningphones?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/provisioningphones/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/provisioningphones/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`ph_name`</td></tr><tr><td>`mac`</td><td>`ph_mac`</td></tr><tr><td>`model_id`</td><td>`ph_pm_id`</td></tr><tr><td>`password`</td><td>`ph_password`</td></tr><tr><td>`filename`</td><td>`ph_filename`</td></tr><tr><td>`http_user`</td><td>`ph_http_user`</td></tr><tr><td>`http_password`</td><td>`ph_http_password`</td></tr></tbody></table>

## Examples

### List Provisioning Phones

Returns the provisioning phones visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/provisioningphones?tenant=CANISTRACCI"
```

### Get Provisioning Phone

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/provisioningphones/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Provisioning Phone

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Desk Phone",
  "mac": "001122334455",
  "model_id": 1,
  "filename": "docs-api-001122334455.cfg"
}' \
  "https://pbx.example.com/pbx/openapi.php/provisioningphones?tenant=CANISTRACCI"
```

### Edit Provisioning Phone

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "http_user": "phone-user",
  "http_password": "change-this-password"
}' \
  "https://pbx.example.com/pbx/openapi.php/provisioningphones/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Provisioning Phone

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/provisioningphones/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>