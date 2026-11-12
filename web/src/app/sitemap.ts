import type { MetadataRoute } from "next";
import { getGallerySlugs } from "@/lib/gallery";
import { localizePath } from "@/lib/i18n";
import { getJournalPosts } from "@/lib/journal";
import { siteConfig, siteNavigation } from "@/lib/site-config";

// Required by `output: "export"`: written once at build time.
export const dynamic = "force-static";

/** One entry per page and language, each pointing to its other language. */
function entry(path: string, priority: number, lastModified?: string): MetadataRoute.Sitemap {
  const languages = {
    "pt-BR": `${siteConfig.url}${localizePath(path, "pt")}`,
    "en-US": `${siteConfig.url}${localizePath(path, "en")}`,
  };
  return (["pt", "en"] as const).map((locale) => ({
    url: `${siteConfig.url}${localizePath(path, locale)}`,
    priority,
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", ...siteNavigation.map((item) => item.href)].flatMap((path) =>
    entry(path, path === "/" ? 1 : 0.8),
  );
  const posts = getJournalPosts()
    .filter((post) => post.hasPage)
    .flatMap((post) => entry(`/journal/${post.slug}`, 0.6, post.date));
  const galleries = getGallerySlugs().flatMap((slug) => entry(`/archive/${slug}`, 0.6));
  return [...pages, ...posts, ...galleries];
}
