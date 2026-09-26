# Media File

The **Media File** object is supported by the MiRTA PBX OpenAPI endpoint. This object is normally tenant-scoped. With a global API key, use `global=1` to manage the shared/global record set. Tenant writes still require `tenant=CANISTRACCI`.

## Object Summary

<table id="bkmrk-propertyvalueobjectm"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`mediafile`</td></tr><tr><td>Primary path</td><td>`/mediafiles`</td></tr><tr><td>ID field</td><td>`me_id`</td></tr><tr><td>Label field</td><td>`me_name`</td></tr><tr><td>Primary source table</td><td>`me_mediafiles`</td></tr><tr><td>Required on create</td><td>`me_name`</td></tr><tr><td>Path aliases</td><td>`/mediafiles`, `/media_files`, `/media_file`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/mediafiles?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/mediafiles/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/mediafiles?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/mediafiles/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/mediafiles/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`me_name`</td></tr><tr><td>`description`</td><td>`me_description`</td></tr><tr><td>`format`</td><td>`me_format`</td></tr><tr><td>`type`</td><td>`me_type`</td></tr><tr><td>`text`</td><td>`me_text`</td></tr><tr><td>`engine`</td><td>`me_engine`</td></tr><tr><td>`language`</td><td>`me_language`</td></tr><tr><td>`data_base64`</td><td>`me_data`</td></tr></tbody></table>

## Examples

### List Media Files

Returns the media files visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/mediafiles?tenant=CANISTRACCI"
```

### Get Media File

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/mediafiles/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Media File

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Welcome Prompt",
  "description": "Generated prompt for documentation",
  "type": "tts",
  "text": "Welcome to Kartoon Cars. Press 1 for sales or 2 for support.",
  "engine": "azure",
  "language": "en-US"
}' \
  "https://pbx.example.com/pbx/openapi.php/mediafiles?tenant=CANISTRACCI"
```

### Edit Media File

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "description": "Updated generated prompt"
}' \
  "https://pbx.example.com/pbx/openapi.php/mediafiles/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Media File

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/mediafiles/OBJECT_ID?tenant=CANISTRACCI"
```

### List Global Media Files

Uses the shared/global record set for object types that support global rows.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/mediafiles?global=1"
```

### Media File Binary Upload

Sends audio data as base64. Replace the shortened example with the complete encoded file.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Uploaded Prompt",
  "format": "wav",
  "data_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."
}' \
  "https://pbx.example.com/pbx/openapi.php/mediafiles?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>