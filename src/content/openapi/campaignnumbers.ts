import type { Category } from "../types";
import { f, openapiResource, q } from "./shared";

/**
 * Campaign Number. Source: source-docs/openapi/campaignnumbers.md (official
 * page `campaign-number`, rev #18). A single target phone number within a
 * Campaign, with call disposition, attempt count, and last-attempt/talk-time
 * tracking.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "campaignnumbers",
  file: "campaignnumbers.md",
  page: "campaign-number",
  category: "campaignnumber",
  singular: "campaign number",
  plural: "campaign numbers",
  path: "/campaignnumbers",
  idField: "cn_id",
  tenantScoped: true,
  aliases: ["/campaignnumber", "/campaign_number", "/campaign_numbers"],
  listFilters: [
    q("campaign_id", "Filters the list by parent Campaign. Aliases: `caid`, `cn_ca_id`.", { type: "integer", example: "44" }),
  ],
  fields: [
    f("campaign_id", "Parent Campaign reference. Maps to `cn_ca_id`.", { required: true, type: "integer", example: "44" }),
    f("number", "Maps to `cn_number`.", { required: true, example: "5550100" }),
    f("description", "Maps to `cn_description`."),
    f("disposition", "Maps to `cn_disposition`. Example value `\"CALLBACK\"`; not stated exhaustive — likely mirrors CDR-style dispositions, not confirmed on this page."),
    f("attempts", "Maps to `cn_attempts`.", { type: "integer" }),
    f("lastattempt", "Maps to `cn_lastattempt`."),
    f("billsec", "Maps to `cn_billsec`.", { type: "integer" }),
  ],
  createExample: { campaign_id: 44, number: "5550100", description: "Demo campaign target" },
  updateExample: { disposition: "CALLBACK", attempts: 2 },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-24): `number` is a target phone number tied to campaign call activity; `billsec`/`lastattempt`/`attempts` are call-outcome metadata, similar sensitivity to CDR/Simple CDR (SEC-REQ-07/08). Before Live: confirm the response schema.",
  ],
});

export const campaignnumberCategory: Category = {
  id: "campaignnumber",
  title: "Campaign Number",
  endpoints: [list, get, create, update, remove],
};
