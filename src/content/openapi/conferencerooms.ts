import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Conference Room. Source: source-docs/openapi/conferencerooms.md (official
 * page `conference-room`, rev #18). An Asterisk `meetme` conference room
 * with a join PIN and separate admin PIN, plus scheduling and rating
 * fields.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "conferencerooms",
  file: "conferencerooms.md",
  page: "conference-room",
  category: "conferenceroom",
  singular: "conference room",
  plural: "conference rooms",
  path: "/conferencerooms",
  idField: "cr_id",
  scope: "Tenant API key",
  tenantScoped: true,
  aliases: ["/conference", "/conferences", "/conference_rooms", "/conference_room"],
  fields: [
    f("name", "Maps to `cr_name`.", { required: true, example: "Demo Conference" }),
    f("number", "Maps to `cr_number`.", { required: true, example: "840" }),
    f("hosted", "Maps to `cr_hosted`. Example value `\"yes\"`."),
    f("rate_id", "Maps to `cr_rrid`.", { type: "integer" }),
    f("startdate", "Maps to the raw `starttime` column."),
    f("enddate", "Maps to the raw `endtime` column."),
    f("request_pin_mediafile_id", "Media file ID; its purpose is not described on the page. Maps to `cr_requestpinmeid`.", { type: "integer" }),
    f(
      "meetme",
      "Nested object creating/updating the related meetme row: `pin` (join PIN, a credential), `adminpin` (admin/moderator PIN, a credential), `opts`/`adminopts` (Asterisk MeetMe option-letter strings; their letter meanings are not confirmed by this page).",
      { type: "object" },
    ),
  ],
  createExample: {
    name: "Demo Conference",
    number: "840",
    hosted: "yes",
    meetme: { pin: "SYNTHETIC_PIN_1", adminpin: "SYNTHETIC_PIN_2", opts: "T", adminopts: "AaT" },
  },
  updateExample: { meetme: { pin: "SYNTHETIC_PIN_3", adminpin: "SYNTHETIC_PIN_4" } },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "If `confno` is not supplied, the conference number is combined with the tenant code; `confno` itself is not otherwise documented as a request field.",
    "Security (SEC-REQ-20): `meetme.pin` and `meetme.adminpin` are join/admin credentials for the conference room; the page does not describe what `adminpin` permits, but by name it grants administrator access to a live conference. BLOCK LIVE: assume GET returns the `meetme` object, including both PINs, until a response schema proves otherwise.",
  ],
});

export const conferenceroomCategory: Category = {
  id: "conferenceroom",
  title: "Conference Room",
  endpoints: [list, get, create, update, remove],
};
