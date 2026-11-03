"use client";

import { gsap } from "gsap";
import {
  Fragment,
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type PageLoaderProps = {
  enabled: boolean;
};

const MAX_SITE_BLUR = 20;
const BLUR_START_PROGRESS = 0.58;
const BLUR_END_PROGRESS = 0.82;
const FALLBACK_TIMEOUT = 8000;
const LOADER_DURATION = 3300;

export function PageLoader({ enabled }: PageLoaderProps) {
  const [visible, setVisible] = useState(enabled);
  const [ready, setReady] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const siteBlurRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const revealTimeline = useRef<gsap.core.Timeline | null>(null);
  const monitorFrame = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const finished = useRef(false);

  const complete = useCallback(() => {
    document.documentElement.classList.remove("has-page-loader");
    setVisible(false);
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    siteBlurRef.current?.style.setProperty("--page-loader-site-blur", "0px");
    complete();
  }, [complete]);

  const failOpen = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    const loader = loaderRef.current;
    const siteBlur = siteBlurRef.current;

    if (!loader) {
      complete();
      return;
    }

    loader.classList.add("is-failing");
    siteBlur?.classList.add("is-failing");

    revealTimeline.current = gsap.timeline({ onComplete: complete });
    revealTimeline.current.to(
      loader,
      { opacity: 0, duration: 0.35, ease: "power2.out" },
      0,
    );

    if (siteBlur) {
      revealTimeline.current.to(
        siteBlur,
        {
          "--page-loader-site-blur": "0px",
          opacity: 0,
          duration: 0.35,
          ease: "power2.out",
        },
        0,
      );
    }
  }, [complete]);

  const syncBlur = useCallback((progress: number) => {
    const siteBlur = siteBlurRef.current;

    if (!siteBlur) return;

    const revealProgress = Math.min(
      1,
      Math.max(
        0,
        (progress - BLUR_START_PROGRESS) /
          (BLUR_END_PROGRESS - BLUR_START_PROGRESS),
      ),
    );
    const easedProgress = revealProgress * revealProgress * (3 - 2 * revealProgress);
    const blur = MAX_SITE_BLUR * (1 - easedProgress);

    siteBlur.style.setProperty("--page-loader-site-blur", `${blur.toFixed(2)}px`);
  }, []);

  const handleImageLoad = useCallback(() => {
    if (startedAt.current !== null || finished.current) return;
    startedAt.current = window.performance.now();
    loaderRef.current?.classList.add("is-playing");

    const monitor = (now: number) => {
      if (startedAt.current === null || finished.current) return;
      const progress = Math.min(1, (now - startedAt.current) / LOADER_DURATION);
      syncBlur(progress);
      if (progress >= 1) {
        finish();
        return;
      }
      monitorFrame.current = window.requestAnimationFrame(monitor);
    };

    monitorFrame.current = window.requestAnimationFrame(monitor);
  }, [finish, syncBlur]);

  useEffect(() => {
    if (!enabled) return;

    setReady(true);

    const fallback = window.setTimeout(failOpen, FALLBACK_TIMEOUT);

    return () => {
      window.clearTimeout(fallback);
      if (monitorFrame.current !== null) {
        window.cancelAnimationFrame(monitorFrame.current);
      }
      revealTimeline.current?.kill();
    };
  }, [enabled, failOpen]);

  useEffect(() => {
    if (ready && imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
      handleImageLoad();
    }
  }, [handleImageLoad, ready]);

  if (!visible) return null;

  return (
    <Fragment>
      <div
        ref={siteBlurRef}
        className="page-loader__site-blur"
        aria-hidden="true"
        style={
          {
            backdropFilter: "blur(var(--page-loader-site-blur))",
            WebkitBackdropFilter: "blur(var(--page-loader-site-blur))",
          } as CSSProperties
        }
      />
      <div
        ref={loaderRef}
        className="page-loader"
        aria-label="Carregando o site"
      >
        {ready && (
          <picture className="page-loader__picture">
            <source
              media="(max-width: 700px)"
              srcSet="/motion/page-loader-alpha-mobile.webp"
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              className="page-loader__image"
              src="/motion/page-loader-alpha.webp"
              alt=""
              onLoad={handleImageLoad}
              onError={failOpen}
            />
          </picture>
        )}
      </div>
    </Fragment>
  );
}
