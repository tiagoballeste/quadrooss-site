"use client";

import { motion, useReducedMotion } from "motion/react";
import { TransitionLink } from "@/components/page-transition";
import type { GallerySummary } from "@/lib/gallery";

/*
 * The "Gallery" list under the Archive dome: one row per gallery with its
 * cover, title, descriptor and photo count. Rows reveal on scroll with the
 * same easing as the Work cards and lead to /archive/<slug>.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

type Props = {
  heading: string;
  galleries: (GallerySummary & { countLabel: string })[];
};

export function ArchiveGalleryList({ heading, galleries }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="archive-gallery" id="gallery" aria-labelledby="archive-gallery-title">
      <header className="archive-gallery__head">
        <span className="archive-gallery__label">(Gallery)</span>
        <h2 className="archive-gallery__title" id="archive-gallery-title">{heading}</h2>
        <span className="archive-gallery__label archive-gallery__label--end" aria-hidden="true">
          Abra uma galeria <span className="archive-gallery__arrow">↘</span>
        </span>
      </header>

      <ol className="archive-gallery__list">
        {galleries.map((gallery, index) => (
          <motion.li
            className="archive-gallery__item"
            key={gallery.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9, ease: EASE, delay: reduceMotion ? 0 : Math.min(index, 4) * 0.06 }}
          >
            <TransitionLink className="archive-gallery__row" href={gallery.href}>
              <span className="archive-gallery__cover">
                <img
                  src={gallery.cover.thumb}
                  alt=""
                  width={gallery.cover.width}
                  height={gallery.cover.height}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="archive-gallery__name">{gallery.title}</span>
              <span className="archive-gallery__meta">{gallery.descriptor}</span>
              <span className="archive-gallery__meta archive-gallery__count">{gallery.countLabel}</span>
              <span className="archive-gallery__view">
                Ver <span className="archive-gallery__arrow" aria-hidden="true">↗</span>
              </span>
            </TransitionLink>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
