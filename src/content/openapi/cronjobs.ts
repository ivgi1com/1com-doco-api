import type { Category } from "../types";
import { f, openapiResource } from "./shared";

/**
 * Cron Job. Source: source-docs/openapi/cronjobs.md (official page
 * `cron-job`, rev #18). A scheduled task that fires a single destination on
 * a cron-style schedule.
 */

const [list, get, create, update, remove] = openapiResource({
  slug: "cronjobs",
  file: "cronjobs.md",
  page: "cron-job",
  category: "cronjob",
  singular: "cron job",
  plural: "cron jobs",
  path: "/cronjobs",
  idField: "cr_id",
  tenantScoped: true,
  globalFlag: true,
  aliases: ["/cronjob", "/cron_job", "/cron_jobs"],
  fields: [
    f("name", "Maps to `cr_name`.", { required: true, example: "Demo Nightly Job" }),
    f("type", "Maps to `cr_type`. Example value `\"CALL\"`; not stated exhaustive."),
    f("node_id", "PBX node reference. Maps to `cr_no_id`.", { type: "integer" }),
    f("active", "Maps to `cr_active`. Example values `\"yes\"`/`\"no\"`."),
    f("once", "Maps to `cr_once`."),
    f("minute", "Cron minute field. Maps to `cr_minute`. Standard cron syntax is assumed, not explicitly stated."),
    f("hour", "Cron hour field. Maps to `cr_hour`."),
    f("day", "Cron day-of-month field. Maps to `cr_day`."),
    f("month", "Cron month field. Maps to `cr_month`."),
    f("year", "Cron year field. Maps to `cr_year`."),
    f("weekday", "Cron weekday field. Maps to `cr_weekday`."),
    f("timezone", "Maps to `cr_timezone`. Example value `Europe/Rome`."),
    f("run", "Maps to `cr_run`."),
    f("destination", "`CRONJOB` destination: the action fired on schedule. Alias: `destinations`.", { type: "unknown" }),
  ],
  createExample: { name: "Demo Nightly Job", type: "CALL", active: "yes", minute: "0", hour: "2", timezone: "Europe/Rome" },
  updateExample: { active: "no" },
  errorCodes: ["missing_api_key", "invalid_api_key", "tenant_required", "read_only_api_key", "missing_required_field"],
  notes: [
    "No credential- or PII-shaped field is documented. A cron job can trigger arbitrary destinations on a schedule — an automation/business-logic concern rather than a data-exposure one. Security review is held at UNKNOWN pending schema confirmation; writes stay excluded from Live regardless (SEC-REQ-27).",
  ],
});

export const cronjobCategory: Category = { id: "cronjob", title: "Cron Job", endpoints: [list, get, create, update, remove] };
