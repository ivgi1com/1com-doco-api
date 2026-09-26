# Custom Destination

The **Custom Destination** object is supported by the MiRTA PBX OpenAPI endpoint. This object is normally tenant-scoped. With a global API key, use `global=1` to manage the shared/global record set. Tenant writes still require `tenant=CANISTRACCI`.

## Object Summary

<table id="bkmrk-propertyvalueobjectc"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`customdestination`</td></tr><tr><td>Primary path</td><td>`/customdestinations`</td></tr><tr><td>ID field</td><td>`cu_id`</td></tr><tr><td>Label field</td><td>`cu_name`</td></tr><tr><td>Primary source table</td><td>`cu_customs`</td></tr><tr><td>Required on create</td><td>`cu_name`, `cu_ct_id`</td></tr><tr><td>Path aliases</td><td>`/custom`, `/customs`, `/customdestinations`, `/custom_destinations`, `/custom_destination`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/customdestinations?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/customdestinations?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`cu_name`</td></tr><tr><td>`type_id`</td><td>`cu_ct_id`</td></tr><tr><td>`custom_type_id`</td><td>`cu_ct_id`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`PRIVACY-DONTCALL`</td><td>`privacy_dontcall`, `dontcall`</td></tr><tr><td>`PRIVACY-TORTURE`</td><td>`privacy_torture`, `torture`</td></tr><tr><td>`CTONANSWER`</td><td>`onanswer`</td></tr><tr><td>`CALLBACK-CONNECTED`</td><td>`callback_connected`</td></tr><tr><td>`CTONCALLERHANGUP`</td><td>`caller_hangup`</td></tr><tr><td>`SPLITCHANNELACTION-CALLER`</td><td>`split_caller`</td></tr><tr><td>`SPLITCHANNELACTION-CALLED`</td><td>`split_called`</td></tr><tr><td>`RANDOMDESTINATION`</td><td>`randomdestination`, `random_destination`</td></tr><tr><td>`RANDOMDESTINATION1`</td><td>`randomdestination1`, `random_destination1`</td></tr><tr><td>`RANDOMDESTINATION2`</td><td>`randomdestination2`, `random_destination2`</td></tr><tr><td>`RANDOMDESTINATION3`</td><td>`randomdestination3`, `random_destination3`</td></tr><tr><td>`RANDOMDESTINATION4`</td><td>`randomdestination4`, `random_destination4`</td></tr><tr><td>`RANDOMDESTINATION5`</td><td>`randomdestination5`, `random_destination5`</td></tr><tr><td>`RANDOMDESTINATION6`</td><td>`randomdestination6`, `random_destination6`</td></tr><tr><td>`RANDOMDESTINATION7`</td><td>`randomdestination7`, `random_destination7`</td></tr><tr><td>`RANDOMDESTINATION8`</td><td>`randomdestination8`, `random_destination8`</td></tr><tr><td>`RANDOMDESTINATION9`</td><td>`randomdestination9`, `random_destination9`</td></tr><tr><td>`RANDOMDESTINATION10`</td><td>`randomdestination10`, `random_destination10`</td></tr><tr><td>`RANDOMDESTINATION11`</td><td>`randomdestination11`, `random_destination11`</td></tr><tr><td>`RANDOMDESTINATION12`</td><td>`randomdestination12`, `random_destination12`</td></tr><tr><td>`RANDOMDESTINATION13`</td><td>`randomdestination13`, `random_destination13`</td></tr><tr><td>`RANDOMDESTINATION14`</td><td>`randomdestination14`, `random_destination14`</td></tr><tr><td>`RANDOMDESTINATION15`</td><td>`randomdestination15`, `random_destination15`</td></tr><tr><td>`RANDOMDESTINATION16`</td><td>`randomdestination16`, `random_destination16`</td></tr><tr><td>`RANDOMDESTINATION17`</td><td>`randomdestination17`, `random_destination17`</td></tr><tr><td>`RANDOMDESTINATION18`</td><td>`randomdestination18`, `random_destination18`</td></tr><tr><td>`RANDOMDESTINATION19`</td><td>`randomdestination19`, `random_destination19`</td></tr><tr><td>`RANDOMDESTINATION20`</td><td>`randomdestination20`, `random_destination20`</td></tr></tbody></table>

## Examples

### List Custom Destinations

Returns the custom destinations visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/customdestinations?tenant=CANISTRACCI"
```

### Get Custom Destination

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Custom Destination

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Custom Destination",
  "type_id": 1
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations?tenant=CANISTRACCI"
```

### Edit Custom Destination

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Custom Destination Updated"
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Custom Destination

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### List Global Custom Destinations

Uses the shared/global record set for object types that support global rows.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/customdestinations?global=1"
```

### Custom Destination DONTCALL Destination

Updates the `PRIVACY-DONTCALL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "privacy_dontcall": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination TORTURE Destination

Updates the `PRIVACY-TORTURE` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "privacy_torture": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination Destination

Updates the `CTONANSWER` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onanswer": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination CONNECTED Destination

Updates the `CALLBACK-CONNECTED` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "callback_connected": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination Destination

Updates the `CTONCALLERHANGUP` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "caller_hangup": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination CALLER Destination

Updates the `SPLITCHANNELACTION-CALLER` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "split_caller": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination CALLED Destination

Updates the `SPLITCHANNELACTION-CALLED` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "split_called": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination Destination

Updates the `RANDOMDESTINATION` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 1 Destination

Updates the `RANDOMDESTINATION1` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination1": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 2 Destination

Updates the `RANDOMDESTINATION2` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination2": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 3 Destination

Updates the `RANDOMDESTINATION3` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination3": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 4 Destination

Updates the `RANDOMDESTINATION4` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination4": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 5 Destination

Updates the `RANDOMDESTINATION5` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination5": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 6 Destination

Updates the `RANDOMDESTINATION6` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination6": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 7 Destination

Updates the `RANDOMDESTINATION7` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination7": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 8 Destination

Updates the `RANDOMDESTINATION8` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination8": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 9 Destination

Updates the `RANDOMDESTINATION9` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination9": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 10 Destination

Updates the `RANDOMDESTINATION10` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination10": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 11 Destination

Updates the `RANDOMDESTINATION11` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination11": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 12 Destination

Updates the `RANDOMDESTINATION12` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination12": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 13 Destination

Updates the `RANDOMDESTINATION13` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination13": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 14 Destination

Updates the `RANDOMDESTINATION14` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination14": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 15 Destination

Updates the `RANDOMDESTINATION15` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination15": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 16 Destination

Updates the `RANDOMDESTINATION16` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination16": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 17 Destination

Updates the `RANDOMDESTINATION17` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination17": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 18 Destination

Updates the `RANDOMDESTINATION18` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination18": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 19 Destination

Updates the `RANDOMDESTINATION19` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination19": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination 20 Destination

Updates the `RANDOMDESTINATION20` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "randomdestination20": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

### Custom Destination Extended Data

Adds or replaces custom destination extended rows when the custom type uses extra parameters.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "extended_infos": [
    {
      "ce_name": "DOCS_VARIABLE",
      "ce_value": "example"
    }
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/customdestinations/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>