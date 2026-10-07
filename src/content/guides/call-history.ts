import type { Guide } from "./types";

/**
 * CDRS vs SIMPLECDRS, output formats, and recordings. Derived from
 * source-docs/proxy-api/info.md plus the Stage 4 probe findings recorded in
 * source-docs/DOCS_AUDIT.md (A-49, A-54, A-64).
 */
export const callHistory: Guide = {
  slug: "call-history",
  title: "Call history",
  summary: "Choosing between CDRS and SIMPLECDRS, picking an output format, and fetching a call's recording.",
  synthetic: false,
  apiId: "proxy",
  sources: [
    "source-docs/proxy-api/info.md",
    "source-docs/DOCS_AUDIT.md#a-49",
    "source-docs/DOCS_AUDIT.md#a-54",
    "source-docs/DOCS_AUDIT.md#a-64",
  ],
  sections: [
    {
      id: "cdrs-vs-simplecdrs",
      title: "CDRS vs SIMPLECDRS",
      blocks: [
        {
          kind: "paragraph",
          text: "There are two separate call-history sources. `INFO CDRS` is the fuller one: it accepts more filters (`id`, `uniqueid`, `src`, `firstdst`, `direction`, `phone`, and an XML output template), but its default/plain response shape was never independently characterised, and no CDR data was observed on the tenant used to probe it — it returned an empty body for every format tried.",
        },
        {
          kind: "paragraph",
          text: "`INFO SIMPLECDRS` is narrower (fewer filters: `phone`, `start`, `end`) but better understood: `json` and `csv` were both confirmed with real data. Its default/plain format exists but its exact layout could only be partially decoded from a masked capture, so this portal doesn't offer it.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Prefer SIMPLECDRS when its filters are enough",
          text: "If you only need `phone`/`start`/`end` filtering, SIMPLECDRS's `json`/`csv` output is the better-documented choice. Reach for CDRS only when you need one of its extra filters or its XML template support — and expect to verify its response shape yourself.",
        },
        { kind: "endpoints", ids: ["info-cdrs", "info-simplecdrs", "cdr-get"] },
      ],
    },
    {
      id: "choosing-a-format",
      title: "Choosing an output format",
      blocks: [
        {
          kind: "paragraph",
          text: "`format` is not one global enum — the Doc's common-parameters table lists only `json`/`plain`, but individual operations document their own different sets, and this portal's own probing found further undocumented values behave differently per operation. Always check the specific endpoint's own Reference page rather than assuming a format that works elsewhere will work here.",
        },
        {
          kind: "list",
          items: [
            "SIMPLECDRS: `json` (array, each record's fields duplicated under bare positional keys) and `csv` (comma-separated, same fields) are both confirmed with data.",
            "CDRS: `csv` and `xml` are documented, including a server-side XML template (`template=`) for `format=xml`; none returned data during this portal's own probe, so their exact column layout is unconfirmed.",
            "An empty result doesn't always look the same: SIMPLECDRS's no-match case is a genuinely empty 200 body, while CDRS's `format=json` returned the single byte `]` — a malformed/truncated empty array, not valid JSON on its own.",
          ],
        },
        { kind: "sample", endpoint: "info-simplecdrs", language: "curl", title: "shell" },
      ],
    },
    {
      id: "recordings",
      title: "Fetching a call's recording",
      blocks: [
        {
          kind: "paragraph",
          text: "Three related operations share the same `id`/`tenant` lookup — the call's unique id, or the id a DIAL request returned: `info=recording` downloads the audio, `info=playrecording` asks the browser to play it inline instead, and `info=inforecording` returns the recording's metadata rather than the audio itself.",
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Without an id, all three return the same error",
          text: "Calling any of the three with no `id` returns the plain-text error “No id specified” — not the audio or metadata shape. This was confirmed by probing; the actual binary/metadata response still needs a real recording id to observe.",
        },
        { kind: "endpoints", ids: ["info-recording", "info-playrecording", "info-inforecording"] },
      ],
    },
  ],
};
