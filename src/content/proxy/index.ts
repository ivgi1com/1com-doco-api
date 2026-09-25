import type { ApiDefinition } from "../types";
import { cdrCategory } from "./cdr";
import { dialCategory } from "./dial";
import { infoCategory } from "./info";
import { managedbCategory } from "./managedb";
import { PROXY_BASE_URL } from "./shared";

/**
 * The Proxy API (`proxyapi.php`). One module per reqtype; the sidebar is
 * grouped by reqtype (user decision, Phase 7 Stage 1 — the source defines
 * no categories). Operation inventory and coverage:
 * source-docs/proxy-api/operations.json, tests/unit/proxy-coverage.test.ts.
 */
export const proxyApi: ApiDefinition = {
  id: "proxy",
  name: "Proxy API",
  version: "legacy",
  baseUrl: PROXY_BASE_URL,
  synthetic: false,
  summary:
    "1com's HTTP API for MiRTA PBX (proxyapi.php). One URL; the reqtype query parameter (plus an action, info, object or subreqtype value) selects the operation. Operations are grouped by reqtype. Operations that change state are documented here but never sent from the Playground.",
  // INFO first (it holds the Phase 4–6 Live/Demo operations), then alphabetical.
  categories: [infoCategory, cdrCategory, dialCategory, managedbCategory],
};
