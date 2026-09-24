"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import type { PlaygroundMode } from "./use-playground";

/** Explicit confirmation before switching Playground mode (MASTER.md "Playground"). */
export function ModeConfirmDialog({
  target,
  onCancel,
  onConfirm,
}: {
  target: PlaygroundMode | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("playground");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (target && !dialog.open) dialog.showModal();
    else if (!target && dialog.open) dialog.close();
  }, [target]);

  const title = target === "live" ? t("switchConfirmTitle") : t("switchConfirmDemoTitle");
  const body = target === "live" ? t("switchConfirmBody") : t("switchConfirmDemoBody");

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="mode-confirm-title"
      onClose={onCancel}
      onClick={(e) => e.target === dialogRef.current && onCancel()}
      className="mx-auto mt-[20vh] w-[min(26rem,calc(100vw-2rem))] rounded-lg border border-border bg-raised p-0 text-ink shadow-overlay backdrop:bg-black/40"
    >
      <div className="p-5">
        <h2 id="mode-confirm-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">{body}</p>
      </div>
      <div className="flex justify-end gap-2 border-t border-border px-5 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-md px-3 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="h-9 rounded-md bg-accent px-3 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
        >
          {t("confirm")}
        </button>
      </div>
    </dialog>
  );
}
