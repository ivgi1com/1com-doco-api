import type { Category, Parameter } from "../types";
import { authAdmin, b, proxyOperation, q, tenantParam } from "./shared";

/**
 * reqtype=MANAGEDB — source-docs/proxy-api/managedb.md (Site 224–534; not
 * in the Doc). Discriminators: `object` and `action`. Every ManageDB action
 * requires an admin key (Site line 225). Reads are GET; writes POST a
 * `jsondata` form field (source-docs/proxy-api/_common.md "POST conventions"),
 * except HUNTLIST setextensions and DESTINATION replace, whose jsondata body
 * is a plain indexed array of destination-tag strings rather than an
 * associative object (see the "Destination tags" table, managedb.md).
 */

const managedbNotes = [
  "Every ManageDB action requires an admin key (Site line 225). No admin key was available for testing, so no ManageDB operation has been tried against the real API.",
];

const writeNotes = [
  "The method is not stated; POST is inferred because the source's PHP example sends a jsondata body, which a GET query string cannot carry.",
];

const objectId = (description: string, example?: string): Parameter => q("objectid", description, { example });

export const managedbCustomAdd = proxyOperation({
  id: "managedb-custom-add",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "custom", action: "add" },
  title: "Create a custom destination",
  summary: "Creates a custom destination for the tenant.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  requestBody: [
    b("cu_name", "Name of the custom destination."),
    b("cu_ct_id", "Custom destination type id, as listed by MANAGEDB object=CUSTOMTYPES action=list.", { type: "integer" }),
    b("cu_param1", "First type-specific parameter. Its meaning depends on the destination type and is not documented."),
    b("cu_param2", "Second type-specific parameter. Not documented."),
    b("cu_param3", "Third type-specific parameter. Not documented."),
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { cu_name: "Front desk mobile", cu_ct_id: 1, cu_param1: "5550100123", cu_param2: "INCOMINGDID", cu_param3: "30" },
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "The body fields are taken from the source's single example; the full field set is not documented.",
  ],
  related: ["managedb-custom-update", "managedb-customtypes-list"],
});

// --- object=CUSTOMTYPES ---

export const managedbCustomtypesList = proxyOperation({
  id: "managedb-customtypes-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "CUSTOMTYPES", action: "list" },
  title: "List custom destination types",
  summary: "Lists the custom destination types available to the tenant.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-custom-add"],
});

// --- object=CUSTOM ---

export const managedbCustomList = proxyOperation({
  id: "managedb-custom-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "CUSTOM", action: "list" },
  title: "List custom destinations",
  summary: "Lists the tenant's custom destinations.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-custom-get"],
});

export const managedbCustomGet = proxyOperation({
  id: "managedb-custom-get",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "CUSTOM", action: "get" },
  title: "Get a custom destination",
  summary: "Returns info for one custom destination.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The custom destination's id.", "67")],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-custom-list", "managedb-custom-update"],
});

export const managedbCustomUpdate = proxyOperation({
  id: "managedb-custom-update",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "custom", action: "update" },
  title: "Update a custom destination",
  summary: "Updates a custom destination's fields.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The custom destination's id. Also appears as cu_id in the request body — the source does not explain whether both are required or one is redundant.", "286")],
  requestBody: [
    b("cu_name", "Name of the custom destination.", { required: false }),
    b("cu_id", "The custom destination's id. Duplicates the objectid query parameter.", { type: "integer", required: false }),
    b("cu_param1", "First type-specific parameter.", { required: false }),
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { cu_name: "Front desk mobile (updated)", cu_id: 286, cu_param1: "5550100199" },
  notes: [...managedbNotes, ...writeNotes, "Response not documented."],
  related: ["managedb-custom-get", "managedb-custom-add"],
});

// --- object=PHONE ---

export const managedbPhoneList = proxyOperation({
  id: "managedb-phone-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "PHONE", action: "list" },
  title: "List phones",
  summary: "Lists the tenant's phones.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-phone-get"],
});

export const managedbPhoneGet = proxyOperation({
  id: "managedb-phone-get",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "PHONE", action: "get" },
  title: "Get a phone",
  summary: "Returns info for one phone.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The phone's id.", "182")],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-phone-list", "managedb-phone-update"],
});

