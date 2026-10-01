import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Flow. Source: source-docs/openapi/flows.md (official page `flow`, rev
 * #18). A call-flow "state" toggle object (e.g. open/closed) with a single
 * destination, driven by a stored variable value. Likely the OpenAPI
 * equivalent of Proxy's SETFLOW, but the two API families are separate; no
 * Proxy behavior is carried over as evidence.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "flows",
  file: "flows.md",
  page: "flow",
  category: "flow",
  singular: "flow",
  plural: "flows",
  path: "/flows",
  idField: "fl_id",
  tenantScoped: true,
  aliases: ["/flow"],
  fields: [
    f("name", "Maps to `fl_name`.", { required: true, example: "Demo Flow" }),
    f("comment", "Maps to `fl_comment`."),
    f("number", "Maps to `fl_number`.", { example: "850" }),
    f("value", "Current state value. Example values `\"open\"`/`\"closed\"`. Maps to `fl_value`.", { example: "open" }),
    f("variable_name", "Stored variable name backing the state, e.g. `\"DOCS_FLOW_STATE\"`. Maps to `fl_variable_name`."),
    f("monitor_type", "Maps to `fl_monitor_type`.", { required: "undocumented" }),
    f("monitor_type_id", "Maps to `fl_monitor_type_id`.", { required: "undocumented", type: "integer" }),
    f(
      "destination",
      "`FLOW` destination. The source documents `destinations` itself as an alias of this single destination type here — unlike every other object's `destinations`-wrapper-object convention. Flagged, not resolved.",
      { type: "unknown" },
    ),
  ],
  createExample: { name: "Demo Flow", number: "850", variable_name: "DEMO_FLOW_STATE", value: "open" },
  updateExample: { value: "closed" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "A dedicated PATCH form also accepts the state value under `status`, `state`, or `st_state` as aliases for `value`.",
    "No credential- or PII-shaped field is documented. Security review is held at UNKNOWN pending schema confirmation.",
  ],
});

export const flowCategory: Category = { id: "flow", title: "Flow", endpoints: [list, get, create, update, remove] };
