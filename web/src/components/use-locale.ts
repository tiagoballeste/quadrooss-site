"use client";

import { usePathname } from "next/navigation";
import { getUi } from "@/i18n/ui";
import { localeFromPath } from "@/lib/i18n";

/** The page's language, read from its path (/en/... is English). */
export function useLocale() {
  return localeFromPath(usePathname());
}

export function useUi() {
  return getUi(useLocale());
}
