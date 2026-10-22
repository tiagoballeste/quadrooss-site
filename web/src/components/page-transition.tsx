"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type TransitionPhase = "idle" | "entering" | "covered" | "leaving";

type IrisOrigin = {
  x: number;
  y: number;
};

type StartTransition = (href: string, origin: IrisOrigin) => boolean;

const PageTransitionContext = createContext<StartTransition | null>(null);

function IrisCurtain({
  phase,
  origin,
  reducedMotion,
  onCovered,
  onRevealed,
}: {
  phase: Exclude<TransitionPhase, "idle">;
  origin: IrisOrigin;
  reducedMotion: boolean;
  onCovered: () => void;
  onRevealed: () => void;
}) {
  const farthestX = Math.max(origin.x, window.innerWidth - origin.x);
  const farthestY = Math.max(origin.y, window.innerHeight - origin.y);
  const radius = Math.ceil(Math.hypot(farthestX, farthestY)) + 4;

  useEffect(() => {
    if (!reducedMotion) return;

    if (phase === "entering") {
      const timer = window.setTimeout(onCovered, 100);
      return () => window.clearTimeout(timer);
    }

    if (phase === "leaving") {
      const timer = window.setTimeout(onRevealed, 100);
      return () => window.clearTimeout(timer);
    }
  }, [onCovered, onRevealed, phase, reducedMotion]);

  return (
    <div
      className={`iris-transition is-${phase}${reducedMotion ? " is-reduced" : ""}`}
      aria-hidden="true"
    >
      <div
        className="iris-transition__circle"
        style={
          {
            "--iris-x": `${origin.x}px`,
            "--iris-y": `${origin.y}px`,
            "--iris-radius": radius,
          } as CSSProperties
        }
        onAnimationEnd={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.animationName === "iris-cover") onCovered();
          if (event.animationName === "iris-reveal") onRevealed();
        }}
      />
    </div>
  );
}

function getPathname(href: string) {
  return new URL(href, window.location.href).pathname;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [origin, setOrigin] = useState<IrisOrigin>({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const phaseRef = useRef<TransitionPhase>("idle");
  const targetRef = useRef<string | null>(null);
  const sourcePathRef = useRef(pathname);

  const updatePhase = useCallback((nextPhase: TransitionPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const finishTransition = useCallback(() => {
    updatePhase("idle");
    targetRef.current = null;
    document.documentElement.classList.remove("is-route-transitioning");
    window.dispatchEvent(new Event("quad:transition-end"));
  }, [updatePhase]);

  const startTransition = useCallback<StartTransition>(
    (href, clickOrigin) => {
      if (phaseRef.current !== "idle") return false;

      const targetPath = getPathname(href);
      if (targetPath === pathname) return false;

      sourcePathRef.current = pathname;
      targetRef.current = href;
      setOrigin(clickOrigin);
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      document.documentElement.classList.add("is-route-transitioning");
      window.dispatchEvent(new Event("quad:transition-start"));
      router.prefetch(href);
      updatePhase("entering");
      return true;
    },
    [pathname, router, updatePhase],
  );

  const navigateWhenCovered = useCallback(() => {
    const target = targetRef.current;
    if (!target || phaseRef.current !== "entering") return;

    updatePhase("covered");
    router.push(target, { scroll: false });
  }, [router, updatePhase]);

  useEffect(() => {
    if (phaseRef.current !== "covered" || pathname === sourcePathRef.current) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const frame = window.requestAnimationFrame(() => updatePhase("leaving"));
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, updatePhase]);

  useEffect(() => {
    if (phase === "idle") return;

    const failSafe = window.setTimeout(() => {
      if (phaseRef.current === "covered" && targetRef.current) {
        window.location.assign(targetRef.current);
        return;
      }
      finishTransition();
    }, 5000);

    return () => window.clearTimeout(failSafe);
  }, [finishTransition, phase]);

  return (
    <PageTransitionContext.Provider value={startTransition}>
      {children}
      {phase !== "idle" && (
        <IrisCurtain
          phase={phase}
          origin={origin}
          reducedMotion={reducedMotion}
          onCovered={navigateWhenCovered}
          onRevealed={finishTransition}
        />
      )}
    </PageTransitionContext.Provider>
  );
}

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  transitionLabel?: string;
};

export function TransitionLink({
  href,
  transitionLabel: _transitionLabel,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
  const startTransition = useContext(PageTransitionContext);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !startTransition) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.target === "_blank" ||
      props.download ||
      href.startsWith("#")
    ) {
      return;
    }

    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const isKeyboardClick = event.detail === 0;
    const clickOrigin = {
      x: isKeyboardClick ? rect.left + rect.width / 2 : event.clientX,
      y: isKeyboardClick ? rect.top + rect.height / 2 : event.clientY,
    };

    if (startTransition(href, clickOrigin)) event.preventDefault();
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
