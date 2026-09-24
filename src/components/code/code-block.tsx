import { highlight } from "@/lib/highlight";
import { CopyButton } from "./copy-button";

/** Single-language block. Always LTR and dark in both themes. */
export async function CodeBlock({
  code,
  lang,
  title,
  className = "",
}: {
  code: string;
  lang: string;
  title?: string;
  className?: string;
}) {
  const html = await highlight(code, lang);
  const lines = code.split("\n").length;
  return (
    <div dir="ltr" className={`overflow-hidden rounded-md border border-code-border bg-code-bg text-code-ink ${className}`}>
      <div className="flex h-10 items-center justify-between gap-2 border-b border-code-border ps-3 pe-1">
        <span className="truncate font-mono text-xs text-code-muted">{title ?? lang}</span>
        <CopyButton text={code} />
      </div>
      <div
        tabIndex={0}
        className={`code-body ${lines > 10 ? "with-lines" : ""}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
