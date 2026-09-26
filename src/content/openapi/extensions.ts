import type { Category, Parameter } from "../types";
import { errors, f, openapiAuth, openapiOperation, openapiResource, q, tenantParam } from "./shared";

/**
 * Extension and Extension State. Sources: source-docs/openapi/extensions.md
 * (official page `extension`, rev #17) and extensions-state.md
 * (`extension-state`, rev #4). Line citations are to the snapshots in
 * source-docs/raw/mirta-openapi/.
 */

const EXT = "extension";

const extensionFields: Parameter[] = [
  f("number", "Extension number. Maps to `ex_number`; `ex_number` is also accepted.", { required: true, example: "100" }),
  f("name", "Display name. Maps to `ex_name`."),
  f("tech", "Technology. Maps to `ex_tech`.", { required: "undocumented", enum: ["SIP", "PJSIP", "CUSTOM", "VIRTUAL"] }),
  f("password", "Technology secret/password (written to the technology row). A credential: never log or echo it.", {
    required: "undocumented",
  }),
  f("sipusername", "SIP username. Maps to `username`. When omitted, the API generates `<number>-<tenantcode>`."),
  f("mailbox", "Maps to `ex_mailbox`.", { required: "undocumented", type: "unknown" }),
  f("email", "Maps to `ex_email`. Personal data.", { required: "undocumented" }),
  f("callgroups", "Maps to `ex_callgroup`. The example sends an array of integers.", { required: "undocumented", type: "array" }),
  f("pickupgroups", "Maps to `ex_pickupgroup`. The example sends an array of integers.", { required: "undocumented", type: "array" }),
  f("realextensions", "Real extension IDs for a VIRTUAL extension. Maps to `virtual_items`.", { type: "array" }),
  f("sipfriends", "Nested chan_sip peer fields, e.g. `host`, `nat`.", { type: "object" }),
  f("ps_endpoints", "Nested PJSIP endpoint fields, e.g. `transport`, `direct_media`.", { type: "object" }),
  f("ps_aors", "Nested PJSIP AOR fields, e.g. `max_contacts`, `remove_existing`.", { type: "object" }),
  f("ps_auths", "Nested PJSIP auth row. Its fields are not shown by the source.", { type: "object" }),
  f("ce_customextensions", "Nested CUSTOM extension fields, e.g. `ce_peername`, `ce_destination`.", { type: "object" }),
  f("ve_virtualextensions", "Nested virtual-extension row. Its fields are not shown by the source.", { type: "object" }),
  f(
    "destinations",
    "Call-forwarding destinations, keyed by destination type. Each value is one destination string or an array, e.g. `VOICEMAIL-100`. Each type also has alias keys usable at the top level: `EXT-UNCONDITIONAL` (`unconditional`), `EXT-NOANSWER` (`onnoanswer`, `noanswer`, `no_answer`), `EXT-BUSY` (`onbusy`, `busy`), `EXT-OFFLINE` (`onoffline`, `offline`), `EXT-ONCONDITION` (`oncondition`, `condition`), `EXT-DIALBYNAME` (`dialbyname`, `dial_by_name`), `EXT-ONLYALLOWCALL` (`onlyallowcall`, `only_allow_call`), `EXT-DONOTCALL` (`donotcall`, `do_not_call`).",
    { type: "object" },
  ),
];

const extensionNotes = [
  "No response schema or example is documented for any Extension operation.",
  "Security (SEC-REQ-03): get-by-ID and get-by-number include related technology data, where the technology secret is stored. Treat responses as credential-bearing until a schema proves otherwise. `ex_email` is personal data.",
];

const [list, get, create, update, remove] = openapiResource({
  slug: "extensions",
  file: "extensions.md",
  page: EXT,
  category: "extension",
  singular: "extension",
  plural: "extensions",
  path: "/extensions",
  idField: "ex_id",
  scope: "Tenant API key",
  tenantScoped: true,
  fields: extensionFields,
  createExample: {
    number: "100",
    name: "Demo User",
    tech: "PJSIP",
    password: "SYNTHETIC_SECRET",
    ps_aors: { max_contacts: 1 },
  },
  updateExample: { name: "Demo User - Desk", destinations: { "EXT-NOANSWER": ["VOICEMAIL-100"] } },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  summaries: {
    list: "Returns extension ID, number, name, and technology for the tenant.",
    get: "Reads one extension by internal ID and includes related technology data.",
    create: "Creates an extension of one technology (SIP, PJSIP, CUSTOM or VIRTUAL), with optional nested technology data.",
    update: "Updates only the supplied extension fields. Destinations can be set by alias key or through a `destinations` object.",
    delete: "Deletes the extension, its technology row, and extension destinations.",
  },
  notes: extensionNotes,
  operationNotes: {
    list: ["The exact response field names and envelope are not documented; the page describes the content in prose only."],
    get: ["Returns the cached extension state; the live state is Get extension state (`/extensions/state`)."],
    delete: ["A cascading delete: the technology row and destinations go with it."],
  },
});

