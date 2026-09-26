# Queue

The **Queue** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectq"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`queue`</td></tr><tr><td>Primary path</td><td>`/queues`</td></tr><tr><td>ID field</td><td>`qu_id`</td></tr><tr><td>Label field</td><td>`qu_name`</td></tr><tr><td>Primary source table</td><td>`qu_queues`</td></tr><tr><td>Path aliases</td><td>`/queues`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/queues?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/queues?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`qu_name`</td></tr><tr><td>`number`</td><td>`qu_number`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`QUEUE-FULL`</td><td>`full`</td></tr><tr><td>`QUEUE-TIMEOUT`</td><td>`timeout_destination`, `timeout`</td></tr><tr><td>`QUEUE-EXITKEY`</td><td>`exitkey`</td></tr><tr><td>`QUEUE-ONCALLBACK`</td><td>`oncallback`</td></tr><tr><td>`QUEUE-NOBODYHOME`</td><td>`nobodyhome`</td></tr><tr><td>`QUEUE-NOFREEMEMBER`</td><td>`nofreemember`</td></tr><tr><td>`QUEUE-PERIODICANNOUNCE`</td><td>`periodicannounce`</td></tr><tr><td>`QUEUE-BEFORERINGING`</td><td>`beforeringing`</td></tr><tr><td>`QUEUE-ONAUTOPAUSE`</td><td>`onautopause`</td></tr><tr><td>`QUEUE-ONABANDONEDCALL`</td><td>`onabandonedcall`</td></tr></tbody></table>

## Examples

### List Queues

Returns the queues visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/queues?tenant=CANISTRACCI"
```

### Get Queue

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Queue

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Accounting Queue",
  "number": "700"
}' \
  "https://pbx.example.com/pbx/openapi.php/queues?tenant=CANISTRACCI"
```

### Edit Queue

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Accounting Queue Updated"
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Queue

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue FULL Destination

Updates the `QUEUE-FULL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "full": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue TIMEOUT Destination

Updates the `QUEUE-TIMEOUT` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "timeout_destination": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue EXITKEY Destination

Updates the `QUEUE-EXITKEY` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "exitkey": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue ONCALLBACK Destination

Updates the `QUEUE-ONCALLBACK` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "oncallback": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue NOBODYHOME Destination

Updates the `QUEUE-NOBODYHOME` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "nobodyhome": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue NOFREEMEMBER Destination

Updates the `QUEUE-NOFREEMEMBER` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "nofreemember": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue PERIODICANNOUNCE Destination

Updates the `QUEUE-PERIODICANNOUNCE` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "periodicannounce": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue BEFORERINGING Destination

Updates the `QUEUE-BEFORERINGING` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "beforeringing": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue ONAUTOPAUSE Destination

Updates the `QUEUE-ONAUTOPAUSE` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onautopause": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue ONABANDONEDCALL Destination

Updates the `QUEUE-ONABANDONEDCALL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onabandonedcall": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue Members

Replaces queue members. Use extension IDs and optional member fields such as penalty when needed.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "members": [
    {
      "extension_id": 45,
      "penalty": 0
    },
    {
      "extension_id": 46,
      "penalty": 1
    }
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

### Queue Allowed Members

Controls which extensions are allowed to be used as queue members.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "allowed_members": [
    45,
    46,
    47
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/queues/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>