import type { MetadataRoute } from "next";
import { getGallerySlugs } from "@/lib/gallery";
import { getJournalPosts } from "@/lib/journal";
import { siteConfig, siteNavigation } from "@/lib/site-config";

// Required by `output: "export"`: written once at build time.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...siteNavigation.map((item) => item.href)];
  const pages: MetadataRoute.Sitemap = paths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
  const posts: MetadataRoute.Sitemap = getJournalPosts()
    .filter((post) => post.hasPage)
    .map((post) => ({ url: `${siteConfig.url}${post.href}`, lastModified: post.date, priority: 0.6 }));
  const galleries: MetadataRoute.Sitemap = getGallerySlugs().map((slug) => ({
    url: `${siteConfig.url}/archive/${slug}`,
    priority: 0.6,
  }));
  return [...pages, ...posts, ...galleries];
}
