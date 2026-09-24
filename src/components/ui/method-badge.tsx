import type { HttpMethod } from "@/content/types";

const methodVar: Record<HttpMethod, string> = {
  GET: "var(--method-get)",
  POST: "var(--method-post)",
  PUT: "var(--method-put)",
  PATCH: "var(--method-patch)",
  DELETE: "var(--method-delete)",
};

/** Fixed-width filled pill; the verb text is always present (MASTER.md "Method badges"). */
export function MethodBadge({
  method,
  size = "md",
}: {
  method: HttpMethod;
  size?: "sm" | "md";
}) {
  return (
    <span
      dir="ltr"
      className={`method-pill inline-flex shrink-0 items-center justify-center rounded-sm font-mono font-semibold uppercase text-method-ink ${
        size === "sm" ? "h-[18px] w-[3.25rem] text-[10px] tracking-wide" : "h-5 w-[3.75rem] text-[11px] tracking-wide"
      }`}
      style={{ backgroundColor: methodVar[method] }}
    >
      {method === "DELETE" ? "DEL" : method}
    </span>
  );
}
