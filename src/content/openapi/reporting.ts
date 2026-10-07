import type { Category, Parameter } from "../types";
import { errors, openapiAuth, openapiOperation, q, tenantParam } from "./shared";

/**
 * The four read-only reporting endpoints: CDR, Simple CDR, AI Analysis, AI
 * Logs. Sources: source-docs/openapi/{cdrs,simplecdrs,aianalysis,ailogs}.md
 * (official pages `cdr` rev #13, `simple-cdr` rev #13, `ai-analysis` rev #6,
 * `ai-logs` rev #3). None supports writes; each documents `method_not_allowed`
 * for one.
 */

const reportTenant = () => tenantParam(false, "Tenant code or name.");

// --- CDR ---

/**
 * A documented response field whose JSON type the source does not give
 * (CDR and Simple CDR publish a field/description table but no example).
 */
const field = (name: string, description: string): Parameter => ({
  name,
  location: "body",
  type: "unknown",
  required: "undocumented",
  description,
});

/** Shared description for a field table with no example, envelope or status (Stage 1 "vendor examples go under status 200"). */
const fieldTableResponse = (fields: Parameter[]) => ({
  status: 200,
  description:
    "Per-record fields as listed by the source (field names and descriptions only). Not documented: the HTTP status, the JSON envelope (array or wrapper object), each field's type, and empty-result behavior.",
  format: "json" as const,
  evidence: "vendor" as const,
  schema: fields,
  verified: false,
});

const cdrFields: Parameter[] = [
  field("accountcode", "Tenant code stored on the CDR."),
  field("ID", "Internal CDR row ID."),
  field("start", "Call start timestamp."),
  field("answer", "Answer timestamp when the call was answered."),
  field("end", "Call end timestamp."),
  field("clid", "Full caller ID string."),
  field("realsrc", "Normalized or real source value."),
  field("firstdst", "First dialed destination tracked by the PBX."),
  field("duration", "Total call duration in seconds."),
  field("billsec", "Answered talk time in seconds."),
  field("disposition", "Asterisk call disposition."),
  field("cc_cost", "Calculated tenant-side call cost when available."),
  field("dcontext", "Asterisk destination context."),
  field("dstchannel", "Destination channel."),
  field("userfield", "PBX call marker, commonly including inbound or outbound direction information."),
  field("uniqueid", "Asterisk unique ID for the CDR leg."),
  field("prevuniqueid", "Previous unique ID for linked call-leg processing."),
  field("lastdst", "Last destination reached by the call."),
  field("wherelanded", "Final PBX object or destination where the call landed."),
  field("src", "Asterisk source value."),
  field("dst", "Asterisk destination value."),
  field("lastapp", "Last Asterisk application executed."),
  field("srcCallID", "Source SIP Call-ID when available."),
  field("linkedid", "Asterisk linked ID used to group related CDR legs."),
  field("peeraccount", "Asterisk peer account value."),
  field("originateid", "Origination tracking ID when available."),
  field("cc_country", "Rated country when rating data is available."),
  field("cc_network", "Rated network when rating data is available."),
  field("pincode", "PIN code associated with the call when present."),
  field("cc_buy", "Calculated buy-side cost when available."),
];
const simplecdrFields: Parameter[] = [
  field("sc_te_id", "Internal tenant ID."),
  field("tenantcode", "Tenant code."),
  field("sc_start", "Simple CDR start timestamp."),
  field("sc_direction", "Simple direction value, such as IN, OUT, or LOCAL."),
  field("sc_calleridnum", "Caller ID number."),
  field("sc_calleridname", "Caller ID name."),
  field("sc_dialednum", "Dialed number."),
  field("sc_disposition", "Call disposition."),
  field("sc_duration", "Total call duration in seconds."),
  field("sc_billsec", "Answered talk time in seconds."),
  field("sc_uniqueid", "Asterisk unique ID represented by the simple CDR row."),
  field("sc_whoanswered", "Extension, user, or object that answered the call."),
];

