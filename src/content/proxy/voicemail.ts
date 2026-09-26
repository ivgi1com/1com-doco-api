import type { Category, Parameter } from "../types";
import { proxyOperation, q } from "./shared";

/** reqtype=VOICEMAIL — source-docs/proxy-api/voicemail.md (Site 140-150, Doc 311-319). */

const vmTenantParam = q("tenant", "Tenant for the voicemails.", { required: false });
const vmMailboxParam = q("mailbox", "Mailbox number to show info about.", { required: false, example: "102" });
const vmMsgidParam = q("msgid", "Message id.", { example: "1475685709-00000004" });

// Observed 2026-09-26 by a structure-only probe (source-docs/DOCS_AUDIT.md
// A-77, SECURITY). imapuser/imappassword were null in every mailbox
// observed; a populated mailbox's actual value was not confirmed.
const voicemailListItemSchema: Parameter[] = [
  { name: "uniqueid", location: "body", type: "string", required: true, description: "Mailbox record id." },
  { name: "te_id", location: "body", type: "string", required: true, description: "Internal tenant id." },
  { name: "context", location: "body", type: "string", required: true, description: "Dial-plan context." },
  { name: "mailbox", location: "body", type: "string", required: true, description: "Mailbox number." },
  { name: "fullname", location: "body", type: "string", required: true, description: "Mailbox owner's display name." },
  { name: "email", location: "body", type: "string", required: true, description: "Notification email address(es), comma-separated." },
  { name: "pager", location: "body", type: "string", required: false, description: "Pager email address. Often empty." },
  { name: "attach", location: "body", type: "string", required: true, description: "Whether to attach the audio to the notification email." },
  { name: "attachfmt", location: "body", type: "string", required: false, description: "Attachment audio format." },
  { name: "serveremail", location: "body", type: "string", required: false, description: "From address used for notification email." },
  { name: "language", location: "body", type: "string", required: false, description: "Mailbox language. Often empty." },
  { name: "tz", location: "body", type: "string", required: false, description: "Timezone. Often empty." },
  { name: "tzbytenant", location: "body", type: "string", required: true, description: "Whether the timezone follows the tenant setting." },
  { name: "deletevoicemail", location: "body", type: "string", required: true, description: "Whether to delete voicemail after notification." },
  { name: "saycid", location: "body", type: "string", required: true, description: "Whether to announce caller id." },
  { name: "sendvoicemail", location: "body", type: "string", required: false, description: "Whether to send the voicemail by email." },
  { name: "review", location: "body", type: "string", required: true, description: "Whether the caller can review before leaving a message." },
  { name: "tempgreetwarn", location: "body", type: "string", required: false, description: "Temporary-greeting warning setting." },
  { name: "operator", location: "body", type: "string", required: false, description: "Operator escape setting. Often empty." },
  { name: "envelope", location: "body", type: "string", required: true, description: "Whether to play the message envelope." },
  { name: "sayduration", location: "body", type: "string", required: false, description: "Whether to announce message duration." },
  { name: "saydurationm", location: "body", type: "string", required: false, description: "Minimum duration (minutes) to trigger the announcement." },
  { name: "forcename", location: "body", type: "string", required: false, description: "Whether to force name recording." },
  { name: "forcegreetings", location: "body", type: "string", required: false, description: "Whether to force greeting recording." },
  { name: "callback", location: "body", type: "string", required: false, description: "Callback context. Often empty." },
  { name: "dialout", location: "body", type: "string", required: false, description: "Dialout context. Often empty." },
  { name: "exitcontext", location: "body", type: "string", required: true, description: "Context to exit to." },
  { name: "maxmsg", location: "body", type: "string", required: true, description: "Maximum stored messages." },
  { name: "volgain", location: "body", type: "string", required: false, description: "Playback volume gain. Often empty." },
  {
    name: "imapuser",
    location: "body",
    type: "string",
    required: false,
    description:
      "IMAP username for message storage (SECURITY, source-docs/DOCS_AUDIT.md A-77). Null in every mailbox observed; a populated value's actual content was not confirmed.",
  },
  {
    name: "imappassword",
    location: "body",
    type: "string",
    required: false,
    description:
      "IMAP password for message storage, in the clear if populated (SECURITY, source-docs/DOCS_AUDIT.md A-77, docs/SECURITY.md SEC-REQ-02). Null in every mailbox observed.",
  },
  { name: "stamp", location: "body", type: "string", required: true, description: "Record timestamp, \"YYYY-MM-DD HH:MM\"." },
  { name: "welcomeoption", location: "body", type: "string", required: false, description: "Welcome-message option." },
  { name: "category", location: "body", type: "string", required: false, description: "Category tag. Often empty." },
  { name: "fromstring", location: "body", type: "string", required: false, description: "From-name override for notification email. Often empty." },
  { name: "minsecs", location: "body", type: "string", required: true, description: "Minimum message length in seconds." },
  { name: "maxsecs", location: "body", type: "string", required: true, description: "Maximum message length in seconds." },
  { name: "transcript_store", location: "body", type: "string", required: true, description: "Whether to store a transcript." },
  { name: "onnewmessage", location: "body", type: "string", required: false, description: "Action to run on a new message." },
  ...Array.from({ length: 30 }, (_, i): Parameter => ({
    name: `onnewmessageparam${i + 1}`,
    location: "body",
    type: "string",
    required: false,
    description: "Parameter for the on-new-message action. Often empty.",
  })),
  { name: "ivr_id", location: "body", type: "string", required: false, description: "Associated IVR id." },
  { name: "nextaftercmd", location: "body", type: "string", required: false, description: "Next command after playback." },
  { name: "includeindbn", location: "body", type: "string", required: false, description: "Whether included in the directory by name." },
  { name: "transcript_generate", location: "body", type: "string", required: false, description: "Whether to generate a transcript. Often empty." },
  { name: "autodeleteolder", location: "body", type: "string", required: true, description: "Auto-delete threshold." },
  { name: "voicemailbackup", location: "body", type: "string", required: true, description: "Whether messages are backed up." },
  { name: "summary_generate", location: "body", type: "string", required: false, description: "Whether to generate a summary. Often empty." },
];

