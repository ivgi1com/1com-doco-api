# IVR

The **IVR** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjecti"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`ivr`</td></tr><tr><td>Primary path</td><td>`/ivrs`</td></tr><tr><td>ID field</td><td>`iv_id`</td></tr><tr><td>Label field</td><td>`iv_name`</td></tr><tr><td>Primary source table</td><td>`iv_ivrs`</td></tr><tr><td>Required on create</td><td>`iv_name`</td></tr><tr><td>Path aliases</td><td>`/ivrs`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/ivrs?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/ivrs?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`iv_name`</td></tr><tr><td>`mediafile_id`</td><td>`iv_me_id`</td></tr><tr><td>`timeout`</td><td>`iv_timeout`</td></tr><tr><td>`digit_timeout`</td><td>`iv_digittimeout`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`IVR_1`</td><td>`ivr_1`, `key_1`, `1`</td></tr><tr><td>`IVR_2`</td><td>`ivr_2`, `key_2`, `2`</td></tr><tr><td>`IVR_3`</td><td>`ivr_3`, `key_3`, `3`</td></tr><tr><td>`IVR_4`</td><td>`ivr_4`, `key_4`, `4`</td></tr><tr><td>`IVR_5`</td><td>`ivr_5`, `key_5`, `5`</td></tr><tr><td>`IVR_6`</td><td>`ivr_6`, `key_6`, `6`</td></tr><tr><td>`IVR_7`</td><td>`ivr_7`, `key_7`, `7`</td></tr><tr><td>`IVR_8`</td><td>`ivr_8`, `key_8`, `8`</td></tr><tr><td>`IVR_9`</td><td>`ivr_9`, `key_9`, `9`</td></tr><tr><td>`IVR_0`</td><td>`ivr_0`, `key_0`, `0`</td></tr><tr><td>`IVR_STAR`</td><td>`ivr_star`, `key_star`, `star`</td></tr><tr><td>`IVR_SHARP`</td><td>`ivr_sharp`, `key_sharp`, `sharp`</td></tr><tr><td>`IVR_WRONG`</td><td>`ivr_wrong`, `wrong`</td></tr><tr><td>`IVR_TIMEOUT`</td><td>`ivr_timeout`, `timeout`</td></tr><tr><td>`IVR_HANGUP`</td><td>`ivr_hangup`, `hangup`</td></tr><tr><td>`IVR_FEATURE`</td><td>`ivr_feature`, `feature`</td></tr><tr><td>`IVR_EXTENSION`</td><td>`ivr_extension`, `extension`</td></tr><tr><td>`IVR_MEDIAFILE`</td><td>`ivr_mediafile`, `mediafile`</td></tr><tr><td>`IVR_OPTIONSMEDIAFILE`</td><td>`ivr_optionsmediafile`, `optionsmediafile`</td></tr><tr><td>`CUSTOMIVR_SUPPORT`</td><td>`customivr_support`</td></tr></tbody></table>

## Important Notes

- Custom IVR destination names matching CUSTOMIVR\_\* are also accepted.

## Examples

### List IVRs

Returns the ivrs visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/ivrs?tenant=CANISTRACCI"
```

### Get IVR

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### Create IVR

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API IVR",
  "mediafile_id": 22,
  "timeout": 5,
  "digit_timeout": 3
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs?tenant=CANISTRACCI"
```

### Edit IVR

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "timeout": 8,
  "digit_timeout": 4
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete IVR

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 1 Destination

Updates the `IVR_1` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_1": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 2 Destination

Updates the `IVR_2` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_2": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 3 Destination

Updates the `IVR_3` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_3": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 4 Destination

Updates the `IVR_4` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_4": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 5 Destination

Updates the `IVR_5` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_5": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 6 Destination

Updates the `IVR_6` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_6": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 7 Destination

Updates the `IVR_7` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_7": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 8 Destination

Updates the `IVR_8` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_8": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 9 Destination

Updates the `IVR_9` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_9": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR 0 Destination

Updates the `IVR_0` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_0": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR STAR Destination

Updates the `IVR_STAR` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_star": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR SHARP Destination

Updates the `IVR_SHARP` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_sharp": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR WRONG Destination

Updates the `IVR_WRONG` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_wrong": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR TIMEOUT Destination

Updates the `IVR_TIMEOUT` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_timeout": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR HANGUP Destination

Updates the `IVR_HANGUP` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_hangup": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR FEATURE Destination

Updates the `IVR_FEATURE` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_feature": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR EXTENSION Destination

Updates the `IVR_EXTENSION` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_extension": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR MEDIAFILE Destination

Updates the `IVR_MEDIAFILE` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_mediafile": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR OPTIONSMEDIAFILE Destination

Updates the `IVR_OPTIONSMEDIAFILE` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "ivr_optionsmediafile": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

### IVR SUPPORT Destination

Updates the `CUSTOMIVR_SUPPORT` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "customivr_support": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/ivrs/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>