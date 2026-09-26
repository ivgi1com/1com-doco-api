# Flow

The **Flow** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectf"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`flow`</td></tr><tr><td>Primary path</td><td>`/flows`</td></tr><tr><td>ID field</td><td>`fl_id`</td></tr><tr><td>Label field</td><td>`fl_name`</td></tr><tr><td>Primary source table</td><td>`fl_flows`</td></tr><tr><td>Required on create</td><td>`fl_name`</td></tr><tr><td>Path aliases</td><td>`/flow`, `/flows`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/flows?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/flows?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`fl_name`</td></tr><tr><td>`comment`</td><td>`fl_comment`</td></tr><tr><td>`number`</td><td>`fl_number`</td></tr><tr><td>`value`</td><td>`fl_value`</td></tr><tr><td>`variable_name`</td><td>`fl_variable_name`</td></tr><tr><td>`monitor_type`</td><td>`fl_monitor_type`</td></tr><tr><td>`monitor_type_id`</td><td>`fl_monitor_type_id`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`FLOW`</td><td>`destination`, `destinations`</td></tr></tbody></table>

## Examples

### List Flows

Returns the flows visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/flows?tenant=CANISTRACCI"
```

### Get Flow

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Flow

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Flow",
  "number": "850",
  "variable_name": "DOCS_FLOW_STATE",
  "value": "open"
}' \
  "https://pbx.example.com/pbx/openapi.php/flows?tenant=CANISTRACCI"
```

### Edit Flow

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "value": "closed"
}' \
  "https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Flow

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI"
```

### Flow Destination

Updates the `FLOW` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "destination": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI"
```

### Flow State Change

Sets the current flow state using one of the accepted state aliases: status, state, or st\_state.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "status": "open"
}' \
  "https://pbx.example.com/pbx/openapi.php/flows/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>