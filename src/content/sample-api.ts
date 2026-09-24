import type { ApiDefinition, Endpoint, Parameter } from "./types";

/**
 * SYNTHETIC PROTOTYPE CONTENT (Phase 2).
 * Fictional endpoints used only to evaluate the visual design. They describe
 * no real 1com API. Phone numbers use the reserved fictional +1 555-01xx range
 * and the host is the reserved example.com domain.
 */

const notVerified = {
  documented: false,
  implemented: true,
  tested: false,
  verified: false,
};

const bearer = {
  type: "Bearer token",
  description:
    "Send your API key in the Authorization header. Keys are scoped to one tenant.",
};

const authHeader: Parameter = {
  name: "Authorization",
  location: "header",
  type: "string",
  required: true,
  description: "Bearer token for the tenant, for example `Bearer $SAMPLE_API_KEY`.",
};

const callIdParam: Parameter = {
  name: "call_id",
  location: "path",
  type: "string",
  required: true,
  description: "Identifier of the call record, prefixed with `call_`.",
  example: "call_0001",
};

const callRecordSchema: Parameter[] = [
  { name: "id", location: "body", type: "string", required: true, description: "Call record identifier." },
  {
    name: "direction",
    location: "body",
    type: "string",
    required: true,
    description: "Whether the call entered or left the tenant.",
    enum: ["inbound", "outbound"],
  },
  { name: "from", location: "body", type: "string", required: true, description: "Caller number in E.164 format." },
  { name: "to", location: "body", type: "string", required: true, description: "Callee number in E.164 format." },
  {
    name: "status",
    location: "body",
    type: "string",
    required: true,
    description: "Final state of the call.",
    enum: ["completed", "busy", "no-answer", "failed"],
  },
  {
    name: "duration_seconds",
    location: "body",
    type: "integer",
    required: false,
    description: "Billable duration in seconds.",
    condition: "Only present when status is completed.",
  },
  { name: "started_at", location: "body", type: "string (ISO 8601)", required: true, description: "Start time in UTC." },
  {
    name: "extension",
    location: "body",
    type: "object",
    required: false,
    description: "Extension that handled the call.",
    children: [
      { name: "number", location: "body", type: "string", required: true, description: "Internal extension number." },
      { name: "name", location: "body", type: "string", required: false, description: "Display name of the extension." },
    ],
  },
];

const callRecordExample = {
  id: "call_0001",
  direction: "inbound",
  from: "+15555550142",
  to: "+15555550100",
  status: "completed",
  duration_seconds: 184,
  started_at: "2026-09-01T08:14:03Z",
  extension: { number: "204", name: "Support desk" },
};

const errorBody = (code: string, message: string) => ({
  error: { code, message, request_id: "req_sample_7f3a" },
});

const listCalls: Endpoint = {
  id: "list-call-records",
  api: "sample",
  version: "v1",
  category: "call-records",
  status: "stable",
  method: "GET",
  path: "/v1/call-records",
  title: "List call records",
  summary:
    "Returns call records for the tenant, newest first. Filter by direction, status or a time window.",
  verification: notVerified,
  authentication: bearer,
  headers: [authHeader],
  pathParameters: [],
  queryParameters: [
    {
      name: "direction",
      location: "query",
      type: "string",
      required: false,
      description: "Return only inbound or outbound calls.",
      enum: ["inbound", "outbound"],
    },
    {
      name: "status",
      location: "query",
      type: "string",
      required: false,
      description: "Return only calls that ended in this state.",
      enum: ["completed", "busy", "no-answer", "failed"],
    },
    {
      name: "from_date",
      location: "query",
      type: "string (ISO 8601)",
      required: false,
      description: "Earliest start time to include, in UTC.",
      example: "2026-09-01T00:00:00Z",
    },
    {
      name: "limit",
      location: "query",
      type: "integer",
      required: false,
      description: "Maximum number of records per page.",
      default: "25",
      constraints: "1 to 100",
      example: 25,
    },
  ],
  requestBody: null,
  responses: [
    {
      status: 200,
      description: "A page of call records.",
      verified: false,
      schema: [
        {
          name: "data",
          location: "body",
          type: "array of objects",
          required: true,
          description: "Call records on this page.",
          children: callRecordSchema,
        },
        {
          name: "next_cursor",
          location: "body",
          type: "string | null",
          required: true,
          description: "Cursor for the next page, or null on the last page.",
        },
      ],
      example: {
        data: [
          callRecordExample,
          {
            id: "call_0002",
            direction: "outbound",
            from: "+15555550100",
            to: "+15555550177",
            status: "no-answer",
            started_at: "2026-09-01T08:02:51Z",
            extension: { number: "311", name: "Sales" },
          },
        ],
        next_cursor: "cur_sample_2",
      },
    },
    { status: 401, description: "Missing or invalid API key.", verified: false, example: errorBody("unauthorized", "The API key is missing or invalid.") },
    { status: 429, description: "Rate limit exceeded.", verified: false, example: errorBody("rate_limited", "Too many requests. Retry after 12 seconds.") },
  ],
  errors: [
    { status: 400, code: "invalid_parameter", description: "A query parameter has an unsupported value." },
    { status: 401, code: "unauthorized", description: "The API key is missing, malformed or revoked." },
    { status: 429, code: "rate_limited", description: "The tenant exceeded its request quota. Honour Retry-After." },
  ],
  related: ["get-call-record"],
};

