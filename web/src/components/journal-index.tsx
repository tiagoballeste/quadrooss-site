"use client";

import { ViewTransition, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { journalCoverName } from "@/lib/journal-names";
import {
  CARD_LAYOUT_TRANSITION,
  CARD_VARIANTS,
  PAGE_SIZE,
  getGridColumnCount,
} from "@/components/core/catalog-motion";

/*
 * Journal catalog. Same rail, filter and grid motion as the Work catalog
 * (work-projects-grid.tsx). A card opens the post page, and its cover morphs
 * into the cover there (React <ViewTransition>, see journal/[slug]/page.tsx).
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

let arrivalTimer = 0;

function markJournalArrival() {
  const root = document.documentElement;
  root.dataset.journalArrival = "";
  window.clearTimeout(arrivalTimer);
  arrivalTimer = window.setTimeout(() => delete root.dataset.journalArrival, 2000);
}

function TiltJournalCard({ item, eager }: { item: JournalItem; eager: boolean }) {
  const resetTilt = useCallback((element: HTMLElement) => {
    element.style.setProperty("--work-card-rotate-x", "0deg");
    element.style.setProperty("--work-card-rotate-y", "0deg");
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType === "touch") return;
    const element = event.currentTarget;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    element.style.setProperty("--work-card-rotate-x", `${y * 8}deg`);
    element.style.setProperty("--work-card-rotate-y", `${x * -8}deg`);
  };

  return (
    <Link
      aria-label={`${item.title}, abrir post`}
      className="work-project-card journal-project-card"
      href={item.pageHref}
      transitionTypes={["journal-open"]}
      onBlur={(event) => resetTilt(event.currentTarget)}
      onClick={(event) => {
        // Flatten the tilt before the browser snapshots the cover, and mark the
        // arrival so the post page plays its entrance (see globals.css).
        resetTilt(event.currentTarget);
        markJournalArrival();
      }}
      onPointerLeave={(event) => resetTilt(event.currentTarget)}
      onPointerMove={handlePointerMove}
    >
      <span className="work-project-card__media">
        <ViewTransition name={journalCoverName(item.slug)} share={{ "journal-open": "journal-morph", default: "none" }} default="none">
          <span className="work-project-card__image-zoom">
            <img
              alt={`Capa de ${item.title}`}
              decoding="async"
              fetchPriority={eager ? "high" : "auto"}
              loading={eager ? "eager" : "lazy"}
              sizes="(max-width: 700px) 100vw, (max-width: 900px) 50vw, 30vw"
              src={item.thumbnail.src}
              srcSet={item.thumbnail.srcSet ?? undefined}
            />
          </span>
        </ViewTransition>
        <span className="work-project-card__glow" aria-hidden="true" />
      </span>
      <span className="work-project-card__meta">
        <strong>{item.title}</strong>
        <small>{item.subtitle}</small>
      </span>
    </Link>
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
