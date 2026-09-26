import type { DemoFixtureSet } from "./types";

/**
 * Synthetic Demo fixtures for the MiRTA OpenAPI (Phase 8 Stage 3, revised
 * Phase 8B Stage 4 per docs/DECISIONS.md "Phase 8B planning and probe
 * decisions", and its resumed/completed scope decided in this session
 * after a crash lost the running handoff — see docs/SESSION_HANDOFF.md
 * "Phase 8B Stage 4"). AI Logs is dropped (the test PBX returned 404,
 * source-docs/DOCS_AUDIT.md OA-17). Every other OpenAPI GET the masked
 * probe (source-docs/observed/openapi/probe-2026-09-26.masked.json)
 * returned genuine data for gets a fixture; a GET the probe returned no
 * data for (error-only, empty, or timeout) falls back to "Demo data not
 * available". Every write stays Reference-only (SEC-REQ-27).
 *
 * Extension State and AI Analysis reuse the endpoint's own documented
 * response example (src/content/openapi/{extensions,reporting}.ts),
 * already normalized to the project's synthetic conventions at Stage 1.
 * Every other fixtured endpoint has no documented response; its body is
 * the probe's observed field shape with fabricated values (matching
 * src/content/observed.ts's mask-to-example rules exactly, so Demo and the
 * Reference page's observed schema agree), trimmed of fields the probe
 * observed as empty/null on every row and of long numbered-field runs
 * (kept to their first 2 members, e.g. `provisioningphones`' `ph_lineN_
 * ex_id`) — the untrimmed schema is on the Reference page itself.
 *
 * Scenarios beyond the plain "found" case are fixtured only where the
 * probe observed them, and only on an endpoint that also has a success
 * case:
 * - **Tenant omitted → 401 `invalid_api_key`** (OA-15) on every endpoint
 *   whose `tenant` parameter is optional. This one auth check was probed
 *   directly on a single representative endpoint (`extensions-list`), not
 *   on each resource individually, and is applied here on the premise
 *   that the same auth layer runs in front of every OpenAPI resource —
 *   flagged in each case's own `basis`, not silently assumed.
 *   `extensions-state-get` is excluded: its `tenant` is documented as
 *   required, a different, unprobed situation.
 * - **AI Analysis**: `invalid_api_key` via the documented `key` query
 *   parameter (unique to this endpoint), and an empty-array result for a
 *   uniqueid with no analysis (OA-14, OA-18).
 * - **Simple CDR list**: an empty-array result for a filter matching no
 *   calls (OA-18).
 * Two observed error scenarios are NOT fixtured, both for the same reason
 * — the real Playground blocks `Send` before the Demo resolver ever runs
 * (`use-playground.ts`'s `validate()`: a documented `required: true`
 * query/body field left empty sets a client-side error and returns early):
 * - every get-by-ID endpoint's observed 404 `object_not_found` (OA-16),
 *   whose id is a required *path* parameter (never empty in the UI, and
 *   `DemoCase.when` only matches query parameters anyway, types.ts) — the
 *   same limitation the Stage 4 Queue work hit and the user chose to skip
 *   rather than extend the matcher;
 * - AI Analysis's observed 400 `uniqueid_required`, whose `uniqueid` is a
 *   required *query* parameter — found and removed during this session's
 *   own Stage 5 visual validation (rule 6): the field can never actually
 *   be emptied through Send, so the case was unreachable dead data.
 */

const TENANT = "TESTTENANT";

// --- extensions-state-get (extension-state.md) ---

const extensionsStateFixtures: DemoFixtureSet = {
  endpoint: "openapi/extensions-state-get",
  evidence: "synthetic",
  cases: [
    {
      id: "not-registered-json",
      label: "Not registered",
      basis: "extension-state.md: the documented response when the extension exists but no registration server is available (UniqueID KO). Demo convention: extension number 199 selects this case; the number itself is not from the source.",
      when: { tenant: "*", number: ["199"], ext: "*" },
      preset: { tenant: TENANT, number: "199" },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          UniqueID: "KO",
          LinkedID: "Extension not registered",
          "Connected Line ID": "",
          "Connected Line ID Name": "",
          Context: "",
          Extension: "",
          Direction: "",
          OtherParty: "",
        },
      },
    },
    {
      id: "registered-json",
      label: "Registered, active channel",
      basis: "extension-state.md: the documented example response, a registered extension with an active channel. The registered-but-idle variant is documented in prose only (which fields are \"live\" is not listed), so it is not fixtured.",
      when: { tenant: "*", number: "*", ext: "*" },
      preset: { tenant: TENANT, number: "100" },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          UniqueID: "1700000000.1",
          LinkedID: "1700000000.1",
          "Connected Line ID": "5550100",
          "Connected Line ID Name": "Demo Caller",
          Context: "authenticated",
          Extension: "5550100",
          Direction: "IN",
          OtherParty: "5550100",
        },
      },
    },
  ],
};

// --- queues-list / queues-get (queues.md; no documented response, Phase 8B Stage 4 uses the probe's observed shape) ---

function queueRow(fields: { id: string; number: string; name: string }) {
  return {
    qu_id: fields.id,
    qu_te_id: "1",
    qu_name: fields.name,
    qu_number: fields.number,
    id: Number(fields.id),
    name: fields.name,
  };
}

const queuesListFixtures: DemoFixtureSet = {
  endpoint: "openapi/queues-list",
  evidence: "synthetic",
  cases: [
    {
      id: "list-json",
      label: "Queues found",
      basis: "queues.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed queues-list shape (source-docs/DOCS_AUDIT.md OA-14, OA-18) — the full observed schema is shown on the Reference page itself (src/content/observed.ts).",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          queueRow({ id: "1", number: "700", name: "Demo Sales Queue" }),
          queueRow({ id: "2", number: "701", name: "Demo Support Queue" }),
        ],
      },
    },
  ],
};

const queuesGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/queues-get",
  evidence: "synthetic",
  cases: [
    {
      id: "found-json",
      label: "Queue found",
      basis: "queues.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed queues-get shape, including the `related.members`/`related.allowed_members` objects the create/update fields write to (source-docs/DOCS_AUDIT.md OA-14, OA-18) — the full observed schema is shown on the Reference page itself (src/content/observed.ts).",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          ...queueRow({ id: "1", number: "700", name: "Demo Sales Queue" }),
          object: "queue",
          related: {
            members: [],
            allowed_members: [
              { aq_uniqueid: "1", aq_membername: "100", aq_queue_name: "700", aq_interface: "PJSIP/100", aq_penalty: "0", aq_paused: "0" },
              { aq_uniqueid: "2", aq_membername: "101", aq_queue_name: "700", aq_interface: "PJSIP/101", aq_penalty: "0", aq_paused: "0" },
            ],
          },
        },
      },
    },
  ],
};

const calleridblacklistsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/calleridblacklists-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "calleridblacklists.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "bl_id": "100",
            "bl_te_id": "100",
            "bl_callerid": "example",
            "bl_inserted": "2026-01-01 09:00:00",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const calleridblacklistsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/calleridblacklists-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "calleridblacklists.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "bl_id": "100",
          "bl_te_id": "100",
          "bl_callerid": "example",
          "bl_inserted": "2026-01-01 09:00:00",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": []
        },
      },
    },
  ],
};

const campaignnumbersListFixtures: DemoFixtureSet = {
  endpoint: "openapi/campaignnumbers-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], campaign_id: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "campaignnumbers.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", campaign_id: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "cn_id": "100",
            "cn_te_id": "100",
            "cn_ca_id": "100",
            "cn_number": "example",
            "cn_attempts": "100",
            "cn_lastattempt": "2026-01-01 09:00:00",
            "cn_billsec": "100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const campaignnumbersGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/campaignnumbers-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "campaignnumbers.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "cn_id": "100",
          "cn_te_id": "100",
          "cn_ca_id": "100",
          "cn_number": "example",
          "cn_attempts": "100",
          "cn_lastattempt": "2026-01-01 09:00:00",
          "cn_billsec": "100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "campaign": {
              "ca_id": "100",
              "ca_te_id": "100",
              "ca_name": "Demo",
              "ca_type": "example",
              "ca_tech": "example",
              "ca_state": "example"
            }
          }
        },
      },
    },
  ],
};

const campaignsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/campaigns-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "campaigns.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "ca_id": "100",
            "ca_te_id": "100",
            "ca_name": "Demo",
            "ca_type": "example",
            "ca_datestart": "2026-01-01",
            "ca_dateend": "2026-01-01",
            "ca_co_id": "100",
            "ca_maxchannels": "100",
            "ca_maxattempts": "100",
            "ca_callerid": "5550100",
            "ca_calldelay": "100",
            "ca_state": "example",
            "ca_lastrun": "2026-01-01 09:00:00",
            "ca_dialtimeout": "100",
            "ca_hosted": "example",
            "ca_tech": "example",
            "ca_message": "example",
            "ca_recording": "example",
            "ca_cr_id": "100",
            "ca_qu_id": "100",
            "ca_minfreeagents": "100",
            "ca_minemailrecording": "demo@example.com",
            "ca_retrytime": "100",
            "channelsforfreeagents": "0.00",
            "ca_confirmmessage_me_id": "100",
            "ca_maxcampaignnumbers": "5550100",
            "ca_statechange": "2026-01-01 09:00:00",
            "ca_channelsforfreeagents": "100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const campaignsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/campaigns-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "campaigns.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "ca_id": "100",
          "ca_te_id": "100",
          "ca_name": "Demo",
          "ca_type": "example",
          "ca_datestart": "2026-01-01",
          "ca_dateend": "2026-01-01",
          "ca_co_id": "100",
          "ca_maxchannels": "100",
          "ca_maxattempts": "100",
          "ca_callerid": "5550100",
          "ca_calldelay": "100",
          "ca_state": "example",
          "ca_lastrun": "2026-01-01 09:00:00",
          "ca_dialtimeout": "100",
          "ca_hosted": "example",
          "ca_tech": "example",
          "ca_message": "example",
          "ca_recording": "example",
          "ca_cr_id": "100",
          "ca_qu_id": "100",
          "ca_minfreeagents": "100",
          "ca_minemailrecording": "demo@example.com",
          "ca_retrytime": "100",
          "channelsforfreeagents": "0.00",
          "ca_confirmmessage_me_id": "100",
          "ca_maxcampaignnumbers": "5550100",
          "ca_statechange": "2026-01-01 09:00:00",
          "ca_channelsforfreeagents": "100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ],
            "numbers_count": {
              "count": "100"
            },
            "numbers_by_disposition": [
              {
                "cn_disposition": "example",
                "count": "100"
              }
            ],
            "binary_files": []
          }
        },
      },
    },
  ],
};

const conditionsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/conditions-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "conditions.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "co_id": "100",
            "co_te_id": "100",
            "co_name": "Demo",
            "co_type": "example",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const conditionsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/conditions-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "conditions.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "co_id": "100",
          "co_te_id": "100",
          "co_name": "Demo",
          "co_type": "example",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ],
            "extended_infos": [
              {
                "ce_id": "100",
                "ce_te_id": "100",
                "ce_co_id": "100",
                "ce_param1": "example",
                "ce_param2": "example"
              }
            ]
          }
        },
      },
    },
  ],
};

const conferenceroomsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/conferencerooms-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "conferencerooms.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "cr_id": "100",
            "cr_te_id": "100",
            "cr_number": "5550100",
            "cr_name": "Demo",
            "cr_hosted": "example",
            "cr_bookid": "100",
            "cr_rrid": "100",
            "cr_requestpinmeid": "100",
            "cr_pinenteredmeid": "100",
            "cr_adminpinenteredmeid": "100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const conferenceroomsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/conferencerooms-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "conferencerooms.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "cr_id": "100",
          "cr_te_id": "100",
          "cr_number": "5550100",
          "cr_name": "Demo",
          "cr_hosted": "example",
          "cr_bookid": "100",
          "cr_rrid": "100",
          "cr_requestpinmeid": "100",
          "cr_pinenteredmeid": "100",
          "cr_adminpinenteredmeid": "100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "meetme": {
              "bookid": "100",
              "confno": "example",
              "starttime": "2026-01-01 09:00:00",
              "endtime": "2026-01-01 09:00:00",
              "pin": "SYNTHETIC_SECRET",
              "adminpin": "SYNTHETIC_SECRET",
              "opts": "example",
              "adminopts": "example",
              "maxusers": "100",
              "members": "100"
            }
          }
        },
      },
    },
  ],
};

const cronjobsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/cronjobs-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "cronjobs.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "cr_id": "100",
            "cr_te_id": "100",
            "cr_type": "example",
            "cr_name": "Demo",
            "cr_no_id": "100",
            "cr_active": "example",
            "cr_minute": "100",
            "cr_hour": "100",
            "cr_day": "example",
            "cr_month": "example",
            "cr_weekday": "example",
            "cr_laststarted": "2026-01-01 09:00:00",
            "cr_lastended": "2026-01-01 09:00:00",
            "cr_once": "example",
            "cr_lastping": "2026-01-01 09:00:00",
            "cr_pid": "100",
            "cr_timezone": "example",
            "cr_year": "example",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const cronjobsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/cronjobs-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "cronjobs.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "cr_id": "100",
          "cr_te_id": "100",
          "cr_type": "example",
          "cr_name": "Demo",
          "cr_no_id": "100",
          "cr_active": "example",
          "cr_minute": "100",
          "cr_hour": "100",
          "cr_day": "example",
          "cr_month": "example",
          "cr_weekday": "example",
          "cr_laststarted": "2026-01-01 09:00:00",
          "cr_lastended": "2026-01-01 09:00:00",
          "cr_once": "example",
          "cr_lastping": "2026-01-01 09:00:00",
          "cr_pid": "100",
          "cr_timezone": "example",
          "cr_year": "example",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const customdestinationsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/customdestinations-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "customdestinations.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "cu_id": "100",
            "cu_te_id": "100",
            "cu_ct_id": "100",
            "cu_param1": "100",
            "id": 1
          }
        ],
      },
    },
  ],
};

const customdestinationsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/customdestinations-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "customdestinations.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "cu_id": "100",
          "cu_te_id": "100",
          "cu_ct_id": "100",
          "cu_param1": "100",
          "id": 1,
          "object": "example",
          "related": {
            "destinations": [],
            "extended_infos": [],
            "binary_files": []
          }
        },
      },
    },
  ],
};

const didsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/dids-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "dids.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "di_id": "100",
            "di_te_id": "100",
            "di_number": "5550100",
            "di_comment": "example",
            "di_fax": "example",
            "di_faxstationid": "example",
            "di_fax_store": "example",
            "di_maxchannels": "100",
            "di_ibid": "100",
            "di_notifyunassigned": "example",
            "di_minemailrecording": "demo@example.com",
            "di_dp_id": "100",
            "di_sms_store": "example",
            "di_faxprinturlformat": "example",
            "di_mmslinkauthprovider": "100",
            "di_fax_rp_id": "100",
            "id": 1,
            "name": "100"
          }
        ],
      },
    },
  ],
};

const didsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/dids-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "dids.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "di_id": "100",
          "di_te_id": "100",
          "di_number": "5550100",
          "di_comment": "example",
          "di_fax": "example",
          "di_faxstationid": "example",
          "di_fax_store": "example",
          "di_maxchannels": "100",
          "di_ibid": "100",
          "di_notifyunassigned": "example",
          "di_minemailrecording": "demo@example.com",
          "di_dp_id": "100",
          "di_sms_store": "example",
          "di_faxprinturlformat": "example",
          "di_mmslinkauthprovider": "100",
          "di_fax_rp_id": "100",
          "id": 1,
          "name": "100",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const disasListFixtures: DemoFixtureSet = {
  endpoint: "openapi/disas-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "disas.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "ds_id": "100",
            "ds_te_id": "100",
            "ds_name": "Demo",
            "ds_me_id": "100",
            "ds_pin": "SYNTHETIC_SECRET",
            "ds_outbound": "example",
            "ds_calleridnum": "5550100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const disasGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/disas-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "disas.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "ds_id": "100",
          "ds_te_id": "100",
          "ds_name": "Demo",
          "ds_me_id": "100",
          "ds_pin": "SYNTHETIC_SECRET",
          "ds_outbound": "example",
          "ds_calleridnum": "5550100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": []
        },
      },
    },
  ],
};

const featurecodesListFixtures: DemoFixtureSet = {
  endpoint: "openapi/featurecodes-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "featurecodes.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "fe_id": "100",
            "fe_te_id": "100",
            "fe_code": "example",
            "fe_comment": "example",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const featurecodesGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/featurecodes-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "featurecodes.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "fe_id": "100",
          "fe_te_id": "100",
          "fe_code": "example",
          "fe_comment": "example",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const flowsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/flows-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "flows.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "fl_id": "100",
            "fl_te_id": "100",
            "fl_name": "Demo",
            "fl_number": "example",
            "fl_monitor_type": "example",
            "fl_monitor_type_id": "100",
            "fl_monitor_parameter": "100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const flowsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/flows-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "flows.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "fl_id": "100",
          "fl_te_id": "100",
          "fl_name": "Demo",
          "fl_number": "example",
          "fl_monitor_type": "example",
          "fl_monitor_type_id": "100",
          "fl_monitor_parameter": "100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ],
            "state": {
              "st_extension": "example",
              "st_state": "example",
              "st_timestamp": "2026-01-01 09:00:00",
              "st_peername": "Demo"
            }
          }
        },
      },
    },
  ],
};

const huntlistsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/huntlists-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "huntlists.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "hu_id": "100",
            "hu_number": "5550100",
            "hu_name": "100",
            "hu_te_id": "100",
            "hu_type": "example",
            "hu_ringtime": "100",
            "hu_confirmmessage_id": "100",
            "hu_dialtimeout": "100",
            "id": 1,
            "name": "100"
          }
        ],
      },
    },
  ],
};

const huntlistsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/huntlists-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "huntlists.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "hu_id": "100",
          "hu_number": "5550100",
          "hu_name": "100",
          "hu_te_id": "100",
          "hu_type": "example",
          "hu_ringtime": "100",
          "hu_confirmmessage_id": "100",
          "hu_dialtimeout": "100",
          "id": 1,
          "name": "100",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const ivrsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/ivrs-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "ivrs.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "iv_id": "100",
            "iv_te_id": "100",
            "iv_name": "Demo",
            "iv_me_id": "100",
            "iv_timeout": "100",
            "iv_loopontimeout": "example",
            "iv_looponwrongkeypress": "example",
            "iv_allowdisa": "example",
            "iv_allowfeatures": "example",
            "iv_digittimeout": "100",
            "iv_allowcustom": "example",
            "iv_maxloops": "100",
            "iv_loopplaymessageonce": "example",
            "iv_ivrtype": "example",
            "iv_language": "example",
            "iv_minsilence": "100",
            "iv_silencethreshold": "100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const ivrsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/ivrs-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "ivrs.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "iv_id": "100",
          "iv_te_id": "100",
          "iv_name": "Demo",
          "iv_me_id": "100",
          "iv_timeout": "100",
          "iv_loopontimeout": "example",
          "iv_looponwrongkeypress": "example",
          "iv_allowdisa": "example",
          "iv_allowfeatures": "example",
          "iv_digittimeout": "100",
          "iv_allowcustom": "example",
          "iv_maxloops": "100",
          "iv_loopplaymessageonce": "example",
          "iv_ivrtype": "example",
          "iv_language": "example",
          "iv_minsilence": "100",
          "iv_silencethreshold": "100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const mediafilesListFixtures: DemoFixtureSet = {
  endpoint: "openapi/mediafiles-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "mediafiles.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "me_id": "100",
            "me_te_id": "100",
            "me_name": "Demo",
            "me_format": "example",
            "me_size": "100",
            "me_md5": "SYNTHETIC_SECRET",
            "me_type": "example",
            "me_volume": "0.00",
            "me_datetime": "2026-01-01 09:00:00",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const mediafilesGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/mediafiles-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "mediafiles.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "me_id": "100",
          "me_te_id": "100",
          "me_name": "Demo",
          "me_format": "example",
          "me_size": "100",
          "me_md5": "SYNTHETIC_SECRET",
          "me_type": "example",
          "me_volume": "0.00",
          "me_datetime": "2026-01-01 09:00:00",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": []
        },
      },
    },
  ],
};

const musiconholdsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/musiconholds-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "musiconholds.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "mu_id": "100",
            "mu_te_id": "100",
            "mu_name": "Demo",
            "mu_default": "example",
            "mu_volume": "100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const musiconholdsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/musiconholds-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "musiconholds.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "mu_id": "100",
          "mu_te_id": "100",
          "mu_name": "Demo",
          "mu_default": "example",
          "mu_volume": "100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ],
            "realtime": {
              "name": "100",
              "mode": "example",
              "application": "example",
              "format": "example",
              "stamp": "2026-01-01 09:00:00"
            },
            "entries": [
              {
                "name": "100",
                "position": "100",
                "entry": "example"
              }
            ],
            "default_setting": {
              "se_id": "100",
              "se_te_id": "100",
              "se_code": "example",
              "se_value": "100"
            }
          }
        },
      },
    },
  ],
};

const paginggroupsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/paginggroups-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "paginggroups.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "pa_id": "100",
            "pa_te_id": "100",
            "pa_number": "5550100",
            "pa_name": "Demo",
            "pa_pin": "SYNTHETIC_SECRET",
            "pa_bidirectional": "example",
            "pa_me_id": "100",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const paginggroupsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/paginggroups-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "paginggroups.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "pa_id": "100",
          "pa_te_id": "100",
          "pa_number": "5550100",
          "pa_name": "Demo",
          "pa_pin": "SYNTHETIC_SECRET",
          "pa_bidirectional": "example",
          "pa_me_id": "100",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const phonebooksListFixtures: DemoFixtureSet = {
  endpoint: "openapi/phonebooks-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "phonebooks.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "pb_id": "100",
            "pb_te_id": "100",
            "pb_name": "Demo",
            "pb_includeext": "example",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const phonebooksGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/phonebooks-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "phonebooks.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "pb_id": "100",
          "pb_te_id": "100",
          "pb_name": "Demo",
          "pb_includeext": "example",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": {
            "layout": [
              {
                "pl_id": "100",
                "pl_te_id": "100",
                "pl_pb_id": "100",
                "pl_pi_id": "100",
                "pl_order": "100",
                "pi_code": "example",
                "pi_name": "Demo"
              }
            ],
            "available_items": [
              {
                "pi_id": "100",
                "pi_code": "example",
                "pi_name": "Demo"
              }
            ],
            "entries_count": {
              "count": "100"
            }
          }
        },
      },
    },
  ],
};

