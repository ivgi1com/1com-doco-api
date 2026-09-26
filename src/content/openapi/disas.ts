import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * DISA. Source: source-docs/openapi/disas.md (official page `disa`, rev
 * #18). A Direct Inward System Access object: a PIN-gated entry point that
 * grants outbound dialing access, with caller ID and timeout controls.
 * Categorically excluded from Live (SEC-REQ-22), not merely allowlist-gated.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "disas",
  file: "disas.md",
  page: "disa",
  category: "disa",
  singular: "DISA",
  plural: "DISAs",
  path: "/disas",
  idField: "ds_id",
  scope: "Tenant API key",
  tenantScoped: true,
  aliases: ["/disa"],
  fields: [
    f("name", "Maps to `ds_name`.", { required: true, example: "Demo DISA" }),
    f("mediafile_id", "Prompt media file played on entry. Maps to `ds_me_id`.", { type: "integer" }),
    f("pin", "Access PIN. Grants outbound dialing through the tenant's trunk — a credential; never log or echo it. Maps to `ds_pin`."),
    f("outbound", "Maps to `ds_outbound`. Example value `\"yes\"`."),
    f("blockcid", "Maps to `ds_blockcid`.", { required: "undocumented" }),
    f("calleridnum", "Maps to `ds_calleridnum`."),
    f("calleridname", "Maps to `ds_calleridname`."),
    f("digitstimeout", "Maps to `ds_digitstimeout`.", { type: "integer" }),
    f("responsetimeout", "Maps to `ds_responsetimeout`.", { type: "integer" }),
    f("looponattempt", "Maps to `ds_looponattempt`.", { required: "undocumented" }),
  ],
  createExample: { name: "Demo DISA", mediafile_id: 22, pin: "SYNTHETIC_PIN", outbound: "yes" },
  updateExample: { outbound: "no" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-22): `pin` grants outbound dialing access through the tenant's trunk — a fraud/cost risk on write alone, independent of whether it is ever readable. BLOCK LIVE outright, treated like Dial/Auth Token (SEC-REQ-05/06): categorically excluded from Live, not a standard field-allowlist case.",
  ],
});

export const disaCategory: Category = { id: "disa", title: "DISA", endpoints: [list, get, create, update, remove] };