export const managedbPhoneAdd = proxyOperation({
  id: "managedb-phone-add",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "phones", action: "add" },
  title: "Create a phone",
  summary: "Creates a phone.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  requestBody: [
    b("ph_name", "Phone display name."),
    b("ph_mac", "Phone's MAC address.", { example: "AA:BB:CC:DD:EE:FF:00:11" }),
    b("ph_pm_id", "Phone model id.", { type: "integer" }),
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { ph_name: "Front Desk", ph_mac: "AA:BB:CC:DD:EE:FF:00:11", ph_pm_id: 5 },
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "object=phones (plural) for this action, vs object=PHONE (singular) for list/get above, and object=phone (singular, different again) for update below — the source uses three different casings/pluralizations across the same section, unexplained.",
    "The full field set is not documented; these three come from the source's single example.",
  ],
  related: ["managedb-phone-update", "managedb-phone-list"],
});

export const managedbPhoneUpdate = proxyOperation({
  id: "managedb-phone-update",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "phone", action: "update" },
  title: "Update a phone",
  summary: "Updates a phone's fields.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The phone's id.", "207")],
  requestBody: [b("ph_name", "Phone display name.", { required: false })],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { ph_name: "Front Desk (renamed)" },
  notes: [...managedbNotes, ...writeNotes, "Response not documented."],
  related: ["managedb-phone-get", "managedb-phone-add"],
});

// --- object=MEDIAFILE (ManageDB form; distinct from the standalone MEDIAFILE reqtype, misc.ts) ---

export const managedbMediafileList = proxyOperation({
  id: "managedb-mediafile-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "MEDIAFILE", action: "list" },
  title: "List media files",
  summary: "Lists the tenant's media files.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [...managedbNotes, "Distinct from the standalone MEDIAFILE reqtype (misc.ts), which only downloads audio by id. Response not documented."],
  related: ["managedb-mediafile-get", "mediafile-getaudio"],
});

export const managedbMediafileGet = proxyOperation({
  id: "managedb-mediafile-get",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "MEDIAFILE", action: "get" },
  title: "Get a media file",
  summary: "Returns metadata for one media file.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The media file's id.", "1063")],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-mediafile-getbinary", "managedb-mediafile-update"],
});

export const managedbMediafileGetbinary = proxyOperation({
  id: "managedb-mediafile-getbinary",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "MEDIAFILE", action: "getbinary" },
  title: "Download a media file's binary",
  summary: "Downloads the binary content of one media file.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The media file's id.", "1063")],
  responses: [
    { status: 200, description: "The media file's binary content. Content type not documented.", format: "binary", evidence: "vendor", verified: false, source: "source-docs/proxy-api/managedb.md" },
  ],
  notes: [...managedbNotes],
  related: ["managedb-mediafile-get", "managedb-mediafile-updatebinary"],
});

export const managedbMediafileUpdate = proxyOperation({
  id: "managedb-mediafile-update",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "mediafile", action: "update" },
  title: "Update a media file's metadata",
  summary: "Updates a media file's metadata (not its binary content — see updatebinary).",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The media file's id.", "10")],
  requestBody: [b("me_name", "Media file display name.", { required: false })],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { me_name: "Beep" },
  notes: [...managedbNotes, ...writeNotes, "Response not documented."],
  related: ["managedb-mediafile-get", "managedb-mediafile-updatebinary"],
});

export const managedbMediafileUpdatebinary = proxyOperation({
  id: "managedb-mediafile-updatebinary",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "MEDIAFILE", action: "updatebinary" },
  title: "Update a media file's binary content",
  summary: "Replaces a media file's binary content (metadata is unchanged — see update).",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The media file's id.", "247")],
  requestBodyEncoding: { kind: "multipart", fileField: "filename", exampleFile: "audio.wav" },
  notes: [
    ...managedbNotes,
    "Multipart file upload, not jsondata like the metadata-only update above.",
    "Response not documented.",
  ],
  related: ["managedb-mediafile-update", "managedb-mediafile-getbinary"],
});

// --- object=HUNTLIST ---

export const managedbHuntlistGet = proxyOperation({
  id: "managedb-huntlist-get",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "HUNTLIST", action: "get" },
  title: "Get a hunt list",
  summary: "Returns info for one hunt list.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The hunt list's id.", "323")],
  notes: [
    ...managedbNotes,
    "The source's own section title reads \"Getting the hunt lists list\", but the action used is get (not list) with an objectid already supplied — unlike every other object's list action, which takes no objectid. Not explained; reproduced as given.",
    "Response not documented.",
  ],
  related: ["managedb-huntlist-getextensions"],
});

