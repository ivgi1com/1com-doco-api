import type { Category } from "../types";
import { proxyOperation, q } from "./shared";

/** reqtype=VOICEMAIL — source-docs/proxy-api/voicemail.md (Site 140-150, Doc 311-319). */

const vmTenantParam = q("tenant", "Tenant for the voicemails.", { required: false });
const vmMailboxParam = q("mailbox", "Mailbox number to show info about.", { required: false, example: "102" });
const vmMsgidParam = q("msgid", "Message id.", { example: "1475685709-00000004" });

export const voicemailList = proxyOperation({
  id: "voicemail-list",
  category: "voicemail",
  operationClass: "read",
  fixedQuery: { reqtype: "VOICEMAIL", action: "list" },
  title: "List voicemails",
  summary: "Lists every voicemail for a tenant.",
  source: "voicemail.md",
  queryParameters: [vmTenantParam],
  notes: ["Response not documented."],
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
  notes: ["Response not documented."],
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
