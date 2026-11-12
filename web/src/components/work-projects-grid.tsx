"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
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
import {
  CARD_LAYOUT_TRANSITION,
  CARD_VARIANTS,
  PAGE_SIZE,
  getGridColumnCount,
} from "@/components/core/catalog-motion";
import { VimeoProjectPlayer } from "@/components/core/vimeo-project-player";
import creditsData from "@/data/work/credits.json";
import projectsData from "@/data/work/projects.json";

type Role =
  | "video"
  | "direcao-criativa"
  | "producao-executiva"
  | "edicao-real-time";

type Filter = "todos" | Role;

type WorkProject = {
  title: string;
  vimeoTitle: string;
  vimeoId: string;
  href: string;
  thumbnail: string;
  publishedAt: string;
  roles: Role[];
  sourceOrder: number;
  match: string;
};

type WorkCredits = {
  unavailable: boolean;
  items: Array<{
    label: string;
    value: string;
  }>;
};

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "video", label: "Vídeo" },
  { id: "direcao-criativa", label: "Direção criativa" },
  { id: "producao-executiva", label: "Produção executiva" },
  { id: "edicao-real-time", label: "Edição / Real time" },
];

const ROLE_LABELS: Record<Role, string> = {
  video: "Vídeo",
  "direcao-criativa": "Direção criativa",
  "producao-executiva": "Produção executiva",
  "edicao-real-time": "Edição / Real time",
};

const FEATURED_TITLES = [
  "Havaianas Nuitsz",
  "Kyan Cena 2K25",
  "Alok Rave the World",
  "Nowdays 4/20",
  "Umbro Urban Glow",
  'Champion "What Moves You?"',
];

const LOCAL_COVERS: Record<string, string> = {
  "Havaianas Nuitsz": "/images/work/havaianas-nuitsz.png",
  "Kyan Cena 2K25": "/images/work/kyan-cena-2k25.png",
  "Alok Rave the World": "/images/work/alok-rave-the-world.png",
  "Nowdays 4/20": "/images/work/nowdays-420.png",
  "Umbro Urban Glow": "/images/work/umbro-urban-glow.png",
  'Champion "What Moves You?"': "/images/work/champion-what-moves-you.png",
};

const projects = projectsData.projects as WorkProject[];
const credits = creditsData as Record<string, WorkCredits>;

function getAllProjectsOrder(project: WorkProject[]) {
  const featuredIndex = new Map(
    FEATURED_TITLES.map((title, index) => [title, index]),
  );

  return [...project].sort((a, b) => {
    const aFeatured = featuredIndex.get(a.title);
    const bFeatured = featuredIndex.get(b.title);

    if (aFeatured !== undefined && bFeatured !== undefined) {
      return aFeatured - bFeatured;
    }
    if (aFeatured !== undefined) return -1;
    if (bFeatured !== undefined) return 1;
    return a.sourceOrder - b.sourceOrder;
  });
}

