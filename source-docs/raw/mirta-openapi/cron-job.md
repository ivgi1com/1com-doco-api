# Cron Job

The **Cron Job** object is supported by the MiRTA PBX OpenAPI endpoint. This object is normally tenant-scoped. With a global API key, use `global=1` to manage the shared/global record set. Tenant writes still require `tenant=CANISTRACCI`.

## Object Summary

<table id="bkmrk-propertyvalueobjectc"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`cronjob`</td></tr><tr><td>Primary path</td><td>`/cronjobs`</td></tr><tr><td>ID field</td><td>`cr_id`</td></tr><tr><td>Label field</td><td>`cr_name`</td></tr><tr><td>Primary source table</td><td>`cr_cronjobs`</td></tr><tr><td>Required on create</td><td>`cr_name`</td></tr><tr><td>Path aliases</td><td>`/cronjob`, `/cronjobs`, `/cron_job`, `/cron_jobs`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/cronjobs?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/cronjobs/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/cronjobs?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/cronjobs/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/cronjobs/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`cr_name`</td></tr><tr><td>`type`</td><td>`cr_type`</td></tr><tr><td>`node_id`</td><td>`cr_no_id`</td></tr><tr><td>`active`</td><td>`cr_active`</td></tr><tr><td>`once`</td><td>`cr_once`</td></tr><tr><td>`minute`</td><td>`cr_minute`</td></tr><tr><td>`hour`</td><td>`cr_hour`</td></tr><tr><td>`day`</td><td>`cr_day`</td></tr><tr><td>`month`</td><td>`cr_month`</td></tr><tr><td>`year`</td><td>`cr_year`</td></tr><tr><td>`weekday`</td><td>`cr_weekday`</td></tr><tr><td>`timezone`</td><td>`cr_timezone`</td></tr><tr><td>`run`</td><td>`cr_run`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`CRONJOB`</td><td>`destination`, `destinations`</td></tr></tbody></table>

## Examples

### List Cron Jobs

Returns the cron jobs visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cronjobs?tenant=CANISTRACCI"
```

### Get Cron Job

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cronjobs/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Cron Job

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Nightly Job",
  "type": "CALL",
  "active": "yes",
  "minute": "0",
  "hour": "2",
  "timezone": "Europe/Rome"
}' \
  "https://pbx.example.com/pbx/openapi.php/cronjobs?tenant=CANISTRACCI"
```

### Edit Cron Job

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "active": "no"
}' \
  "https://pbx.example.com/pbx/openapi.php/cronjobs/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Cron Job

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cronjobs/OBJECT_ID?tenant=CANISTRACCI"
```

### List Global Cron Jobs

Uses the shared/global record set for object types that support global rows.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cronjobs?global=1"
```

### Cron Job Destination

Updates the `CRONJOB` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "destination": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/cronjobs/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>