import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Media File. Source: source-docs/openapi/mediafiles.md (official page
 * `media-file`, rev #18). An audio prompt or TTS-generated media file:
 * uploaded binary audio, or text-to-speech configuration.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "mediafiles",
  file: "mediafiles.md",
  page: "media-file",
  category: "mediafile",
  singular: "media file",
  plural: "media files",
  path: "/mediafiles",
  idField: "me_id",
  tenantScoped: true,
  aliases: ["/media_files", "/media_file"],
  fields: [
    f("name", "Maps to `me_name`.", { required: true, example: "Demo Welcome Prompt" }),
    f("description", "Maps to `me_description`."),
    f(
      "type",
      "Selects between the two create forms (TTS vs binary upload). Example value `\"tts\"`; not stated exhaustive — a non-TTS/binary type value is implied but not named. Maps to `me_type`.",
    ),
    f("text", "TTS prompt text to synthesize. Not marked required, but required in practice for the TTS form. Maps to `me_text`."),
    f("engine", "TTS engine. Example value `\"azure\"`. Maps to `me_engine`."),
    f("language", "TTS language. Example value `\"en-US\"`. Maps to `me_language`."),
    f("format", "Audio format for a binary upload, e.g. `\"wav\"`. Maps to `me_format`."),
    f(
      "data_base64",
      "Base64-encoded audio for a binary upload. Not marked required, but required in practice for this form — replace any shortened example with the complete encoded file. Maps to `me_data`. Whether GET ever echoes this payload is unconfirmed.",
    ),
  ],
  createExample: {
    name: "Demo Welcome Prompt",
    description: "Demo TTS prompt",
    type: "tts",
    text: "Welcome to Demo Corp. Press 1 for sales or 2 for support.",
    engine: "azure",
    language: "en-US",
  },
  updateExample: { text: "Welcome to Demo Corp. Press 1 for sales, 2 for support, or 3 for billing." },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "Two distinct create forms exist (TTS vs binary upload); no formal discriminator field beyond `type` is confirmed to select between them.",
    "Security (SEC-REQ-18): create accepts a base64 audio payload (`data_base64`→`me_data`). Whether GET returns this payload is unconfirmed; if so, both a bandwidth and a content-sensitivity concern. Before Live: confirm whether GET returns `me_data`.",
  ],
});

export const mediafileCategory: Category = { id: "mediafile", title: "Media File", endpoints: [list, get, create, update, remove] };
