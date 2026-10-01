/**
 * Date and date-time field values (Phase 8E, brief item 7).
 *
 * A picker only changes how the user chooses a value; the string that goes
 * into the request is the exact documented format, composed here with no
 * timezone conversion (no timezone is documented for these fields). A
 * value that is not in the documented format is not rewritten: the field
 * falls back to plain text so nothing the user typed is silently changed.
 */

export type DateFormat = "date" | "datetime";

export interface DateParts {
  /** `YYYY-MM-DD`, or "" when unset. */
  date: string;
  /** `HH:MM:SS`, or "" when unset (date-time fields only). */
  time: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}:\d{2}$/;

/** Splits a stored value into picker parts; `null` when the value is non-empty and not in the documented format. */
export function parseDateValue(value: string, format: DateFormat): DateParts | null {
  const v = value.trim();
  if (v === "") return { date: "", time: "" };
  if (format === "date") return DATE.test(v) ? { date: v, time: "" } : null;
  const [date, time, ...rest] = v.split(" ");
  if (rest.length || !DATE.test(date ?? "") || !TIME.test(time ?? "")) return null;
  return { date, time };
}

/**
 * Composes the documented string from picker parts. A date-time with a date
 * but no time takes `defaultTime` (the documented default for that field,
 * e.g. 00:00:00 for `start`, 23:59:59 for `end`); with no date it is empty.
 */
export function composeDateValue(parts: DateParts, format: DateFormat, defaultTime = "00:00:00"): string {
  if (!parts.date) return "";
  if (format === "date") return parts.date;
  return `${parts.date} ${parts.time || defaultTime}`;
}

/** The documented default time of day for a field, from its name (`end` -> 23:59:59), else midnight. */
export function defaultTimeFor(name: string): string {
  return /^(end|dateend|enddate)$/i.test(name) ? "23:59:59" : "00:00:00";
}
