"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/i18n/navigation";

/** Link that marks itself current when its href matches (or prefixes) the path. */
export function NavLink({
  href,
  match = "exact",
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & { href: string; match?: "exact" | "prefix" }) {
  const pathname = usePathname();
  const current =
    match === "exact" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return <Link href={href} aria-current={current ? "page" : undefined} {...rest} />;
}
