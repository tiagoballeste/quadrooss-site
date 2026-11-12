import type { Metadata } from "next";
import { getUi } from "@/i18n/ui";
import { OG_LOCALE, languageAlternates, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site-config";

type PageMetadataInput = {
  locale: Locale;
  /** The page's Portuguese path, e.g. "/work". */
  path: string;
  title?: string;
  /** A full title that skips the "· Quadrooss" template (the home page). */
  absoluteTitle?: string;
  description?: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
  type?: "website" | "article";
};

/** Title, description, hreflang alternates and Open Graph for one page. */
export function pageMetadata({ locale, path, title, absoluteTitle, description, images, type = "website" }: PageMetadataInput): Metadata {
  const text = description ?? getUi(locale).meta.description;
  const shareTitle = absoluteTitle ?? (title ? `${title} — ${siteConfig.name}` : undefined);
  return {
    ...(absoluteTitle ? { title: { absolute: absoluteTitle } } : title ? { title } : {}),
    description: text,
    alternates: languageAlternates(path, locale),
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "en" ? "pt" : "en"],
      ...(shareTitle ? { title: shareTitle } : {}),
      description: text,
      ...(images ? { images } : {}),
    },
  };
}
