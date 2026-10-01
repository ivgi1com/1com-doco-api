import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * User Profile. Source: source-docs/openapi/userprofiles.md (official page
 * `user-profile`, rev #17). A permission-profile object assigned to Users,
 * defining a set of privileges. Global system object: always requires a
 * global API Key (`tenantScoped: false`).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "userprofiles",
  file: "userprofiles.md",
  page: "user-profile",
  category: "userprofile",
  singular: "user profile",
  plural: "user profiles",
  path: "/userprofiles",
  idField: "up_id",
  tenantScoped: false,
  aliases: ["/userprofile", "/user_profile", "/user_profiles"],
  fields: [
    f("name", "Maps to `up_name`.", { required: true, example: "Demo Profile" }),
    f("description", "Maps to `up_description`.", { example: "Demo documentation profile" }),
    f("reserved", "Maps to `up_reserved`. Meaning not explained.", { required: "undocumented" }),
    f("userpanel", "Aliases: `user_panel`, `extension_user_profile`. Maps to `up_userpanel`.", { example: "yes" }),
    f(
      "privileges",
      "Distinct PATCH-only write shape replacing the profile's privilege list: an array of `{id, param1}`. Privilege IDs must exist in the system privilege table (not itself documented). `param1` values `\"read\"`/`\"write\"` are shown in the one example, not stated exhaustive.",
      { type: "array" },
    ),
  ],
  createExample: { name: "Demo Profile", description: "Demo documentation profile", userpanel: "yes" },
  updateExample: {
    privileges: [
      { id: 1, param1: "read" },
      { id: 2, param1: "write" },
    ],
  },
  errorCodes: ["missing_api_key", "invalid_api_key", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-13): this object controls authorization (privileges) for Users; a response or write vulnerability has systemic impact. No response schema is documented. Before Live: establish the schema, and treat any Live read cautiously given the privilege-control role.",
  ],
});

export const userprofileCategory: Category = {
  id: "userprofile",
  title: "User Profile",
  endpoints: [list, get, create, update, remove],
};
