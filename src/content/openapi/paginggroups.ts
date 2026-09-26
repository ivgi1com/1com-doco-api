import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Paging Group. Source: source-docs/openapi/paginggroups.md (official page
 * `paging-group`, rev #18). An intercom/paging group: a set of extensions
 * that can be paged together, with an optional PIN. BLOCK LIVE
 * (SEC-REQ-19).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "paginggroups",
  file: "paginggroups.md",
  page: "paging-group",
  category: "paginggroup",
  singular: "paging group",
  plural: "paging groups",
  path: "/paginggroups",
  idField: "pa_id",
  scope: "Tenant API key",
  tenantScoped: true,
  aliases: ["/paging", "/pagings", "/paginggroup", "/intercom", "/intercoms"],
  fields: [
    f("name", "Maps to `pa_name`.", { required: true, example: "Demo Paging Group" }),
    f("number", "Maps to `pa_number`.", { required: true, example: "830" }),
    f("pin", "A credential-shaped field; the page does not describe what it protects. Maps to `pa_pin`.", { example: "1234" }),
    f("bidirectional", "Maps to `pa_bidirectional`. Example values `\"no\"`/`\"yes\"`."),
    f("checkinuse", "Maps to `pa_checkinuse`.", { required: "undocumented" }),
    f("mediafile_id", "Maps to `pa_me_id`.", { type: "integer" }),
    f("manualheader", "Maps to `pa_manualheader`.", { required: "undocumented" }),
    f(
      "extensions",
      "`PAGING` destination: member extensions, e.g. `{\"extensions\": [100, 101]}` — raw extension numbers, not the `EXT-`-string convention used elsewhere. Aliases: `peers`, `members`, `destination`.",
      { type: "unknown" },
    ),
  ],
  createExample: { name: "Demo Paging Group", number: "830", pin: "1234", bidirectional: "no" },
  updateExample: { bidirectional: "yes" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-19): `pin` is a credential-shaped field written directly; the page does not describe what it protects. BLOCK LIVE — follows the same rule as Voicemail, Conference Room, Provider and Provisioning Phone: a write of a credential/PIN plus an undocumented GET means BLOCK LIVE until a response schema shows `pa_pin` is excluded.",
  ],
});

export const paginggroupCategory: Category = {
  id: "paginggroup",
  title: "Paging Group",
  endpoints: [list, get, create, update, remove],
};
