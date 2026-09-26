import type { DemoFixtureSet } from "./types";

/**
 * Synthetic Demo fixtures for the MiRTA OpenAPI (Phase 8 Stage 3). Per the
 * approved scope (docs/DECISIONS.md "Phase 8 planning"), only the 3
 * resources with both a documented response schema and no categorical
 * Live/Demo exclusion get a fixture: Extension State, AI Logs, AI Analysis.
 * Every other OpenAPI GET falls back to "Demo data not available" and every
 * write stays Reference-only (SEC-REQ-27).
 *
 * Each case's body is the same values already used as the endpoint's own
 * documented response example in src/content/openapi/{extensions,
 * reporting}.ts — those were already normalized to the project's synthetic
 * conventions at Stage 1 (`TESTTENANT`, `555-01xx`, "Demo Caller"), so
 * reusing them here introduces no new data. Only the one documented
 * scenario per endpoint is fixtured; anything the source page doesn't show
 * a worked example for (e.g. an unregistered extension, a `csv` AI Logs
 * export, or an all-miss AI Analysis query) resolves to "Not simulated".
 */

const TENANT = "TESTTENANT";

// --- extensions-state-get (extension-state.md) ---

const extensionsStateFixtures: DemoFixtureSet = {
  endpoint: "openapi/extensions-state-get",
  evidence: "synthetic",
  cases: [
    {
      id: "registered-json",
      label: "Registered, active channel",
      basis: "extension-state.md: the documented example response, a registered extension with an active channel. The no-active-channel and not-registered variants are documented in prose only, with no worked example, so only this one case is fixtured.",
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

// --- ailogs-list (ai-logs.md) ---

const ailogsFixtures: DemoFixtureSet = {
  endpoint: "openapi/ailogs-list",
  evidence: "synthetic",
  cases: [
    {
      id: "found-json",
      label: "AI logs found (JSON)",
      basis: "ai-logs.md: the documented example response. CSV output's column order is documented as the same field order as JSON but not independently verified, so only the JSON case is fixtured; an explicit csv format isn't simulated.",
      when: {
        tenant: "*",
        start: "*",
        end: "*",
        id: "*",
        uniqueid: "*",
        callerid: "*",
        customid: "*",
        format: ["", "json"],
        key: "*",
      },
      preset: { tenant: TENANT, format: "json" },
      response: {
        status: 200,
        format: "json",
        contentType: "application/json",
        body: [
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
      },
    },
  ],
};

// --- aianalysis-get (ai-analysis.md) ---

const aianalysisFixtures: DemoFixtureSet = {
  endpoint: "openapi/aianalysis-get",
  evidence: "synthetic",
  cases: [
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
        body: [
          {
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
          },
        ],
      },
    },
  ],
};

export const openapiDemoFixtures: readonly DemoFixtureSet[] = [extensionsStateFixtures, ailogsFixtures, aianalysisFixtures];