const provisioningphonesListFixtures: DemoFixtureSet = {
  endpoint: "openapi/provisioningphones-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "provisioningphones.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "ph_id": "100",
            "ph_te_id": "100",
            "ph_pm_id": "100",
            "ph_mac": "00:00:5E:00:53:00",
            "ph_line0_ex_id": "100",
            "ph_line1_ex_id": "100",
            "ph_default": "example",
            "ph_active": "example",
            "id": 1
          }
        ],
      },
    },
  ],
};

const provisioningphonesGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/provisioningphones-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "provisioningphones.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "ph_id": "100",
          "ph_te_id": "100",
          "ph_pm_id": "100",
          "ph_mac": "00:00:5E:00:53:00",
          "ph_line0_ex_id": "100",
          "ph_line1_ex_id": "100",
          "ph_default": "example",
          "ph_active": "example",
          "id": 1,
          "object": "example",
          "related": {
            "button_layouts": [
              {
                "pl_id": "100",
                "pl_te_id": "100",
                "pl_ph_id": "100",
                "pl_bl_id": "100",
                "pl_order": "100"
              }
            ],
            "phonebooks": [
              {
                "pp_id": "100",
                "pp_te_id": "100",
                "pp_ph_id": "100",
                "pp_pb_id": "100",
                "pp_order": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const settingsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/settings-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "settings.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "se_id": "100",
            "se_te_id": "100",
            "se_code": "example",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const settingsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/settings-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "settings.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "se_id": "100",
          "se_te_id": "100",
          "se_code": "example",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": []
        },
      },
    },
  ],
};

const shortnumbersListFixtures: DemoFixtureSet = {
  endpoint: "openapi/shortnumbers-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "shortnumbers.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "sn_id": "100",
            "sn_te_id": "100",
            "sn_number": "example",
            "sn_destnumber": "example",
            "sn_comment": "example",
            "id": 1,
            "name": "Demo"
          }
        ],
      },
    },
  ],
};

const shortnumbersGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/shortnumbers-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], global: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "shortnumbers.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", global: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "sn_id": "100",
          "sn_te_id": "100",
          "sn_number": "example",
          "sn_destnumber": "example",
          "sn_comment": "example",
          "id": 1,
          "name": "Demo",
          "object": "example",
          "related": []
        },
      },
    },
  ],
};

const voicemailsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/voicemails-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "voicemails.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "uniqueid": "100",
            "te_id": "100",
            "context": "example",
            "mailbox": "5550100",
            "fullname": "Demo",
            "email": "demo@example.com",
            "attach": "example",
            "tzbytenant": "example",
            "deletevoicemail": "demo@example.com",
            "saycid": "example",
            "review": "example",
            "envelope": "example",
            "exitcontext": "example",
            "maxmsg": "100",
            "stamp": "2026-01-01 09:00:00",
            "welcomeoption": "example",
            "minsecs": "100",
            "maxsecs": "100",
            "transcript_store": "example",
            "onnewmessage": "example",
            "onnewmessageparam2": "example",
            "onnewmessageparam3": "example",
            "ivr_id": "100",
            "nextaftercmd": "example",
            "onnewmessageparam4": "example",
            "includeindbn": "example",
            "autodeleteolder": "example",
            "voicemailbackup": "demo@example.com",
            "id": 1,
            "name": "100"
          }
        ],
      },
    },
  ],
};

const voicemailsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/voicemails-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "voicemails.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "uniqueid": "100",
          "te_id": "100",
          "context": "example",
          "mailbox": "5550100",
          "fullname": "Demo",
          "email": "demo@example.com",
          "attach": "example",
          "tzbytenant": "example",
          "deletevoicemail": "demo@example.com",
          "saycid": "example",
          "review": "example",
          "envelope": "example",
          "exitcontext": "example",
          "maxmsg": "100",
          "stamp": "2026-01-01 09:00:00",
          "welcomeoption": "example",
          "minsecs": "100",
          "maxsecs": "100",
          "transcript_store": "example",
          "onnewmessage": "example",
          "onnewmessageparam2": "example",
          "onnewmessageparam3": "example",
          "ivr_id": "100",
          "nextaftercmd": "example",
          "onnewmessageparam4": "example",
          "includeindbn": "example",
          "autodeleteolder": "example",
          "voicemailbackup": "demo@example.com",
          "id": 1,
          "name": "100",
          "object": "example",
          "related": {
            "destinations": [
              {
                "de_id": "100",
                "de_te_id": "100",
                "de_type_src": "example",
                "de_type_id_src": "5550100",
                "de_type_dst": "example",
                "de_type_id_dst": "5550100",
                "de_ord": "100"
              }
            ]
          }
        },
      },
    },
  ],
};

const extensionsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/extensions-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "extensions.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "id": 1,
            "number": "5550100",
            "name": "Demo",
            "tech": "example"
          }
        ],
      },
    },
  ],
};

const extensionsGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/extensions-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "extensions.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "ex_id": "100",
          "ex_te_id": "100",
          "ex_name": "Demo",
          "ex_tech": "example",
          "ex_number": "5550100",
          "ex_tech_id": "100",
          "ex_cidnum": "5550100",
          "ex_cidname": "Demo",
          "ex_mindigitprefix": "100",
          "ex_maxdigitprefix": "100",
          "ex_fmfmdialtimeout": "100",
          "ex_fmfmdialmethod": "example",
          "ex_fmfmcallerid": "example",
          "ex_recording": "example",
          "ex_dialtimeout": "100",
          "ex_callgroup": "100",
          "ex_pickupgroup": "100",
          "ex_callallowed": "example",
          "ex_rp_id": "100",
          "ex_up_id": "100",
          "ex_datecreation": "2026-01-01 09:00:00",
          "ex_fmfmconfirmmessage_id": "100",
          "ex_minemailrecording": "demo@example.com",
          "ex_autocallerid": "example",
          "ex_cr_id": "100",
          "ex_description": "example",
          "ex_fmfmholdmessage_id": "100",
          "ex_mu_id": "100",
          "ex_fmfmdelay": "100",
          "ex_includeindbn": "example",
          "ex_dailycostlimit": "0.00",
          "ex_dailycostlimitdom": "0.00",
          "ex_dailycostlimitint": "0.00",
          "ex_routecostlimit": "0.00",
          "ex_dailycostwarning": "0.00",
          "ex_dailycostwarningdom": "0.00",
          "ex_dailycostwarningint": "0.00",
          "ex_cl_id": "100",
          "ex_includeinpb": "example",
          "ex_oncondition_id": "100",
          "ex_regexprefix": "example",
          "ex_dn_me_id": "100",
          "ex_outboundtimeout": "100",
          "ex_useragentsecurity": "example",
          "ex_sms_rp_id": "100",
          "ex_permit_fqdn": "example",
          "ex_prefixdefault": "example",
          "ex_regexprefixdefault": "example",
          "ex_monthlycostlimit": "0.00",
          "ex_monthlycostlimitdom": "0.00",
          "ex_monthlycostlimitint": "0.00",
          "ex_monthlycostwarning": "0.00",
          "ex_monthlycostwarningdom": "0.00",
          "ex_monthlycostwarningint": "0.00",
          "ex_workinghours": "100",
          "ex_fmfmonconditionid": "100",
          "ex_outboundrecordingmessage": "100",
          "ex_sw_id": "100",
          "ex_lastchange": "2026-01-01 09:00:00",
          "tenant_code": "TESTTENANT",
          "tenant_name": "Demo",
          "id": 1,
          "number": "5550100",
          "name": "Demo",
          "tech": "example",
          "username": "Demo",
          "state": "example",
          "tech_details": {
            "virtualextension": {
              "ve_id": "100",
              "ve_te_id": "100",
              "ve_name": "Demo",
              "ve_callerid": "example"
            },
            "items": []
          },
          "related": {
            "state": {
              "st_extension": "example",
              "st_state": "example",
              "st_timestamp": "2026-01-01 09:00:00",
              "st_peername": "Demo"
            },
            "sip_registrations": [],
            "pjsip_contacts": [],
            "callgroups": [
              {
                "cg_id": "100",
                "cg_te_id": "100",
                "cg_ex_id": "100",
                "cg_value": "100"
              }
            ],
            "pickupgroups": [
              {
                "pg_id": "100",
                "pg_te_id": "100",
                "pg_ex_id": "100",
                "pg_value": "100"
              }
            ],
            "destinations": [],
            "referenced_by_destinations": [],
            "queue_members": [],
            "allowed_queue_members": [],
            "userprofile": {
              "up_id": "100",
              "up_name": "Demo",
              "up_userpanel": "example"
            },
            "routing_profile": false,
            "sms_routing_profile": false,
            "client_rate": false,
            "callerid_regex": false,
            "callerid_regex_rules": [],
            "music_on_hold": false,
            "parkinglot": false,
            "conditions": [],
            "mediafiles": [],
            "phones": []
          },
          "st_state": "example"
        },
      },
    },
  ],
};

const extensionsGetByNumberFixtures: DemoFixtureSet = {
  endpoint: "openapi/extensions-get-by-number",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "extensions.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "ex_id": "100",
          "ex_te_id": "100",
          "ex_name": "Demo",
          "ex_tech": "example",
          "ex_number": "5550100",
          "ex_tech_id": "100",
          "ex_cidnum": "5550100",
          "ex_cidname": "Demo",
          "ex_mindigitprefix": "100",
          "ex_maxdigitprefix": "100",
          "ex_fmfmdialtimeout": "100",
          "ex_fmfmdialmethod": "example",
          "ex_fmfmcallerid": "example",
          "ex_recording": "example",
          "ex_dialtimeout": "100",
          "ex_callgroup": "100",
          "ex_pickupgroup": "100",
          "ex_callallowed": "example",
          "ex_rp_id": "100",
          "ex_up_id": "100",
          "ex_datecreation": "2026-01-01 09:00:00",
          "ex_fmfmconfirmmessage_id": "100",
          "ex_minemailrecording": "demo@example.com",
          "ex_autocallerid": "example",
          "ex_cr_id": "100",
          "ex_description": "example",
          "ex_fmfmholdmessage_id": "100",
          "ex_mu_id": "100",
          "ex_fmfmdelay": "100",
          "ex_includeindbn": "example",
          "ex_dailycostlimit": "0.00",
          "ex_dailycostlimitdom": "0.00",
          "ex_dailycostlimitint": "0.00",
          "ex_routecostlimit": "0.00",
          "ex_dailycostwarning": "0.00",
          "ex_dailycostwarningdom": "0.00",
          "ex_dailycostwarningint": "0.00",
          "ex_cl_id": "100",
          "ex_includeinpb": "example",
          "ex_oncondition_id": "100",
          "ex_regexprefix": "example",
          "ex_dn_me_id": "100",
          "ex_outboundtimeout": "100",
          "ex_useragentsecurity": "example",
          "ex_sms_rp_id": "100",
          "ex_permit_fqdn": "example",
          "ex_prefixdefault": "example",
          "ex_regexprefixdefault": "example",
          "ex_monthlycostlimit": "0.00",
          "ex_monthlycostlimitdom": "0.00",
          "ex_monthlycostlimitint": "0.00",
          "ex_monthlycostwarning": "0.00",
          "ex_monthlycostwarningdom": "0.00",
          "ex_monthlycostwarningint": "0.00",
          "ex_workinghours": "100",
          "ex_fmfmonconditionid": "100",
          "ex_outboundrecordingmessage": "100",
          "ex_sw_id": "100",
          "ex_lastchange": "2026-01-01 09:00:00",
          "tenant_code": "TESTTENANT",
          "tenant_name": "Demo",
          "id": 1,
          "number": "5550100",
          "name": "Demo",
          "tech": "example",
          "username": "Demo",
          "state": "example",
          "tech_details": {
            "virtualextension": {
              "ve_id": "100",
              "ve_te_id": "100",
              "ve_name": "Demo",
              "ve_callerid": "example"
            },
            "items": []
          },
          "related": {
            "state": {
              "st_extension": "example",
              "st_state": "example",
              "st_timestamp": "2026-01-01 09:00:00",
              "st_peername": "Demo"
            },
            "sip_registrations": [],
            "pjsip_contacts": [],
            "callgroups": [
              {
                "cg_id": "100",
                "cg_te_id": "100",
                "cg_ex_id": "100",
                "cg_value": "100"
              }
            ],
            "pickupgroups": [
              {
                "pg_id": "100",
                "pg_te_id": "100",
                "pg_ex_id": "100",
                "pg_value": "100"
              }
            ],
            "destinations": [],
            "referenced_by_destinations": [],
            "queue_members": [],
            "allowed_queue_members": [],
            "userprofile": {
              "up_id": "100",
              "up_name": "Demo",
              "up_userpanel": "example"
            },
            "routing_profile": false,
            "sms_routing_profile": false,
            "client_rate": false,
            "callerid_regex": false,
            "callerid_regex_rules": [],
            "music_on_hold": false,
            "parkinglot": false,
            "conditions": [],
            "mediafiles": [],
            "phones": []
          },
          "st_state": "example"
        },
      },
    },
  ],
};

