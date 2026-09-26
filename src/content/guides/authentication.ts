import type { Guide } from "./types";

/**
 * Proxy API authentication and keys. Derived only from documented/observed
 * facts (source-docs/proxy-api/_common.md); no behavior is assumed beyond
 * what the source states.
 */
export const authentication: Guide = {
  slug: "authentication",
  title: "Authentication and keys",
  summary: "Tenant vs Admin keys, read/write vs read-only, and how the key and tenant selector are sent.",
  synthetic: false,
  apiId: "proxy",
  sources: ["source-docs/proxy-api/_common.md"],
  sections: [
    {
      id: "key-kinds",
      title: "Tenant keys and the Admin key",
      blocks: [
        {
          kind: "paragraph",
          text: "Every request authenticates with an API key: either a Tenant key, scoped to one tenant, or the Admin key, which can see across tenants. Tenant keys come in two kinds — Read/Write and read-only — generated per tenant on the Configuration/Settings page.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "ManageDB always needs the Admin key",
          text: "The source states this as the only reqtype-specific key-scope rule found in either document: any `MANAGEDB` action requires an Admin key, regardless of which object it targets.",
        },
        {
          kind: "paragraph",
          text: "Beyond that one rule, the source rarely states which key kind (read/write vs read-only, Tenant vs Admin) a given operation needs — most Reference pages for this reason show the key's scope as “Not documented”. Use the narrowest key that works for your use case, and confirm against your own tenant if a write fails with a key that answers reads.",
        },
      ],
    },
    {
      id: "sending-the-key",
      title: "Sending the key",
      blocks: [
        {
          kind: "paragraph",
          text: "The key is always sent as the `key` query parameter — never a header, and never in the request body — the same for every reqtype, read or write.",
        },
        { kind: "sample", endpoint: "info-extensions", language: "curl", title: "shell" },
      ],
    },
    {
      id: "tenant-scoping",
      title: "The tenant selector",
      blocks: [
        {
          kind: "paragraph",
          text: "The `tenant` query parameter selects which tenant's data a request reads or writes. The source's own wording for when it can be omitted is “Sometime optional if the Admin API key is used” (sic) — inconsistent phrasing that this portal reproduces rather than smooths over.",
        },
        {
          kind: "paragraph",
          text: "A few operations document the effect precisely: with the Admin key, omitting `tenant` returns data across every tenant; supplying it scopes the same request to one tenant. `COUNTPEERS`, `COUNTCHANNELS` and `PEERS` state this explicitly; other operations likely behave the same way with an Admin key, but that is not confirmed for each one individually.",
        },
        {
          kind: "list",
          items: [
            "`tenant=%` is documented for `INFO CDRS` as a wildcard meaning every tenant.",
            "Some operations accept `tenant` but were never confirmed to need it — check each endpoint's own Reference page for what was actually observed.",
          ],
        },
        { kind: "endpoints", ids: ["countpeers", "countchannels", "peers"] },
      ],
    },
  ],
};
