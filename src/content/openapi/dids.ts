import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * DID. Source: source-docs/openapi/dids.md (official page `did`, rev #18).
 * A tenant's inbound phone number (DID) with country/area metadata and
 * destination routing for voice, SMS and fax.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "dids",
  file: "dids.md",
  page: "did",
  category: "did",
  singular: "DID",
  plural: "DIDs",
  path: "/dids",
  idField: "di_id",
  scope: "Tenant API key",
  tenantScoped: true,
  fields: [
    f("number", "Maps to `di_number`. Whether multiple formats (E.164 only, or also local formats) are accepted is not documented; the official example uses a leading `+1`.", {
      required: true,
      example: "5550100",
    }),
    f("country", "Maps to `di_country`.", { example: "US" }),
    f("area", "Maps to `di_area`.", { example: "212" }),
    f("comment", "Maps to `di_comment`."),
    f("destination", "`DID` destination (default/voice). Aliases: `destination`, `did`.", { type: "unknown" }),
    f("unconditional", "`DID-UNCONDITIONAL` destination.", { type: "unknown" }),
    f("sms", "`DID-SMS` destination.", { type: "unknown" }),
    f("faxsuccess", "`DID-FAXSUCCESS` destination. Alias: `fax_success`.", { type: "unknown" }),
  ],
  createExample: { number: "5550100", country: "US", area: "212", comment: "Demo inbound DID" },
  updateExample: { comment: "Demo inbound DID (updated)" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-16): no response schema is documented. The Proxy API's own `info-dids` (a different API family, not carried over as evidence) joined the DID row with the entire tenant row, including recording credentials and billing code — a direct precedent to check once an OpenAPI DID response schema is available. Before Live: establish the response schema and specifically check for joined tenant-level fields.",
  ],
});

export const didCategory: Category = { id: "did", title: "DID", endpoints: [list, get, create, update, remove] };
