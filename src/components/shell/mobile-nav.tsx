"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Drawer from the inline-start edge for widths below `xl`, built on the native
 * modal <dialog> (focus trap, Escape, inert background).
 */
export function MobileNav({ children }: { children: ReactNode }) {
  const t = useTranslations("nav");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  // Close after navigation.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label={t("menu")}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
        className="-ms-1 grid size-10 place-items-center rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink xl:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <dialog
        ref={dialogRef}
        aria-label={t("mainNav")}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="drawer fixed inset-y-0 start-0 m-0 h-dvh max-h-none w-[min(20rem,88vw)] max-w-none border-e border-border bg-bg p-0 text-ink backdrop:bg-black/40"
      >
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <span aria-hidden className="brand-mark block h-[20px] w-[42px] text-ink" />
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={() => dialogRef.current?.close()}
            className="grid size-10 place-items-center rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain px-3 py-4">{children}</div>
      </dialog>
    </>
  );
}
