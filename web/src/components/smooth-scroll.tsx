"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches) {
      const scrollToHero = () => window.scrollTo({ top: 0, left: 0 });
      window.addEventListener("quad:scroll-hero", scrollToHero);
      return () => window.removeEventListener("quad:scroll-hero", scrollToHero);
    }

    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: true,
    });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    const scrollLocks = new Set<"transition" | "modal">();
    const stopFor = (reason: "transition" | "modal") => {
      scrollLocks.add(reason);
      lenis.stop();
    };
    const startFor = (reason: "transition" | "modal") => {
      scrollLocks.delete(reason);
      if (scrollLocks.size === 0) lenis.start();
    };
    const stopForTransition = () => stopFor("transition");
    const startAfterTransition = () => startFor("transition");
    const stopForModal = () => stopFor("modal");
    const startAfterModal = () => startFor("modal");
    const scrollToHero = () => {
      lenis.scrollTo(0, {
        duration: 1.15,
        easing: (progress) =>
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2,
      });
    };
    window.addEventListener("quad:transition-start", stopForTransition);
    window.addEventListener("quad:transition-end", startAfterTransition);
    window.addEventListener("quad:modal-open", stopForModal);
    window.addEventListener("quad:modal-close", startAfterModal);
    window.addEventListener("quad:scroll-hero", scrollToHero);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("quad:transition-start", stopForTransition);
      window.removeEventListener("quad:transition-end", startAfterTransition);
      window.removeEventListener("quad:modal-open", stopForModal);
      window.removeEventListener("quad:modal-close", startAfterModal);
      window.removeEventListener("quad:scroll-hero", scrollToHero);
      lenis.destroy();
    };
  }, []);

  return null;
}
