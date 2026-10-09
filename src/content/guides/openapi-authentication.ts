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
  summary: "Full vs read-only API Keys, how the key travels, the tenant parameter, the common error codes, and why nothing here is Live yet.",
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
          text: "The API accepts the key in three ways: the `X-API-Key` header, a `key` query parameter, or `Authorization: Bearer <key>`. This portal always sends the header — a project preference, not an API requirement — because a key in the query string ends up in URLs and logs.",
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
          text: "Errors come back as JSON with an error code and a message. Neither the JSON field names of that error body nor an HTTP status for any error is documented on any page — this portal's error tables show the status as “undocumented” rather than guess one.",
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
          text: "A handful of resources document their own additional codes — `single_tenant_required`, `template_not_found` for the two CDR-style reports' template output; `uniqueid_required` for AI Analysis; `invalid_format`, `api_ip_not_allowed` for AI Logs. Each Reference page lists exactly the codes its own official page documents.",
        },
      ],
    },
    {
      id: "live-safety",
      title: "Why nothing here is Live yet",
      blocks: [
        {
          kind: "paragraph",
          text: "Every Open API write stays Reference-only in this portal — the Playground never sends a `POST`, `PATCH`, `PUT`, or `DELETE`, in Live or Demo. No Open API operation has been tested against a real PBX.",
        },
        {
          kind: "list",
          items: [
            "A future Live read would use your tenant's API Key.",
            "The server, not the browser, would set and enforce `tenant`.",
            "`%` tenant wildcards and an omitted tenant would be rejected.",
          ],
        },
      ],
    },
  ],
};
