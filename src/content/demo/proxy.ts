import type { DemoFixtureSet } from "./types";

/**
 * Synthetic Demo fixtures for the Proxy API, grounded in the real-API
 * verification findings in source-docs/DOCS_AUDIT.md SS7, SS9, SS11
 * (A-40, A-43, A-48..A-54). Every value here is fabricated: a fictional
 * tenant code, fictional names, and phone numbers from the reserved NANP
 * "555-01xx" fictional range — never a real customer's data, and never the
 * real tenant used for verification (its name is deliberately not recorded
 * anywhere in this repository).
 *
 * Only input combinations that were actually observed get a case. Anything
 * else resolves to "Not simulated" (resolve.ts) — this file never invents
 * a response shape or value that wasn't seen on the real API.
 */

const TENANT = "EXAMPLE";

// --- info-extensions (A-40) ---
// The Live proxy shows only 6 fields per extension (allowlist.ts); Demo
// mirrors that same curated shape, per user decision (2026-09-25), not the
// ~148-field raw upstream record.

function extensionRecord(fields: {
  id: string;
  number: string;
  name: string;
  state: string;
  username: string;
}) {
  return {
    ex_id: fields.id,
    ex_number: fields.number,
    ex_name: fields.name,
    ex_tech: "SIP",
    st_state: fields.state,
    username: fields.username,
  };
}

const demoExtensions = [
  extensionRecord({ id: "90001", number: "201", name: "Demo Reception", state: "UNAVAILABLE", username: `201-${TENANT}` }),
  extensionRecord({ id: "90002", number: "300", name: "Demo Support Desk", state: "UNAVAILABLE", username: `300-${TENANT}` }),
];

// Header and column order observed (A-40); Password column is always blank
// here, mirroring the Live proxy's own redaction of that column.
const extensionsPlainTable =
  "Number|Name|Tech|State|Username|Password\n" +
  demoExtensions.map((e) => `${e.ex_number}|${e.ex_name}|${e.ex_tech}|${e.st_state}|${e.username}|\n`).join("");

const infoExtensionsFixtures: DemoFixtureSet = {
  endpoint: "proxy/info-extensions",
  evidence: "synthetic",
  cases: [
    {
      id: "list-plain",
      label: "Extension list (plain)",
      basis: "A-40: default/plain is a pipe-delimited table, one header row.",
      when: { tenant: "*", id: [""], number: [""], format: ["", "plain"] },
      preset: { tenant: TENANT, id: "", number: "", format: "" },
      response: { status: 200, format: "text", contentType: "text/html; charset=UTF-8", body: extensionsPlainTable },
    },
    {
      id: "list-json",
      label: "Extension list (JSON)",
      basis: "A-40: format=json returns an array with the portal's 6 allowlisted fields.",
      when: { tenant: "*", id: [""], number: [""], format: ["json"] },
      preset: { tenant: TENANT, id: "", number: "", format: "json" },
      response: { status: 200, format: "json", contentType: "application/json", body: demoExtensions },
    },
  ],
};

// --- info-agents (A-43) ---

function agentRecord(key: string) {
  return { "0": "0", "1": "available", "2": "UNAVAILABLE", "4": "", "5": "", "6": "", "7": "", "8": "", "10": key, "11": key };
}

const KNOWN_QUEUE = "281"; // the existing content's own example value (agentsQueueParam), not a real queue id.
const demoAgents = {
  [`201-${TENANT}`]: agentRecord(`201-${TENANT}`),
  [`300-${TENANT}`]: agentRecord(`300-${TENANT}`),
};
const agentsPlainLine = `201-${TENANT}:available|300-${TENANT}:available|`;

const infoAgentsFixtures: DemoFixtureSet = {
  endpoint: "proxy/info-agents",
  evidence: "synthetic",
  cases: [
    {
      id: "known-json",
      label: "Queue agents (JSON)",
      basis: "A-43: an omitted or known queue returns a keyed object of positional records.",
      when: { tenant: "*", queue: ["", KNOWN_QUEUE], format: ["json"] },
      preset: { tenant: TENANT, queue: "", format: "json" },
      response: { status: 200, format: "json", contentType: "application/json", body: demoAgents },
    },
    {
      id: "unknown-json",
      label: "Unknown queue (JSON null)",
      basis: "A-43: a nonexistent queue returns the JSON literal null.",
      when: { tenant: "*", queue: "*", format: ["json"] },
      preset: { tenant: TENANT, queue: "999999", format: "json" },
      response: { status: 200, format: "json", contentType: "application/json", body: null },
    },
    {
      id: "known-plain",
      label: "Queue agents (plain)",
      basis: "A-43: default/plain is one line of `<agent>:<state>|` pairs.",
      when: { tenant: "*", queue: ["", KNOWN_QUEUE], format: ["", "plain"] },
      preset: { tenant: TENANT, queue: "", format: "" },
      response: { status: 200, format: "text", contentType: "text/html; charset=UTF-8", body: agentsPlainLine },
    },
  ],
};

