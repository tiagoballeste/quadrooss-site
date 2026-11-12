"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { HTML_LANG, localeFromPath } from "@/lib/i18n";

/**
 * Keeps <html lang> in step with the page's language on client navigations.
 * The first load already gets the right value from the Cloudflare middleware.
 */
export function HtmlLang() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[localeFromPath(pathname)];
  }, [pathname]);
  return null;
}
