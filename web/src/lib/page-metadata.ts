import type { Metadata } from "next";
import { getUi } from "@/i18n/ui";
import { OG_LOCALE, languageAlternates, type Locale } from "@/lib/i18n";
import { siteConfig } from "@/lib/site-config";

type PageMetadataInput = {
  locale: Locale;
  /** The page's Portuguese path, e.g. "/work". */
  path: string;
  title?: string;
  description?: string;
  images?: NonNullable<Metadata["openGraph"]>["images"];
  type?: "website" | "article";
};

/** Title, description, hreflang alternates and Open Graph for one page. */
export function pageMetadata({ locale, path, title, description, images, type = "website" }: PageMetadataInput): Metadata {
  const text = description ?? getUi(locale).meta.description;
  return {
    ...(title ? { title } : {}),
    description: text,
    alternates: languageAlternates(path, locale),
    openGraph: {
      type,
      siteName: siteConfig.name,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "en" ? "pt" : "en"],
      ...(title ? { title: `${title} — ${siteConfig.name}` } : {}),
      description: text,
      ...(images ? { images } : {}),
    },
  };
}
