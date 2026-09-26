import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Setting. Source: source-docs/openapi/settings.md (official page
 * `setting`, rev #18). A generic tenant or global key/value configuration
 * setting.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "settings",
  file: "settings.md",
  page: "setting",
  category: "setting",
  singular: "setting",
  plural: "settings",
  path: "/settings",
  idField: "se_id",
  scope: "Tenant API key or global key with global=1",
  tenantScoped: true,
  globalFlag: true,
  fields: [
    f("code", "Free-form settings key. No enum is documented. Maps to `se_code`.", { required: true, example: "DEMO_SETTING" }),
    f("value", "Free string value. Example values `\"enabled\"`/`\"disabled\"`. Maps to `se_value`.", { example: "enabled" }),
  ],
  createExample: { code: "DEMO_SETTING", value: "enabled" },
  updateExample: { value: "disabled" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-17): `se_code`/`se_value` is a generic, unenumerated key/value slot; risk depends entirely on which settings a real PBX stores here. Before Live: enumerate actual `se_code` values in use and apply a default-deny allowlist by code, not just by response field name. The `global=1` list falls under SEC-REQ-28 (tenant isolation).",
  ],
});

export const settingCategory: Category = { id: "setting", title: "Setting", endpoints: [list, get, create, update, remove] };
