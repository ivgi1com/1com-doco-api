import type { Guide } from "./types";

/**
 * ManageDB write conventions: jsondata encoding, the Admin key requirement,
 * and destination tags. Derived from source-docs/proxy-api/managedb.md and
 * _common.md.
 */
export const managedbWrites: Guide = {
  slug: "managedb-writes",
  title: "ManageDB writes",
  summary: "The jsondata encoding every ManageDB write shares, the Admin key it requires, and how destination tags work.",
  synthetic: false,
  apiId: "proxy",
  sources: ["source-docs/proxy-api/managedb.md", "source-docs/proxy-api/_common.md"],
  sections: [
    {
      id: "admin-key",
      title: "Every ManageDB action needs the Admin key",
      blocks: [
        {
          kind: "callout",
          tone: "warning",
          title: "Admin key required",
          text: "The source states this once, plainly: “Any ManageDB action requires an admin key” — reads and writes alike, for every `object` this reqtype supports. A Tenant key, even a Read/Write one, is not documented to work here.",
        },
      ],
    },
    {
      id: "jsondata-encoding",
      title: "The jsondata encoding",
      blocks: [
        {
          kind: "paragraph",
          text: "Every ManageDB write — add, update, or replace, across every object type (custom destinations, phones, media files, hunt lists, extensions, conferences, routing profiles, DIDs, destination lists) — POSTs its body as a single `jsondata` form field: build an associative array, then send `jsondata=urlencode(json_encode($array))`.",
        },
        {
          kind: "list",
          items: [
            "The request method itself is never stated by the source for these operations — POST is inferred, since a GET query string cannot carry a JSON body.",
            "PHONEBOOK's `add` sub-request uses the same JSON-encoding pattern but a different field name, `values`, not `jsondata`. The source doesn't explain the divergence.",
            "Two operations skip `jsondata` entirely and post a raw file instead (FAX `send`, ManageDB `MEDIAFILE`/`updatebinary`) — an old-style cURL `@`-prefixed multipart upload, not a JSON body.",
          ],
        },
        { kind: "sample", endpoint: "managedb-custom-add", language: "curl", title: "shell" },
      ],
    },
    {
      id: "destination-tags",
      title: "Destination tags",
      blocks: [
        {
          kind: "paragraph",
          text: "Some ManageDB writes — replacing a DID's, Condition's, or IVR key-press's destinations, and setting a hunt list's extensions — take a different body shape: not an associative array, but a plain indexed array of destination-tag strings, each in `TAG-id` form (for example `EXT-1701` to dial extension 1701, or `PLAYBACK-60` to play media file 60).",
        },
        {
          kind: "list",
          items: [
            "`EXT` — dial an extension. `PLAYBACK` — play a media file. `QUEUE` — dial a queue. `IVR` — call an IVR. `HUNTLIST` — call a hunt list. `FLOW` — call a flow.",
            "Over 40 tags exist in total; the full table is on each operation's own Reference page (`managedb-destination-replace`), including two source defects reproduced as-is: a `VOICMEAIL` misspelling, and `PAUSECAMPAIGN` listed twice (the second occurrence is described as “Unpause a campaign”, almost certainly meant to be a distinct `UNPAUSECAMPAIGN` tag that the source never actually names).",
          ],
        },
        { kind: "sample", endpoint: "managedb-destination-replace", language: "curl", title: "shell" },
      ],
    },
  ],
};
