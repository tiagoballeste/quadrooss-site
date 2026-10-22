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
const FALLBACK_TIMEOUT = 8000;

export function PageLoader({ enabled }: PageLoaderProps) {
  const [visible, setVisible] = useState(enabled);
  const loaderRef = useRef<HTMLDivElement>(null);
  const siteBlurRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const revealTimeline = useRef<gsap.core.Timeline | null>(null);
  const monitorFrame = useRef<number | null>(null);
  const finished = useRef(false);

  const complete = useCallback(() => {
    document.documentElement.classList.remove("has-page-loader");
    setVisible(false);
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    videoRef.current?.pause();
    siteBlurRef.current?.style.setProperty("--page-loader-site-blur", "0px");
    complete();
  }, [complete]);

  const failOpen = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    videoRef.current?.pause();

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

  const syncBlurToVideo = useCallback(() => {
    const video = videoRef.current;
    const siteBlur = siteBlurRef.current;

    if (
      !video ||
      !siteBlur ||
      !Number.isFinite(video.duration) ||
      video.duration <= 0
    ) {
      return;
    }

    const progress = video.currentTime / video.duration;
    const revealProgress = Math.min(
      1,
      Math.max(0, (progress - BLUR_START_PROGRESS) / (1 - BLUR_START_PROGRESS)),
    );
    const easedProgress = revealProgress * revealProgress * (3 - 2 * revealProgress);
    const blur = MAX_SITE_BLUR * (1 - easedProgress);

    siteBlur.style.setProperty("--page-loader-site-blur", `${blur.toFixed(2)}px`);
  }, []);

  const handlePlaybackProgress = useCallback(() => {
    loaderRef.current?.classList.add("is-playing");
    syncBlurToVideo();

    if (monitorFrame.current !== null) return;

    const monitor = () => {
      const video = videoRef.current;

      if (!video || finished.current) return;

      syncBlurToVideo();

      monitorFrame.current = window.requestAnimationFrame(monitor);
    };

    monitorFrame.current = window.requestAnimationFrame(monitor);
  }, [syncBlurToVideo]);

  useEffect(() => {
    if (!enabled) return;

    const fallback = window.setTimeout(failOpen, FALLBACK_TIMEOUT);

    return () => {
      window.clearTimeout(fallback);
      if (monitorFrame.current !== null) {
        window.cancelAnimationFrame(monitorFrame.current);
      }
      revealTimeline.current?.kill();
    };
  }, [enabled, failOpen]);

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
        <video
          ref={videoRef}
          className="page-loader__video"
          autoPlay
          controls={false}
          controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
          disablePictureInPicture
          muted
          playsInline
          preload="auto"
          onLoadedData={handlePlaybackProgress}
          onPlaying={handlePlaybackProgress}
          onTimeUpdate={handlePlaybackProgress}
          onEnded={finish}
          onError={failOpen}
        >
          <source
            media="(max-width: 700px)"
            src="/motion/page-loader-alpha-mobile.webm"
            type='video/webm; codecs="vp9"'
          />
          <source
            src="/motion/page-loader-alpha.webm"
            type='video/webm; codecs="vp9"'
          />
          Seu navegador não oferece suporte ao vídeo de abertura.
        </video>
      </div>
    </Fragment>
  );
}
