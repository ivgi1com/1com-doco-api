import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Phone Book. Source: source-docs/openapi/phonebooks.md (official page
 * `phone-book`, rev #7). A phone-book container defining which columns
 * (layout) its entries expose, and whether extensions/short numbers are
 * auto-included.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "phonebooks",
  file: "phonebooks.md",
  page: "phone-book",
  category: "phonebook",
  singular: "phone book",
  plural: "phone books",
  path: "/phonebooks",
  idField: "pb_id",
  tenantScoped: true,
  aliases: ["/phonebook", "/phone_book", "/phone_books"],
  fields: [
    f("name", "Maps to `pb_name`.", { required: true, example: "Demo Phone Book" }),
    f("include_extensions", "Alias: `includeext`. Maps to `pb_includeext`. Example value `\"no\"`."),
    f("include_short_numbers", "Alias: `includeshortnum`. Maps to `pb_includeshortnum`. Example value `\"no\"`."),
    f(
      "layout",
      "Array of phone-book item codes (e.g. `NAME`, `PHONE1`, `PHONE2`, `EMAIL`, `ROUTING`), or `pi_phonebookitems` IDs. Alias: `items`. When omitted on create, the API creates the default layout `NAME`, `PHONE1`, `PHONE2`, `EMAIL`, `ROUTING`. Maps to `pl_phonebooklayouts` rows.",
      { type: "array" },
    ),
  ],
  createExample: { name: "Demo Phone Book", include_extensions: "no", include_short_numbers: "no", layout: ["NAME", "PHONE1", "PHONE2", "EMAIL", "ROUTING"] },
  updateExample: { layout: ["NAME", "PHONE1", "EMAIL", "ROUTING"] },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Deleting a phone book removes its layout rows, entries, entry details, and phone assignment rows — a documented cascading delete, unlike every other object's generic \"check references\" caution.",
    "The container itself holds only structural metadata (name, layout, inclusion flags), not contact data directly — actual contact PII lives in Phone Book Entry (SEC-REQ-25).",
  ],
});

export const phonebookCategory: Category = { id: "phonebook", title: "Phone Book", endpoints: [list, get, create, update, remove] };
