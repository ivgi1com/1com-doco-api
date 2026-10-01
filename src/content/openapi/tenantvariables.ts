import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Tenant Variable. Source: source-docs/openapi/tenantvariables.md (official
 * page `tenant-variable`, rev #18). A tenant-scoped named variable/value
 * pair, similar in shape to Setting but tenant-only (no `global=1`) and
 * with a `locked` flag.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "tenantvariables",
  file: "tenantvariables.md",
  page: "tenant-variable",
  category: "tenantvariable",
  singular: "tenant variable",
  plural: "tenant variables",
  path: "/tenantvariables",
  idField: "tv_id",
  tenantScoped: true,
  aliases: ["/variable", "/variables", "/tenantvariable", "/tenant_variable", "/tenant_variables"],
  fields: [
    f("variable_id", "References an \"allowed variable\" definition (`tv_al_id`). This is the required-on-create field, not the label field `value`.", {
      required: true,
      type: "integer",
      example: "1",
    }),
    f("value", "Maps to `tv_value`. Its actual content depends on which allowed-variable definition it's attached to.", { example: "demo-value" }),
    f("comment", "Maps to `tv_comment`."),
    f("locked", "Suggests some variables are protected from ordinary changes. Maps to `tv_locked`.", { required: "undocumented" }),
  ],
  createExample: { variable_id: 1, value: "demo-value", comment: "Demo variable value" },
  updateExample: { value: "demo-value-updated" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Unlike Setting, this object has no `global=1` option documented.",
    "Security (SEC-REQ-21): the same generic key/value risk as Setting (SEC-REQ-17) — enumerate the \"allowed variable\" (`tv_al_id`) definitions before Live and allowlist by definition, not just by field name.",
  ],
});

export const tenantvariableCategory: Category = {
  id: "tenantvariable",
  title: "Tenant Variable",
  endpoints: [list, get, create, update, remove],
};
