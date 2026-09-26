import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Condition. Source: source-docs/openapi/conditions.md (official page
 * `condition`, rev #18). A call-flow branching object (e.g. time/weektime
 * conditions) with up to 20 numbered outcome destinations plus true/false
 * destinations.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "conditions",
  file: "conditions.md",
  page: "condition",
  category: "condition",
  singular: "condition",
  plural: "conditions",
  path: "/conditions",
  idField: "co_id",
  scope: "Tenant API key",
  tenantScoped: true,
  fields: [
    f("type", "Maps to `co_type`. Example value `\"WEEKTIME\"`; not stated exhaustive. This is the required-on-create field, not the label field `name`.", {
      required: true,
      example: "WEEKTIME",
    }),
    f("name", "Maps to `co_name`."),
    f("timezone", "Maps to `co_timezone`. Example value `Europe/Rome`."),
    f("condition", "`CONDITION` destination — the true branch. Aliases: `true`, `yes`, `destination`.", { type: "unknown" }),
    f("notcondition", "`NOTCONDITION` destination — the false branch. Aliases: `false`, `no`, `notdestination`.", { type: "unknown" }),
    f(
      "extended_infos",
      "Array of `{ce_type, ce_value}` rows for condition types needing additional values, e.g. WEEKTIME's schedule (`weekday`, `hours` observed; the full `ce_type` set is not otherwise specified).",
      { type: "array" },
    ),
  ],
  createExample: { name: "Demo Office Hours", type: "WEEKTIME", timezone: "Europe/Rome" },
  updateExample: {
    extended_infos: [
      { ce_type: "weekday", ce_value: "mon-fri" },
      { ce_type: "hours", ce_value: "09:00-18:00" },
    ],
  },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Up to 20 additional numbered destinations, `CONDITION1` through `CONDITION20` (aliases `condition[N]`/`destination[N]`/`destinationmvv[N]`), are documented but not individually modeled here.",
    "No credential- or PII-shaped field is documented. Security review is held at UNKNOWN pending schema confirmation.",
  ],
});

export const conditionCategory: Category = { id: "condition", title: "Condition", endpoints: [list, get, create, update, remove] };
