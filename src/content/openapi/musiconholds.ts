import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Music On Hold. Source: source-docs/openapi/musiconholds.md (official page
 * `music-on-hold`, rev #18). A music-on-hold class: playlist of media
 * files, volume, randomization, and streaming engine settings.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "musiconholds",
  file: "musiconholds.md",
  page: "music-on-hold",
  category: "musiconhold",
  singular: "music on hold class",
  plural: "music on hold classes",
  path: "/musiconholds",
  idField: "mu_id",
  tenantScoped: true,
  globalFlag: true,
  aliases: ["/moh", "/music", "/music_on_hold", "/music_on_holds"],
  fields: [
    f("name", "Maps to `mu_name`.", { required: true, example: "Demo Music On Hold" }),
    f("custom", "Maps to `mu_custom`. Example value `\"yes\"`."),
    f("volume", "Numeric; can be negative. Example values `0`, `-3`. Maps to `mu_volume`.", { type: "integer" }),
    f("randomizeorder", "Maps to `mu_randomizeorder`.", { required: "undocumented" }),
    f("streamengine", "Raw, free-form field; its meaning is not documented on this page. Maps to `mu_streamengine`.", { required: "undocumented" }),
    f("format", "Maps to the raw `format` column. Example value `\"slin\"`."),
    f(
      "application",
      "Raw, free-form field; its meaning is not documented on this page. In Asterisk music-on-hold configuration, `application` can name an external program the server runs — domain knowledge, not documented behavior of this API.",
      { required: "undocumented" },
    ),
    f("mode", "Maps to the raw `mode` column. Example value `\"playlist\"`; not stated exhaustive."),
    f("mediafile", "`MUSICONHOLD` destination: playlist entries by media file ID, e.g. `{\"mediafile\": [22]}`. Aliases: `mediafiles`, `destination`.", {
      type: "unknown",
    }),
    f("entries", "Distinct PATCH-only write shape replacing the playlist: an array of `{me_id, order}`.", { type: "array" }),
    f(
      "default",
      "Distinct PATCH-only write shape marking this class as the default. Its relationship to the `global=1` scope (per-tenant or per-global-set default) is not documented.",
      { type: "boolean" },
    ),
  ],
  createExample: { name: "Demo Music On Hold", custom: "yes", volume: 0, mode: "playlist", format: "slin" },
  updateExample: {
    entries: [
      { me_id: 22, order: 1 },
      { me_id: 23, order: 2 },
    ],
    default: true,
  },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Security (SEC-REQ-30): `application`/`streamengine` are raw, free-form fields with no documented meaning; before Live, establish their semantics from the spec or the vendor. Writes are already excluded from Live by SEC-REQ-27; a read would expose the configured value. The `global=1` list falls under SEC-REQ-28 (tenant isolation).",
  ],
});

export const musiconholdCategory: Category = {
  id: "musiconhold",
  title: "Music On Hold",
  endpoints: [list, get, create, update, remove],
};