const simplecdrsListFixtures: DemoFixtureSet = {
  endpoint: "openapi/simplecdrs-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], start: "*", end: "*", id: "*", uniqueid: "*", calleridnum: "*", calleridname: "*", disposition: "*", direction: "*", dialednum: "*", whoanswered: "*", phone: "*", minduration: "*", mintalktime: "*", format: "*", template: "*", contenttype: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "no-match-json",
      label: "No matching calls",
      basis: "Observed on the test PBX: a filter matching no calls (minduration=999999 in the probe) returned HTTP 200 with an empty JSON array `[]`, not an error (source-docs/DOCS_AUDIT.md OA-18). `999999` selects this case as a Demo convention; the value itself is not from the source.",
      when: { tenant: "*", start: "*", end: "*", id: "*", uniqueid: "*", calleridnum: "*", calleridname: "*", disposition: "*", direction: "*", dialednum: "*", whoanswered: "*", phone: "*", minduration: ["999999"], mintalktime: "*", format: "*", template: "*", contenttype: "*" },
      preset: { tenant: TENANT, minduration: "999999" },
      response: { status: 200, format: "json", contentType: "application/json", body: [] },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "simplecdrs.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", start: "*", end: "*", id: "*", uniqueid: "*", calleridnum: "*", calleridname: "*", disposition: "*", direction: "*", dialednum: "*", whoanswered: "*", phone: "*", minduration: "*", mintalktime: "*", format: "*", template: "*", contenttype: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "sc_te_id": "100",
            "tenantcode": "TESTTENANT",
            "sc_start": "2026-01-01 09:00:00",
            "sc_direction": "example",
            "sc_calleridnum": "5550100",
            "sc_dialednum": "5550100",
            "sc_disposition": "example",
            "sc_duration": "100",
            "sc_billsec": "100",
            "sc_uniqueid": "example"
          }
        ],
      },
    },
  ],
};

const phonebookentriesListFixtures: DemoFixtureSet = {
  endpoint: "openapi/phonebookentries-list",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], phonebook_id: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "phonebookentries.md documents no response. Observed on the test PBX only with a `phonebook_id` filter (without one, the request did not answer before the probe's timeout, so that combination is not reproduced here — source-docs/DOCS_AUDIT.md OA-18). Field names/shape are the probe's observed shape, trimmed of empty/null fields; the full observed schema is on the Reference page (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*", phonebook_id: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
          {
            "pe_id": "100",
            "pe_te_id": "100",
            "pe_pb_id": "100",
            "id": 1,
            "phonebook_id": 1,
            "object": "example",
            "values": {
              "NAME": "Demo",
              "PHONE3": "5550100"
            },
            "details": [
              {
                "pd_id": "100",
                "pd_te_id": "100",
                "pd_pe_id": "100",
                "pd_pi_id": "100",
                "pd_pi_value": "example",
                "pi_code": "example",
                "pi_name": "Demo"
              }
            ],
            "related": {
              "phonebook": {
                "pb_id": "100",
                "pb_te_id": "100",
                "pb_name": "Demo",
                "pb_includeext": "example"
              }
            }
          }
        ],
      },
    },
  ],
};

const phonebookentriesGetFixtures: DemoFixtureSet = {
  endpoint: "openapi/phonebookentries-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""] },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "found-json",
      label: "Found",
      basis: "phonebookentries.md documents no response; field names/shape are a legible subset of the Phase 8B Stage 2 probe's observed shape (source-docs/DOCS_AUDIT.md OA-14, OA-18), trimmed of fields the probe observed as empty/null on every row and of long numbered-field runs (kept to their first 2 members) — the full observed schema is on the Reference page itself (src/content/observed.ts). Fabricated example values.",
      when: { tenant: "*" },
      preset: { tenant: TENANT },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: {
          "pe_id": "100",
          "pe_te_id": "100",
          "pe_pb_id": "100",
          "id": 1,
          "phonebook_id": 1,
          "object": "example",
          "values": {
            "NAME": "Demo",
            "PHONE3": "5550100"
          },
          "details": [
            {
              "pd_id": "100",
              "pd_te_id": "100",
              "pd_pe_id": "100",
              "pd_pi_id": "100",
              "pd_pi_value": "example",
              "pi_code": "example",
              "pi_name": "Demo"
            }
          ],
          "related": {
            "phonebook": {
              "pb_id": "100",
              "pb_te_id": "100",
              "pb_name": "Demo",
              "pb_includeext": "example"
            }
          }
        },
      },
    },
  ],
};


