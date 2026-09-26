# Condition

The **Condition** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectc"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`condition`</td></tr><tr><td>Primary path</td><td>`/conditions`</td></tr><tr><td>ID field</td><td>`co_id`</td></tr><tr><td>Label field</td><td>`co_name`</td></tr><tr><td>Primary source table</td><td>`co_conditions`</td></tr><tr><td>Required on create</td><td>`co_type`</td></tr><tr><td>Path aliases</td><td>`/conditions`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/conditions?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/conditions?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`co_name`</td></tr><tr><td>`type`</td><td>`co_type`</td></tr><tr><td>`timezone`</td><td>`co_timezone`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`CONDITION`</td><td>`condition`, `true`, `yes`, `destination`</td></tr><tr><td>`NOTCONDITION`</td><td>`notcondition`, `false`, `no`, `notdestination`</td></tr><tr><td>`CONDITION1`</td><td>`condition1`, `destination1`, `destinationmvv1`</td></tr><tr><td>`CONDITION2`</td><td>`condition2`, `destination2`, `destinationmvv2`</td></tr><tr><td>`CONDITION3`</td><td>`condition3`, `destination3`, `destinationmvv3`</td></tr><tr><td>`CONDITION4`</td><td>`condition4`, `destination4`, `destinationmvv4`</td></tr><tr><td>`CONDITION5`</td><td>`condition5`, `destination5`, `destinationmvv5`</td></tr><tr><td>`CONDITION6`</td><td>`condition6`, `destination6`, `destinationmvv6`</td></tr><tr><td>`CONDITION7`</td><td>`condition7`, `destination7`, `destinationmvv7`</td></tr><tr><td>`CONDITION8`</td><td>`condition8`, `destination8`, `destinationmvv8`</td></tr><tr><td>`CONDITION9`</td><td>`condition9`, `destination9`, `destinationmvv9`</td></tr><tr><td>`CONDITION10`</td><td>`condition10`, `destination10`, `destinationmvv10`</td></tr><tr><td>`CONDITION11`</td><td>`condition11`, `destination11`, `destinationmvv11`</td></tr><tr><td>`CONDITION12`</td><td>`condition12`, `destination12`, `destinationmvv12`</td></tr><tr><td>`CONDITION13`</td><td>`condition13`, `destination13`, `destinationmvv13`</td></tr><tr><td>`CONDITION14`</td><td>`condition14`, `destination14`, `destinationmvv14`</td></tr><tr><td>`CONDITION15`</td><td>`condition15`, `destination15`, `destinationmvv15`</td></tr><tr><td>`CONDITION16`</td><td>`condition16`, `destination16`, `destinationmvv16`</td></tr><tr><td>`CONDITION17`</td><td>`condition17`, `destination17`, `destinationmvv17`</td></tr><tr><td>`CONDITION18`</td><td>`condition18`, `destination18`, `destinationmvv18`</td></tr><tr><td>`CONDITION19`</td><td>`condition19`, `destination19`, `destinationmvv19`</td></tr><tr><td>`CONDITION20`</td><td>`condition20`, `destination20`, `destinationmvv20`</td></tr></tbody></table>

## Examples

### List Conditions

Returns the conditions visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/conditions?tenant=CANISTRACCI"
```

### Get Condition

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Condition

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Office Hours",
  "type": "WEEKTIME",
  "timezone": "Europe/Rome"
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions?tenant=CANISTRACCI"
```

### Edit Condition

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "timezone": "UTC"
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Condition

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition Destination

Updates the `CONDITION` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition Destination

Updates the `NOTCONDITION` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "notcondition": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 1 Destination

Updates the `CONDITION1` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition1": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 2 Destination

Updates the `CONDITION2` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition2": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 3 Destination

Updates the `CONDITION3` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition3": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 4 Destination

Updates the `CONDITION4` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition4": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 5 Destination

Updates the `CONDITION5` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition5": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 6 Destination

Updates the `CONDITION6` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition6": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 7 Destination

Updates the `CONDITION7` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition7": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 8 Destination

Updates the `CONDITION8` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition8": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 9 Destination

Updates the `CONDITION9` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition9": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 10 Destination

Updates the `CONDITION10` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition10": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 11 Destination

Updates the `CONDITION11` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition11": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 12 Destination

Updates the `CONDITION12` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition12": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 13 Destination

Updates the `CONDITION13` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition13": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 14 Destination

Updates the `CONDITION14` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition14": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 15 Destination

Updates the `CONDITION15` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition15": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 16 Destination

Updates the `CONDITION16` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition16": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 17 Destination

Updates the `CONDITION17` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition17": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 18 Destination

Updates the `CONDITION18` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition18": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 19 Destination

Updates the `CONDITION19` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition19": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition 20 Destination

Updates the `CONDITION20` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "condition20": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

### Condition Extended Rows

Supplies the extended rows used by condition types that require additional values.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "extended_infos": [
    {
      "ce_type": "weekday",
      "ce_value": "mon-fri"
    },
    {
      "ce_type": "hours",
      "ce_value": "09:00-18:00"
    }
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/conditions/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>