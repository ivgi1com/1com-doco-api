# User Profile

The **User Profile** object is supported by the MiRTA PBX OpenAPI endpoint. This object is managed at system scope and requires a global API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectu"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`userprofile`</td></tr><tr><td>Primary path</td><td>`/userprofiles`</td></tr><tr><td>ID field</td><td>`up_id`</td></tr><tr><td>Label field</td><td>`up_name`</td></tr><tr><td>Primary source table</td><td>`up_userprofiles`</td></tr><tr><td>Required on create</td><td>`up_name`</td></tr><tr><td>Path aliases</td><td>`/userprofile`, `/userprofiles`, `/user_profile`, `/user_profiles`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/userprofiles`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/userprofiles/OBJECT_ID`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/userprofiles`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/userprofiles/OBJECT_ID`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/userprofiles/OBJECT_ID`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`up_name`</td></tr><tr><td>`description`</td><td>`up_description`</td></tr><tr><td>`reserved`</td><td>`up_reserved`</td></tr><tr><td>`userpanel`</td><td>`up_userpanel`</td></tr><tr><td>`user_panel`</td><td>`up_userpanel`</td></tr><tr><td>`extension_user_profile`</td><td>`up_userpanel`</td></tr></tbody></table>

## Examples

### List User Profiles

Returns the user profiles visible to the key and scope.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/userprofiles"
```

### Get User Profile

Reads one object by its internal ID.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/userprofiles/OBJECT_ID"
```

### Create User Profile

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Profile",
  "description": "Documentation profile",
  "user_panel": "yes"
}' \
  "https://pbx.example.com/pbx/openapi.php/userprofiles"
```

### Edit User Profile

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "description": "Updated documentation profile"
}' \
  "https://pbx.example.com/pbx/openapi.php/userprofiles/OBJECT_ID"
```

### Delete User Profile

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/userprofiles/OBJECT_ID"
```

### User Profile Privileges

Replaces the profile privilege list. Privilege IDs must exist in the system privilege table.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "privileges": [
    {
      "id": 1,
      "param1": "read"
    },
    {
      "id": 2,
      "param1": "write"
    }
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/userprofiles/OBJECT_ID"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>