const cdr = openapiOperation({
  file: "cdrs.md",
  page: "cdr",
  id: "cdrs-list",
  category: "cdr",
  method: "GET",
  path: "/cdrs",
  title: "List CDRs",
  summary: "Read-only call detail record (CDR) reporting. Filters by date range, ID(s) or a set of call fields.",
  authentication: openapiAuth({
  }),
  queryParameters: [
    reportTenant(),
    q("start", "Start date/time filter. Defaults to today 00:00:00. The source states two rules: the date range applies when neither `id` nor `uniqueid` is supplied, and also when neither `id` nor `linkedid` is supplied.", { example: "2026-01-01 00:00:00", format: "datetime" }),
    q("end", "End date/time filter. Defaults to today 23:59:59. Applied under the same two rules as `start`.", { example: "2026-01-01 23:59:59", format: "datetime" }),
    q("id", "Comma-separated CDR row IDs. A path segment (`/cdrs/123`) also maps here."),
    q("uniqueid", "Comma-separated Asterisk unique IDs."),
    q("linkedid", "Comma-separated linked IDs. Groups call legs of the same call."),
    q("src", "Comma-separated source values."),
    q("firstdst", "Comma-separated first-destination values."),
    q("disposition", "Comma-separated call disposition. Examples given: `ANSWERED`, `NO ANSWER`, `BUSY`, `FAILED`. Not stated as an exhaustive list."),
    q("direction", "`IN`, `OUT`, `IN,OUT`, or `OUT,IN`, based on the CDR userfield mapping."),
    q("phone", "Comma-separated values, searched across `src`, `dst`, `firstdst`, `lastdst`, `realsrc`, `wherelanded`."),
    q("format", "Response format.", { enum: ["json", "template", "xml"], default: "json", example: "json" }),
    q("template", "Template name. Only with `format=template` or `format=xml`.", { condition: "Only with `format=template`/`xml`" }),
    q("contenttype", "Content-Type override for rendered template output."),
  ],
  responses: [fieldTableResponse(cdrFields)],
  errors: errors("missing_api_key", "invalid_api_key", "tenant_required", "method_not_allowed", "single_tenant_required", "template_not_found"),
  notes: [
    "Path aliases: `/cdr`, `/cdrs`, `/call`, `/calls`.",
    "The endpoint may repair attended-transfer and where-landed CDR metadata while preparing results — an undocumented normalization step, not raw storage.",
    "No JSON example is given. The response field names and descriptions are listed under Responses; the JSON envelope (array vs wrapper object), value types, and empty-result behavior are undocumented.",
    "Security (SEC-REQ-07): fields include `clid` (full caller ID string), `src`/`dst`/`realsrc`/`firstdst`/`lastdst` (phone numbers), and `pincode`. `cc_cost`/`cc_country`/`cc_network`/`cc_buy` are billing-rate fields. Before Live: a default-deny field allowlist excluding `pincode` and billing-cost fields.",
    "Template/XML output renders through a tenant-configured template, a second output path whose own rendered content is out of scope of this documentation.",
  ],
});

// --- Simple CDR ---

const simplecdr = openapiOperation({
  file: "simplecdrs.md",
  page: "simple-cdr",
  id: "simplecdrs-list",
  category: "simplecdr",
  method: "GET",
  path: "/simplecdrs",
  title: "List simple CDRs",
  summary: "A simplified, read-only call-history reporting endpoint: fewer and renamed fields than CDR.",
  authentication: openapiAuth({
  }),
  queryParameters: [
    reportTenant(),
    q("start", "Start date/time filter. Defaults to today 00:00:00. Applied when neither `id` nor `uniqueid` is supplied.", {
      example: "2026-01-01 00:00:00",
      format: "datetime",
    }),
    q("end", "End date/time filter. Defaults to today 23:59:59. Applied under the same rule as `start`.", { example: "2026-01-01 23:59:59", format: "datetime" }),
    q("id", "Comma-separated simple-CDR row IDs. A path segment also maps here."),
    q("uniqueid", "Comma-separated Asterisk unique IDs."),
    q("calleridnum", "Comma-separated caller ID numbers."),
    q("calleridname", "Comma-separated caller ID names."),
    q("disposition", "Comma-separated call disposition, e.g. `ANSWERED`, `NO ANSWER`, `BUSY`, `FAILED`."),
    q("direction", "Comma-separated, e.g. `IN`, `OUT`, `LOCAL`."),
    q("dialednum", "Comma-separated dialed numbers."),
    q("whoanswered", "Comma-separated extension/user/object that answered."),
    q("phone", "Comma-separated values, searched across `sc_whoanswered`, `sc_calleridnum`, `sc_dialednum`."),
    q("minduration", "Minimum total duration in seconds, exclusive.", { type: "integer" }),
    q("mintalktime", "Minimum answered talk time in seconds, exclusive; uses the stored billsec/talk-time value.", { type: "integer" }),
    q("format", "Response format.", { enum: ["json", "template", "xml"], default: "json", example: "json" }),
    q("template", "Template name. Only with `format=template` or `format=xml`.", { condition: "Only with `format=template`/`xml`" }),
    q("contenttype", "Content-Type override for rendered template output."),
  ],
  responses: [fieldTableResponse(simplecdrFields)],
  errors: errors("missing_api_key", "invalid_api_key", "tenant_required", "method_not_allowed", "single_tenant_required", "template_not_found"),
  notes: [
    "Path aliases: `/simplecdr`, `/simplecdrs`, `/simple_cdr`, `/simple_cdrs`.",
    "Template output also exposes template variables `{$end}`, `{$clid}`, `{$callerid_number}`, `{$callerid_name}`, `{$firstdst}`, `{$talk_time}`, `{$who_answered}` inside `{row_loop}`.",
    "No JSON example is given. The response field names and descriptions are listed under Responses; the JSON envelope, value types, and empty-result behavior are undocumented.",
    "Security (SEC-REQ-08): `sc_calleridnum`, `sc_calleridname`, `sc_dialednum` are caller PII. Before Live: a default-deny field allowlist.",
  ],
});

