# Campaign

The **Campaign** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectc"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`campaign`</td></tr><tr><td>Primary path</td><td>`/campaigns`</td></tr><tr><td>ID field</td><td>`ca_id`</td></tr><tr><td>Label field</td><td>`ca_name`</td></tr><tr><td>Primary source table</td><td>`ca_campaigns`</td></tr><tr><td>Required on create</td><td>`ca_name`</td></tr><tr><td>Path aliases</td><td>`/campaign`, `/campaigns`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/campaigns?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/campaigns?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`ca_name`</td></tr><tr><td>`type`</td><td>`ca_type`</td></tr><tr><td>`tech`</td><td>`ca_tech`</td></tr><tr><td>`datestart`</td><td>`ca_datestart`</td></tr><tr><td>`dateend`</td><td>`ca_dateend`</td></tr><tr><td>`condition_id`</td><td>`ca_co_id`</td></tr><tr><td>`callerid`</td><td>`ca_callerid`</td></tr><tr><td>`calleridname`</td><td>`ca_calleridname`</td></tr><tr><td>`state`</td><td>`ca_state`</td></tr><tr><td>`queue_id`</td><td>`ca_qu_id`</td></tr><tr><td>`message`</td><td>`ca_message`</td></tr><tr><td>`confirmmessage_id`</td><td>`ca_confirmmessage_me_id`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`CAMPAIGN-ONCONNECT`</td><td>`onconnect`, `on_connect`</td></tr><tr><td>`CAMPAIGN-DONOTCALL`</td><td>`donotcall`, `do_not_call`</td></tr></tbody></table>

## Examples

### List Campaigns

Returns the campaigns visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaigns?tenant=CANISTRACCI"
```

### Get Campaign

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Campaign

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Campaign",
  "type": "VOICE",
  "tech": "PJSIP",
  "callerid": "+15551234567",
  "state": "PAUSED"
}' \
  "https://pbx.example.com/pbx/openapi.php/campaigns?tenant=CANISTRACCI"
```

### Edit Campaign

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "state": "ACTIVE"
}' \
  "https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Campaign

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI"
```

### Campaign ONCONNECT Destination

Updates the `CAMPAIGN-ONCONNECT` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onconnect": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI"
```

### Campaign DONOTCALL Destination

Updates the `CAMPAIGN-DONOTCALL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "donotcall": [
    22
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI"
```

### Campaign Binary File References

Adds binary or fax-related files to the campaign. Use complete base64 data in production integrations.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "binary_files": [
    {
      "name": "docs-script.txt",
      "data_base64": "VGhpcyBpcyBhIGRvY3VtZW50YXRpb24gZXhhbXBsZS4="
    }
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/campaigns/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>