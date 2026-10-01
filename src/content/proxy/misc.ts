import type { Category } from "../types";
import { proxyOperation, q, tenantParam } from "./shared";

/**
 * Smaller reqtypes, one section each: FAX, MEDIAFILE (standalone; distinct
 * from MANAGEDB object=MEDIAFILE, see managedb.ts), PHONEBOOK, RESPONSEPATH,
 * SMS, HELP. Each still gets its own sidebar category (grouped by reqtype).
 */

// --- FAX (fax.md; Site 173-188, Doc 208-222) ---

export const faxSend = proxyOperation({
  id: "fax-send",
  category: "fax",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "FAX", action: "send" },
  title: "Send a fax",
  summary: "Sends a PDF as a fax from one number to another.",
  source: "fax.md",
  queryParameters: [
    q("source_number", "Number to send the fax from."),
    q("dest_number", "Number to send the fax to. The Site's own multipart example instead names this parameter number — not explained whether that is an undocumented alias or an inconsistency between the two sources."),
    q("quality", "Fax quality.", { required: false, enum: ["204x98", "204x196", "204x392"] }),
    q("pagesize", "Page size.", { required: false, enum: ["a4", "letter", "legal"] }),
    q("rotate", "Rotation. Empty means automatic.", { required: false, enum: ["", "E", "W", "no"] }),
    q("deleteaftersend", "Delete the fax after sending.", { required: false, enum: ["on"] }),
    q("schedule", "When to send the fax.", { required: false }),
    q("statusemail", "Email address for a status update.", { required: false }),
  ],
  requestBodyEncoding: { kind: "multipart", fileField: "filename", exampleFile: "fax.pdf" },
  notes: [
    "The Doc's own reference URL passes filename as a query parameter, showing no file upload; the Site's fuller PHP example posts filename as an old-style cURL @-prefixed file field instead. Whether the Doc's version is a simplified illustration or a genuinely different calling convention is not stated.",
    "Response not documented.",
  ],
  related: ["mediafile-getaudio"],
});

export const faxCategory: Category = { id: "fax", title: "FAX", endpoints: [faxSend] };

// --- MEDIAFILE (standalone reqtype; mediafile.md, Site 134-135, Doc 229-234) ---

