import type { Guide } from "./types";

/**
 * MiRTA OpenAPI authentication and scope. Derived only from
 * source-docs/openapi/_common.md (the cross-resource contract cited there
 * as `ov:N`, from source-docs/raw/mirta-openapi/overview-and-examples.md);
 * no behavior is assumed beyond what that page states. Slug distinct from
 * the Proxy API's own "authentication" guide (Phase 7 Stage 6) — same
 * topic, different API, kept as two guides rather than merged, since the
 * two APIs' auth rules differ in almost every particular (key kinds,
 * transports, tenant/global scope, error codes).
 */
export const openapiAuthentication: Guide = {
  slug: "openapi-authentication",
  title: "OpenAPI authentication and scope",
  summary: "The 4 key kinds, how the key travels, tenant vs global scope, the common error codes, and why nothing here is Live yet.",
  synthetic: false,
  apiId: "openapi",
  sources: ["source-docs/openapi/_common.md"],
  sections: [
    {
      id: "key-kinds",
      title: "Key kinds and where the key travels",
      blocks: [
        {
          kind: "paragraph",
          text: "Every request authenticates with one of four key kinds: tenant full, tenant read-only, global full, or global read-only. Which kinds a given resource accepts is stated on the Overview's own objects table and carried through to each resource's own Reference page as its `Authentication` scope.",
        },
        {
          kind: "paragraph",
          text: "The source documents three transports for the key: the `X-API-Key` header, a `key` query parameter, or `Authorization: Bearer <key>`. This portal always sends the header — a project preference, not an API requirement — because a key in the query string ends up in URLs and logs.",
        },
        { kind: "sample", endpoint: "extensions-state-get", language: "curl", title: "shell" },
        {
          kind: "callout",
          tone: "note",
          title: "Full vs read-only",
          text: "Writes (`POST`, `PATCH`, `DELETE`) require a writable (full) key; a read-only key attempting one gets `read_only_api_key`. An optional per-key IP allowlist is documented on the AI Logs page; whether it applies to every other resource too is not stated.",
        },
      ],
    },
    {
      id: "tenant-and-global",
      title: "Tenant scoping and global=1",
      blocks: [
        {
          kind: "paragraph",
          text: "The `tenant` query parameter selects a tenant by code, and some pages also accept the tenant's name. A tenant key must supply it; a global key can supply it to scope to one tenant, or omit it to see across every tenant it's allowed to.",
        },
        {
          kind: "paragraph",
          text: "Six resources are global-key-only: they accept no `tenant` parameter at all, and always require a global key (full for writes; the Provider page states read-only global keys can list and read).",
        },
        { kind: "endpoints", ids: ["tenants-list", "users-list", "userprofiles-list", "routingprofiles-list", "providers-list", "auth-token-create"] },
        {
          kind: "paragraph",
          text: "Eight resources instead stay tenant-scoped but also accept `global=1` with a global key, addressing the shared/global record set instead of a single tenant's:",
        },
        {
          kind: "endpoints",
          ids: [
            "customdestinations-list",
            "settings-list",
            "mediafiles-list",
            "musiconholds-list",
            "calleridblacklists-list",
            "cronjobs-list",
            "featurecodes-list",
            "shortnumbers-list",
          ],
        },
        {
          kind: "list",
          items: [
            "A `%` SQL-style wildcard, or omitting `tenant` entirely with a global key, is documented on the 4 reporting pages only (CDR, Simple CDR, AI Analysis, AI Logs) — not a general rule for every resource.",
            "Extension State is the one exception in the other direction: it needs a tenant even when called with a global key.",
          ],
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
            "`invalid_api_key` — the supplied key doesn't match the tenant or global key.",
            "`tenant_required` — a tenant code is required for this tenant-scoped write or tenant-key read.",
            "`read_only_api_key` — the key can read but not create, update, or delete.",
            "`missing_required_field` — a required create field is missing.",
            "`tenant_not_found` — the tenant parameter matched no visible tenant.",
            "`method_not_allowed` — the endpoint is read-only and only supports GET (the 4 reporting resources).",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          text: "A handful of resources document their own additional codes — `admin_required`, `missing_user`, `user_not_found`, `invalid_validity` for Auth Token; `single_tenant_required`, `template_not_found` for the two CDR-style reports' template output; `uniqueid_required` for AI Analysis; `invalid_format`, `api_ip_not_allowed` for AI Logs. Each Reference page lists exactly the codes its own official page documents.",
        },
      ],
    },
    {
      id: "live-safety",
      title: "Why nothing here is Live yet",
      blocks: [
        {
          kind: "paragraph",
          text: "Every OpenAPI write stays Reference-only in this portal — the Playground never sends a `POST`, `PATCH`, `PUT`, or `DELETE`, in Live or Demo, regardless of any per-resource allowlist. No OpenAPI operation has been tested against a real PBX.",
        },
        {
          kind: "list",
          items: [
            "A future Live read would need a tenant-scoped key only, never a global one.",
            "The server, not the browser, would set and enforce `tenant`.",
            "`global=1`, `%` tenant wildcards, and an omitted tenant would all be rejected.",
            "The 6 global-key-only resources above would stay excluded from Live entirely.",
          ],
        },
      ],
    },
  ],
};