export const voicemailList = proxyOperation({
  id: "voicemail-list",
  category: "voicemail",
  operationClass: "read",
  fixedQuery: { reqtype: "VOICEMAIL", action: "list" },
  title: "List voicemails",
  summary: "Lists every voicemail for a tenant.",
  source: "voicemail.md",
  queryParameters: [
    vmTenantParam,
    q("format", "Output format. Observed (A-77): the default is a 5-column pipe-delimited table; format=json (undocumented) returns an array with the full per-mailbox record.", { required: false, enum: ["json"], example: "json" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description:
        "With format=json (undocumented): an array, one object per mailbox (42 observed on the test tenant), roughly 60 fields including a plaintext IMAP credential pair. Without format (or format=plain): a smaller 5-column pipe-delimited table (header: Mailbox|Fullname|Email|Attach|, the fifth column's header was empty in the observed capture).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-77",
      schema: [
        { name: "[ ]", location: "body", type: "object", required: true, description: "One item per mailbox.", children: voicemailListItemSchema },
      ],
      example: [
        {
          uniqueid: "1001", te_id: "500", context: "default", mailbox: "1001", fullname: "Demo Mailbox",
          email: "demo@example.com", pager: "", attach: "yes", attachfmt: null, serveremail: null,
          language: "", tz: "", tzbytenant: "no", deletevoicemail: "no", saycid: "no", sendvoicemail: null,
          review: "no", tempgreetwarn: null, operator: "", envelope: "yes", sayduration: null, saydurationm: null,
          forcename: null, forcegreetings: null, callback: "", dialout: "", exitcontext: "default-exit",
          maxmsg: "100", volgain: null, imapuser: null, imappassword: null, stamp: "2026-01-15 09:30",
          welcomeoption: "std", category: "", fromstring: "", minsecs: "1", maxsecs: "60",
          transcript_store: "no", onnewmessage: "", onnewmessageparam1: "",
        },
      ],
    },
  ],
  notes: [
    "Response observed by probe (source-docs/DOCS_AUDIT.md A-77).",
    "SECURITY: the format=json response includes a plaintext IMAP credential pair (imapuser, imappassword) per mailbox. This operation must never be added to the Live allowlist without a field-level output allowlist that drops both — tracked as blocking requirement SEC-REQ-02 in docs/SECURITY.md.",
  ],
  related: ["voicemail-messages"],
});

export const voicemailMessages = proxyOperation({
  id: "voicemail-messages",
  category: "voicemail",
  operationClass: "read",
  fixedQuery: { reqtype: "VOICEMAIL", action: "messages" },
  title: "List a mailbox's messages",
  summary: "Lists the messages in one mailbox.",
  source: "voicemail.md",
  queryParameters: [vmTenantParam, vmMailboxParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Success response not documented — response with a real mailbox is unknown. Without mailbox (A-74): an empty 200 body (0 bytes), for both the default and format=json requests.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-74",
    },
  ],
  notes: ["Response observed by probe without mailbox (source-docs/DOCS_AUDIT.md A-74); the populated shape remains undocumented."],
  related: ["voicemail-list", "voicemail-message"],
});

