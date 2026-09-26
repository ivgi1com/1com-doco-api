import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * IVR. Source: source-docs/openapi/ivrs.md (official page `ivr`, rev #18).
 * An interactive voice response menu: prompt media file, timeouts, and
 * per-digit call-flow destinations.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "ivrs",
  file: "ivrs.md",
  page: "ivr",
  category: "ivr",
  singular: "IVR",
  plural: "IVRs",
  path: "/ivrs",
  idField: "iv_id",
  scope: "Tenant API key",
  tenantScoped: true,
  fields: [
    f("name", "Maps to `iv_name`.", { required: true, example: "Demo IVR" }),
    f("mediafile_id", "References a Media File object (the prompt). Maps to `iv_me_id`.", { type: "integer" }),
    f("timeout", "Maps to `iv_timeout`. Unit assumed seconds by naming convention, not stated.", { type: "integer" }),
    f("digit_timeout", "Maps to `iv_digittimeout`. Unit assumed seconds by naming convention, not stated.", { type: "integer" }),
    f(
      "destinations",
      "Per-key call-flow destinations, one string or array per type, or a `destinations` object keyed by destination type. Digit keys `IVR_0`-`IVR_9` (aliases `ivr_<n>`/`key_<n>`/`<n>`), `IVR_STAR` (`star`), `IVR_SHARP` (`sharp`), `IVR_WRONG` (`wrong`), `IVR_TIMEOUT` (`timeout`), `IVR_HANGUP` (`hangup`), `IVR_FEATURE` (`feature`), `IVR_EXTENSION` (`extension`), `IVR_MEDIAFILE` (`mediafile`), `IVR_OPTIONSMEDIAFILE` (`optionsmediafile`), plus custom `CUSTOMIVR_<name>` destinations (e.g. `CUSTOMIVR_SUPPORT`) matched by name.",
      { type: "object" },
    ),
  ],
  createExample: { name: "Demo IVR", mediafile_id: 22, timeout: 5, digit_timeout: 3 },
  updateExample: { timeout: 8 },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "No credential- or PII-shaped field is documented for this object itself. `mediafile_id` references a Media File object, whose own content is out of scope here. Security review is held at UNKNOWN pending schema confirmation.",
  ],
});

export const ivrCategory: Category = { id: "ivr", title: "IVR", endpoints: [list, get, create, update, remove] };
