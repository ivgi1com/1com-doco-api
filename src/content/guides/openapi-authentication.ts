import type { Guide } from "./types";

/**
 * Open API authentication. Derived only from source-docs/openapi/_common.md
 * (the cross-resource contract cited there as `ov:N`); no behavior is
 * assumed beyond what that page states. Administrative (global) keys and
 * the resources that need them are out of scope for this customer portal
 * (Phase 8E, docs/phases/08E-customer-change-brief.md). Slug distinct from
 * the Proxy API's own "authentication" guide: same topic, different API.
 */
export const openapiAuthentication: Guide = {
  slug: "openapi-authentication",
  title: "Open API authentication",
  summary: "Full vs read-only API Keys, how the key travels, the tenant parameter, the common errors, and what the Playground does in Live mode.",
  synthetic: false,
  apiId: "openapi",
  sources: ["source-docs/openapi/_common.md"],
  sections: [
    {
      id: "key-kinds",
      title: "API Keys and where the key travels",
      blocks: [
        {
          kind: "paragraph",
          text: "Every request authenticates with an API Key, either full (read and write) or read-only.",
        },
        {
          kind: "paragraph",
          text: "The API accepts the key in three ways: the `X-API-Key` header, a `key` query parameter, or `Authorization: Bearer <key>`. The Playground and the code samples always send the header, because a key in the query string ends up in URLs and logs. Prefer the header in your own code too.",
        },
        { kind: "sample", endpoint: "extensions-state-get", language: "curl", title: "shell" },
        {
          kind: "callout",
          tone: "note",
          title: "Full vs read-only",
          text: "Writes (`POST`, `PATCH`, `DELETE`) require an API Key with write access; a read-only API Key attempting one gets `read_only_api_key`. An optional per-key IP allowlist is documented on the AI Logs page; whether it applies to every other resource too is not stated.",
        },
      ],
    },
    {
      id: "tenant",
      title: "The tenant parameter",
      blocks: [
        {
          kind: "paragraph",
          text: "The `tenant` query parameter selects your tenant by code, and some pages also accept the tenant's name. Send it with your API Key on tenant-scoped requests; each Reference page shows whether its own operation requires it.",
        },
      ],
    },
    {
      id: "errors",
      title: "Errors",
      blocks: [
        {
          kind: "paragraph",
          text: "Errors come back as JSON in the envelope `{\"error\": {\"code\": \"...\", \"message\": \"...\"}}`. HTTP statuses are not specified for most errors; where we have seen one on the 1com PBX it is shown below, and every other status is left as “—” rather than guessed.",
        },
        {
          kind: "list",
          items: [
            "`missing_api_key` — no key was supplied in the query string, `X-API-Key`, or the bearer token.",
            "`invalid_api_key` — the supplied key doesn't match the tenant.",
            "`tenant_required` — a tenant code is required for this request.",
            "`read_only_api_key` — the key can read but not create, update, or delete.",
            "`missing_required_field` — a required create field is missing.",
            "`tenant_not_found` — the tenant parameter matched no visible tenant.",
            "`method_not_allowed` — the endpoint is read-only and only supports GET (the 4 reporting resources).",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "Observed on the 1com PBX",
          text: "On one installation, every successful read returned HTTP 200, and errors used the envelope above with statuses 400, 401, 403 and 404: `invalid_api_key` → 401, `uniqueid_required` → 400, `not_found` and `object_not_found` → 404 (an ID that does not exist), and `admin_required` → 403 (a tenant key calling an administrative resource). A missing or unknown `tenant` was also answered with 401 `invalid_api_key` rather than `tenant_required` or `tenant_not_found`. These are observations, not guarantees; do not rely on a status or code that is not listed here.",
        },
        {
          kind: "callout",
          tone: "note",
          text: "A handful of resources document their own additional codes — `single_tenant_required`, `template_not_found` for the two CDR-style reports' template output; `uniqueid_required` for AI Analysis; `invalid_format`, `api_ip_not_allowed` for AI Logs. Each Reference page lists exactly the codes its own official page documents.",
        },
      ],
    },
    {
      id: "live-safety",
      title: "Live mode in the Playground",
      blocks: [
        {
          kind: "paragraph",
          text: "Open API reads can run in Live mode against your own tenant with your API Key; a few sensitive resources are Demo-only. Writes (`POST`, `PATCH`, `PUT`, `DELETE`) are Reference-only: the Playground never sends them, in Live or Demo mode. Live reads have been run against a real PBX; write operations have not been tested.",
        },
        {
          kind: "list",
          items: [
            "Live uses your tenant's API Key. It is sent for that request only and is not stored or logged.",
            "Use a tenant-scoped key. `%` tenant wildcards and an omitted tenant are rejected.",
            "Sensitive values in a response (for example credentials) are redacted before the response reaches your browser.",
            "If a Live request fails, the Playground shows the failure. It never swaps in Demo data.",
          ],
        },
      ],
    },
  ],
};
