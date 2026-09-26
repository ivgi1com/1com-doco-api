import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Routing Profile. Source: source-docs/openapi/routingprofiles.md (official
 * page `routing-profile`, rev #17). A named routing configuration (e.g.
 * voice/fax/campaign routing) referenced by Tenant. Global system object:
 * always requires a global API key (`tenantScoped: false`).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "routingprofiles",
  file: "routingprofiles.md",
  page: "routing-profile",
  category: "routingprofile",
  singular: "routing profile",
  plural: "routing profiles",
  path: "/routingprofiles",
  idField: "rp_id",
  scope: "Global API key",
  tenantScoped: false,
  aliases: ["/routing_profiles", "/routing_profile"],
  fields: [
    f("name", "Maps to `rp_name`.", { required: true, example: "Demo Voice Routing" }),
    f("description", "Maps to `rp_description`."),
    f(
      "type",
      "Example value `\"VOICE\"`. Tenant's own field aliases (`campaign_routing_profile_id`, `fax_routing_profile_id`) imply `CAMPAIGN` and `FAX` types plausibly also exist, but that is not confirmed on this page. Maps to `rp_type`.",
      { example: "VOICE" },
    ),
  ],
  createExample: { name: "Demo Voice Routing", description: "Demo outbound routing", type: "VOICE" },
  updateExample: { description: "Demo outbound routing (updated)" },
  errorCodes: ["missing_api_key", "invalid_api_key", "read_only_api_key", "missing_required_field"],
  notes: [
    "Managed at system scope; requires a global API key.",
    "No credential- or PII-shaped field is documented. Security review is held at UNKNOWN pending schema confirmation — lowest apparent sensitivity of the admin/system objects documented so far.",
  ],
});

export const routingprofileCategory: Category = {
  id: "routingprofile",
  title: "Routing Profile",
  endpoints: [list, get, create, update, remove],
};