// --- AI Analysis ---

const aianalysisRecordingFields: Parameter[] = [
  { name: "metadata_id", location: "body", type: "number", required: true, description: "Recording metadata row ID." },
  { name: "recording_id", location: "body", type: "number", required: true, description: "Recording ID." },
  { name: "date", location: "body", type: "string", required: true, description: "Recording date/time." },
  { name: "transcript", location: "body", type: "string", required: true, description: "This recording's own transcript text." },
  { name: "summary", location: "body", type: "string", required: true, description: "This recording's own summary." },
  { name: "sentiment_score", location: "body", type: "number", required: true, description: "This recording's sentiment score." },
  { name: "sentiment_brief", location: "body", type: "string", required: true, description: "This recording's sentiment text." },
  { name: "sentiment_details", location: "body", type: "unknown", required: true, description: "This recording's sentiment payload; its own shape is undocumented." },
];

const aianalysisSegmentFields: Parameter[] = [
  { name: "recording_id", location: "body", type: "number", required: true, description: "Recording this segment belongs to." },
  { name: "speaker", location: "body", type: "number", required: true, description: "Speaker number." },
  { name: "start", location: "body", type: "number", required: true, description: "Segment start, seconds." },
  { name: "end", location: "body", type: "number", required: true, description: "Segment end, seconds." },
  { name: "text", location: "body", type: "string", required: true, description: "Segment text." },
];

