import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Custom Destination. Source: source-docs/openapi/customdestinations.md
 * (official page `custom-destination`, rev #18). A configurable call-flow
 * destination object, tenant-scoped or shared globally. Its documented
 * destination types cover privacy handling, callback, channel splitting
 * and random destinations; which `cu_ct_id` type enables which behavior is
 * not documented.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "customdestinations",
  file: "customdestinations.md",
  page: "custom-destination",
  category: "customdestination",
  singular: "custom destination",
  plural: "custom destinations",
  path: "/customdestinations",
  idField: "cu_id",
  tenantScoped: true,
  globalFlag: true,
  aliases: ["/custom", "/customs", "/custom_destinations", "/custom_destination"],
  fields: [
    f("name", "Maps to `cu_name`.", { required: true, example: "Demo Custom Destination" }),
    f(
      "type_id",
      "Custom-destination type ID. Two request aliases: `type_id`, `custom_type_id`. Maps to `cu_ct_id`. Its enumeration (which numeric ID maps to which behavior — privacy, callback, split, random) is not documented on this page.",
      { required: true, type: "integer", example: "1" },
    ),
    f("privacy_dontcall", "`PRIVACY-DONTCALL` destination. Alias: `dontcall`.", { type: "unknown" }),
    f("privacy_torture", "`PRIVACY-TORTURE` destination. Alias: `torture`.", { type: "unknown" }),
    f("onanswer", "`CTONANSWER` destination.", { type: "unknown" }),
    f("callback_connected", "`CALLBACK-CONNECTED` destination.", { type: "unknown" }),
    f("caller_hangup", "`CTONCALLERHANGUP` destination.", { type: "unknown" }),
    f("split_caller", "`SPLITCHANNELACTION-CALLER` destination.", { type: "unknown" }),
    f("split_called", "`SPLITCHANNELACTION-CALLED` destination.", { type: "unknown" }),
    f(
      "extended_infos",
      "Array of `{ce_name, ce_value}` rows. Adds or replaces custom destination extended rows for custom types that need extra parameters; the valid names depend on the selected `cu_ct_id` type, itself not enumerated on this page.",
      { type: "array" },
    ),
  ],
  createExample: { name: "Demo Custom Destination", type_id: 1 },
  updateExample: { extended_infos: [{ ce_name: "DOCS_VARIABLE", ce_value: "example" }] },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "28 destination types are documented in total; only the non-random ones are modeled individually here. `RANDOMDESTINATION` (aliases `randomdestination`/`random_destination`) through `RANDOMDESTINATION20` (aliases `randomdestination[N]`/`random_destination[N]`) are not.",
    "Security (SEC-REQ-29): `extended_infos` (`ce_name`/`ce_value`) is an unenumerated key/value store whose valid names depend on the undocumented `cu_ct_id` type — the same risk class as Setting (SEC-REQ-17) and Tenant Variable (SEC-REQ-21). Before Live: enumerate the custom types and their extended names, then allowlist by name. The `global=1` list falls under SEC-REQ-28 (tenant isolation).",
  ],
});

export const customdestinationCategory: Category = {
  id: "customdestination",
  title: "Custom Destination",
  endpoints: [list, get, create, update, remove],
};
