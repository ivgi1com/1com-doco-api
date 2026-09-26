import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Feature Code. Source: source-docs/openapi/featurecodes.md (official page
 * `feature-code`, rev #18). A dialable feature code (e.g. `*880`) mapped to
 * a single destination.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "featurecodes",
  file: "featurecodes.md",
  page: "feature-code",
  category: "featurecode",
  singular: "feature code",
  plural: "feature codes",
  path: "/featurecodes",
  idField: "fe_id",
  scope: "Tenant API key or global key with global=1",
  tenantScoped: true,
  globalFlag: true,
  aliases: ["/feature", "/features", "/feature_codes", "/feature_code"],
  fields: [
    f("code", "Maps to `fe_code`. Example value `\"*880\"`.", { required: true, example: "*880" }),
    f("comment", "Maps to `fe_comment`."),
    f("destination", "`FEATURE` destination. Alias: `feature`.", { type: "unknown" }),
  ],
  createExample: { code: "*880", comment: "Demo feature code" },
  updateExample: { comment: "Demo feature code (updated)" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "No credential- or PII-shaped field is documented. Security review is held at UNKNOWN pending schema confirmation. Writes stay excluded from Live regardless (SEC-REQ-27): a feature code changes dialing behavior.",
  ],
});

export const featurecodeCategory: Category = {
  id: "featurecode",
  title: "Feature Code",
  endpoints: [list, get, create, update, remove],
};
