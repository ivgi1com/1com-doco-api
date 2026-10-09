import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Voicemail. Source: source-docs/openapi/voicemails.md (official page
 * `voicemail`, rev #18). A tenant voicemail mailbox: number, name, email,
 * password, and call-flow destinations. BLOCK LIVE (SEC-REQ-15).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "voicemails",
  file: "voicemails.md",
  page: "voicemail",
  category: "voicemail",
  singular: "voicemail mailbox",
  plural: "voicemail mailboxes",
  path: "/voicemails",
  idField: "uniqueid",
  tenantScoped: true,
  fields: [
    f("number", "Maps to `mailbox`, the object's label field.", { required: true, example: "240" }),
    f("name", "Maps to `fullname`.", { example: "Demo Mailbox" }),
    f("email", "Not in the alias table; used directly in the official example. Personal data.", { required: "undocumented", example: "demo@example.com" }),
    f("password", "Not in the alias table; used directly in the official example. A real mailbox PIN — a credential; never log or echo it.", {
      required: "undocumented",
    }),
    f("operator", "`VOICEMAIL-OPERATOR` destination. Alias: `voicemail_operator`.", { type: "unknown" }),
    f("follow", "`VOICEMAIL-FOLLOW` destination. Alias: `voicemail_follow`.", { type: "unknown" }),
    f("broadcast", "`VOICEMAIL-BROADCAST` destination. Alias: `voicemail_broadcast`.", { type: "unknown" }),
  ],
  createExample: { number: "240", name: "Demo Mailbox", email: "demo@example.com", password: "SYNTHETIC_SECRET" },
  updateExample: { name: "Demo Mailbox (updated)" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Unlike every other object, the ID field is the bare name `uniqueid` and the underlying table is also bare (`voicemail`), not prefixed — as specified.",
    "Security (SEC-REQ-15): `password` sets a real mailbox PIN, directly analogous to the Proxy API's VOICEMAIL list `imapuser`/`imappassword` exposure (SEC-REQ-02). If GET echoes it, this repeats the same precedent in a new API family. BLOCK LIVE until a response schema is confirmed not to include the mailbox password.",
  ],
});

export const voicemailCategory: Category = { id: "voicemail", title: "Voicemail", endpoints: [list, get, create, update, remove] };
