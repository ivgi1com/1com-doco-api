"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  label,
  className = "",
  tone = "code",
}: {
  text: string;
  label?: string;
  className?: string;
  tone?: "code" | "surface";
}) {
  const t = useTranslations("code");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = async () => {
    if (!(await copyText(text))) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  const toneClass =
    tone === "code"
      ? "text-code-muted hover:bg-code-surface hover:text-code-ink"
      : "text-ink-muted hover:bg-surface-2 hover:text-ink";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label ?? t("copyCode")}
      className={`inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold transition-colors duration-150 ${toneClass} ${className}`}
    >
      {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
    </button>
  );
}
