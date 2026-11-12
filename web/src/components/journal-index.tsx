"use client";

import { useState } from "react";
import { JournalCard, type JournalCardData } from "@/components/journal-card";
import { TransitionLink } from "@/components/page-transition";

export type JournalSection = {
  id: string;
  title: string;
  /** Right-hand note, e.g. "16 dias · 9 episódios". */
  note: string;
  kind: "vlog" | "set";
  posts: JournalCardData[];
};

type Filter = "all" | "vlog" | "set";

type JournalIndexProps = {
  featured: (JournalCardData & { kicker: string; place: string | null }) | null;
  sections: JournalSection[];
  counts: Record<Filter, number>;
};

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "vlog", label: "Vlogs" },
  { id: "set", label: "Sets" },
];

export function JournalIndex({ featured, sections, counts }: JournalIndexProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const showVlogs = filter !== "set";
  const visibleSections = sections.filter((section) => filter === "all" || section.kind === filter);

  return (
    <section className="work-catalog journal-catalog" aria-label="Journal">
      <aside className="work-catalog__sidebar">
        <div className="work-catalog__sidebar-inner">
          <h1 className="work-catalog__intro">Um pouco do que ando vivendo...</h1>
          <p className="journal-catalog__lead">
            Um feed contínuo com anotações, o diário de bordo do mochilão pela Europa e a
            curadoria musical que ando fazendo.
          </p>

          <div className="work-catalog__filters">
            <span>Filtro</span>
            <div className="work-catalog__filter-list" aria-label="Filtrar posts" role="group">
              {FILTERS.map((option) => (
                <button
                  aria-pressed={filter === option.id}
                  className={filter === option.id ? "is-active" : undefined}
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  type="button"
                >
                  {option.label}
                  <span className="journal-catalog__count">{String(counts[option.id]).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="journal-catalog__results" aria-live="polite">
        {showVlogs && featured ? (
          <article className="journal-feature">
            <TransitionLink className="journal-feature__media" href={featured.href} tabIndex={-1} aria-hidden="true">
              <img
                alt=""
                decoding="async"
                sizes="(max-width: 900px) 100vw, 40vw"
                src={featured.thumbnail.src}
                srcSet={featured.thumbnail.srcSet ?? undefined}
              />
            </TransitionLink>
            <div className="journal-feature__body">
              <p className="journal-feature__kicker">
                <span>Novo</span>
                <span>{featured.kicker}</span>
              </p>
              <h2 className="journal-feature__title">
                <TransitionLink href={featured.href}>{featured.title}</TransitionLink>
              </h2>
              <p className="journal-feature__excerpt">{featured.excerpt}</p>
              <p className="journal-feature__meta">
                <span>{featured.dateLabel}</span>
                <span>{featured.duration}</span>
                {featured.place ? <span>{featured.place}</span> : null}
              </p>
              <TransitionLink className="journal-button" href={featured.href}>
                Ler e assistir →
              </TransitionLink>
            </div>
          </article>
        ) : null}

        {visibleSections.map((section) => (
          <section aria-labelledby={`journal-${section.id}`} className="journal-section" id={section.id} key={section.id}>
            <header className="journal-section__head">
              <h2 id={`journal-${section.id}`}>{section.title}</h2>
              <span>{section.note}</span>
            </header>
            <div className={`journal-grid journal-grid--${section.kind}`}>
              {section.posts.map((post) => (
                <JournalCard key={post.slug} post={post} shape={section.kind === "set" ? "wide" : "episode"} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
