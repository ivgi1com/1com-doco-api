import type { ApiDefinition, Category } from "../types";
import { calleridblacklistCategory } from "./calleridblacklists";
import { campaignCategory } from "./campaigns";
import { campaignnumberCategory } from "./campaignnumbers";
import { conditionCategory } from "./conditions";
import { conferenceroomCategory } from "./conferencerooms";
import { cronjobCategory } from "./cronjobs";
import { customdestinationCategory } from "./customdestinations";
import { dialCategory } from "./dial";
import { didCategory } from "./dids";
import { disaCategory } from "./disas";
import { featurecodeCategory } from "./featurecodes";
import { flowCategory } from "./flows";
import { huntlistCategory } from "./huntlists";
import { ivrCategory } from "./ivrs";
import { mediafileCategory } from "./mediafiles";
import { musiconholdCategory } from "./musiconholds";
import { paginggroupCategory } from "./paginggroups";
import { phonebookCategory } from "./phonebooks";
import { phonebookentryCategory } from "./phonebookentries";
import { provisioningphoneCategory } from "./provisioningphones";
import { queueCategory } from "./queues";
import { settingCategory } from "./settings";
import { shortnumberCategory } from "./shortnumbers";
import { tenantvariableCategory } from "./tenantvariables";
import { voicemailCategory } from "./voicemails";
import { extensionCategory } from "./extensions";
import { aianalysisCategory, ailogsCategory, cdrCategory, simplecdrCategory } from "./reporting";
import { OPENAPI_BASE_URL } from "./shared";

/**
 * MiRTA OpenAPI (`openapi.php`). One module per official resource page;
 * one sidebar category per resource, ordered by domain (reporting,
 * extensions, routing, media, dialing codes, campaigns, phone books,
 * tenant settings, system administration, actions). Operation inventory
 * and coverage: source-docs/openapi/operations.json,
 * tests/unit/openapi-coverage.test.ts.
 */
const categories: Category[] = [
  // Reporting
  cdrCategory,
  simplecdrCategory,
  aianalysisCategory,
  ailogsCategory,
  // Extensions
  extensionCategory,
  // Campaigns
  campaignCategory,
  campaignnumberCategory,
  // Call routing
  conditionCategory,
  flowCategory,
  huntlistCategory,
  customdestinationCategory,
  ivrCategory,
  // Media & conferencing
  conferenceroomCategory,
  mediafileCategory,
  musiconholdCategory,
  paginggroupCategory,
  voicemailCategory,
  // Numbers & dialing
  calleridblacklistCategory,
  didCategory,
  disaCategory,
  featurecodeCategory,
  // Call routing (continued)
  queueCategory,
  // Phone books & provisioning
  phonebookCategory,
  phonebookentryCategory,
  provisioningphoneCategory,
  // Numbers & dialing (continued)
  shortnumberCategory,
  // System
  cronjobCategory,
  settingCategory,
  tenantvariableCategory,
  // Actions
  dialCategory,
];

export const openapiApi: ApiDefinition = {
  id: "openapi",
  name: "1com Open API",
  version: "current",
  baseUrl: OPENAPI_BASE_URL,
  synthetic: false,
  defaultEndpoint: "simplecdrs-list",
  summary:
    "1com's REST-style API (openapi.php): one path per object, JSON bodies, and list/get/create/update/delete on most configuration objects. Authenticate with the X-API-Key header; tenant-scoped objects take a tenant parameter. Documented from the official API documentation; no operation has been tested against a real PBX yet. Operations that change state are documented here but never sent from the Playground.",
  categories: categories.filter((c) => c.endpoints.length > 0),
  menuOrder: ["dial", "simplecdr", "extension", "did", "queue", "huntlist", "mediafile"],
  menuHidden: ["provisioningphone", "setting"],
};
