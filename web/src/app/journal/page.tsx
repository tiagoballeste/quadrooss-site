import type { Metadata } from "next";
import { CargoNav } from "@/components/cargo/cargo-shell";
import type { JournalCardData } from "@/components/journal-card";
import { JournalCta } from "@/components/journal-cta";
import { JournalIndex, type JournalSection } from "@/components/journal-index";
import { SiteFooter } from "@/components/site-footer";
import {
  getFeaturedPost,
  getJournalPosts,
  getPostTag,
  seriesAnchor,
  type JournalPost,
} from "@/lib/journal";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Um feed contínuo com anotações, o diário de bordo do mochilão pela Europa e a curadoria musical que ando fazendo.",
};

function toCard(post: JournalPost): JournalCardData {
  return {
    slug: post.slug,
    title: post.title,
    dateLabel: post.dateLabel,
    duration: post.duration,
    excerpt: post.excerpt,
    href: post.href,
    hasPage: post.hasPage,
    thumbnail: post.thumbnail,
    tag: getPostTag(post),
  };
}

export default function JournalPage() {
  const posts = getJournalPosts();
  const featured = getFeaturedPost(posts.filter((post) => post.type === "vlog"));
  const vlogs = posts.filter((post) => post.type === "vlog");
  const sets = posts.filter((post) => post.type === "set");

  const sections: JournalSection[] = [];
  const seriesNames = [...new Set(vlogs.map((post) => post.series).filter((name): name is string => !!name))];

  for (const name of seriesNames) {
    const inSeries = vlogs.filter((post) => post.series === name);
    sections.push({
      id: seriesAnchor(name),
      title: name,
      note: `${inSeries.length} episódios`,
      kind: "vlog",
      posts: inSeries
        .filter((post) => post.slug !== featured?.slug)
        .sort((a, b) => (b.episode ?? 0) - (a.episode ?? 0))
        .map(toCard),
    });
  }

  const looseVlogs = vlogs.filter((post) => !post.series && post.slug !== featured?.slug);
  if (looseVlogs.length) {
    sections.push({ id: "vlogs", title: "Vlogs", note: `${looseVlogs.length} vlogs`, kind: "vlog", posts: looseVlogs.map(toCard) });
  }

  if (sets.length) {
    sections.push({ id: "sets", title: "Sets", note: `${sets.length} sets`, kind: "set", posts: sets.map(toCard) });
  }

  const featuredCard = featured
    ? {
        ...toCard(featured),
        place: featured.place,
        kicker: ["Vlog", featured.series, featured.episode ? `Ep. ${String(featured.episode).padStart(2, "0")}` : null]
          .filter(Boolean)
          .join(" · "),
      }
    : null;

  return (
    <main className="cargo-page work-index-page journal-page">
      <CargoNav />
      <JournalIndex
        counts={{ all: posts.length, vlog: vlogs.length, set: sets.length }}
        featured={featuredCard}
        sections={sections}
      />
      <JournalCta />
      <SiteFooter />
    </main>
  );
}
