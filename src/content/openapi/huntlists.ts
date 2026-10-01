import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Hunt List. Source: source-docs/openapi/huntlists.md (official page
 * `hunt-list`, rev #18). A ring-group / hunt-list object: a set of member
 * extensions rung together with a ring strategy and timeout destination.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "huntlists",
  file: "huntlists.md",
  page: "hunt-list",
  category: "huntlist",
  singular: "hunt list",
  plural: "hunt lists",
  path: "/huntlists",
  idField: "hu_id",
  tenantScoped: true,
  fields: [
    f("name", "Maps to `hu_name`.", { required: true, example: "Demo Hunt List" }),
    f("number", "Maps to `hu_number`.", { example: "820" }),
    f("type", "Maps to `hu_type`. Example value `\"RINGALL\"`; not stated exhaustive — other ring strategies plausibly exist."),
    f("ringtime", "Ring duration. Maps to `hu_ringtime`. Unit inferred from the example value (`20`) as seconds; not explicitly stated.", {
      type: "integer",
    }),
    f(
      "extensions",
      "`HUNTLIST` destination: the member list. Aliases: `members`, `huntlist`. The value shape (presumably an array of extension references) is not explicitly specified beyond the generic destination-field convention.",
      { type: "unknown" },
    ),
    f("timeout", "`HUNTLIST-TIMEOUT` destination. Alias: `huntlist_timeout`.", { type: "unknown" }),
  ],
  createExample: { name: "Demo Hunt List", number: "820", type: "RINGALL", ringtime: 20 },
  updateExample: { ringtime: 30 },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: ["No credential- or PII-shaped field is documented. Security review is held at UNKNOWN pending schema confirmation."],
});

export const huntlistCategory: Category = { id: "huntlist", title: "Hunt List", endpoints: [list, get, create, update, remove] };