export const mediafileGetaudio = proxyOperation({
  id: "mediafile-getaudio",
  category: "mediafile",
  operationClass: "read",
  fixedQuery: { reqtype: "MEDIAFILE", action: "GETAUDIO" },
  title: "Download a media file's audio",
  summary: "Downloads the audio for one media file, by id.",
  source: "mediafile.md",
  queryParameters: [
    q("tenant", "Tenant to get audio from."),
    q("objectid", "Media file id.", { example: "3619" }),
    q("id", "Also sent by the Site's own example alongside objectid. Neither source explains what id means here, and it is not in the Doc's parameter list for this reqtype at all.", { required: false, example: "19" }),
  ],
  responses: [
    {
      status: 200,
      description: "The audio as a binary file, implied by \"Download the audio\"; content type not documented.",
      format: "binary",
      evidence: "vendor",
      verified: false,
      source: "source-docs/proxy-api/mediafile.md",
    },
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  notes: [
    "Observed (A-74): without objectid, returns an empty 200 body (0 bytes) rather than an error string. The binary shape itself remains unconfirmed.",
  ],
  related: [],
});

export const mediafileCategory: Category = { id: "mediafile", title: "MEDIAFILE", endpoints: [mediafileGetaudio] };

// --- PHONEBOOK (phonebook.md; Site 156-172, Doc 90-105) ---

const phonebookTenantParam = q("tenant", "Tenant to select.");
const phonebookNameParam = q("phonebook", "Phone book name to select.", { example: "Default" });

export const phonebookQuery = proxyOperation({
  id: "phonebook-query",
  category: "phonebook",
  operationClass: "read",
  fixedQuery: { reqtype: "PHONEBOOK", subreqtype: "query" },
  title: "Search a phone book",
  summary: "Searches one phone book by a field and value.",
  source: "phonebook.md",
  queryParameters: [
    phonebookTenantParam,
    phonebookNameParam,
    q("field", "Field name to search on.", { example: "name" }),
    q("value", "Search value; % matches partially.", { example: "Ben" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Success response with a real search is not documented. Without field/value (A-75): an explicit \"Wrong or missing phonebook or id\"-style error naming the missing parameters.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-75",
    },
  ],
  notes: [
    "The Site's own table-of-contents heading spells this reqtype PHONEBOOKS (plural), but every example and every Doc reference uses the singular reqtype=PHONEBOOK — a mismatch already flagged in the prior audit and unchanged in this source.",
    "Response observed by probe without field/value (source-docs/DOCS_AUDIT.md A-75); the success shape remains undocumented.",
  ],
  related: ["phonebook-add"],
});

export const phonebookAdd = proxyOperation({
  id: "phonebook-add",
  category: "phonebook",
  operationClass: "write",
  method: "POST",
  fixedQuery: { reqtype: "PHONEBOOK", subreqtype: "add" },
  title: "Add a phone book entry",
  summary: "Adds one entry to a phone book.",
  source: "phonebook.md",
  queryParameters: [phonebookTenantParam, phonebookNameParam],
  requestBody: [
    { name: "NAME", location: "body", type: "string", required: "undocumented", description: "Entry name." },
    { name: "PHONE1", location: "body", type: "string", required: "undocumented", description: "Phone number. The full set of accepted field names is not documented." },
  ],
  requestBodyEncoding: { kind: "form-json-field", field: "values" },
  requestExample: { NAME: "Ross", PHONE1: "3564732920" },
  notes: [
    "The entry travels in a `values` form field whose value is the entry encoded as JSON.",
    "Response not documented.",
  ],
  related: ["phonebook-query", "phonebook-delete"],
});

export const phonebookDelete = proxyOperation({
  id: "phonebook-delete",
  category: "phonebook",
  operationClass: "write",
  fixedQuery: { reqtype: "PHONEBOOK", subreqtype: "delete" },
  title: "Delete a phone book entry",
  summary: "Deletes one entry from a phone book, by the id a prior search returned.",
  source: "phonebook.md",
  queryParameters: [
    phonebookTenantParam,
    phonebookNameParam,
    q("peid", "Entry id, as returned by a prior subreqtype=query search."),
  ],
  notes: ["No example; parameters inferred from the shared PHONEBOOK parameter table. Response not documented."],
  related: ["phonebook-query", "phonebook-cleanall"],
});

export const phonebookCleanall = proxyOperation({
  id: "phonebook-cleanall",
  category: "phonebook",
  operationClass: "write",
  fixedQuery: { reqtype: "PHONEBOOK", subreqtype: "cleanall" },
  title: "Clear a phone book",
  summary: "Deletes every record in a phone book. Takes no parameters beyond selecting the phone book.",
  source: "phonebook.md",
  queryParameters: [phonebookTenantParam, phonebookNameParam],
  notes: ["No example; parameters inferred from the shared PHONEBOOK parameter table. Response not documented."],
  related: ["phonebook-delete"],
});

export const phonebookCategory: Category = {
  id: "phonebook",
  title: "PHONEBOOK",
  endpoints: [phonebookQuery, phonebookAdd, phonebookDelete, phonebookCleanall],
};

// --- RESPONSEPATH (responsepath.md; Site 197-223, Doc 264-276, 329-339 duplicate) ---

const rpTenantParam = q("tenant", "Tenant for the response path to query.");
const rpIdParam = q("id", "Response path id.", { example: "19" });
const rpFilterParams = [
  q("filter", "Which field to filter on.", { required: false, enum: ["queue", "answer", "uniqueid"] }),
  q("filterdata", "Filter value, matching filter's kind.", { required: false, example: "104-DEMO" }),
];

export const responsepathList = proxyOperation({
  id: "responsepath-list",
  category: "responsepath",
  operationClass: "read",
  fixedQuery: { reqtype: "RESPONSEPATH", action: "list" },
  title: "List response-path entries",
  summary: "Lists every response recorded for a response path.",
  source: "responsepath.md",
  queryParameters: [rpTenantParam, rpIdParam, ...rpFilterParams],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Success response not documented, consistent with the source's own lack of a response sample. An empty 200 body (0 bytes), with no error text, was observed on the test tenant regardless of parameters or format (A-76).",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-76",
    },
  ],
  notes: [
    "The Doc's parameter block for RESPONSEPATH appears twice with different action lists; both copies document list. No vendor example or response sample for this action; response observed by probe (source-docs/DOCS_AUDIT.md A-76).",
  ],
  related: ["responsepath-getlast"],
});

export const responsepathGetid = proxyOperation({
  id: "responsepath-getid",
  category: "responsepath",
  operationClass: "read",
  fixedQuery: { reqtype: "RESPONSEPATH", action: "getid" },
  title: "Get a response-path entry by id",
  summary: "Returns one response-path response, by its response id or unique id.",
  source: "responsepath.md",
  queryParameters: [
    rpTenantParam,
    rpIdParam,
    q("rrid", "Response-path response id, or response-path unique id."),
    ...rpFilterParams,
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Success response not documented. An empty 200 body (0 bytes), with no error text, was observed on the test tenant regardless of parameters (A-76).",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-76",
    },
  ],
  notes: [
    "A source defect: this action and its rrid parameter appear only in the Doc's first copy of the RESPONSEPATH block (lines 264-276); the second copy (330-339) omits both, listing only list and getlast. Which is current is not stated — both are recorded here as documented, but treat getid as less certain than list/getlast.",
    "No vendor example or response sample; response observed by probe (source-docs/DOCS_AUDIT.md A-76).",
  ],
  related: ["responsepath-list", "responsepath-getlast"],
});