export const managedbHuntlistGetextensions = proxyOperation({
  id: "managedb-huntlist-getextensions",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "HUNTLIST", action: "getextensions" },
  title: "Get a hunt list's extensions",
  summary: "Returns the extension list for one hunt list.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The hunt list's id.", "323")],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-huntlist-setextensions", "managedb-huntlist-get"],
});

export const managedbHuntlistSetextensions = proxyOperation({
  id: "managedb-huntlist-setextensions",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "huntlist", action: "setextensions" },
  title: "Set a hunt list's extensions",
  summary: "Replaces the extension list for one hunt list, as an ordered list of destination tags.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The hunt list's id.", "26")],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: ["EXT-1701", "EXT-1703", "EXT-1705", "CUSTOM-67"],
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "The body is a plain indexed array of destination-tag strings (TAG-id form), not an associative object like every other jsondata example. Full tag table: source-docs/proxy-api/managedb.md \"Destination tags\".",
  ],
  related: ["managedb-huntlist-getextensions", "managedb-destination-replace"],
});

// --- object=extension / EXTENSION ---

export const managedbExtensionList = proxyOperation({
  id: "managedb-extension-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "extension", action: "list" },
  title: "List extensions (ManageDB)",
  summary: "Lists the tenant's extensions, in ManageDB's fuller CRUD form.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [
    ...managedbNotes,
    "Distinct from INFO info=EXTENSIONS (info.ts), a tenant-key read with a narrower, portal-redacted response. This ManageDB form needs an admin key and is not offered on Live or Demo.",
    "Response not documented.",
  ],
  related: ["info-extensions", "managedb-extension-add", "managedb-extension-update"],
});

export const managedbExtensionUpdate = proxyOperation({
  id: "managedb-extension-update",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "extension", action: "update" },
  title: "Update an extension's security",
  summary: "Updates one extension's call-security setting.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The extension's internal id.", "1695")],
  requestBody: [b("ex_callallowed", "Call security setting.", { enum: ["none", "all"] })],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { ex_callallowed: "none" },
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "The source's own example shows both none and all as possible values (one active, one commented out); other accepted values are not documented.",
  ],
  related: ["managedb-extension-list", "managedb-extension-add"],
});

export const managedbExtensionAdd = proxyOperation({
  id: "managedb-extension-add",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "extension", action: "add" },
  title: "Add a SIP extension",
  summary: "Creates a new SIP extension.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  requestBody: [
    b("ex_number", "Extension number.", { example: "1100" }),
    b("ex_name", "Extension display name."),
    b("ex_tech", "Channel technology.", { enum: ["SIP"] }),
    b("secret", "SIP registration secret."),
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { ex_number: "1100", ex_name: "Front Desk", ex_tech: "SIP", secret: "REPLACE_WITH_A_STRONG_SECRET" },
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "The source's own example uses a placeholder SIP secret value that spells out a security joke; it is never reproduced here or used as a Demo fixture, replaced with a neutral placeholder instead (CLAUDE.md \"Demo mode invariants\": synthetic fixtures only).",
    "The source's own example targets the alternate DEMO.1com.com/1com host form; reproduced here with the portal's canonical host instead (source-docs/unresolved.md U-12).",
  ],
  related: ["managedb-extension-list", "managedb-extension-update"],
});

// --- object=conference / CONFERENCE ---

export const managedbConferenceAdd = proxyOperation({
  id: "managedb-conference-add",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "conference", action: "add" },
  title: "Create a conference",
  summary: "Creates a conference room.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  requestBody: [
    b("cr_number", "Conference number.", { example: "887" }),
    b("cr_name", "Conference display name."),
    b("pin", "Conference PIN.", { example: "5678" }),
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { cr_number: "887", cr_name: "Weekly Standup", pin: "5678" },
  notes: [...managedbNotes, ...writeNotes, "The full field set is not documented; these three come from the source's single example. Response not documented."],
});

// --- object=routingprofile ---

export const managedbRoutingprofileUpdate = proxyOperation({
  id: "managedb-routingprofile-update",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "routingprofile", action: "update" },
  title: "Update a routing profile",
  summary: "Updates a routing profile's fields.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [objectId("The routing profile's id.", "275")],
  requestBody: [b("rp_name", "Routing profile display name.", { required: false })],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { rp_name: "National calls only" },
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "No tenant parameter in the source's example, unlike every sibling ManageDB example — not stated whether that is intentional (e.g. routing profiles are tenant-independent) or an omission in the source. No object= value is confirmed for a list/get form of this object either.",
  ],
});

// --- object=DID ---

