import { TransitionLink } from "@/components/page-transition";
import type { JournalPost } from "@/lib/journal";

export type JournalCardData = Pick<
  JournalPost,
  "slug" | "title" | "dateLabel" | "duration" | "excerpt" | "href" | "hasPage" | "thumbnail"
> & { tag: string };

type JournalCardProps = {
  post: JournalCardData;
  /** "episode" uses the 5:4 crop of the series covers, "wide" a 16:9 one. */
  shape?: "episode" | "wide";
  showDate?: boolean;
};

export function JournalCard({ post, shape = "episode", showDate = true }: JournalCardProps) {
  const content = (
    <>
      <span className={`journal-card__media journal-card__media--${shape}`}>
        <img
          alt=""
          decoding="async"
          loading="lazy"
          sizes="(max-width: 700px) 7rem, (max-width: 900px) 45vw, 22vw"
          src={post.thumbnail.src}
          srcSet={post.thumbnail.srcSet ?? undefined}
        />
      </span>
      <span className="journal-card__text">
        <span className="journal-card__meta">
          <span>{post.tag}</span>
          <span>{post.duration}</span>
        </span>
        <h3 className="journal-card__title">{post.title}</h3>
        <span className="journal-card__excerpt">{post.excerpt}</span>
        {showDate ? <span className="journal-card__date">{post.dateLabel}</span> : null}
      </span>
    </>
  );

  if (post.hasPage) {
    return (
      <TransitionLink className="journal-card" href={post.href}>
        {content}
      </TransitionLink>
    );
  }

  return (
    <a
      aria-label={`${post.title} (abre no YouTube)`}
      className="journal-card"
      href={post.href}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  );
}
