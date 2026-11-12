"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { localeFromPath, localizePath, type Locale } from "@/lib/i18n";
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
 * Page transition, after the Maxima Michaels reference (Framer's wipe effect):
 * the browser's View Transition API snapshots the old page and the new one.
 * The old slides up 30%, fades out and is wiped from the bottom up (a black
 * shape rising over it), 600ms; the new rises from 30% below, fades in and is
 * unmasked from the bottom up, 600ms starting at 500ms. Both on
 * cubic-bezier(0.73, 0, 0.33, 1). Keyframes: globals.css, html.is-page-transition.
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
  /** Target language. Left out, internal links stay in the current one. */
  locale?: Locale;
};

export function TransitionLink({
  href: rawHref,
  transitionLabel: _transitionLabel,
  locale,
  onClick,
  children,
  ...props
}: TransitionLinkProps) {
  const startTransition = useContext(PageTransitionContext);
  const currentLocale = localeFromPath(usePathname());
  // Internal paths are written in Portuguese ("/work"); on an English page
  // they point to the English one ("/en/work").
  const href = localizePath(rawHref, locale ?? currentLocale);

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
