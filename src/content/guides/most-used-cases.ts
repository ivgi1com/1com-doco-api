import type { Guide } from "./types";

/**
 * Most Used Cases (Phase 8E, brief items 9-10). Open API only, derived from
 * source-docs/openapi/dial.md, simplecdrs.md and cdrs.md (the same evidence
 * as the Reference pages it links to). The inbound-call popup and post-call
 * delivery cases are deliberately absent: no documented mechanism exists
 * yet, and they wait for the user's description (docs/DECISIONS.md "Phase
 * 8E").
 */
export const mostUsedCases: Guide = {
  slug: "most-used-cases",
  title: "Most Used Cases",
  summary: "The most common integrations, step by step with the Open API: Click to Call and viewing call history (CDRs).",
  synthetic: false,
  apiId: "openapi",
  sources: ["source-docs/openapi/dial.md", "source-docs/openapi/simplecdrs.md", "source-docs/openapi/cdrs.md"],
  sections: [
    {
      id: "click-to-call",
      title: "Click to Call",
      blocks: [
        {
          kind: "paragraph",
          text: "Click to Call connects one of your extensions to an outside number with a single request: `POST /dial` originates a call from `source` (the extension) to `dest` (the number to call). Both fields are required, and so is `tenant`.",
        },
        {
          kind: "list",
          items: [
            "`dialtimeout` — originate timeout in seconds; defaults to 30.",
            "`sourceclid` and `destclid` — set the caller ID variables for each leg (`SETSOURCECLID`, `SETDESTCLID`).",
            "`var` (comma-separated) or `vars` (a JSON object) — custom variables attached to the call, e.g. a campaign or lead id.",
          ],
        },
        { kind: "sample", endpoint: "dial", language: "curl", title: "shell" },
        {
          kind: "paragraph",
          text: "The documented success response reports that the originate request was queued: `Response` (`Success`), `Message`, a tracking `ID`, the resolved `source` and `dest`, and the PBX `server` and `node` used. A failure response and the HTTP status codes are not documented.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "This places a real call",
          text: "`POST /dial` needs an API Key with write access; a read-only API Key cannot originate calls. The Playground never sends it, in Live or Demo — try it from your own code.",
        },
        { kind: "endpoints", ids: ["dial"] },
      ],
    },
    {
      id: "call-history",
      title: "Viewing call history (CDRs)",
      blocks: [
        {
          kind: "paragraph",
          text: "Two read-only reports return call records. `GET /simplecdrs` is the simplified one, with fewer, renamed fields (`sc_*`). `GET /cdrs` returns the full call detail record and accepts more filters, such as `linkedid` to group the legs of one call, `src` and `firstdst`.",
        },
        {
          kind: "paragraph",
          text: "Both filter by a date range with `start` and `end`, written as `YYYY-MM-DD HH:MM:SS`. They default to today, 00:00:00 to 23:59:59, and the range applies when you don't select records by `id` or `uniqueid`.",
        },
        {
          kind: "list",
          items: [
            "`phone` — comma-separated numbers, searched across several number fields (each Reference page lists which).",
            "`disposition` — e.g. `ANSWERED`, `NO ANSWER`, `BUSY`, `FAILED`.",
            "`direction` — e.g. `IN`, `OUT`.",
            "`minduration` and `mintalktime` (Simple CDR) — skip calls at or under a number of seconds.",
          ],
        },
        { kind: "sample", endpoint: "simplecdrs-list", language: "curl", title: "shell" },
        {
          kind: "callout",
          tone: "note",
          title: "What the response looks like",
          text: "The field names and their meaning are listed on each Reference page. The JSON envelope, value types and the empty-result shape are not documented, so check them against your own data before relying on them. You can try Simple CDR in the Playground's Demo mode with synthetic data.",
        },
        { kind: "endpoints", ids: ["simplecdrs-list", "cdrs-list"] },
      ],
    },
  ],
};
