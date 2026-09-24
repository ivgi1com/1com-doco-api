"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

/** Page feedback. Prototype: the answer is kept in component state only; nothing is sent. */
export function Feedback() {
  const t = useTranslations("endpoint");
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted" aria-live="polite">
      {answer ? (
        <p>{t("thanks")}</p>
      ) : (
        <>
          <p>{t("helpful")}</p>
          <div className="flex gap-2">
            {(["yes", "no"] as const).map((value) => {
              const Icon = value === "yes" ? ThumbsUp : ThumbsDown;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAnswer(value)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-control/70 px-3 font-semibold text-ink transition-colors duration-150 hover:border-accent hover:text-accent"
                >
                  <Icon className="size-3.5" aria-hidden />
                  {t(value)}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
