import { Fragment } from "react";
import { CodeBlock } from "@/components/code/code-block";
import { Callout } from "@/components/ui/callout";
import { getApi, getEndpoint } from "@/content";
import type { Guide, GuideBlock } from "@/content/guides";
import { Link } from "@/i18n/navigation";
import { customerText } from "@/lib/customer-text";
import { buildSample, sampleLanguages } from "@/lib/code-samples";

/** Renders `backtick` spans as inline code; everything else is plain text (no HTML). Internal evidence references are dropped (customer-text.ts). */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {customerText(text).split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="prose-code">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

function Block({ block, guide }: { block: GuideBlock; guide: Guide }) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p>
          <InlineText text={block.text} />
        </p>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1 ps-5">
          {block.items.map((item, i) => (
            <li key={i}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    case "callout":
      return (
        <Callout kind={block.tone} title={block.title && customerText(block.title)}>
          <p>
            <InlineText text={block.text} />
          </p>
        </Callout>
      );
    case "code":
      return <CodeBlock code={block.code} lang={block.lang} title={block.title} />;
    case "sample": {
      // Integrity of these references is enforced by tests/unit/guides.test.ts.
      const api = getApi(guide.apiId)!;
      const endpoint = getEndpoint(guide.apiId, block.endpoint)!;
      const lang = sampleLanguages.find((l) => l.id === block.language)!;
      return (
        <CodeBlock code={buildSample(endpoint, api.baseUrl, block.language)} lang={lang.shiki} title={block.title ?? lang.label} />
      );
    }
    case "endpoints":
      return (
        <ul className="space-y-1">
          {block.ids.map((id) => {
            const endpoint = getEndpoint(guide.apiId, id)!;
            return (
              <li key={id}>
                <Link href={`/reference/${guide.apiId}/${id}`} className="text-accent underline">
                  {customerText(endpoint.title)}
                </Link>{" "}
                <span className="font-mono text-xs text-ink-muted">
                  {endpoint.method} {Object.entries(endpoint.fixedQuery ?? {}).map(([k, v]) => `${k}=${v}`).join("&") || endpoint.path}
                </span>
              </li>
            );
          })}
        </ul>
      );
  }
}

export function GuideBody({ guide }: { guide: Guide }) {
  return (
    <>
      {guide.sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`} className="scroll-mt-20 space-y-3">
          <h2 id={`${section.id}-h`} className="text-xl font-semibold text-ink">
            {customerText(section.title)}
          </h2>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} guide={guide} />
          ))}
        </section>
      ))}
    </>
  );
}
