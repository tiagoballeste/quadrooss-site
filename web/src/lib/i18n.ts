/*
 * Two languages: Portuguese at the current paths, English under /en.
 * The Cloudflare middleware (functions/_middleware.ts) sends a first visit to
 * the right one by country; the language menu stores the visitor's choice in
 * the qd_lang cookie, which the middleware then respects.
 */

export type Locale = "pt" | "en";

export const LOCALES: Locale[] = ["pt", "en"];
export const LANG_COOKIE = "qd_lang";

export const HTML_LANG: Record<Locale, string> = { pt: "pt-BR", en: "en-US" };
export const OG_LOCALE: Record<Locale, string> = { pt: "pt_BR", en: "en_US" };
export const LOCALE_LABEL: Record<Locale, string> = { pt: "PT-BR", en: "EN-US" };

export function localeFromPath(pathname: string | null | undefined): Locale {
  return pathname === "/en" || pathname?.startsWith("/en/") ? "en" : "pt";
}

/** "/en/work" → "/work", "/en" → "/". Portuguese paths come back unchanged. */
export function stripLocale(pathname: string): string {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

/** The same internal path in the given language. Hash and query are kept. */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const match = href.match(/^([^?#]*)(.*)$/);
  const path = stripLocale(match?.[1] || "/");
  const rest = match?.[2] ?? "";
  if (locale === "pt") return `${path}${rest}`;
  return `${path === "/" ? "/en" : `/en${path}`}${rest}`;
}

/** hreflang alternates for a Portuguese path, for page metadata. */
export function languageAlternates(path: string, locale: Locale) {
  return {
    canonical: localizePath(path, locale),
    languages: {
      "pt-BR": localizePath(path, "pt"),
      "en-US": localizePath(path, "en"),
      "x-default": localizePath(path, "en"),
    },
  };
}
