import { notFound } from "next/navigation";

/**
 * Catches any URL under a valid locale that matches no page. Without this,
 * Next.js can't tell the request belongs under `[locale]/` at all, so it
 * renders its built-in generic 404 instead of `[locale]/not-found.tsx`
 * (chrome-less, unlocalized). This route enters that tree and immediately
 * defers to the nested boundary.
 */
export default function CatchAll(): never {
  notFound();
}
