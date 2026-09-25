import type { Category } from "../types";
import { proxyOperation, q, tenantParam } from "./shared";

/** reqtype=DIAL — source-docs/proxy-api/dial.md (Site 117–127, Doc 187–206). */


export const dial = proxyOperation({
  id: "dial",
  category: "dial",
  operationClass: "write",
  fixedQuery: { reqtype: "DIAL" },
  title: "Place a call",
  summary: "Calls a first number (the source) and, once it answers, connects it to a second number (the destination).",
  source: "dial.md",
  queryParameters: [
    { ...tenantParam, description: "Tenant to place the call in." },
    q("source", "First number to dial. ACCOUNT uses the number associated with the chosen account. The Doc also names this parameter ?exten, without explaining the alternate name or its leading question mark.", { example: "201" }),
    q("dest", "Number to connect the source to once it answers. The Doc also names this parameter phone.", { example: "5550100123" }),
    q("account", "Account to simulate the call from. SOURCE uses the account associated with the source number.", { required: false, example: "source" }),
    q("var", "A variable to set on the call, as name=value (URL-encode the =). The PBX prefixes the name with the tenant code: callid=453131 becomes TENANTCODE-callid in the dial plan.", { required: false }),
    q("dialtimeout", "Dial timeout, in seconds.", { required: false }),
    q("timeout", "Maximum call duration, in seconds.", { required: false }),
    q("sourceclid", "Caller ID shown when dialing the source number.", { required: false }),
    q("destclid", "Caller ID shown when dialing the destination number.", { required: false }),
    q("recording", "Call recording setting.", { required: false, enum: ["yes", "no", "yeschange", "nochange"] }),
    q("server", "Specific server to dial from.", { required: false }),
    q("autoanswer", "Ask the source phone to answer automatically.", { required: false, enum: ["yes"] }),
  ],
  responses: [
    {
      status: 200,
      description:
        "A pipe-delimited text line: result, message, and a call id. The call id also appears in the CDR's OriginateID field and can be passed to INFO info=recording as id. Only the success line is documented.",
      format: "plain",
      evidence: "vendor",
      verified: false,
      source: "source-docs/proxy-api/dial.md (Site line 120)",
      example: "Success|Originate successfully queued|15a4cfe6429054|",
    },
  ],
  notes: [
    "Places a real call on the PBX. Try it only against a tenant and numbers where that is safe.",
    "Which parameters are required is not stated; the source's examples always send tenant, source and dest.",
    "The source's examples write account=source in lowercase, while the Doc's wording says SOURCE; case sensitivity is not documented.",
  ],
});

export const dialCategory: Category = { id: "dial", title: "DIAL", endpoints: [dial] };