export const managedbDidList = proxyOperation({
  id: "managedb-did-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "DID", action: "LIST" },
  title: "List DIDs (ManageDB)",
  summary: "Lists the tenant's DIDs, in ManageDB's fuller CRUD form.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [
    ...managedbNotes,
    "Distinct from INFO info=DIDS (info.ts, a tenant-key read, list-only). This ManageDB form needs an admin key and additionally supports get-by-id and update.",
    "Response not documented.",
  ],
  related: ["info-dids", "managedb-did-get"],
});

export const managedbDidGet = proxyOperation({
  id: "managedb-did-get",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "DID", action: "GET" },
  title: "Get a DID",
  summary: "Returns more info for one DID.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The DID's internal id.", "27699")],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-did-list", "managedb-did-update"],
});

export const managedbDidUpdate = proxyOperation({
  id: "managedb-did-update",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "did", action: "update" },
  title: "Update a DID",
  summary: "Updates a DID's fields.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [objectId("The DID's internal id.", "27699")],
  requestBody: [
    b("di_comment", "Free-text comment on the DID.", { required: false }),
    b("di_recording", "Whether calls to this DID are recorded.", { required: false, enum: ["yes"] }),
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: { di_comment: "Main line", di_recording: "yes" },
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "No tenant parameter in the source's example, the same pattern as routingprofile update above.",
  ],
  related: ["managedb-did-get", "managedb-did-list"],
});

// --- object=DESTINATION ---

export const managedbDestinationList = proxyOperation({
  id: "managedb-destination-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "DESTINATION", action: "LIST" },
  title: "List an object's destinations",
  summary: "Lists the destinations attached to a DID or a Condition (true or false branch).",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [
    tenantParam,
    q("typesrc", "Which kind of object typeidsrc refers to.", { enum: ["DID", "CONDITION", "NOTCONDITION"] }),
    q("typeidsrc", "Id of the DID or Condition to list destinations for.", { example: "27699" }),
  ],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-destination-replace"],
});

export const managedbDestinationReplace = proxyOperation({
  id: "managedb-destination-replace",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "DESTINATION", action: "replace" },
  title: "Replace an object's destinations",
  summary: "Replaces the destinations attached to a DID, a Condition (true or false branch), or an IVR key press.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [
    tenantParam,
    q("typesrc", "Which kind of object typeidsrc refers to. IVR_<n> selects the nth key-press branch of an IVR; the general pattern for other key presses beyond IVR_1 is not documented.", { example: "DID" }),
    q("typeidsrc", "Id of the DID, Condition, or IVR to replace destinations for.", { example: "27699" }),
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: ["PLAYBACK-60", "EXT-29379"],
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "The body is a plain indexed array of destination-tag strings (TAG-id form, e.g. EXT-1701, PLAYBACK-60), the same shape as HUNTLIST setextensions. Full tag table (over 40 entries, including two source defects — a VOICMEAIL misspelling and a duplicated PAUSECAMPAIGN row): source-docs/proxy-api/managedb.md \"Destination tags\".",
    "typesrc=CONDITION/NOTCONDITION examples are shown as bare URLs in the source with no jsondata body shown; the array-of-tags shape is presumed the same as the DID example, not separately confirmed.",
  ],
  related: ["managedb-destination-list", "managedb-huntlist-setextensions"],
});

// --- object=IVR ---

export const managedbIvrList = proxyOperation({
  id: "managedb-ivr-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "IVR", action: "LIST" },
  title: "List IVRs",
  summary: "Lists the tenant's IVRs.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-ivr-get"],
});

export const managedbIvrGet = proxyOperation({
  id: "managedb-ivr-get",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "IVR", action: "GET" },
  title: "Get an IVR",
  summary: "Returns more info for one IVR.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The IVR's id.", "322")],
  notes: [
    ...managedbNotes,
    "Site line 497: the iv_me_id field is not used; media files are stored in the destination table instead.",
    "Response not documented.",
  ],
  related: ["managedb-ivr-list", "managedb-ivr-getdestinations"],
});

export const managedbIvrGetdestinations = proxyOperation({
  id: "managedb-ivr-getdestinations",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "IVR", action: "GETDESTINATIONS" },
  title: "Get an IVR's destinations",
  summary: "Returns an IVR's destinations, including its media files.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The IVR's id.", "3634")],
  notes: [
    ...managedbNotes,
    "Site line 501: to change an IVR's destinations, use DESTINATION replace with typesrc=IVR_<n>, not a dedicated IVR-update call.",
    "Response not documented.",
  ],
  related: ["managedb-ivr-get", "managedb-destination-replace"],
});

