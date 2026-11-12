import type { Variants } from "motion/react";

/*
 * Grid motion shared by the Work and Journal catalogs: page size, column count
 * per breakpoint, the card enter/exit variants and the layout transition used
 * when a filter changes.
 */

export const PAGE_SIZE = 9;

export function getGridColumnCount() {
  if (typeof window === "undefined") return 3;
  if (window.matchMedia("(max-width: 700px)").matches) return 1;
  if (window.matchMedia("(max-width: 900px)").matches) return 2;
  return 3;
}

export const CARD_VARIANTS: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 36,
    filter: "blur(8px)",
  },
  animate: (index: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      opacity: {
        delay: Math.min(index, PAGE_SIZE - 1) * 0.025,
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1],
      },
      scale: {
        delay: Math.min(index, PAGE_SIZE - 1) * 0.025,
        duration: 0.72,
        ease: [0.16, 1, 0.3, 1],
      },
      y: {
        delay: Math.min(index, PAGE_SIZE - 1) * 0.025,
        duration: 0.72,
        ease: [0.16, 1, 0.3, 1],
      },
      filter: {
        delay: Math.min(index, PAGE_SIZE - 1) * 0.025,
        duration: 0.48,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -24,
    filter: "blur(7px)",
    transition: {
      duration: 0.38,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export const CARD_LAYOUT_TRANSITION = {
  duration: 0.88,
  ease: [0.16, 1, 0.3, 1] as const,
};
