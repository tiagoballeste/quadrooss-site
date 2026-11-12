"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

/*
 * Intro loader, drawn in code (it used to be a 1920×1080 animated WebP at
 * ~22 fps with a full-screen blur re-rendered every frame):
 *
 *   0.17s  the inner brackets appear and open up
 *   0.30s  the outer brackets and the letters come in
 *   0.50s  the wordmark slowly grows
 *   1.95s  the white panel wipes up, the blurred site underneath sharpens
 *   2.75s  done
 *
 * Only transform, opacity and clip-path are animated, so it stays on the GPU.
 * The panel is server-rendered, so the page never flashes before it.
 */

const WORD = "quadrooss";
const WIPE_AT = 1.95;

type PageLoaderProps = { enabled: boolean };

export function PageLoader({ enabled }: PageLoaderProps) {
  const [visible, setVisible] = useState(enabled);
  const panelRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const panel = panelRef.current;
    const blur = blurRef.current;
    const mark = markRef.current;
    const word = wordRef.current;
    if (!panel || !blur || !mark || !word) return;

    const done = () => {
      document.documentElement.classList.remove("has-page-loader");
      setVisible(false);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const tween = gsap.to([panel, blur], { opacity: 0, duration: 0.4, delay: 0.3, onComplete: done });
      return () => {
        tween.kill();
      };
    }

    const brackets = (ring: number) => mark.querySelectorAll(`[data-ring="${ring}"]`);
    const letters = word.querySelectorAll("span");
    const wordWidth = word.scrollWidth;

    const timeline = gsap.timeline({ onComplete: done });
    timeline
      .set(mark, { autoAlpha: 1 })
      // The inner pair appears side by side, then opens to make room for the word.
      .fromTo(brackets(1), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, 0.17)
      .fromTo(word, { width: 0 }, { width: wordWidth, duration: 0.42, ease: "power3.out" }, 0.2)
      .fromTo(brackets(2), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, 0.3)
      .fromTo(brackets(3), { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "none" }, 0.4)
      .fromTo(
        letters,
        { opacity: 0 },
        { opacity: 1, duration: 0.08, ease: "none", stagger: { each: 0.025, from: "random" } },
        0.34,
      )
      // The wordmark grows the whole time it is on screen.
      .fromTo(mark, { scale: 0.62 }, { scale: 1, duration: WIPE_AT - 0.17, ease: "power1.inOut" }, 0.17)
      // The panel wipes up from the bottom while the site comes into focus.
      .to(panel, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.56, ease: "power3.inOut" }, WIPE_AT)
      .to(blur, { opacity: 0, duration: 0.8, ease: "sine.out" }, WIPE_AT);

    return () => {
      timeline.kill();
    };
  }, [enabled]);

  if (!visible) return null;

  return (
    <>
      <div ref={blurRef} className="page-loader__site-blur" aria-hidden="true" />
      <div ref={panelRef} className="page-loader" role="status" aria-label="Quadrooss">
        <div ref={markRef} className="page-loader__mark" aria-hidden="true">
          <span data-ring="3">(</span>
          <span data-ring="2">(</span>
          <span data-ring="1">(</span>
          <span ref={wordRef} className="page-loader__word">
            {WORD.split("").map((letter, index) => (
              <span key={index}>{letter}</span>
            ))}
          </span>
          <span data-ring="1">)</span>
          <span data-ring="2">)</span>
          <span data-ring="3">)</span>
        </div>
      </div>
    </>
  );
}
