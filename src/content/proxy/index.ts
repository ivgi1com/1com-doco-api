import type { ApiDefinition } from "../types";
import {
  agentCategory,
  atxtransferCategory,
  channelCategory,
  channelsCategory,
  countcallsCategory,
  countchannelsCategory,
  hangupCategory,
  transferCategory,
} from "./calls";
import { cdrCategory } from "./cdr";
import { dialCategory } from "./dial";
import {
  blfsCategory,
  countpeersCategory,
  peersCategory,
  rebootCategory,
  unregisterCategory,
  virtualextCategory,
} from "./extensions";
import { infoCategory } from "./info";
import { managedbCategory } from "./managedb";
import {
  campaignCategory,
  flowsCategory,
  queueCategory,
  queueresetCategory,
  setflowCategory,
} from "./queues";
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
  categories: [
    infoCategory,
    agentCategory,
    atxtransferCategory,
    blfsCategory,
    campaignCategory,
    cdrCategory,
    channelCategory,
    channelsCategory,
    countcallsCategory,
    countchannelsCategory,
    countpeersCategory,
    dialCategory,
    flowsCategory,
    hangupCategory,
    managedbCategory,
    peersCategory,
    queueCategory,
    queueresetCategory,
    rebootCategory,
    setflowCategory,
    transferCategory,
    unregisterCategory,
    virtualextCategory,
  ],
};
