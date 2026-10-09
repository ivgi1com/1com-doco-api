import type { Category } from "../types";
import { f, openapiAuth, openapiOperation, tenantParam } from "./shared";

/**
 * Dial. Source: source-docs/openapi/dial.md (official page `dial`, rev #3).
 * Places a real call: Reference-only, never sent from the Playground
 * (SEC-REQ-06, SEC-REQ-27).
 */

const dial = openapiOperation({
  file: "dial.md",
  page: "dial",
  id: "dial",
  category: "dial",
  method: "POST",
  path: "/dial",
  title: "Originate a call",
  summary:
    "Originates a call between a source extension and a destination number. It is the Open API equivalent of the Proxy API's DIAL, using the same PBX dialplan contexts.",
  authentication: openapiAuth({
    write: true,
    extra: "Read-only API Keys cannot originate calls.",
  }),
  queryParameters: [tenantParam(true, "Tenant code or tenant name.")],
  requestBody: [
    f("source", "Source extension. Compatibility aliases: `exten`, `?exten`. `ACCOUNT` resolves the number from the `account` peer name.", {
      required: true,
    }),
    f("dest", "Destination number. Compatibility alias: `phone`.", { required: true }),
    f("dialtimeout", "Originate timeout in seconds.", { type: "integer", default: "30" }),
    f("timeout", "Sets the dialplan variable `SETTIMEOUT`."),
    f("sourceclid", "Sets `SETSOURCECLID`."),
    f("destclid", "Sets `SETDESTCLID`."),
    f("logqueueoutbound", "Sets `SETLOGQUEUEOUTBOUND`."),
    f("recording", "Sets `SETRECORDING`. The example sends `\"yes\"`; other accepted values are not documented."),
    f("autoanswer", "Sets `AUTOANSWER`."),
    f("nofollow", "Sets `SETNOFOLLOWEXTENSION`."),
    f("account", "Peer account name to set as `SETPEERNAME`. `SOURCE` resolves it from the originating extension."),
    f("server", "PBX node peer name to use when the originating or destination registration server cannot be found."),
    f("var", "Comma-separated custom variables, e.g. `campaign=summer,lead=42`."),
    f("vars", "Custom variables as a JSON object. Variables are tenant-prefixed and listed in `VARLIST`.", { type: "object" }),
  ],
  requestExample: {
    source: "100",
    dest: "5550100",
    dialtimeout: 30,
    sourceclid: "100",
    recording: "yes",
    vars: { campaign: "summer", lead: "42" },
  },
  responses: [
    {
      status: 200,
      description:
        "The originate request was queued. Mixed-case keys are as documented. A failure response and `Response` values other than `Success` are not documented, and neither is the HTTP status code.",
      format: "json",
      evidence: "vendor",
      schema: [
        ["Response", "`Success` in the documented example."],
        ["Message", "Human-readable result, e.g. `Originate successfully queued`."],
        ["ID", "Originate tracking ID."],
        ["source", "The originating party, as resolved."],
        ["dest", "The destination as resolved."],
        ["server", "PBX node peer name used."],
        ["node", "PBX node display name."],
      ].map(([name, description]) => ({ name, location: "body" as const, type: "string", required: true, description })),
      example: {
        Response: "Success",
        Message: "Originate successfully queued",
        ID: "originate-tracking-id",
        source: "100",
        dest: "5550100",
        server: "pbx-node-1",
        node: "PBX Node 1",
      },
      source: "source-docs/raw/mirta-openapi/dial.md:43-51",
      verified: false,
    },
  ],
  notes: [
    "This places a real phone call. It is documented here but never sent from the Playground, in Live or Demo (SEC-REQ-06).",
    "The HTTP status of a successful response is not specified for this operation.",
    "The endpoint returns JSON only. Value types of the `SET*` fields are not documented beyond the example.",
  ],
});

export const dialCategory: Category = { id: "dial", title: "Dial", endpoints: [dial] };
