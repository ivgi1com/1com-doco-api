import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Campaign. Source: source-docs/openapi/campaigns.md (official page
 * `campaign`, rev #18). An outbound dialing campaign: type/tech, schedule,
 * caller ID, state, queue routing, message, and attached binary/fax files.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "campaigns",
  file: "campaigns.md",
  page: "campaign",
  category: "campaign",
  singular: "campaign",
  plural: "campaigns",
  path: "/campaigns",
  idField: "ca_id",
  scope: "Tenant API key",
  tenantScoped: true,
  aliases: ["/campaign"],
  fields: [
    f("name", "Maps to `ca_name`.", { required: true, example: "Demo Campaign" }),
    f("type", "Maps to `ca_type`. Example value `\"VOICE\"`; not stated exhaustive."),
    f("tech", "Maps to `ca_tech`. Example value `\"PJSIP\"`."),
    f("datestart", "Maps to `ca_datestart`."),
    f("dateend", "Maps to `ca_dateend`."),
    f("condition_id", "References a Condition object. Maps to `ca_co_id`.", { type: "integer" }),
    f("callerid", "Outbound caller ID presentation value. Maps to `ca_callerid`.", { example: "5550100" }),
    f("calleridname", "Maps to `ca_calleridname`."),
    f(
      "state",
      "Maps to `ca_state`. Example values `\"PAUSED\"`, `\"ACTIVE\"`; not stated exhaustive. Writing this field starts or stops real automated outbound dialing.",
    ),
    f("queue_id", "References a Queue object. Maps to `ca_qu_id`.", { type: "integer" }),
    f("message", "Maps to `ca_message`."),
    f("confirmmessage_id", "References a Media File object. Maps to `ca_confirmmessage_me_id`.", { type: "integer" }),
    f("onconnect", "`CAMPAIGN-ONCONNECT` destination. Alias: `on_connect`.", { type: "unknown" }),
    f(
      "donotcall",
      "`CAMPAIGN-DONOTCALL` destination. Alias: `do_not_call`. The documented example uses a numeric value (e.g. `[22]`) rather than an `EXT-`-style string, likely a Custom Destination ID reference.",
      { type: "unknown" },
    ),
    f(
      "binary_files",
      "Attaches binary or fax-related files to the campaign: an array of `{name, data_base64}`. \"Use complete base64 data in production integrations.\"",
      { type: "array" },
    ),
  ],
  createExample: { name: "Demo Campaign", type: "VOICE", tech: "PJSIP", callerid: "5550100", state: "PAUSED" },
  updateExample: { state: "ACTIVE" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-23): writing `state` (e.g. `ACTIVE`) starts or stops real automated outbound dialing — an operational side effect beyond ordinary CRUD. `binary_files`/`data_base64` can carry uploaded scripts or fax content, the same bandwidth/content concern as Media File's `me_data` (SEC-REQ-18). Before Live: confirm the response schema; state-changing writes stay excluded from Live regardless of read-allowlist status (SEC-REQ-27).",
  ],
});

export const campaignCategory: Category = { id: "campaign", title: "Campaign", endpoints: [list, get, create, update, remove] };
