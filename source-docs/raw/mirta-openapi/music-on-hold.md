# Music On Hold

The **Music On Hold** object is supported by the MiRTA PBX OpenAPI endpoint. This object is normally tenant-scoped. With a global API key, use `global=1` to manage the shared/global record set. Tenant writes still require `tenant=CANISTRACCI`.

## Object Summary

<table id="bkmrk-propertyvalueobjectm"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`musiconhold`</td></tr><tr><td>Primary path</td><td>`/musiconholds`</td></tr><tr><td>ID field</td><td>`mu_id`</td></tr><tr><td>Label field</td><td>`mu_name`</td></tr><tr><td>Primary source table</td><td>`mu_musiconholds`</td></tr><tr><td>Required on create</td><td>`mu_name`</td></tr><tr><td>Path aliases</td><td>`/moh`, `/music`, `/musiconholds`, `/music_on_hold`, `/music_on_holds`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/musiconholds?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/musiconholds?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`mu_name`</td></tr><tr><td>`custom`</td><td>`mu_custom`</td></tr><tr><td>`volume`</td><td>`mu_volume`</td></tr><tr><td>`randomizeorder`</td><td>`mu_randomizeorder`</td></tr><tr><td>`streamengine`</td><td>`mu_streamengine`</td></tr><tr><td>`format`</td><td>`format`</td></tr><tr><td>`application`</td><td>`application`</td></tr><tr><td>`mode`</td><td>`mode`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`MUSICONHOLD`</td><td>`mediafile`, `mediafiles`, `destination`</td></tr></tbody></table>

## Examples

### List Music On Hold Classes

Returns the music on hold classes visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/musiconholds?tenant=CANISTRACCI"
```

### Get Music On Hold

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Music On Hold

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Music On Hold",
  "custom": "yes",
  "volume": 0,
  "mode": "playlist",
  "format": "slin"
}' \
  "https://pbx.example.com/pbx/openapi.php/musiconholds?tenant=CANISTRACCI"
```

### Edit Music On Hold

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "volume": -3
}' \
  "https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Music On Hold

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI"
```

### List Global Music On Hold Classes

Uses the shared/global record set for object types that support global rows.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/musiconholds?global=1"
```

### Music On Hold Destination

Updates the `MUSICONHOLD` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "mediafile": [
    22
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI"
```

### Music On Hold Entries and Default

Replaces music-on-hold entries and marks the class as the default class for the scope.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "entries": [
    {
      "me_id": 22,
      "order": 1
    },
    {
      "me_id": 23,
      "order": 2
    }
  ],
  "default": true
}' \
  "https://pbx.example.com/pbx/openapi.php/musiconholds/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>