const aianalysis = openapiOperation({
  file: "aianalysis.md",
  page: "ai-analysis",
  id: "aianalysis-get",
  category: "aianalysis",
  method: "GET",
  path: "/aianalysis",
  title: "Get AI call analysis",
  summary:
    "Returns transcript, AI-generated summary, and sentiment-analysis data for recorded calls, keyed by Asterisk uniqueid. Distinct from AI Logs (Talk-with-AI conversation logs).",
  authentication: openapiAuth({
  }),
  queryParameters: [
    reportTenant(),
    q("uniqueid", "Comma-separated Asterisk unique IDs. A path value (`/aianalysis/<id>`) also maps here.", { required: true, example: "1700000000.42" }),
    q("key", "API Key. The header or bearer transport is preferred for new integrations."),
  ],
  responses: [
    {
      status: 200,
      description:
        "A top-level JSON array, one object per matched uniqueid. Unknown unique IDs are omitted from the response. When a uniqueid has multiple recording rows, the top-level transcript/summary/sentiment text are combined without duplicate text, and `recordings[]` keeps each recording's own values. Older installations may return fewer populated fields until their database upgrades are complete. The HTTP status code itself is not documented.",
      format: "json",
      evidence: "vendor",
      schema: [
        {
          name: "[ ]",
          location: "body",
          type: "object",
          required: true,
          description: "One object per matched `uniqueid`.",
          children: [
            { name: "tenant_id", location: "body", type: "number", required: true, description: "Internal tenant ID." },
            { name: "tenant_code", location: "body", type: "string", required: true, description: "Tenant code." },
            { name: "uniqueid", location: "body", type: "string", required: true, description: "Requested Asterisk unique ID." },
            { name: "transcript", location: "body", type: "string", required: true, description: "Full transcript text, built from segments when metadata lacks a full transcript." },
            { name: "summary", location: "body", type: "string", required: true, description: "AI-generated call summary." },
            { name: "sentiment_score", location: "body", type: "number", required: true, description: "First numeric sentiment score found, or `null`." },
            { name: "sentiment_scores", location: "body", type: "array", required: true, description: "Every distinct numeric sentiment score found." },
            { name: "sentiment_brief", location: "body", type: "string", required: true, description: "Short sentiment text." },
            { name: "sentiment_details", location: "body", type: "unknown", required: true, description: "Detailed sentiment payload. May be JSON text depending on the configured AI processor; its own shape is undocumented." },
            { name: "recordings", location: "body", type: "array", required: true, description: "Per-recording metadata rows.", children: aianalysisRecordingFields },
            { name: "transcript_segments", location: "body", type: "array", required: true, description: "Timestamped transcript segments.", children: aianalysisSegmentFields },
          ],
        },
      ],
      example: [
        {
          tenant_id: 1,
          tenant_code: "TESTTENANT",
          uniqueid: "1700000000.42",
          transcript: "Speaker 1: Hello, how can I help you?",
          summary: "The caller asked for support and the agent scheduled a follow-up.",
          sentiment_score: 0.72,
          sentiment_scores: [0.72],
          sentiment_brief: "Positive",
          sentiment_details: "{...}",
          recordings: [
            {
              metadata_id: 345,
              recording_id: 678,
              date: "2026-01-01 10:00:00",
              transcript: "Speaker 1: Hello, how can I help you?",
              summary: "The caller asked for support and the agent scheduled a follow-up.",
              sentiment_score: 0.72,
              sentiment_brief: "Positive",
              sentiment_details: "{...}",
            },
          ],
          transcript_segments: [{ recording_id: 678, speaker: 1, start: 0.0, end: 3.4, text: "Hello, how can I help you?" }],
        },
      ],
      source: "source-docs/raw/mirta-openapi/ai-analysis.md:72-105",
      verified: false,
    },
  ],
  errors: errors("missing_api_key", "invalid_api_key", "tenant_required", "tenant_not_found", "uniqueid_required", "method_not_allowed"),
  notes: [
    "Path aliases: `/aianalysis`, `/aianalyses`, `/ai_analysis`, `/ai_analyses`, `/callanalysis`, `/call_analysis`.",
    "The 200 status is the portal's placeholder for a success response; the source documents no HTTP status codes.",
    "Example values are synthetic. The response when no requested uniqueid matches at all (empty array vs error) is not shown.",
    "Security (SEC-REQ-09): full call transcripts and AI-generated summaries are call content, not just metadata. BLOCK LIVE outright; any future Live consideration needs a distinct privacy/consent decision, not just a field allowlist.",
  ],
});

// --- AI Logs ---

const ailogsFields: Parameter[] = [
  { name: "ai_id", location: "body", type: "number", required: true, description: "Internal row ID." },
  { name: "ai_te_id", location: "body", type: "number", required: true, description: "Internal tenant ID." },
  { name: "ai_cu_id", location: "body", type: "number", required: true, description: "Internal custom destination ID." },
  { name: "cu_name", location: "body", type: "string", required: true, description: "Associated custom destination name, when available.", condition: "When available" },
  { name: "ai_uniqueid", location: "body", type: "string", required: true, description: "Asterisk unique ID." },
  { name: "ai_callerid", location: "body", type: "string", required: true, description: "Caller ID recorded for the conversation. Personal data." },
  { name: "ai_start", location: "body", type: "string", required: true, description: "Conversation start date/time." },
  { name: "ai_end", location: "body", type: "string", required: true, description: "Conversation end date/time." },
  { name: "ai_duration", location: "body", type: "number", required: true, description: "Conversation duration." },
  { name: "ai_talk", location: "body", type: "string", required: true, description: "Conversation text exchanged with the AI service. Documented as able to contain sensitive conversation content." },
  { name: "ai_total_tokens", location: "body", type: "number", required: true, description: "Total tokens reported." },
  { name: "ai_input_tokens", location: "body", type: "number", required: true, description: "Input tokens reported." },
  { name: "ai_output_tokens", location: "body", type: "number", required: true, description: "Output tokens reported." },
];