const getCall: Endpoint = {
  id: "get-call-record",
  api: "sample",
  version: "v1",
  category: "call-records",
  status: "stable",
  method: "GET",
  path: "/v1/call-records/{call_id}",
  title: "Retrieve a call record",
  summary: "Returns one call record by its identifier.",
  verification: notVerified,
  authentication: bearer,
  headers: [authHeader],
  pathParameters: [callIdParam],
  queryParameters: [],
  requestBody: null,
  responses: [
    { status: 200, description: "The call record.", verified: false, schema: callRecordSchema, example: callRecordExample },
    { status: 404, description: "No call record with this identifier.", verified: false, example: errorBody("not_found", "No call record matches call_id.") },
  ],
  errors: [
    { status: 401, code: "unauthorized", description: "The API key is missing, malformed or revoked." },
    { status: 404, code: "not_found", description: "The call record does not exist or belongs to another tenant." },
  ],
  related: ["list-call-records"],
};

const contactSchema: Parameter[] = [
  { name: "id", location: "body", type: "string", required: true, description: "Contact identifier." },
  { name: "name", location: "body", type: "string", required: true, description: "Display name." },
  { name: "phone", location: "body", type: "string", required: true, description: "Phone number in E.164 format." },
  { name: "created_at", location: "body", type: "string (ISO 8601)", required: true, description: "Creation time in UTC." },
];

const createContact: Endpoint = {
  id: "create-contact",
  api: "sample",
  version: "v1",
  category: "contacts",
  status: "experimental",
  method: "POST",
  path: "/v1/contacts",
  title: "Create a contact",
  summary: "Adds a contact to the tenant address book so incoming calls show a name.",
  verification: notVerified,
  authentication: bearer,
  headers: [authHeader],
  pathParameters: [],
  queryParameters: [],
  requestBody: [
    { name: "name", location: "body", type: "string", required: true, description: "Display name.", constraints: "1 to 80 characters", example: "Dana Levi" },
    { name: "phone", location: "body", type: "string", required: true, description: "Phone number in E.164 format.", example: "+15555550142" },
    { name: "tags", location: "body", type: "array of strings", required: false, description: "Free-form labels for filtering.", constraints: "Up to 10 tags" },
  ],
  requestExample: { name: "Dana Levi", phone: "+15555550142", tags: ["vip"] },
  responses: [
    {
      status: 201,
      description: "The contact was created.",
      verified: false,
      schema: contactSchema,
      example: { id: "con_0001", name: "Dana Levi", phone: "+15555550142", created_at: "2026-09-01T09:00:00Z" },
    },
    { status: 422, description: "The body failed validation.", verified: false, example: errorBody("validation_failed", "phone must be in E.164 format.") },
  ],
  errors: [
    { status: 409, code: "duplicate_phone", description: "A contact with this phone number already exists." },
    { status: 422, code: "validation_failed", description: "A field is missing or has an invalid format." },
  ],
  related: ["update-contact"],
};

const updateContact: Endpoint = {
  id: "update-contact",
  api: "sample",
  version: "v1",
  category: "contacts",
  status: "stable",
  method: "PATCH",
  path: "/v1/contacts/{contact_id}",
  title: "Update a contact",
  summary: "Changes the name, phone or tags of a contact. Omitted fields keep their value.",
  verification: notVerified,
  authentication: bearer,
  headers: [authHeader],
  pathParameters: [
    { name: "contact_id", location: "path", type: "string", required: true, description: "Identifier of the contact, prefixed with `con_`.", example: "con_0001" },
  ],
  queryParameters: [],
  requestBody: [
    { name: "name", location: "body", type: "string", required: false, description: "New display name." },
    { name: "phone", location: "body", type: "string", required: false, description: "New phone number in E.164 format." },
  ],
  requestExample: { name: "Dana Levi-Cohen" },
  responses: [
    { status: 200, description: "The updated contact.", verified: false, schema: contactSchema, example: { id: "con_0001", name: "Dana Levi-Cohen", phone: "+15555550142", created_at: "2026-09-01T09:00:00Z" } },
  ],
  errors: [{ status: 404, code: "not_found", description: "The contact does not exist." }],
  related: ["create-contact"],
};

const deleteContact: Endpoint = {
  id: "delete-contact",
  api: "sample",
  version: "v1",
  category: "contacts",
  status: "deprecated",
  deprecation: {
    date: "2027-03-31",
    replacement: "update-contact",
    note: "Archive contacts by updating them instead of deleting them.",
  },
  method: "DELETE",
  path: "/v1/contacts/{contact_id}",
  title: "Delete a contact",
  summary: "Permanently removes a contact from the address book.",
  verification: notVerified,
  authentication: bearer,
  headers: [authHeader],
  pathParameters: [
    { name: "contact_id", location: "path", type: "string", required: true, description: "Identifier of the contact, prefixed with `con_`.", example: "con_0001" },
  ],
  queryParameters: [],
  requestBody: null,
  responses: [{ status: 204, description: "The contact was deleted. No body is returned.", verified: false }],
  errors: [{ status: 404, code: "not_found", description: "The contact does not exist." }],
  related: ["update-contact"],
};

export const sampleApi: ApiDefinition = {
  id: "sample",
  name: "Sample API",
  version: "v1",
  baseUrl: "https://api.example.com",
  synthetic: true,
  summary: "A fictional telephony API used to evaluate the portal design: call records and a tenant address book.",
  categories: [
    { id: "call-records", title: "Call records", endpoints: [listCalls, getCall] },
    { id: "contacts", title: "Contacts", endpoints: [createContact, updateContact, deleteContact] },
  ],
};
