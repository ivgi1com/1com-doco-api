import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Provisioning Phone. Source: source-docs/openapi/provisioningphones.md
 * (official page `provisioning-phone`, rev #18). A phone provisioning
 * record: MAC address, model, filename, a password, and an HTTP user/
 * password pair. The page does not describe what the HTTP credentials
 * authenticate. BLOCK LIVE (SEC-REQ-26).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "provisioningphones",
  file: "provisioningphones.md",
  page: "provisioning-phone",
  category: "provisioningphone",
  singular: "provisioning phone",
  plural: "provisioning phones",
  path: "/provisioningphones",
  idField: "ph_id",
  tenantScoped: true,
  aliases: ["/phone", "/phones", "/provisioning_phones", "/provisioning_phone"],
  fields: [
    f("name", "Maps to `ph_name`.", { required: true, example: "Demo Desk Phone" }),
    f("mac", "Maps to `ph_mac`.", { required: true, example: "001122334455" }),
    f("model_id", "Phone model reference. Maps to `ph_pm_id`.", { type: "integer" }),
    f("password", "Device provisioning password — a credential; never log or echo it. Maps to `ph_password`."),
    f("filename", "Maps to `ph_filename`.", { example: "demo-001122334455.cfg" }),
    f("http_user", "Maps to `ph_http_user`."),
    f("http_password", "A second, distinct secret; its purpose is not described, but the name implies HTTP authentication. Maps to `ph_http_password`."),
  ],
  createExample: { name: "Demo Desk Phone", mac: "001122334455", model_id: 1, filename: "demo-001122334455.cfg" },
  updateExample: { http_user: "phone-user", http_password: "SYNTHETIC_SECRET" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-26): two distinct secrets are writable here, `ph_password` and `ph_http_password` (with `ph_http_user`); the page describes neither one's purpose. No GET example exists; assume GET may echo both until a response schema proves otherwise. BLOCK LIVE.",
  ],
});

export const provisioningphoneCategory: Category = {
  id: "provisioningphone",
  title: "Provisioning Phone",
  endpoints: [list, get, create, update, remove],
};