const ailogs = openapiOperation({
  file: "ailogs.md",
  page: "ai-logs",
  id: "ailogs-list",
  category: "ailogs",
  method: "GET",
  path: "/ailogs",
  title: "List AI logs",
  summary:
    "Exports records of conversations handled by the \"Talk with AI\" custom destination: conversation text, duration, caller ID and token usage. Distinct from AI Analysis (recorded-call transcripts/summaries/sentiment).",
  authentication: openapiAuth({
    extra:
      "Accepts full and read-only API Keys. An optional per-key IP allowlist may also apply.",
  }),
  queryParameters: [
    reportTenant(),
    q("start", "Applied to `ai_start`. Defaults to today 00:00:00. Ignored when `id` or `uniqueid` is supplied.", { example: "2026-01-01 00:00:00", format: "datetime" }),
    q("end", "Applied to `ai_start`. Defaults to today 23:59:59. Ignored when `id` or `uniqueid` is supplied.", { example: "2026-01-01 23:59:59", format: "datetime" }),
    q("id", "Comma-separated `ai_id` values. A path segment (`/ailogs/123`) also maps here."),
    q("uniqueid", "Comma-separated Asterisk unique IDs."),
    q("callerid", "Comma-separated exact caller ID values."),
    q("customid", "Comma-separated custom destination IDs from `cu_customs`."),
    q("format", "`json` (default) or `csv`. `/ailogs/export` defaults to `csv`.", { enum: ["json", "csv"], default: "json", example: "json" }),
    q("key", "API Key. The header or bearer transport is preferred."),
  ],
  responses: [
    {
      status: 200,
      description: "A top-level JSON array, one object per matching AI log row, in the field order below. The HTTP status code itself is not documented.",
      format: "json",
      evidence: "vendor",
      schema: [{ name: "[ ]", location: "body", type: "object", required: true, description: "One object per matching AI log row.", children: ailogsFields }],
      example: [
        {
          ai_id: 123,
          ai_te_id: 1,
          ai_cu_id: 34,
          cu_name: "AI Receptionist",
          ai_uniqueid: "1700000000.42",
          ai_callerid: "5550100",
          ai_start: "2026-01-01 09:30:00",
          ai_end: "2026-01-01 09:31:15",
          ai_duration: 75,
          ai_talk: "Demo Caller: I need sales.\nAI Receptionist: I will connect you.",
          ai_total_tokens: 420,
          ai_input_tokens: 280,
          ai_output_tokens: 140,
        },
      ],
      source: "source-docs/raw/mirta-openapi/ai-logs.md:63-81",
      verified: false,
    },
  ],
  errors: errors("missing_api_key", "invalid_api_key", "tenant_required", "tenant_not_found", "method_not_allowed", "invalid_format", "api_ip_not_allowed"),
  notes: [
    "Path aliases: `/ailog`, `/ailogs`, `/ai_log`, `/ai_logs`, plus `/ailogs/export` (defaults `format` to `csv`) and `/ailogs/{id}`.",
    "A compatibility query form is also documented: `GET /openapi.php?object=ailogs&action=list&tenant=<code>`. Whether it has different security properties than the primary path is undocumented.",
    "CSV column order is documented as the same field order as JSON, but not independently verified for CSV.",
    "The 200 status is the portal's placeholder for a success response; the source documents no HTTP status codes.",
    "Security (SEC-REQ-10): `ai_talk` is conversation content, and the source page itself warns it \"can contain sensitive conversation content. Store exports securely and restrict access to API Keys.\" `ai_callerid` is caller PII. REVIEW REQUIRED: `ai_talk` needs explicit product sign-off before any Live/Demo exposure, beyond a mechanical field allowlist.",
  ],
});

export const cdrCategory: Category = { id: "cdr", title: "CDR", endpoints: [cdr] };
export const simplecdrCategory: Category = { id: "simplecdr", title: "Simple CDR", endpoints: [simplecdr] };
export const aianalysisCategory: Category = { id: "aianalysis", title: "AI Analysis", endpoints: [aianalysis] };
export const ailogsCategory: Category = { id: "ailogs", title: "AI Logs", endpoints: [ailogs] };
