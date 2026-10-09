import type { Guide } from "./types";

/**
 * Open API quickstart: key and tenant, one read, the response, the Playground.
 * Only facts already recorded for the Open API (source-docs/openapi/_common.md
 * and the observed read-only probe, DOCS_AUDIT OA-14); the key and tenant are
 * issued by 1com support (user decision, 2026-10-09).
 */
export const quickstart: Guide = {
  slug: "quickstart",
  title: "Quickstart",
  summary: "Get an API Key and tenant code, make your first Open API read, and read the response.",
  synthetic: false,
  apiId: "openapi",
  sources: ["source-docs/openapi/_common.md", "source-docs/DOCS_AUDIT.md"],
  sections: [
    {
      id: "credentials",
      title: "1. Get an API Key and tenant code",
      blocks: [
        {
          kind: "paragraph",
          text: "You need two values: a tenant-scoped API Key and your tenant code. Request both from 1com support at support@1com.co.il.",
        },
        {
          kind: "callout",
          tone: "warning",
          text: "Treat the API Key like a password. Keep it in an environment variable or a secrets manager, never in client-side code or a repository.",
        },
      ],
    },
    {
      id: "first-call",
      title: "2. Make your first call",
      blocks: [
        {
          kind: "paragraph",
          text: "List the extensions of your tenant. Send the key in the `X-API-Key` header and your tenant code in the `tenant` query parameter. Reads use `GET` and change nothing.",
        },
        { kind: "sample", endpoint: "extensions-list", language: "curl", title: "shell" },
      ],
    },
    {
      id: "response",
      title: "3. Read the response",
      blocks: [
        {
          kind: "paragraph",
          text: "A successful list returns HTTP 200 with a JSON array. Each extension has `id`, `number`, `name` and `tech` (as observed on the 1com PBX). The values below are an example.",
        },
        {
          kind: "code",
          lang: "json",
          title: "example response",
          code: `[\n  { "id": 1001, "number": "201", "name": "Reception", "tech": "SIP" }\n]`,
        },
        {
          kind: "paragraph",
          text: "No paging was observed: lists returned every row in one response.",
        },
      ],
    },
    {
      id: "errors",
      title: "4. If it fails",
      blocks: [
        {
          kind: "list",
          items: [
            "HTTP 401 with `invalid_api_key`: the key is missing, wrong, or does not match the tenant. A missing or unknown `tenant` is answered the same way.",
            "A read-only key can read but not write: `read_only_api_key`.",
          ],
        },
        {
          kind: "paragraph",
          text: "The full list of error codes and what we have observed is in the Open API authentication guide.",
        },
      ],
    },
    {
      id: "playground",
      title: "5. Try it without writing code",
      blocks: [
        {
          kind: "paragraph",
          text: "Every read has a Try it link on its Reference page. Demo mode needs no key and returns example data. Live mode sends the request to your own tenant with your key. Writes are Reference-only and are never sent from the Playground.",
        },
        { kind: "endpoints", ids: ["extensions-list", "extensions-state-get", "simplecdrs-list"] },
      ],
    },
  ],
};
