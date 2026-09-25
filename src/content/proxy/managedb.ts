import type { Category } from "../types";
import { authAdmin, b, proxyOperation, tenantParam } from "./shared";

/**
 * reqtype=MANAGEDB — source-docs/proxy-api/managedb.md (Site 224–534; not
 * in the Doc). Discriminators: `object` and `action`. Every ManageDB action
 * requires an admin key (Site line 225). Reads are GET; writes POST a
 * `jsondata` form field (source-docs/proxy-api/_common.md "POST conventions").
 */

const managedbNotes = [
  "Every ManageDB action requires an admin key (Site line 225). No admin key was available for testing, so no ManageDB operation has been tried against the real API.",
];

const writeNotes = [
  "The method is not stated; POST is inferred because the source's PHP example sends a jsondata body, which a GET query string cannot carry.",
];

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
});

export const managedbCategory: Category = { id: "managedb", title: "MANAGEDB", endpoints: [managedbCustomAdd] };
