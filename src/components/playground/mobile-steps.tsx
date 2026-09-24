"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import type { PlaygroundState } from "./use-playground";

const steps = [
  { index: 0 as const, key: "stepEndpoint" as const },
  { index: 1 as const, key: "stepRequest" as const },
  { index: 2 as const, key: "stepResponse" as const },
];

export function MobileSteps({
  state,
  endpointPane,
  requestPane,
  responsePane,
}: {
  state: PlaygroundState;
  endpointPane: ReactNode;
  requestPane: ReactNode;
  responsePane: ReactNode;
}) {
  const t = useTranslations("playground");
  const { mobileStep, setMobileStep } = state;
  const panes = [endpointPane, requestPane, responsePane];

  return (
    <div className="flex flex-col md:hidden">
      <div role="tablist" className="flex border-b border-border">
        {steps.map((step) => (
          <button
            key={step.key}
            type="button"
            role="tab"
            aria-selected={mobileStep === step.index}
            onClick={() => setMobileStep(step.index)}
            className="flex-1 border-b-2 border-transparent px-2 py-2.5 text-xs font-semibold text-ink-muted aria-selected:border-accent aria-selected:text-accent"
          >
            {t(step.key)}
          </button>
        ))}
      </div>

      <div className="min-h-[24rem]">{panes[mobileStep]}</div>

      <div className="flex items-center justify-between gap-2 border-t border-border p-3">
        <button
          type="button"
          disabled={mobileStep === 0}
          onClick={() => setMobileStep((mobileStep - 1) as 0 | 1 | 2)}
          className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-ink disabled:opacity-40"
        >
          <ChevronLeft className="icon-directional size-4" aria-hidden />
          {steps[mobileStep - 1] ? t(steps[mobileStep - 1].key) : ""}
        </button>
        <button
          type="button"
          disabled={mobileStep === 2}
          onClick={() => setMobileStep((mobileStep + 1) as 0 | 1 | 2)}
          className="flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-ink disabled:opacity-40"
        >
          {steps[mobileStep + 1] ? t(steps[mobileStep + 1].key) : ""}
          <ChevronRight className="icon-directional size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
