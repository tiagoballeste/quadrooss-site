"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

type StartTransition = (href: string) => boolean;

const PageTransitionContext = createContext<StartTransition | null>(null);

/*
 * Page transition, after the Maxima Michaels reference (Framer): the browser's
 * View Transition API snapshots the old page and the new one; the old slides up
 * 30% and fades out (600ms), the new comes up from 30% below and fades in
 * (600ms, starting at 500ms). Both use cubic-bezier(0.73, 0, 0.33, 1).
 * The keyframes live in globals.css under html.is-page-transition.
 * Browsers without the API, and reduced motion, navigate without animation.
 */

const COMMIT_TIMEOUT = 4000;

function getPathname(href: string) {
  return new URL(href, window.location.href).pathname;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const busyRef = useRef(false);
  const commitRef = useRef<{ path: string; resolve: () => void } | null>(null);

  // The new route has rendered: put it at the top and let the browser take the
  // "after" snapshot.
  useEffect(() => {
    const pending = commitRef.current;
    if (!pending || pending.path !== pathname) return;
    commitRef.current = null;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    pending.resolve();
  }, [pathname]);

  const startTransition = useCallback<StartTransition>(
    (href) => {
      if (busyRef.current) return false;
      const targetPath = getPathname(href);
      if (targetPath === pathname) return false;
      if (typeof document.startViewTransition !== "function") return false;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

      busyRef.current = true;
      const root = document.documentElement;
      root.classList.add("is-page-transition");
      window.dispatchEvent(new Event("quad:transition-start"));

      const committed = new Promise<void>((resolve) => {
        const timer = window.setTimeout(resolve, COMMIT_TIMEOUT);
        commitRef.current = {
          path: targetPath,
          resolve: () => {
            window.clearTimeout(timer);
            resolve();
          },
        };
      });

      const transition = document.startViewTransition(() => {
        router.push(href, { scroll: false });
        return committed;
      });

      transition.finished.finally(() => {
        busyRef.current = false;
        commitRef.current = null;
        root.classList.remove("is-page-transition");
        window.dispatchEvent(new Event("quad:transition-end"));
      });

      return true;
    },
    [pathname, router],
  );

  return <PageTransitionContext.Provider value={startTransition}>{children}</PageTransitionContext.Provider>;
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

    if (startTransition(href)) event.preventDefault();
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
