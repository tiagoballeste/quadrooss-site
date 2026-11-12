"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogDescription,
  MorphingDialogImage,
  MorphingDialogSubtitle,
  MorphingDialogTitle,
  MorphingDialogTrigger,
} from "@/components/core/morphing-dialog";
import { YouTubeProjectPlayer } from "@/components/core/youtube-project-player";
import { TransitionLink } from "@/components/page-transition";
import {
  CARD_LAYOUT_TRANSITION,
  CARD_VARIANTS,
  PAGE_SIZE,
  getGridColumnCount,
} from "@/components/core/catalog-motion";

/*
 * Journal catalog. Same rail, filter, grid motion and morphing dialog as the
 * Work catalog (work-projects-grid.tsx); only the content and the player differ.
 */

export type JournalItem = {
  slug: string;
  type: "vlog" | "set";
  title: string;
  /** Card subtitle, e.g. "Ep. 08 · Paris · 28 min". */
  subtitle: string;
  series: string | null;
  place: string | null;
  credit: string | null;
  dateLabel: string;
  duration: string;
  excerpt: string;
  bodyHtml: string;
  hasPage: boolean;
  pageHref: string;
  youtube: string;
  videoId: string;
  thumbnail: { src: string; srcSet: string | null };
};

type Filter = "todos" | "vlog" | "set";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "vlog", label: "Vlogs" },
  { id: "set", label: "Sets" },
];

