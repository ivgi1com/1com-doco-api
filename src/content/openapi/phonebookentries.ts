import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Phone Book Entry. Source: source-docs/openapi/phonebookentries.md
 * (official page `phone-book-entry`, rev #7). A single contact row inside a
 * Phone Book, with values keyed by phone-book item code (e.g. `NAME`,
 * `PHONE1`, `EMAIL`).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "phonebookentries",
  file: "phonebookentries.md",
  page: "phone-book-entry",
  category: "phonebookentry",
  singular: "phone book entry",
  plural: "phone book entries",
  path: "/phonebookentries",
  idField: "pe_id",
  scope: "Tenant API key",
  tenantScoped: true,
  aliases: [
    "/phonebookentry",
    "/phonebook_entry",
    "/phonebook_entries",
    "/phonebookcontact",
    "/phonebookcontacts",
    "/phonebook_contact",
    "/phonebook_contacts",
  ],
  fields: [
    f("phonebook_id", "Parent Phone Book reference. Alias: `pbid`. Maps to `pe_pb_id`.", { required: true, type: "integer", example: "12" }),
    f(
      "values",
      "Entry values keyed by phone-book item code (e.g. `NAME`, `PHONE1`, `PHONE2`, `EMAIL`, `ROUTING`). Alias: `fields`. At least one value is required on create. Sending an empty string or null for a value clears that field. Maps to `pd_phonebookdetails` rows keyed by `pi_code`.",
      { required: true, type: "object" },
    ),
    f("details", "Alternative form of `values`/`fields`: detail rows containing `pi_id` or `pi_code` plus a value, sent directly.", { type: "array" }),
  ],
  createExample: { phonebook_id: 12, values: { NAME: "Demo Contact", PHONE1: "5550100", EMAIL: "demo@example.com", ROUTING: "EXT-100" } },
  updateExample: { values: { EMAIL: "" } },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Three equivalent request shapes exist for entry values: a `values`/`fields` object, top-level item codes sent directly, or `details` rows containing `pi_id`/`pi_code` plus a value.",
    "Security (SEC-REQ-25): holds real contact PII (name, phone, email) via this flexible values/fields/details write shape. Before Live: confirm the response schema and scope any allowlist to the phone book's own declared layout.",
  ],
  operationNotes: {
    list: ["Also filterable by the parent phone book via `phonebook_id` (aliases `pbid`, `pe_pb_id`); not modeled as a separate parameter here."],
  },
});

export const phonebookentryCategory: Category = {
  id: "phonebookentry",
  title: "Phone Book Entry",
  endpoints: [list, get, create, update, remove],
};
