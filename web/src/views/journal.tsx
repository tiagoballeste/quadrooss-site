import { CargoNav } from "@/components/cargo/cargo-shell";
import { JournalCta } from "@/components/journal-cta";
import { JournalIndex, type JournalItem } from "@/components/journal-index";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import type { Locale } from "@/lib/i18n";
import { getFeaturedPost, getJournalPosts, type JournalPost } from "@/lib/journal";
import { pageMetadata } from "@/lib/page-metadata";

export const journalMetadata = (locale: Locale) =>
  pageMetadata({ locale, path: "/journal", title: "Journal", description: getUi(locale).meta.journal });

function toItem(post: JournalPost): JournalItem {
  const lead =
    post.type === "set"
      ? ["DJ set", post.credit]
      : [post.episode ? `Ep. ${String(post.episode).padStart(2, "0")}` : "Vlog", post.place];

  return {
    slug: post.slug,
    type: post.type,
    title: post.title,
    subtitle: [...lead, post.duration].filter(Boolean).join(" · "),
    series: post.series,
    place: post.place,
    credit: post.credit,
    dateLabel: post.dateLabel,
    duration: post.duration,
    excerpt: post.excerpt,
    bodyHtml: post.bodyHtml,
    hasPage: post.hasPage,
    pageHref: post.href,
    youtube: post.youtube,
    videoId: post.videoId,
    thumbnail: post.thumbnail,
  };
}

export function JournalView({ locale }: { locale: Locale }) {
  const posts = getJournalPosts(locale);
  const vlogs = posts.filter((post) => post.type === "vlog");
  const sets = posts.filter((post) => post.type === "set");
  const featured = getFeaturedPost(vlogs);

  // Same idea as the Work catalog: the featured post opens the grid, then the
  // vlogs from newest to oldest, then the sets.
  const ordered = [
    ...(featured ? [featured] : []),
    ...vlogs.filter((post) => post.slug !== featured?.slug),
    ...sets,
  ];

  return (
    <main className="cargo-page work-index-page journal-page">
      <CargoNav />
      <JournalIndex items={ordered.map(toItem)} />
      <JournalCta />
      <SiteFooter />
    </main>
  );
}