export const responsepathGetlast = proxyOperation({
  id: "responsepath-getlast",
  category: "responsepath",
  operationClass: "read",
  fixedQuery: { reqtype: "RESPONSEPATH", action: "GETLAST" },
  title: "Get the latest response-path entry",
  summary: "Returns the most recent response recorded for a response path.",
  source: "responsepath.md",
  queryParameters: [
    rpTenantParam,
    rpIdParam,
    ...rpFilterParams,
    q("format", "Output format.", { required: false, enum: ["xml"] }),
  ],
  responses: [
    {
      status: 200,
      description:
        "A pipe-delimited table, one row per response-path step, with a header row: UniqueID|Type|Type ID|Value|Type Name|Value Name. The Type Name/Value Name columns are consistently empty in the one sample observed; that is not separately confirmed as always true.",
      format: "plain",
      evidence: "vendor",
      verified: false,
      source: "source-docs/proxy-api/responsepath.md (Site lines 200-208)",
      example:
        "UniqueID|Type|Type ID|Value|Type Name|Value Name\nPBX-1509806457.625|START|0|2017-11-04 15:41:01||\nPBX-1509806457.625|CALLERID|0|Susan <1132555678>||\nPBX-1509806457.625|VARIABLE|85|36985||\nPBX-1509806457.625|VARIABLE|144|56896||\nPBX-1509806457.625|QUEUE|281|||\nPBX-1509806457.625|ANSWER|0|105-DEMO||\nPBX-1509806457.625|HANGUP|0|||",
    },
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  notes: [
    "The plain sample above comes from the vendor source itself (evidence: vendor), not from a probe against a real tenant — shown as-is per the no-guessing rule.",
    "format=xml also exists (Site lines 212-223), but the source's own caveat (Site line 213) is \"Based on the xml format shown in the manual, it returns something like:\" — not a guaranteed-exact sample. Its own example is additionally malformed: <ClientID> and <OrderNumber> both close with a mismatched </MemberNumber> tag rather than their own closing tags. Not reproduced as a second response example here, since this portal's response viewer shows one example per status code and the plain sample is the better-attested of the two.",
    "A structure-only probe found an empty 200 body on the test tenant, for both format=(default) and format=xml (source-docs/DOCS_AUDIT.md A-76) — no matching data on that tenant; the vendor sample above remains the documented format.",
  ],
  related: ["responsepath-list", "responsepath-getid"],
});

export const responsepathCategory: Category = {
  id: "responsepath",
  title: "RESPONSEPATH",
  endpoints: [responsepathList, responsepathGetid, responsepathGetlast],
};

// --- SMS (sms.md; Doc 283-291, no Site example) ---

export const sms = proxyOperation({
  id: "sms",
  category: "sms",
  operationClass: "write",
  title: "Send an SMS",
  summary: "Sends an SMS from one number to another.",
  fixedQuery: { reqtype: "SMS" },
  source: "sms.md",
  queryParameters: [
    q("tenant", "Tenant where to send the SMS from. The Doc reuses DIAL's wording (\"tenant where to place the call\"), likely copy-pasted."),
    q("source", "Sender number, or ACCOUNT to use the number associated with the chosen account. Also named ?exten by the Doc, the same unexplained alternate name and leading question mark seen on DIAL."),
    q("dest", "Number to send the SMS to."),
    q("account", "Account to simulate the SMS from. SOURCE uses the account associated with the source number.", { required: false }),
    q("destclid", "CLID for the dest number.", { required: false }),
    q("server", "Specific server to send from.", { required: false }),
    q("message", "Message text."),
  ],
  notes: [
    "The method is not stated; GET is assumed by analogy to DIAL, not confirmed. No example and no response sample in either source.",
  ],
  related: ["dial", "fax-send"],
});

export const smsCategory: Category = { id: "sms", title: "SMS", endpoints: [sms] };

// --- HELP (_common.md; Site line 95) ---

export const help = proxyOperation({
  id: "help",
  category: "help",
  operationClass: "read",
  fixedQuery: { reqtype: "HELP" },
  title: "Get the operation syntax",
  summary: "Returns the latest syntax for proxyapi.php's own operations, as reported by the server itself.",
  source: "_common.md",
  queryParameters: [tenantParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With tenant: a large (~24 KB) text/html page wrapped in <pre>/<i> tags, consistent with \"the latest syntax for the operations\" (page text not captured — structure only). Without tenant: the shared \"tenant required\" error also seen on CHANNEL/COUNTCALLS/COUNTCHANNELS (source-docs/DOCS_AUDIT.md A-69).",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-69",
    },
  ],
  notes: [
    "Site line 95: \"The latest syntax for the operations can be retrieved by proxyapi itself.\"",
    "tenant is not documented for this operation, but a probe found it required in practice: omitting it returns the same fixed error shared with CHANNEL/COUNTCALLS/COUNTCHANNELS (source-docs/DOCS_AUDIT.md A-69).",
  ],
});

export const helpCategory: Category = { id: "help", title: "HELP", endpoints: [help] };
