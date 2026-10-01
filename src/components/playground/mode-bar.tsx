"use client";

import { FlaskConical, Radio } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PlaygroundMode } from "./use-playground";

const config: Record<
  PlaygroundMode,
  { icon: typeof Radio; tint: string; ink: string; label: string; text: string; switchLabel: string }
> = {
  live: {
    icon: Radio,
    tint: "bg-live-tint",
    ink: "text-live-ink",
    label: "liveLabel",
    text: "liveText",
    switchLabel: "switchToDemo",
  },
  demo: {
    icon: FlaskConical,
    tint: "bg-demo-tint",
    ink: "text-demo-ink",
    label: "demoLabel",
    text: "demoText",
    switchLabel: "switchToLive",
  },
};

export function ModeBar({
  mode,
  sending,
  liveAvailable,
  onRequestSwitch,
}: {
  mode: PlaygroundMode;
  sending: boolean;
  /** False when the selected operation has no Live target (default deny). */
  liveAvailable: boolean;
  onRequestSwitch: (target: PlaygroundMode) => void;
}) {
  const t = useTranslations("playground");
  const { icon: Icon, tint, ink, label, text, switchLabel } = config[mode];

  return (
    <div className={`sticky top-14 z-20 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border px-4 py-2 sm:px-6 lg:px-10 ${tint}`}>
      <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${ink}`}>
        <Icon className="size-3.5" aria-hidden />
        {t(label)}
      </span>
      <p className={`min-w-0 flex-1 text-sm ${ink}`}>{mode === "live" && !liveAvailable ? t("liveBlockedText") : t(text)}</p>
      <button
        type="button"
        disabled={sending}
        onClick={() => onRequestSwitch(mode === "live" ? "demo" : "live")}
        className={`h-8 shrink-0 rounded-md border border-current px-3 text-xs font-semibold transition-colors duration-150 hover:bg-bg/60 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent ${ink}`}
      >
        {t(switchLabel)}
      </button>
    </div>
  );
}
