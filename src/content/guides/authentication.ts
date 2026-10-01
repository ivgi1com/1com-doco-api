import type { Guide } from "./types";

/**
 * Proxy API authentication and keys. Derived only from documented/observed
 * facts (source-docs/proxy-api/_common.md); no behavior is assumed beyond
 * what the source states. Administrative-key content is out of scope for
 * this customer portal (Phase 8E, docs/phases/08E-customer-change-brief.md).
 */
export const authentication: Guide = {
  slug: "authentication",
  title: "Authentication and keys",
  summary: "Read/write vs read-only API Keys, and how the key and the tenant selector are sent.",
  synthetic: false,
  apiId: "proxy",
  sources: ["source-docs/proxy-api/_common.md"],
  sections: [
    {
      id: "key-kinds",
      title: "API Key kinds",
      blocks: [
        {
          kind: "paragraph",
          text: "Every request authenticates with an API Key. Keys come in two kinds — Read/Write and read-only — generated per tenant on the Configuration/Settings page.",
        },
        {
          kind: "paragraph",
          text: "The source rarely states which kind a given operation needs. Use the narrowest key that works for your use case, and confirm against your own tenant if a write fails with a key that answers reads.",
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
          text: "The `tenant` query parameter selects which tenant's data a request reads or writes. Send your own tenant code with your API Key.",
        },
        {
          kind: "list",
          items: [
            "Some operations accept `tenant` but were never confirmed to need it — check each endpoint's own Reference page for what was actually observed.",
          ],
        },
      ],
    },
  ],
};