// --- info-dids (A-53) ---
// JSON shows only the DID's own core fields, per user decision (2026-09-25):
// the raw upstream record also embeds the entire tenant row (te_* — billing
// codes, recording credentials) joined onto every DID, which this portal
// never surfaces. csv is empty on every tenant tried (A-53); plain is a
// clean 11-column table and is reproduced faithfully.

function didRecord(fields: {
  country: string;
  area: string;
  number: string;
  comment: string;
  recording: string;
  faxstationid: string;
  faxEmail: string;
  maxChannels: string;
  recordingEmail: string;
  smsEmail: string;
}) {
  return {
    di_country: fields.country,
    di_area: fields.area,
    di_number: fields.number,
    di_comment: fields.comment,
    di_recording: fields.recording,
    di_faxstationid: fields.faxstationid,
    di_fax_email: fields.faxEmail,
    di_maxchannels: fields.maxChannels,
    di_emailrecording: fields.recordingEmail,
    di_smsemail: fields.smsEmail,
  };
}

const demoDids = [
  didRecord({
    country: "",
    area: "",
    number: "5550101010",
    comment: "Demo main line",
    recording: "yes",
    faxstationid: "Demo Fax",
    faxEmail: "",
    maxChannels: "-1",
    recordingEmail: "",
    smsEmail: "",
  }),
  didRecord({
    country: "",
    area: "",
    number: "5550101020",
    comment: "Demo support line",
    recording: "",
    faxstationid: "Demo Fax",
    faxEmail: "",
    maxChannels: "-1",
    recordingEmail: "",
    smsEmail: "",
  }),
];

// Plain columns include Tenant (the tenant's short code), which the curated
// JSON above deliberately omits (user decision) — the two views' shapes
// differ on purpose, same as the real API's own plain vs json do.
const didsPlainRow = (d: (typeof demoDids)[number]) =>
  `${d.di_country}|${d.di_area}|${d.di_number}|${TENANT}|${d.di_comment}|${d.di_recording}|${d.di_faxstationid}|${d.di_fax_email}|${d.di_maxchannels}|${d.di_emailrecording}|${d.di_smsemail}\n`;

const didsPlainTable =
  "Country|Area|Number|Tenant|Comment|Recording|Faxstation ID|FAX Email|Max Channels|Recording EMail|SMS Email\n" +
  demoDids.map(didsPlainRow).join("");

const infoDidsFixtures: DemoFixtureSet = {
  endpoint: "proxy/info-dids",
  evidence: "synthetic",
  cases: [
    {
      id: "list-plain",
      label: "DID list (plain)",
      basis: "A-53: default/plain is an 11-column pipe-delimited table.",
      when: { tenant: "*", format: ["", "plain"] },
      preset: { tenant: TENANT, format: "" },
      response: { status: 200, format: "text", contentType: "text/html; charset=UTF-8", body: didsPlainTable },
    },
    {
      id: "list-json",
      label: "DID list (JSON)",
      basis: "A-53: format=json returns each DID's own fields — this portal never surfaces the joined tenant record the real API also includes.",
      when: { tenant: "*", format: ["json"] },
      preset: { tenant: TENANT, format: "json" },
      response: { status: 200, format: "json", contentType: "application/json", body: demoDids },
    },
    {
      id: "csv-empty",
      label: "CSV (empty)",
      basis: "A-53: format=csv returned an empty body on the tested tenant.",
      when: { tenant: "*", format: ["csv"] },
      preset: { tenant: TENANT, format: "csv" },
      response: { status: 200, format: "text", contentType: "text/html; charset=UTF-8", body: "" },
    },
  ],
};

// --- info-simplecdrs (A-49, A-54) ---
// format=plain/default is excluded: the real response's structure is only
// partially decoded (A-54 — a malformed table, header not separated by a
// line break from the first row, values duplicated) and reproducing it with
// confidence isn't possible from a masked capture; the Playground shows
// "Not simulated" for that combination rather than a guessed layout.

const MATCHED_PHONE = "5550101001";

function simplecdrsRecord(fields: {
  start: string;
  direction: string;
  calleridnum: string;
  calleridname: string;
  dialednum: string;
  disposition: string;
  duration: string;
  uniqueid: string;
  whoanswered: string;
}) {
  const named = {
    sc_te_id: "9001",
    tenantcode: TENANT,
    sc_start: fields.start,
    sc_direction: fields.direction,
    sc_calleridnum: fields.calleridnum,
    sc_calleridname: fields.calleridname,
    sc_dialednum: fields.dialednum,
    sc_disposition: fields.disposition,
    sc_duration: fields.duration,
    sc_uniqueid: fields.uniqueid,
    sc_whoanswered: fields.whoanswered,
  };
  // Positional duplicate keys "0".."10", same order as the named fields
  // above (A-49 — the real response repeats every value under a bare index).
  const positional = Object.fromEntries(Object.values(named).map((v, i) => [String(i), v]));
  return { ...positional, ...named };
}

