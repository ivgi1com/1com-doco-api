import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Caller ID Blacklist. Source: source-docs/openapi/calleridblacklists.md
 * (official page `caller-id-blacklist`, rev #18). A blocked caller ID entry
 * with a reason and insertion timestamp.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "calleridblacklists",
  file: "calleridblacklists.md",
  page: "caller-id-blacklist",
  category: "calleridblacklist",
  singular: "caller ID blacklist entry",
  plural: "caller ID blacklist entries",
  path: "/calleridblacklists",
  idField: "bl_id",
  tenantScoped: true,
  globalFlag: true,
  aliases: ["/calleridblacklist", "/callerid_blacklist", "/callerid_blacklists", "/blacklist", "/blacklists"],
  fields: [
    f("callerid", "Phone number being blocked. Maps to `bl_callerid`.", { required: true, example: "5550100" }),
    f("reason", "Maps to `bl_reason`."),
    f(
      "inserted",
      "Maps to `bl_inserted`. Insertion timestamp; whether it is settable or server-managed only is not stated — its non-required status is inferred from naming, not stated explicitly.",
    ),
  ],
  createExample: { callerid: "5550100", reason: "Demo blocked caller" },
  updateExample: { reason: "Demo blocked caller (updated)" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "No GET response example is documented for this object; the JSON shape is undocumented. Security review is held at UNKNOWN pending schema confirmation, not because a specific risk was found — `bl_callerid` is PII (a phone number) but not a credential.",
  ],
});

export const calleridblacklistCategory: Category = {
  id: "calleridblacklist",
  title: "Caller ID Blacklist",
  endpoints: [list, get, create, update, remove],
};
