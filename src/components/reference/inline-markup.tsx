import { Fragment } from "react";
import { customerText } from "@/lib/customer-text";

/** Renders `backtick` spans in content strings as inline code (LTR-isolated); internal evidence references are dropped (customer-text.ts). */
export function InlineMarkup({ text }: { text: string }) {
  const parts = customerText(text).split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="prose-code">
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
