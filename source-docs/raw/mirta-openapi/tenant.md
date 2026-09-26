# Tenant

The **Tenant** object is supported by the MiRTA PBX OpenAPI endpoint. This object is managed at system scope and requires a global API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectt"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`tenant`</td></tr><tr><td>Primary path</td><td>`/tenants`</td></tr><tr><td>ID field</td><td>`te_id`</td></tr><tr><td>Label field</td><td>`te_name`</td></tr><tr><td>Primary source table</td><td>`te_tenants`</td></tr><tr><td>Required on create</td><td>`te_name`, `te_code`</td></tr><tr><td>Path aliases</td><td>`/tenants`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/tenants`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/tenants/OBJECT_ID`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/tenants`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/tenants/OBJECT_ID`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/tenants/OBJECT_ID`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`te_name`</td></tr><tr><td>`code`</td><td>`te_code`</td></tr><tr><td>`billingcode`</td><td>`te_billingcode`</td></tr><tr><td>`billing_code`</td><td>`te_billingcode`</td></tr><tr><td>`timezone`</td><td>`te_timezone`</td></tr><tr><td>`routing_profile_id`</td><td>`te_rp_id`</td></tr><tr><td>`campaign_routing_profile_id`</td><td>`te_campaign_rp_id`</td></tr><tr><td>`fax_routing_profile_id`</td><td>`te_fax_rp_id`</td></tr></tbody></table>

## Examples

### List Tenants

Returns the tenants visible to the key and scope.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/tenants"
```

### Get Tenant

Reads one object by its internal ID.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/tenants/OBJECT_ID"
```

### Create Tenant

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Tenant",
  "code": "DOCSAPI",
  "timezone": "Europe/Rome"
}' \
  "https://pbx.example.com/pbx/openapi.php/tenants"
```

### Edit Tenant

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "routing_profile_id": 3,
  "te_payment_type": "Post Paid"
}' \
  "https://pbx.example.com/pbx/openapi.php/tenants/OBJECT_ID"
```

### Delete Tenant

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/tenants/OBJECT_ID"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>