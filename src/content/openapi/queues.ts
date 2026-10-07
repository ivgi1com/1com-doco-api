import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Queue. Source: source-docs/openapi/queues.md (official page `queue`, rev
 * #18). A call queue with member extensions, penalties, and per-state
 * destinations (full, timeout, no free member, abandoned call, etc.).
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "queues",
  file: "queues.md",
  page: "queue",
  category: "queue",
  singular: "queue",
  plural: "queues",
  path: "/queues",
  idField: "qu_id",
  tenantScoped: true,
  fields: [
    f(
      "name",
      "Maps to `qu_name`. Required status not stated — unlike every other object processed, this page's Object Summary table lists no required-create field at all.",
      { required: "undocumented", example: "Demo Accounting Queue" },
    ),
    f("number", "Maps to `qu_number`.", { required: "undocumented", example: "700" }),
    f("members", "Distinct PATCH-only write shape replacing the member list: an array of `{extension_id, penalty}`.", { type: "array" }),
    f("allowed_members", "Distinct PATCH-only write shape controlling which extensions may be used as members: an array of extension IDs.", { type: "array" }),
    f("full", "`QUEUE-FULL` destination.", { type: "unknown" }),
    f("timeout_destination", "`QUEUE-TIMEOUT` destination. Alias: `timeout`.", { type: "unknown" }),
    f("exitkey", "`QUEUE-EXITKEY` destination.", { type: "unknown" }),
    f("oncallback", "`QUEUE-ONCALLBACK` destination.", { type: "unknown" }),
    f("nobodyhome", "`QUEUE-NOBODYHOME` destination.", { type: "unknown" }),
    f("nofreemember", "`QUEUE-NOFREEMEMBER` destination.", { type: "unknown" }),
    f("periodicannounce", "`QUEUE-PERIODICANNOUNCE` destination.", { type: "unknown" }),
    f("beforeringing", "`QUEUE-BEFORERINGING` destination.", { type: "unknown" }),
    f("onautopause", "`QUEUE-ONAUTOPAUSE` destination.", { type: "unknown" }),
    f("onabandonedcall", "`QUEUE-ONABANDONEDCALL` destination.", { type: "unknown" }),
  ],
  createExample: { name: "Demo Accounting Queue", number: "700" },
  updateExample: {
    members: [
      { extension_id: 45, penalty: 0 },
      { extension_id: 46, penalty: 1 },
    ],
  },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Unlike every other object processed, this page's Object Summary table lists no required-create field at all — the Overview's own resource matrix agrees. Whether an empty object create would actually succeed is unconfirmed.",
    "No credential- or PII-shaped field is documented. `members`/`allowed_members` reference internal extension IDs, not sensitive by themselves. Security review is held at UNKNOWN pending schema confirmation.",
  ],
});

export const queueCategory: Category = { id: "queue", title: "Queue", endpoints: [list, get, create, update, remove] };
