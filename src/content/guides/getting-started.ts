import { API_KEY_ENV } from "@/lib/code-samples";
import type { Guide } from "./types";

/**
 * Phase 2's synthetic guide, migrated unchanged into the guide model. Written
 * for the prototype Sample API (bearer auth, /v1/call-records) — labelled by
 * the prototype banner via `synthetic: true`.
 */
export const gettingStarted: Guide = {
  slug: "getting-started",
  title: "Getting started",
  summary: "Create an API key, send your first request and read the response.",
  synthetic: true,
  apiId: "sample",
  sources: [],
  sections: [
    {
      id: "create-a-key",
      title: "Create an API key",
      blocks: [
        {
          kind: "paragraph",
          text: "Every request authenticates with a tenant API key sent as a bearer token. Create a key for your tenant and store it in an environment variable — never commit it to source control.",
        },
        { kind: "code", lang: "bash", title: "shell", code: `export ${API_KEY_ENV}="<YOUR_API_KEY>"` },
      ],
    },
    {
      id: "first-request",
      title: "Send your first request",
      blocks: [
        { kind: "paragraph", text: "List the tenant’s recent call records with a single authenticated `GET` request:" },
        { kind: "sample", endpoint: "list-call-records", language: "curl", title: "shell" },
      ],
    },
    {
      id: "read-the-response",
      title: "Read the response",
      blocks: [
        {
          kind: "paragraph",
          text: "A successful response returns a page of call records and a cursor for the next page. The full field reference is in `List call records` under API Reference.",
        },
        {
          kind: "code",
          lang: "json",
          title: "200 response",
          code: `{\n  "data": [\n    {\n      "id": "call_0001",\n      "direction": "inbound",\n      "status": "completed"\n    }\n  ],\n  "next_cursor": "cur_sample_2"\n}`,
        },
      ],
    },
    {
      id: "handle-errors",
      title: "Handle errors",
      blocks: [
        {
          kind: "paragraph",
          text: "Errors use standard HTTP status codes with a JSON body describing what went wrong. A missing or invalid key returns `401`; check the error code before retrying.",
        },
        {
          kind: "code",
          lang: "json",
          title: "401 response",
          code: `{\n  "error": {\n    "code": "unauthorized",\n    "message": "The API key is missing or invalid.",\n    "request_id": "req_sample_7f3a"\n  }\n}`,
        },
      ],
    },
  ],
};
