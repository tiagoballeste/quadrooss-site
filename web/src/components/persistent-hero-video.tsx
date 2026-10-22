"use client";

import Player from "@vimeo/player";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const VIMEO_EMBED_URL =
  "https://player.vimeo.com/video/1234019616?h=b03831870f&background=1&autoplay=1&muted=1&loop=1&autopause=0&controls=0&keyboard=0&playsinline=1&pip=0&title=0&byline=0&portrait=0&dnt=1&transparent=0&preload=auto&initial_quality=540p&max_quality=1080p";

export const HERO_VIDEO_POSTER =
  "https://i.vimeocdn.com/video/2209862874-1881385341b97185ddd70371fa5b48d27d0dc5a9778cfdac97c096faefe6d503-d_1280?region=us";

export function PersistentHeroVideo() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);

  const updateHeroScroll = useCallback(
    (scrollTop: number) => {
      const root = document.documentElement;

      if (pathname !== "/" || reducedMotion) {
        root.style.setProperty("--hero-video-y", "0px");
        root.style.setProperty("--hero-copy-opacity", "1");
        root.style.setProperty("--hero-copy-y", "0px");
        root.style.setProperty("--hero-stats-opacity", "1");
        return;
      }

      const viewportHeight = Math.max(window.innerHeight, 1);
      const videoProgress = Math.min(scrollTop / (viewportHeight * 0.95), 1);
      const copyProgress = Math.min(scrollTop / (viewportHeight * 0.62), 1);
      const statsProgress = Math.min(scrollTop / (viewportHeight * 0.62), 1);

      root.style.setProperty(
        "--hero-video-y",
        `${-(videoProgress * viewportHeight * 0.15).toFixed(2)}px`,
      );
      root.style.setProperty(
        "--hero-copy-opacity",
        Math.max(0, 1 - copyProgress).toFixed(3),
      );
      root.style.setProperty(
        "--hero-copy-y",
        `${-(copyProgress * 14).toFixed(2)}px`,
      );
      root.style.setProperty(
        "--hero-stats-opacity",
        Math.max(0, 1 - statsProgress).toFixed(3),
      );
    },
    [pathname, reducedMotion],
  );

  useMotionValueEvent(scrollY, "change", updateHeroScroll);

  useEffect(() => {
    updateHeroScroll(window.scrollY);

    const refresh = () => updateHeroScroll(window.scrollY);
    window.addEventListener("resize", refresh);

    return () => {
      window.removeEventListener("resize", refresh);
    };
  }, [updateHeroScroll]);

  const ensurePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    void player.getPaused().then((paused) => {
      if (paused) void player.play().catch(() => undefined);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const player = new Player(iframe);
    playerRef.current = player;

    const markFirstFrame = () => setHasFirstFrame(true);
    const restart = () => {
      void player.setCurrentTime(0).then(() => player.play()).catch(() => undefined);
    };

    player.on("play", markFirstFrame);
    player.on("timeupdate", markFirstFrame);
    player.on("ended", restart);

    void player.ready().then(async () => {
      await Promise.allSettled([
        player.setMuted(true),
        player.setLoop(true),
        player.setAutopause(false),
      ]);
      await player.play().catch(() => undefined);
    }).catch(() => undefined);

    const resumeWhenVisible = () => {
      if (document.visibilityState === "visible") ensurePlayback();
    };

    window.addEventListener("focus", ensurePlayback);
    window.addEventListener("pageshow", ensurePlayback);
    document.addEventListener("visibilitychange", resumeWhenVisible);

    return () => {
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
      window.removeEventListener("focus", ensurePlayback);
      window.removeEventListener("pageshow", ensurePlayback);
      document.removeEventListener("visibilitychange", resumeWhenVisible);
      player.off("play", markFirstFrame);
      player.off("timeupdate", markFirstFrame);
      player.off("ended", restart);
      playerRef.current = null;
    };
  }, [ensurePlayback]);

  useEffect(() => {
    if (pathname === "/") ensurePlayback();
  }, [ensurePlayback, pathname]);

  return (
    <div
      className={`persistent-hero-video${pathname === "/" ? " is-visible" : ""}${hasFirstFrame ? " is-playing" : ""}`}
      aria-hidden="true"
    >
      <div className="persistent-hero-video__media">
        <div
          className="persistent-hero-video__poster"
          style={{ backgroundImage: `url("${HERO_VIDEO_POSTER}")` }}
        />
        <iframe
          ref={iframeRef}
          className="persistent-hero-video__iframe"
          src={VIMEO_EMBED_URL}
          title=""
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          loading="eager"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
          onLoad={() => {
            if (revealTimerRef.current !== null) {
              window.clearTimeout(revealTimerRef.current);
            }
            revealTimerRef.current = window.setTimeout(() => {
              setHasFirstFrame(true);
              ensurePlayback();
            }, 650);
          }}
        />
      </div>
      <div className="persistent-hero-video__shade" />
    </div>
  );
}