// --- object=CONDITION ---

export const managedbConditionList = proxyOperation({
  id: "managedb-condition-list",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "CONDITION", action: "LIST" },
  title: "List conditions",
  summary: "Lists the tenant's conditions.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-condition-get"],
});

export const managedbConditionGetdestinations = proxyOperation({
  id: "managedb-condition-getdestinations",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "CONDITION", action: "GETDESTINATIONS" },
  title: "Get a condition's destinations",
  summary: "Lists the destinations attached to one condition.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The condition's id.", "20"), q("format", "Output format.", { required: false, enum: ["json"] })],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-destination-list", "managedb-condition-get"],
});

export const managedbConditionGet = proxyOperation({
  id: "managedb-condition-get",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "CONDITION", action: "GET" },
  title: "Get a condition",
  summary: "Returns info for one condition.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The condition's id.", "20"), q("format", "Output format.", { required: false, enum: ["json"] })],
  notes: [
    ...managedbNotes,
    "Site line 509: for WEEKTIME or CALENDAR-type conditions, use GETEXTENDEDINFOS to get the extended fields this call doesn't return.",
    "Response not documented.",
  ],
  related: ["managedb-condition-list", "managedb-condition-getextendedinfos"],
});

export const managedbConditionGetextendedinfos = proxyOperation({
  id: "managedb-condition-getextendedinfos",
  category: "managedb",
  operationClass: "read",
  fixedQuery: { reqtype: "MANAGEDB", object: "CONDITION", action: "GETEXTENDEDINFOS" },
  title: "Get a condition's extended info",
  summary: "Returns the extended fields for a WEEKTIME or CALENDAR condition.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The condition's id.", "20"), q("format", "Output format.", { required: false, enum: ["json"] })],
  notes: [...managedbNotes, "Response not documented."],
  related: ["managedb-condition-get", "managedb-condition-replaceextendedinfos"],
});

export const managedbConditionReplaceextendedinfos = proxyOperation({
  id: "managedb-condition-replaceextendedinfos",
  category: "managedb",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "MANAGEDB", object: "CONDITION", action: "replaceextendedinfos" },
  title: "Replace a condition's extended info",
  summary: "Replaces the extended fields for a WEEKTIME or CALENDAR condition, as an indexed list of parameter objects.",
  source: "managedb.md",
  authentication: authAdmin,
  queryParameters: [tenantParam, objectId("The condition's id.", "20")],
  requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
  requestExample: [
    { param1: "1", param2: "8:00", param3: "13:00" },
    { param1: "1", param2: "15:00", param3: "19:00" },
    { param1: "2", param2: "8:00", param3: "13:00" },
    { param1: "2", param2: "15:00", param3: "19:00" },
  ],
  notes: [
    ...managedbNotes,
    ...writeNotes,
    "The body is an indexed array of objects, each with param1/param2/param3. From the source's example values, this reads as a weekly time-window table (param1 = a day-of-week code, param2/param3 = start/end time), but that reading is inferred from the sample, not stated by the source. The param1 values 1/2 (presumably day indices) are not otherwise defined.",
  ],
  related: ["managedb-condition-getextendedinfos"],
});

export const managedbCategory: Category = {
  id: "managedb",
  title: "MANAGEDB",
  endpoints: [
    managedbCustomtypesList,
    managedbCustomList,
    managedbCustomGet,
    managedbCustomAdd,
    managedbCustomUpdate,
    managedbPhoneList,
    managedbPhoneGet,
    managedbPhoneAdd,
    managedbPhoneUpdate,
    managedbMediafileList,
    managedbMediafileGet,
    managedbMediafileGetbinary,
    managedbMediafileUpdate,
    managedbMediafileUpdatebinary,
    managedbHuntlistGet,
    managedbHuntlistGetextensions,
    managedbHuntlistSetextensions,
    managedbExtensionList,
    managedbExtensionUpdate,
    managedbExtensionAdd,
    managedbConferenceAdd,
    managedbRoutingprofileUpdate,
    managedbDidList,
    managedbDidGet,
    managedbDidUpdate,
    managedbDestinationList,
    managedbDestinationReplace,
    managedbIvrList,
    managedbIvrGet,
    managedbIvrGetdestinations,
    managedbConditionList,
    managedbConditionGetdestinations,
    managedbConditionGet,
    managedbConditionGetextendedinfos,
    managedbConditionReplaceextendedinfos,
  ],
};
