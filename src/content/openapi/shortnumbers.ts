import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Short Number. Source: source-docs/openapi/shortnumbers.md (official page
 * `short-number`, rev #18). An internal short-dial number mapped to a
 * destination string.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "shortnumbers",
  file: "shortnumbers.md",
  page: "short-number",
  category: "shortnumber",
  singular: "short number",
  plural: "short numbers",
  path: "/shortnumbers",
  idField: "sn_id",
  tenantScoped: true,
  aliases: ["/short_numbers", "/short_number"],
  fields: [
    f("number", "Maps to `sn_number`.", { required: true, example: "901" }),
    f(
      "destination",
      "Destination string, e.g. `\"EXT-100\"` or `\"QUEUE-700\"` — the same destination-string convention used elsewhere, though this page does not itself enumerate destination types the way sibling pages with a dedicated table do. Alias: `destnumber`. Maps to `sn_destnumber`.",
      { example: "EXT-100" },
    ),
    f("comment", "Maps to `sn_comment`."),
  ],
  createExample: { number: "901", destination: "EXT-100", comment: "Demo shortcut" },
  updateExample: { destination: "QUEUE-700" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: ["No credential- or PII-shaped field is documented. Security review is held at UNKNOWN pending schema confirmation."],
});

export const shortnumberCategory: Category = { id: "shortnumber", title: "Short Number", endpoints: [list, get, create, update, remove] };