function TiltJournalCard({ item, eager }: { item: JournalItem; eager: boolean }) {
  const resetTilt = useCallback((element: HTMLElement) => {
    element.style.setProperty("--work-card-rotate-x", "0deg");
    element.style.setProperty("--work-card-rotate-y", "0deg");
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch") return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.setProperty("--work-card-rotate-x", `${y * 8}deg`);
    element.style.setProperty("--work-card-rotate-y", `${x * -8}deg`);
  };

  const facts = [
    { label: "Data", value: item.dateLabel },
    { label: "Duração", value: item.duration },
    item.place ? { label: "Lugar", value: item.place } : null,
    item.series ? { label: "Série", value: item.series } : null,
    item.credit ? { label: "Com", value: item.credit } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <MorphingDialog layoutId={`journal-post-${item.videoId}`} transition={{ type: "spring", bounce: 0.05, duration: 0.34 }}>
      <MorphingDialogTrigger
        aria-label={`${item.title}, abrir post`}
        className="work-project-card journal-project-card"
        onBlur={(event) => resetTilt(event.currentTarget)}
        onPointerLeave={(event) => resetTilt(event.currentTarget)}
        onPointerMove={handlePointerMove}
      >
        <span className="work-project-card__media">
          <span className="work-project-card__image-zoom">
            <MorphingDialogImage
              alt={`Capa de ${item.title}`}
              decoding="async"
              fetchPriority={eager ? "high" : "auto"}
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 700px) 100vw, (max-width: 900px) 50vw, 30vw"
              src={item.thumbnail.src}
              srcSet={item.thumbnail.srcSet ?? undefined}
            />
          </span>
          <span className="work-project-card__glow" aria-hidden="true" />
        </span>
        <span className="work-project-card__meta">
          <strong>{item.title}</strong>
          <small>{item.subtitle}</small>
        </span>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent className="work-project-dialog" data-lenis-prevent>
          <div className="work-project-dialog__media">
            <MorphingDialogImage
              alt=""
              aria-hidden="true"
              className="work-project-dialog__poster"
              src={item.thumbnail.src}
              srcSet={item.thumbnail.srcSet ?? undefined}
            />
            <YouTubeProjectPlayer title={item.title} videoId={item.videoId} />
          </div>

          <div className="work-project-dialog__body">
            <div className="work-project-dialog__heading">
              <MorphingDialogTitle className="work-project-dialog__title">{item.title}</MorphingDialogTitle>
              <MorphingDialogSubtitle className="work-project-dialog__subtitle">{item.subtitle}</MorphingDialogSubtitle>
            </div>

            <MorphingDialogDescription
              className="work-project-dialog__description"
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, y: 28 },
                animate: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.16, duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                },
                exit: { opacity: 0, y: 18, transition: { duration: 0.18 } },
              }}
            >
              <p className="work-project-dialog__eyebrow">{item.type === "set" ? "Sobre o set" : "Diário de bordo"}</p>
              <div className="journal-dialog__text">
                <p>{item.excerpt}</p>
                {item.bodyHtml ? <div dangerouslySetInnerHTML={{ __html: item.bodyHtml }} /> : null}
              </div>

              <dl className="work-project-dialog__credits journal-dialog__facts">
                {facts.map((fact) => (
                  <div className="work-project-dialog__credit" key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="journal-dialog__links">
                {item.hasPage ? (
                  <TransitionLink className="journal-dialog__link" href={item.pageHref}>
                    Abrir página do post →
                  </TransitionLink>
                ) : null}
                <a className="journal-dialog__link" href={item.youtube} rel="noreferrer" target="_blank">
                  Ver no YouTube ↗
                </a>
              </div>
            </MorphingDialogDescription>
          </div>

          <MorphingDialogClose className="morphing-dialog__close" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export function JournalIndex({ items }: { items: JournalItem[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>("todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const [gridColumnCount, setGridColumnCount] = useState(3);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const filteredItems = useMemo(
    () => (activeFilter === "todos" ? items : items.filter((item) => item.type === activeFilter)),
    [activeFilter, items],
  );

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 700px)");
    const tabletQuery = window.matchMedia("(max-width: 900px)");
    const updateColumnCount = () => setGridColumnCount(getGridColumnCount());

    updateColumnCount();
    mobileQuery.addEventListener("change", updateColumnCount);
    tabletQuery.addEventListener("change", updateColumnCount);

    return () => {
      mobileQuery.removeEventListener("change", updateColumnCount);
      tabletQuery.removeEventListener("change", updateColumnCount);
    };
  }, []);

  useEffect(() => {
    if (!isFilterTransitioning) return;
    const timeout = window.setTimeout(() => setIsFilterTransitioning(false), reducedMotion ? 0 : 950);
    return () => window.clearTimeout(timeout);
  }, [activeFilter, isFilterTransitioning, reducedMotion]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isFilterTransitioning) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredItems.length));
      },
      { rootMargin: "0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredItems.length, hasMore, isFilterTransitioning, visibleCount]);

  const selectFilter = (filter: Filter) => {
    if (filter === activeFilter) return;
    setIsFilterTransitioning(true);
    setVisibleCount(PAGE_SIZE);
    setActiveFilter(filter);
  };

  return (
    <section className="work-catalog" aria-label="Journal">
      <aside className="work-catalog__sidebar">
        <div className="work-catalog__sidebar-inner">
          <p className="work-catalog__intro">
            Um pouco do que ando vivendo: o diário de bordo do mochilão pela Europa e a curadoria
            musical que ando fazendo.
          </p>

          <div className="work-catalog__filters">
            <span>Filtro</span>
            <div className="work-catalog__filter-list" aria-label="Filtrar posts">
              {FILTERS.map((filter) => (
                <button
                  aria-pressed={activeFilter === filter.id}
                  className={activeFilter === filter.id ? "is-active" : undefined}
                  key={filter.id}
                  onClick={() => selectFilter(filter.id)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div aria-busy={isFilterTransitioning} aria-live="polite" className="work-catalog__results">
        <p className="sr-only">
          {filteredItems.length} posts no filtro {FILTERS.find((item) => item.id === activeFilter)?.label}.
        </p>
        <LayoutGroup id="journal-post-filter">
          <motion.div className="work-catalog__grid" layout={!reducedMotion}>
            <AnimatePresence mode="popLayout">
              {visibleItems.map((item, index) => {
                const revealFromIndex = gridColumnCount === 1 ? 2 : gridColumnCount;
                const revealsOnScroll = index >= revealFromIndex;

                return (
                  <motion.div
                    animate={revealsOnScroll || reducedMotion ? undefined : "animate"}
                    className="work-project-card-shell"
                    custom={index % gridColumnCount}
                    exit={reducedMotion ? undefined : "exit"}
                    initial={reducedMotion || !revealsOnScroll ? false : "initial"}
                    key={`${item.videoId}-${gridColumnCount}`}
                    layout={reducedMotion ? false : true}
                    transition={{ layout: CARD_LAYOUT_TRANSITION }}
                    variants={CARD_VARIANTS}
                    viewport={{ amount: 0.18, margin: "0px 0px -8% 0px", once: true }}
                    whileInView={reducedMotion || !revealsOnScroll ? undefined : "animate"}
                  >
                    <TiltJournalCard eager={index < PAGE_SIZE} item={item} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
        <div className="work-catalog__sentinel" ref={sentinelRef} aria-hidden="true" />
      </div>
    </section>
  );
}