const getByNumber = openapiOperation({
  file: "extensions.md",
  page: EXT,
  id: "extensions-get-by-number",
  category: "extension",
  method: "GET",
  path: "/extensions/number/{number}",
  title: "Get extension by number",
  summary:
    "Reads an extension by PBX number. Keep the tenant parameter when the same number may exist in multiple tenants.",
  authentication: openapiAuth("Tenant API key"),
  pathParameters: [
    { name: "number", location: "path", type: "string", required: true, description: "Extension number.", example: "100" },
  ],
  queryParameters: [tenantParam(false)],
  errors: errors("missing_api_key", "invalid_api_key", "tenant_required"),
  notes: extensionNotes,
  related: ["extensions-get", "extensions-state-get"],
});

const stateKeys: Parameter[] = [
  ["UniqueID", "Channel unique ID. `\"KO\"` when the extension is not registered on any server."],
  ["LinkedID", "Linked channel ID. `\"Extension not registered\"` in the not-registered case."],
  ["Connected Line ID", "The other party's number. Personal data."],
  ["Connected Line ID Name", "The other party's name. Personal data."],
  ["Context", "Dialplan context."],
  ["Extension", "Dialed or connected number. Personal data."],
  ["Direction", "Call direction. The source shows `IN`; other values are not documented."],
  ["OtherParty", "The other party's number. Personal data."],
].map(([name, description]) => ({ name, location: "body" as const, type: "string", required: true, description }));

const getState = openapiOperation({
  file: "extensions-state.md",
  page: "extension-state",
  id: "extensions-state-get",
  category: "extension",
  method: "GET",
  path: "/extensions/state",
  title: "Get extension state",
  summary:
    "Returns the live call state of one extension. It checks the extension's registration server and queries the Asterisk manager for the active channel, unlike Get extension, which returns the cached state.",
  authentication: openapiAuth("Tenant context required, even with a global key", {
    extra: "Which key kinds are accepted (read-only or full) is not documented.",
  }),
  queryParameters: [
    tenantParam(true, "Tenant code or tenant name. Required even with a global API key."),
    q("number", "Extension number to check.", { condition: "Required unless `ext` is used", example: "100" }),
    q("ext", "Compatibility alias for `number`.", { condition: "Required unless `number` is used" }),
  ],
  responses: [
    {
      status: 200,
      description:
        "An object with the 8 keys below. When the extension is registered but has no active channel, the live fields are returned empty. When no registration server is available, `UniqueID` is `KO`, `LinkedID` is `Extension not registered`, and the rest are empty. The HTTP status code itself is not documented.",
      format: "json",
      evidence: "vendor",
      schema: stateKeys,
      example: {
        UniqueID: "1700000000.1",
        LinkedID: "1700000000.1",
        "Connected Line ID": "5550100",
        "Connected Line ID Name": "Demo Caller",
        Context: "authenticated",
        Extension: "5550100",
        Direction: "IN",
        OtherParty: "5550100",
      },
      source: "source-docs/raw/mirta-openapi/extension-state.md:27-55",
      verified: false,
    },
  ],
  notes: [
    "GET only. The response is always JSON.",
    "The 200 status is the portal's placeholder for a success response; the source documents no HTTP status codes.",
    "Example values are synthetic; the key set and value types (all strings) are as documented.",
    "Security (SEC-REQ-04): the response carries live caller numbers and names.",
    "The response for an unknown extension number is not documented.",
  ],
  related: ["extensions-get", "extensions-get-by-number"],
});

export const extensionCategory: Category = {
  id: "extension",
  title: "Extension",
  endpoints: [list, get, getByNumber, getState, create, update, remove],
};