// --- aianalysis-get (ai-analysis.md) ---

const ANALYSIS_ROW = {
  tenant_id: 1,
  tenant_code: TENANT,
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
};

const aianalysisFixtures: DemoFixtureSet = {
  endpoint: "openapi/aianalysis-get",
  evidence: "synthetic",
  cases: [
    {
      id: "tenant-omitted-json",
      label: "Tenant omitted",
      basis: "Observed on the test PBX: omitting `tenant` returned HTTP 401 `invalid_api_key`, the same code and (per _common.md ov:42) message documented for a mismatched key, not the documented `tenant_required` (source-docs/DOCS_AUDIT.md OA-15). Probed directly on one representative endpoint (extensions-list); applied here because the same auth check runs in front of every OpenAPI resource.",
      when: { tenant: [""], uniqueid: "*", key: "*" },
      preset: { tenant: "" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "invalid-key-json",
      label: "Invalid API key",
      basis: "_common.md ov:42, `invalid_api_key`: \"The supplied key does not match the tenant or global API key\" (DOCUMENTED). Envelope `{\"error\":{\"code\",\"message\"}}` observed on the test PBX (source-docs/DOCS_AUDIT.md OA-14). `DEMO_INVALID_KEY` is a Demo convention entered in the `key` query field, not from the source.",
      when: { tenant: "*", uniqueid: "*", key: ["DEMO_INVALID_KEY"] },
      preset: { tenant: TENANT, key: "DEMO_INVALID_KEY" },
      response: {
        status: 401,
        format: "json",
        contentType: "application/json",
        body: { error: { code: "invalid_api_key", message: "The supplied key does not match the tenant or global API key." } },
      },
    },
    {
      id: "no-match-json",
      label: "No analysis for the unique ID",
      basis: "Observed on the test PBX: a uniqueid with no analysis returned HTTP 200 with an empty JSON array `[]`, not an error (source-docs/DOCS_AUDIT.md OA-14, OA-18). `1700000000.00` selects this case as a Demo convention; the value itself is not from the source.",
      when: { tenant: "*", uniqueid: ["1700000000.00"], key: "*" },
      preset: { tenant: TENANT, uniqueid: "1700000000.00" },
      response: { status: 200, format: "json", contentType: "application/json", body: [] },
    },
    {
      id: "one-unknown-json",
      label: "One of two unique IDs unknown",
      basis: "ai-analysis.md Important Notes: \"Unknown unique IDs are omitted from the response.\" Two IDs are requested; only the known one returns a row. The second ID is a Demo convention, not from the source.",
      when: { tenant: "*", uniqueid: ["1700000000.42,1700000000.99"], key: "*" },
      preset: { tenant: TENANT, uniqueid: "1700000000.42,1700000000.99" },
      response: { status: 200, format: "json", contentType: "application/json", body: [ANALYSIS_ROW] },
    },
    {
      id: "found-json",
      label: "Analysis found (JSON)",
      basis: "ai-analysis.md: the documented example response for a matched uniqueid. The all-miss case (no uniqueid matches) is not shown on the source page, so only this one case is fixtured.",
      when: { tenant: "*", uniqueid: "*", key: "*" },
      preset: { tenant: TENANT, uniqueid: "1700000000.42" },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [ANALYSIS_ROW],
      },
    },
  ],
};

export const openapiDemoFixtures: readonly DemoFixtureSet[] = [
  extensionsStateFixtures,
  queuesListFixtures,
  queuesGetFixtures,
  aianalysisFixtures,
  // Phase 8B Stage 4 (docs/DECISIONS.md "Phase 8B planning and probe decisions",
  // and this session's resume): every other OpenAPI GET the probe returned
  // genuine data for. See the file header for scope and the evidence rules.
  calleridblacklistsListFixtures,
  calleridblacklistsGetFixtures,
  campaignnumbersListFixtures,
  campaignnumbersGetFixtures,
  campaignsListFixtures,
  campaignsGetFixtures,
  conditionsListFixtures,
  conditionsGetFixtures,
  conferenceroomsListFixtures,
  conferenceroomsGetFixtures,
  cronjobsListFixtures,
  cronjobsGetFixtures,
  customdestinationsListFixtures,
  customdestinationsGetFixtures,
  didsListFixtures,
  didsGetFixtures,
  disasListFixtures,
  disasGetFixtures,
  featurecodesListFixtures,
  featurecodesGetFixtures,
  flowsListFixtures,
  flowsGetFixtures,
  huntlistsListFixtures,
  huntlistsGetFixtures,
  ivrsListFixtures,
  ivrsGetFixtures,
  mediafilesListFixtures,
  mediafilesGetFixtures,
  musiconholdsListFixtures,
  musiconholdsGetFixtures,
  paginggroupsListFixtures,
  paginggroupsGetFixtures,
  phonebooksListFixtures,
  phonebooksGetFixtures,
  provisioningphonesListFixtures,
  provisioningphonesGetFixtures,
  settingsListFixtures,
  settingsGetFixtures,
  shortnumbersListFixtures,
  shortnumbersGetFixtures,
  voicemailsListFixtures,
  voicemailsGetFixtures,
  extensionsListFixtures,
  extensionsGetFixtures,
  extensionsGetByNumberFixtures,
  simplecdrsListFixtures,
  phonebookentriesListFixtures,
  phonebookentriesGetFixtures,
];