function TiltProjectCard({
  project,
  eager,
}: {
  project: WorkProject;
  eager: boolean;
}) {
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

    // Reverse tilt: the card leans against the pointer direction, matching the
    // supplied rotationFactor={8} / isReverse reference.
    element.style.setProperty("--work-card-rotate-x", `${y * 8}deg`);
    element.style.setProperty("--work-card-rotate-y", `${x * -8}deg`);
  };

  const roleText = project.roles.map((role) => ROLE_LABELS[role]).join(" · ");
  const imageSource = LOCAL_COVERS[project.title] ?? project.thumbnail;
  const projectCredits = credits[project.title] ?? {
    unavailable: true,
    items: [],
  };

  return (
    <MorphingDialog
      layoutId={`work-project-${project.vimeoId}`}
      transition={{ type: "spring", bounce: 0.05, duration: 0.34 }}
    >
      <MorphingDialogTrigger
        aria-label={`${project.title} — abrir projeto`}
        className="work-project-card"
        onBlur={(event) => resetTilt(event.currentTarget)}
        onPointerLeave={(event) => resetTilt(event.currentTarget)}
        onPointerMove={handlePointerMove}
      >
        <span className="work-project-card__media">
          <span className="work-project-card__image-zoom">
            <MorphingDialogImage
              alt={`Capa do projeto ${project.title}`}
              decoding="async"
              fetchPriority={eager ? "high" : "auto"}
              loading={eager ? "eager" : "lazy"}
              src={imageSource}
            />
          </span>
          <span className="work-project-card__glow" aria-hidden="true" />
        </span>
        <span className="work-project-card__meta">
          <strong>{project.title}</strong>
          <small>{roleText}</small>
        </span>
      </MorphingDialogTrigger>

      <MorphingDialogContainer>
        <MorphingDialogContent
          className="work-project-dialog"
          data-lenis-prevent
        >
          <div className="work-project-dialog__media">
            <MorphingDialogImage
              alt=""
              aria-hidden="true"
              className="work-project-dialog__poster"
              src={imageSource}
            />
            <VimeoProjectPlayer
              title={project.title}
              vimeoId={project.vimeoId}
            />
          </div>

          <div className="work-project-dialog__body">
            <div className="work-project-dialog__heading">
              <MorphingDialogTitle className="work-project-dialog__title">
                {project.title}
              </MorphingDialogTitle>
              <MorphingDialogSubtitle className="work-project-dialog__subtitle">
                {roleText}
              </MorphingDialogSubtitle>
            </div>

            <MorphingDialogDescription
              className="work-project-dialog__description"
              disableLayoutAnimation
              variants={{
                initial: { opacity: 0, y: 28 },
                animate: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 0.16,
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
                exit: { opacity: 0, y: 18, transition: { duration: 0.18 } },
              }}
            >
              <p className="work-project-dialog__eyebrow">Ficha técnica</p>
              {projectCredits.unavailable ? (
                <p className="work-project-dialog__unavailable">
                  Créditos não informados para este projeto.
                </p>
              ) : (
                <dl className="work-project-dialog__credits">
                  {projectCredits.items.map((credit) => (
                    <div
                      className="work-project-dialog__credit"
                      key={`${credit.label}-${credit.value}`}
                    >
                      <dt>{credit.label}</dt>
                      <dd>{credit.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </MorphingDialogDescription>
          </div>

          <MorphingDialogClose className="morphing-dialog__close" />
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}

export function WorkProjectsGrid() {
  const [activeFilter, setActiveFilter] = useState<Filter>("todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState(false);
  const [gridColumnCount, setGridColumnCount] = useState(3);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const filteredProjects = useMemo(() => {
    if (activeFilter === "todos") return getAllProjectsOrder(projects);
    return projects
      .filter((project) => project.roles.includes(activeFilter))
      .sort((a, b) => a.sourceOrder - b.sourceOrder);
  }, [activeFilter]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

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
    const timeout = window.setTimeout(
      () => setIsFilterTransitioning(false),
      reducedMotion ? 0 : 950,
    );
    return () => window.clearTimeout(timeout);
  }, [activeFilter, isFilterTransitioning, reducedMotion]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isFilterTransitioning) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisibleCount((current) =>
          Math.min(current + PAGE_SIZE, filteredProjects.length),
        );
      },
      { rootMargin: "0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredProjects.length, hasMore, isFilterTransitioning, visibleCount]);

  const selectFilter = (filter: Filter) => {
    if (filter === activeFilter) return;
    setIsFilterTransitioning(true);
    setVisibleCount(PAGE_SIZE);
    setActiveFilter(filter);
  };

  return (
    <section className="work-catalog" aria-label="Projetos">
      <aside className="work-catalog__sidebar">
        <div className="work-catalog__sidebar-inner">
          <p className="work-catalog__intro">
            Um arquivo visual dos projetos que eu conduzo, das cenas e vivências
            que fazem parte da minha vida.
          </p>

          <div className="work-catalog__filters">
            <span>Filtro</span>
            <div className="work-catalog__filter-list" aria-label="Filtrar projetos">
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

      <div
        aria-busy={isFilterTransitioning}
        aria-live="polite"
        className="work-catalog__results"
      >
        <p className="sr-only">
          {filteredProjects.length} projetos no filtro {FILTERS.find((item) => item.id === activeFilter)?.label}.
        </p>
        <LayoutGroup id="work-project-filter">
          <motion.div className="work-catalog__grid" layout={!reducedMotion}>
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project, index) => {
                const revealFromIndex = gridColumnCount === 1 ? 2 : gridColumnCount;
                const revealsOnScroll = index >= revealFromIndex;

                return (
                  <motion.div
                    animate={revealsOnScroll || reducedMotion ? undefined : "animate"}
                    className="work-project-card-shell"
                    custom={index % gridColumnCount}
                    exit={reducedMotion ? undefined : "exit"}
                    initial={reducedMotion || !revealsOnScroll ? false : "initial"}
                    key={`${project.vimeoId}-${gridColumnCount}`}
                    layout={reducedMotion ? false : true}
                    transition={{ layout: CARD_LAYOUT_TRANSITION }}
                    variants={CARD_VARIANTS}
                    viewport={{
                      amount: 0.18,
                      margin: "0px 0px -8% 0px",
                      once: true,
                    }}
                    whileInView={reducedMotion || !revealsOnScroll ? undefined : "animate"}
                  >
                    <TiltProjectCard
                      eager={index < PAGE_SIZE}
                      project={project}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
        <div
          className="work-catalog__sentinel"
          ref={sentinelRef}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
