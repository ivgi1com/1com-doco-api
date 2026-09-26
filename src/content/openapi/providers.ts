import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Provider. Source: source-docs/openapi/providers.md (official page
 * `provider`, rev #14). A SIP trunk/provider object (SIP or PJSIP), with
 * realtime peer/endpoint configuration, caller ID overrides, and SMS
 * gateway settings. Global system object: always requires a global API key
 * (`tenantScoped: false`; no `tenant` parameter is documented for it).
 * BLOCK LIVE (SEC-REQ-14).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "providers",
  file: "providers.md",
  page: "provider",
  category: "provider",
  singular: "provider",
  plural: "providers",
  path: "/providers",
  idField: "pr_id",
  scope: "Global API key",
  tenantScoped: false,
  aliases: ["/provider"],
  fields: [
    f("name", "Maps to `pr_name`.", { required: true, example: "Demo PJSIP Provider" }),
    f("peername", "Alias: `peer_name`. Maps to `pr_peername`.", { example: "demo-pjsip-provider" }),
    f("tech", "`SIP` or `PJSIP` (examples). Required status not stated. Maps to `pr_tech`.", { required: "undocumented", example: "PJSIP" }),
    f("host", "Required status not stated. Maps to `pr_host`.", { required: "undocumented", example: "198.51.100.20" }),
    f("disabled", "Maps to `pr_disabled`.", { required: "undocumented" }),
    f("penalty", "Maps to `pr_penalty`.", { type: "integer" }),
    f("realtime", "Alias: `use_realtime`. Maps to `pr_userealtime`.", { example: "on" }),
    f("calleridmod_id", "Maps to `pr_ca_id`.", { type: "integer" }),
    f("callerid", "Outbound caller ID override for calls routed through this provider. Aliases: `caller_id`, `callerid_number`, `caller_id_number`. Maps to `pr_callerid`.", {
      example: "5550100",
    }),
    f("calleridname", "Aliases: `callerid_name`, `caller_id_name`. Maps to `pr_calleridname`.", { example: "Demo Provider" }),
    f("did_mod_id", "Maps to `pr_did_ca_id`.", { type: "integer" }),
    f("max_out_channels", "Maps to `pr_maxoutchannels`.", { type: "integer" }),
    f("ignore_sip_cause", "Maps to `pr_ignoresipcause`.", { required: "undocumented" }),
    f("ignore_busy", "Maps to `pr_ignorebusy`.", { required: "undocumented" }),
    f("sms_protocol", "Maps to `pr_smsprotocol`.", { required: "undocumented" }),
    f("sms_url", "Maps to `pr_smsurl`.", { required: "undocumented" }),
    f("sms_user", "Maps to `pr_smsuser`.", { required: "undocumented" }),
    f("sms_password", "SMS gateway credential — a secret, distinct from the trunk registration secret. Maps to `pr_smspassword`.", { required: "undocumented" }),
    f("canreinvite", "Direct-media control for chan_sip realtime (`sipfriends.canreinvite`), chan_sip only.", { type: "unknown" }),
    f("direct_media", "Direct-media control for PJSIP (`ps_endpoints.direct_media`), PJSIP only.", { type: "unknown" }),
    f("username", "Realtime peer/endpoint username. Not in the alias table; used directly in the official examples.", { required: "undocumented" }),
    f("password", "Trunk registration secret — a credential; never log or echo it. Not in the alias table; used directly in the official examples. Distinct from `sms_password`.", {
      required: "undocumented",
    }),
    f("transport", "Realtime transport, e.g. `\"UDP\"`. Not in the alias table.", { required: "undocumented" }),
    f("codecs", "Realtime codec list, e.g. `[\"ulaw\", \"alaw\"]`. Not in the alias table.", { type: "array" }),
    f("qualify", "Realtime qualify setting, e.g. `\"yes\"`. Not in the alias table.", { required: "undocumented" }),
    f("qualifyfreq", "Realtime qualify frequency. Not in the alias table.", { type: "integer" }),
    f("nat", "Realtime NAT setting. Not in the alias table.", { required: "undocumented" }),
    f("sendrpid", "Realtime Send RPID setting. Not in the alias table.", { required: "undocumented" }),
  ],
  createExample: {
    name: "Demo PJSIP Provider",
    peername: "demo-pjsip-provider",
    tech: "PJSIP",
    realtime: "on",
    host: "198.51.100.20",
    username: "demo-trunk",
    password: "SYNTHETIC_SECRET",
    transport: "UDP",
    codecs: ["ulaw", "alaw"],
    qualify: "yes",
    qualifyfreq: 60,
    direct_media: "no",
    callerid: "5550100",
    calleridname: "Demo Provider",
  },
  updateExample: { password: "SYNTHETIC_SECRET_ROTATED" },
  errorCodes: ["missing_api_key", "invalid_api_key", "read_only_api_key", "missing_required_field"],
  notes: [
    "SIP providers manage the related `sipfriends` realtime row when realtime is enabled; PJSIP providers manage `ps_endpoints`, `ps_aors`, `ps_auths`, and `ps_endpoint_id_ips`. Changing a provider's technology removes the old realtime rows before creating rows for the new technology — a destructive side effect of a technology change.",
    "Providers are global system objects and always require a global API key. Read-only global keys can list and read; create, update and delete require the full global key.",
    "Security (SEC-REQ-14): `password` is the trunk's registration secret and `sms_password`→`pr_smspassword` is a second, distinct secret (SMS gateway credential). No GET example exists. By analogy with Extension (whose single-object GET is documented to include related technology data, where the secret is stored), assume GET may echo these until a response schema proves otherwise. BLOCK LIVE.",
  ],
});

export const providerCategory: Category = { id: "provider", title: "Provider", endpoints: [list, get, create, update, remove] };
