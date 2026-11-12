import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { JournalCard } from "@/components/journal-card";
import { JournalCta } from "@/components/journal-cta";
import { JournalPlayer } from "@/components/journal-player";
import { TransitionLink } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import type { Locale } from "@/lib/i18n";
import {
  getJournalPost,
  getJournalPosts,
  getPostTag,
  getSeriesPosts,
  seriesAnchor,
  type JournalPost,
} from "@/lib/journal";
import { journalCoverName } from "@/lib/journal-names";
import { pageMetadata } from "@/lib/page-metadata";

export function journalPostParams() {
  return getJournalPosts()
    .filter((post) => post.hasPage)
    .map((post) => ({ slug: post.slug }));
}

export function journalPostMetadata(slug: string, locale: Locale) {
  const post = getJournalPost(slug, locale);
  if (!post) return {};
  const image = post.thumbnail.src.startsWith("/") ? [{ url: post.thumbnail.src, width: 1280 }] : undefined;
  return pageMetadata({
    locale,
    path: `/journal/${slug}`,
    title: post.title,
    description: post.excerpt,
    images: image,
    type: "article",
  });
}

function toCard(post: JournalPost) {
  return { ...post, tag: getPostTag(post) };
}

export function JournalPostView({ slug, locale }: { slug: string; locale: Locale }) {
  const post = getJournalPost(slug, locale);
  if (!post) notFound();
  const ui = getUi(locale);

  const all = getJournalPosts(locale);
  const series = post.series ? getSeriesPosts(all, post.series) : [];
  const position = series.findIndex((item) => item.slug === post.slug);
  const previous = position > 0 ? series[position - 1] : null;
  const next = position >= 0 && position < series.length - 1 ? series[position + 1] : null;
  const neighbour = previous ?? next;

  // Up to three more posts: earlier episodes of the same series first, then the newest of the rest.
  const more = [
    ...series.slice(0, Math.max(position, 0)).reverse(),
    ...all.filter((item) => item.series !== post.series),
  ]
    .filter((item) => item.slug !== post.slug && item.slug !== neighbour?.slug)
    .slice(0, 3);

  const kicker = [post.type === "set" ? "DJ set" : "Vlog", post.series].filter(Boolean).join(" · ");
  const episodeLabel = post.episode && series.length ? `Ep. ${String(post.episode).padStart(2, "0")} / ${String(series.length).padStart(2, "0")}` : null;

  return (
    <main className="cargo-page journal-page journal-post-page">
      <CargoNav />

      <article className="journal-post">
        <TransitionLink className="journal-post__back" href="/journal">
          {ui.journal.back}
        </TransitionLink>

        <header className="journal-post__opening">
          {/* Same name as the Journal card: the cover flies in from the grid. */}
          <ViewTransition name={journalCoverName(post.slug)} share={{ "journal-open": "journal-morph", default: "none" }} default="none">
            <img
              alt=""
              className="journal-post__cover"
              decoding="async"
              fetchPriority="high"
              sizes="(max-width: 900px) 100vw, 50vw"
              src={post.thumbnail.src}
              srcSet={post.thumbnail.srcSet ?? undefined}
            />
          </ViewTransition>
          <div className="journal-post__intro">
            <p className="journal-post__kicker">
              <span>{kicker}</span>
              {episodeLabel ? <span>{episodeLabel}</span> : null}
            </p>
            <h1 className="journal-post__title">{post.title}</h1>
            <p className="journal-post__lead">{post.excerpt}</p>
            <dl className="journal-post__facts">
              <div>
                <dt>{ui.journal.date}</dt>
                <dd>{post.dateLabel}</dd>
              </div>
              <div>
                <dt>{ui.journal.duration}</dt>
                <dd>{post.duration}</dd>
              </div>
              {post.place ? (
                <div>
                  <dt>{ui.journal.place}</dt>
                  <dd>{post.place}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </header>

        <JournalPlayer
          caption={[post.series, post.episode ? `#${String(post.episode).padStart(2, "0")}` : null].filter(Boolean).join(" ") || post.title}
          duration={post.duration}
          poster={post.thumbnail}
          title={post.title}
          videoId={post.videoId}
          youtube={post.youtube}
        />

        <div className="journal-post__body" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />

        {neighbour || post.series ? (
          <nav aria-label={ui.journal.episodes} className="journal-post__nav">
            {neighbour ? (
              <TransitionLink className="journal-post__neighbour" href={neighbour.href}>
                <img alt="" decoding="async" loading="lazy" src={neighbour.thumbnail.src} />
                <span>
                  <span className="journal-post__nav-label">
                    {neighbour === previous ? ui.journal.previousEpisode : ui.journal.nextEpisode}
                    {neighbour.episode ? ` · Ep. ${String(neighbour.episode).padStart(2, "0")}` : ""}
                    {neighbour === previous ? "" : " →"}
                  </span>
                  <span className="journal-post__nav-title">{neighbour.title}</span>
                </span>
              </TransitionLink>
            ) : null}
            {post.series ? (
              <TransitionLink className="journal-post__series" href={`/journal#${seriesAnchor(post.series)}`}>
                <span className="journal-post__nav-label">{ui.journal.fullSeries}</span>
                <span className="journal-post__nav-title">
                  {ui.journal.seriesCount(post.series, series.length)}
                </span>
              </TransitionLink>
            ) : null}
          </nav>
        ) : null}

        {more.length ? (
          <section aria-labelledby="journal-more" className="journal-section journal-post__more">
            <header className="journal-section__head">
              <h2 id="journal-more">{ui.journal.more}</h2>
            </header>
            <div className="journal-grid journal-grid--more">
              {more.map((item) => (
                <JournalCard key={item.slug} locale={locale} post={toCard(item)} shape="wide" showDate={false} />
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <JournalCta />
      <SiteFooter />
    </main>
  );
}
