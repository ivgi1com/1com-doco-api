import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Tenant. Source: source-docs/openapi/tenants.md (official page `tenant`,
 * rev #17). A tenant configuration object: name, code, billing code,
 * timezone, and links to routing profiles. Global system object: always
 * requires a global API key (`tenantScoped: false`).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "tenants",
  file: "tenants.md",
  page: "tenant",
  category: "tenant",
  singular: "tenant",
  plural: "tenants",
  path: "/tenants",
  idField: "te_id",
  scope: "Global API key",
  tenantScoped: false,
  fields: [
    f("name", "Maps to `te_name`.", { required: true, example: "Demo Tenant" }),
    f("code", "Maps to `te_code`.", { required: true, example: "TESTTENANT" }),
    f("billingcode", "Business-sensitive billing identifier. Alias: `billing_code`. Maps to `te_billingcode`."),
    f("timezone", "IANA zone string, e.g. `Europe/Rome`. Maps to `te_timezone`.", { example: "Europe/Rome" }),
    f("routing_profile_id", "References a Routing Profile object. Maps to `te_rp_id`.", { type: "integer" }),
    f("campaign_routing_profile_id", "References a Routing Profile object for campaign routing. Maps to `te_campaign_rp_id`.", { type: "integer" }),
    f("fax_routing_profile_id", "References a Routing Profile object for fax routing. Maps to `te_fax_rp_id`.", { type: "integer" }),
  ],
  createExample: { name: "Demo Tenant", code: "TESTTENANT", timezone: "Europe/Rome" },
  updateExample: { billingcode: "DEMO-BILLING-001" },
  errorCodes: ["missing_api_key", "invalid_api_key", "read_only_api_key", "missing_required_field"],
  notes: [
    "The API also accepts raw source-table field names in addition to the short aliases above (e.g. an undocumented `te_payment_type` is used directly in the official PATCH example).",
    "Delete has no documented safety check beyond a prose warning to check references first.",
    "Security (SEC-REQ-11): `te_billingcode` is business-sensitive. No response schema is documented for any operation. Before Live: establish the response schema; writes stay excluded from Live regardless.",
  ],
});

export const tenantCategory: Category = { id: "tenant", title: "Tenant", endpoints: [list, get, create, update, remove] };