export const voicemailMessage = proxyOperation({
  id: "voicemail-message",
  category: "voicemail",
  operationClass: "read",
  fixedQuery: { reqtype: "VOICEMAIL", action: "message" },
  title: "Get a message's audio",
  summary: "Returns the binary audio for one voicemail message.",
  source: "voicemail.md",
  queryParameters: [vmTenantParam, vmMailboxParam, vmMsgidParam],
  responses: [
    {
      status: 200,
      description: "The message audio as a binary file. Content type and audio format are not documented.",
      format: "binary",
      evidence: "vendor",
      verified: false,
      source: "source-docs/proxy-api/voicemail.md",
    },
  ],
  notes: [
    "Not probed and has no Demo fixture: the source does not say whether retrieving a message marks it read, and VOICEMAIL separately exposes markread/markunread actions — calling this to observe its response could silently change a real mailbox's state (user decision, Phase 7 Stage 1).",
  ],
  related: ["voicemail-messages", "voicemail-markread"],
});

export const voicemailDelete = proxyOperation({
  id: "voicemail-delete",
  category: "voicemail",
  operationClass: "write",
  fixedQuery: { reqtype: "VOICEMAIL", action: "delete" },
  title: "Delete a message",
  summary: "Deletes one voicemail message.",
  source: "voicemail.md",
  queryParameters: [vmTenantParam, vmMailboxParam, vmMsgidParam],
  notes: ["No example; parameters inferred from the shared VOICEMAIL parameter table. Response not documented."],
});

export const voicemailMarkread = proxyOperation({
  id: "voicemail-markread",
  category: "voicemail",
  operationClass: "write",
  fixedQuery: { reqtype: "VOICEMAIL", action: "markread" },
  title: "Mark a message read",
  summary: "Marks one voicemail message as read.",
  source: "voicemail.md",
  queryParameters: [vmTenantParam, vmMsgidParam],
  notes: [
    "Site-only action (Site line 148); not in the Doc's action list (list/messages/message/delete). The Site's own example uses the alternate host form (DEMO.1com.com/1com), reproduced here with the portal's canonical host instead.",
    "Response not documented.",
  ],
  related: ["voicemail-markunread"],
});

export const voicemailMarkunread = proxyOperation({
  id: "voicemail-markunread",
  category: "voicemail",
  operationClass: "write",
  fixedQuery: { reqtype: "VOICEMAIL", action: "markunread" },
  title: "Mark a message unread",
  summary: "Marks one voicemail message as not read.",
  source: "voicemail.md",
  queryParameters: [vmTenantParam, vmMsgidParam],
  notes: ["Site-only action (Site line 150); not in the Doc's action list. Response not documented."],
  related: ["voicemail-markread"],
});

export const voicemailCategory: Category = {
  id: "voicemail",
  title: "VOICEMAIL",
  endpoints: [
    voicemailList,
    voicemailMessages,
    voicemailMessage,
    voicemailDelete,
    voicemailMarkread,
    voicemailMarkunread,
  ],
};
