import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * User. Source: source-docs/openapi/users.md (official page `user`, rev
 * #17). A web-login user account: username, description, email, profile,
 * password, 2FA/IP settings, and tenant/routing-profile/restriction
 * relations. Global system object: always requires a global API Key
 * (`tenantScoped: false`). BLOCK LIVE (SEC-REQ-12).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "users",
  file: "users.md",
  page: "user",
  category: "user",
  singular: "user",
  plural: "users",
  path: "/users",
  idField: "us_id",
  tenantScoped: false,
  aliases: ["/user", "/nuser", "/nusers", "/us_user", "/us_users"],
  fields: [
    f("username", "Maps to `us_username`.", { required: true, example: "demo-user" }),
    f("name", "Second alias for the same source field as `username` (`us_username`); whether the last one wins or a conflict is rejected is not documented.", {
      required: "undocumented",
    }),
    f("description", "Maps to `us_description`.", { example: "Demo API user" }),
    f("email", "Personal data. Maps to `us_email`.", { example: "demo@example.com" }),
    f("profile_id", "References a User Profile object. Alias: `userprofile_id`. Maps to `us_up_id`.", { type: "integer", example: "2" }),
    f("password", "Sets a real login password — a credential; never log or echo it. Maps to `us_password`."),
    f("use_ldap", "Maps to `us_useldap`.", { required: "undocumented" }),
    f("ip_filter", "Security-control field for the account. Maps to `us_ipfilter`.", { required: "undocumented" }),
    f("two_factor_type", "Security-control field. Values not enumerated. Maps to `us_2fatype`.", { required: "undocumented" }),
    f("never_expire", "Maps to `us_neverexpire`.", { required: "undocumented" }),
    f("dynamic_ip", "Maps to `us_dynamicip`.", { required: "undocumented" }),
    f(
      "tenant_ids",
      "Array of Tenant IDs. Not in the alias table but used in the official create example. On PATCH, a distinct relation-replacement shape replaces (not merges) this relation.",
      { type: "array" },
    ),
    f("routingprofile_ids", "Distinct PATCH-only relation-replacement shape: array of Routing Profile IDs.", { type: "array" }),
    f("allowed_userprofile_ids", "Distinct PATCH-only relation-replacement shape: array of allowed User Profile IDs.", { type: "array" }),
    f("queue_restrictions", "Distinct PATCH-only shape: array of Queue IDs restricting the user.", { type: "array" }),
    f("extension_restrictions", "Distinct PATCH-only shape: array of Extension IDs restricting the user.", { type: "array" }),
    f("provider_restrictions", "Distinct PATCH-only shape: array of Provider IDs restricting the user.", { type: "array" }),
    f("force_change", "Raw field used directly in the official PATCH example; not in the alias table.", { type: "boolean", required: "undocumented" }),
  ],
  createExample: {
    username: "demo-user",
    description: "Demo API user",
    email: "demo@example.com",
    profile_id: 2,
    password: "SYNTHETIC_SECRET",
    tenant_ids: [1],
  },
  updateExample: { force_change: true },
  errorCodes: ["missing_api_key", "invalid_api_key", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-12): `password` writes `us_password` directly, a real login password. `ip_filter`/`two_factor_type`/`never_expire`/`dynamic_ip` are security-control fields for the account itself. No response schema is documented; whether GET ever echoes `us_password` or these controls is unconfirmed. This object underlies the Auth Token identity resolution (SEC-REQ-05); treat as high sensitivity. BLOCK LIVE until a response schema is established and confirmed not to include these fields.",
  ],
});

export const userCategory: Category = { id: "user", title: "User", endpoints: [list, get, create, update, remove] };