const demoCalls = [
  simplecdrsRecord({
    start: "2026-01-15 09:30:00",
    direction: "IN",
    calleridnum: MATCHED_PHONE,
    calleridname: "Demo Caller One",
    dialednum: "201",
    disposition: "ANSWERED",
    duration: "42",
    uniqueid: "demo01-1768469400.1001",
    whoanswered: `201-${TENANT}`,
  }),
  simplecdrsRecord({
    start: "2026-01-16 14:05:00",
    direction: "OUT",
    calleridnum: "5550101002",
    calleridname: "Demo Caller Two",
    dialednum: "5550109999",
    disposition: "NO ANSWER",
    duration: "0",
    uniqueid: "demo01-1768572300.1002",
    whoanswered: "",
  }),
];

function csvField(value: string) {
  return value.includes(" ") ? `"${value}"` : value;
}

// Column order and quoting (spaces quoted, matching the observed date and
// "NO ANSWER" cells) from A-49's csv capture.
const SIMPLECDRS_CSV_COLUMNS = [
  "sc_te_id",
  "tenantcode",
  "sc_start",
  "sc_direction",
  "sc_calleridnum",
  "sc_calleridname",
  "sc_dialednum",
  "sc_disposition",
  "sc_duration",
  "sc_uniqueid",
  "sc_whoanswered",
] as const;

function simplecdrsCsv(records: (typeof demoCalls)[number][]) {
  const header = SIMPLECDRS_CSV_COLUMNS.join(",");
  const rows = records.map((r) => SIMPLECDRS_CSV_COLUMNS.map((c) => csvField(String(r[c as keyof typeof r]))).join(","));
  return [header, ...rows].join("\n") + "\n";
}

const infoSimplecdrsFixtures: DemoFixtureSet = {
  endpoint: "proxy/info-simplecdrs",
  evidence: "synthetic",
  cases: [
    {
      id: "unfiltered-json",
      label: "Calls, unfiltered (JSON)",
      basis: "A-49: format=json returns an array; each record's fields are duplicated under bare positional keys.",
      when: { tenant: "*", phone: [""], start: "*", end: "*", format: ["json"] },
      preset: { tenant: TENANT, phone: "", start: "2026-01-01", end: "2026-01-31", format: "json" },
      response: { status: 200, format: "json", contentType: "application/json", body: demoCalls },
    },
    {
      id: "matched-json",
      label: "Calls, phone match (JSON)",
      basis: "A-49: the phone filter narrows the array to matching calls.",
      when: { tenant: "*", phone: [MATCHED_PHONE], start: "*", end: "*", format: ["json"] },
      preset: { tenant: TENANT, phone: MATCHED_PHONE, start: "2026-01-01", end: "2026-01-31", format: "json" },
      response: { status: 200, format: "json", contentType: "application/json", body: [demoCalls[0]] },
    },
    {
      id: "no-match-json",
      label: "Calls, no match (JSON, empty)",
      basis: "A-49: a phone filter with no matching calls returns an empty 200 body, not [].",
      when: { tenant: "*", phone: "*", start: "*", end: "*", format: ["json"] },
      preset: { tenant: TENANT, phone: "5559999999", start: "2026-01-01", end: "2026-01-31", format: "json" },
      response: { status: 200, format: "text", contentType: "application/json", body: "" },
    },
    {
      id: "unfiltered-csv",
      label: "Calls, unfiltered (CSV)",
      basis: "A-49: format=csv returns the same fields as a comma-separated table with a header row.",
      when: { tenant: "*", phone: [""], start: "*", end: "*", format: ["csv"] },
      preset: { tenant: TENANT, phone: "", start: "2026-01-01", end: "2026-01-31", format: "csv" },
      response: { status: 200, format: "text", contentType: "text/html; charset=UTF-8", body: simplecdrsCsv(demoCalls) },
    },
    {
      id: "matched-csv",
      label: "Calls, phone match (CSV)",
      basis: "A-49: the phone filter narrows the CSV rows the same way as json.",
      when: { tenant: "*", phone: [MATCHED_PHONE], start: "*", end: "*", format: ["csv"] },
      preset: { tenant: TENANT, phone: MATCHED_PHONE, start: "2026-01-01", end: "2026-01-31", format: "csv" },
      response: { status: 200, format: "text", contentType: "text/html; charset=UTF-8", body: simplecdrsCsv([demoCalls[0]]) },
    },
    {
      id: "no-match-csv",
      label: "Calls, no match (CSV, empty)",
      basis: "A-49: a phone filter with no matching calls returns an empty 200 body.",
      when: { tenant: "*", phone: "*", start: "*", end: "*", format: ["csv"] },
      preset: { tenant: TENANT, phone: "5559999999", start: "2026-01-01", end: "2026-01-31", format: "csv" },
      response: { status: 200, format: "text", contentType: "text/html; charset=UTF-8", body: "" },
    },
  ],
};

export const proxyDemoFixtures: readonly DemoFixtureSet[] = [
  infoExtensionsFixtures,
  infoAgentsFixtures,
  infoDidsFixtures,
  infoSimplecdrsFixtures,
];
