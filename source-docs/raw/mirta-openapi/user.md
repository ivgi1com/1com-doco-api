# User

The **User** object is supported by the MiRTA PBX OpenAPI endpoint. This object is managed at system scope and requires a global API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectu"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`user`</td></tr><tr><td>Primary path</td><td>`/users`</td></tr><tr><td>ID field</td><td>`us_id`</td></tr><tr><td>Label field</td><td>`us_username`</td></tr><tr><td>Primary source table</td><td>`us_users`</td></tr><tr><td>Required on create</td><td>`us_username`</td></tr><tr><td>Path aliases</td><td>`/user`, `/users`, `/nuser`, `/nusers`, `/us_user`, `/us_users`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/users`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/users`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`username`</td><td>`us_username`</td></tr><tr><td>`name`</td><td>`us_username`</td></tr><tr><td>`description`</td><td>`us_description`</td></tr><tr><td>`email`</td><td>`us_email`</td></tr><tr><td>`profile_id`</td><td>`us_up_id`</td></tr><tr><td>`userprofile_id`</td><td>`us_up_id`</td></tr><tr><td>`password`</td><td>`us_password`</td></tr><tr><td>`use_ldap`</td><td>`us_useldap`</td></tr><tr><td>`ip_filter`</td><td>`us_ipfilter`</td></tr><tr><td>`two_factor_type`</td><td>`us_2fatype`</td></tr><tr><td>`never_expire`</td><td>`us_neverexpire`</td></tr><tr><td>`dynamic_ip`</td><td>`us_dynamicip`</td></tr></tbody></table>

## Examples

### List Users

Returns the users visible to the key and scope.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/users"
```

### Get User

Reads one object by its internal ID.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID"
```

### Create User

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "username": "docs-api-user",
  "description": "Documentation API user",
  "email": "docs-api-user@example.com",
  "profile_id": 2,
  "password": "change-this-password",
  "tenant_ids": [
    1
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/users"
```

### Edit User

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "email": "docs-api-user-updated@example.com",
  "force_change": true
}' \
  "https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID"
```

### Delete User

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID"
```

### User Tenant and Routing Profile Relations

Replaces the user tenant, routing profile, and allowed profile relations with the supplied IDs.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "tenant_ids": [
    1
  ],
  "routingprofile_ids": [
    3
  ],
  "allowed_userprofile_ids": [
    2
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID"
```

### User Object Restrictions

Restricts the user to specific queues, extensions, or providers.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "queue_restrictions": [
    12
  ],
  "extension_restrictions": [
    45
  ],
  "provider_restrictions": [
    7
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/users/OBJECT_ID"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>