"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { GalleryPhoto } from "@/lib/gallery";
import { useUi } from "@/components/use-locale";

/*
 * Photo grid for a gallery page plus its full-screen viewer. The grid is a
 * column layout so every photo keeps its own proportion; the viewer steps
 * through the same list with arrows, keys or a swipe.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const SIZES = "(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw";


const pad = (value: number) => String(value).padStart(2, "0");

type Props = { title: string; photos: GalleryPhoto[] };

export function GalleryPhotoGrid({ title, photos }: Props) {
  const reduceMotion = useReducedMotion();
  const ui = useUi();
  const [active, setActive] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const returnFocus = useRef<HTMLElement | null>(null);
  const total = photos.length;

  const open = (index: number, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    setDirection(0);
    setActive(index);
  };

  const close = useCallback(() => setActive(null), []);

  const step = useCallback(
    (delta: number) => {
      setDirection(delta);
      setActive((current) => (current === null ? current : (current + delta + total) % total));
    },
    [total],
  );

  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    window.dispatchEvent(new Event("quad:modal-open"));

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previousOverflow;
      window.dispatchEvent(new Event("quad:modal-close"));
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [isOpen, close, step]);

  return (
    <>
      <ol className="gallery-grid" aria-label={ui.archive.photosOf(title)}>
        {photos.map((photo, index) => (
          <motion.li
            className="gallery-grid__item"
            key={photo.file}
            initial={reduceMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: EASE, delay: reduceMotion ? 0 : (index % 4) * 0.05 }}
          >
            <button
              className="gallery-grid__button"
              type="button"
              onClick={(event) => open(index, event.currentTarget)}
              aria-label={ui.archive.openPhoto(pad(index + 1), pad(total))}
            >
              <span className="gallery-grid__frame">
                <img
                  src={photo.thumb}
                  srcSet={`${photo.thumb} 480w, ${photo.src} 1440w`}
                  sizes={SIZES}
                  alt=""
                  width={photo.width}
                  height={photo.height}
                  loading={index < 8 ? "eager" : "lazy"}
                  decoding="async"
                />
              </span>
              <span className="gallery-grid__caption">
                <span>Nº {pad(index + 1)}</span>
                <span>{title}</span>
              </span>
            </button>
          </motion.li>
        ))}
      </ol>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {isOpen ? (
                <GalleryViewer
                  key="viewer"
                  title={title}
                  photos={photos}
                  index={active}
                  direction={direction}
                  onClose={close}
                  onStep={step}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

type ViewerProps = {
  title: string;
  photos: GalleryPhoto[];
  index: number;
  direction: number;
  onClose: () => void;
  onStep: (delta: number) => void;
};

function GalleryViewer({ title, photos, index, direction, onClose, onStep }: ViewerProps) {
  const reduceMotion = useReducedMotion();
  const ui = useUi();
  const dialog = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const photo = photos[index];
  const total = photos.length;

  useEffect(() => {
    // Focus the dialog itself: keyboard users land inside it, and mouse
    // users don't get a focus ring on the close button.
    dialog.current?.focus({ preventScroll: true });
  }, []);

  // Warm the neighbours so stepping feels instant.
  useEffect(() => {
    for (const offset of [1, -1]) {
      const next = photos[(index + offset + total) % total];
      const image = new Image();
      image.src = next.src;
    }
  }, [index, photos, total]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) onStep(dx < 0 ? 1 : -1);
  };

  const offset = reduceMotion ? 0 : direction * 48;

  return (
    <motion.div
      className="gallery-viewer"
      ref={dialog}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={ui.archive.photoOf(title, pad(index + 1), pad(total))}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
      onKeyDown={(event) => {
        // Keep Tab inside the viewer while it is open.
        if (event.key !== "Tab") return;
        const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        const atStart = document.activeElement === first || document.activeElement === event.currentTarget;
        if (event.shiftKey && atStart) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="gallery-viewer__bar">
        <span>{title}</span>
        <span aria-live="polite">
          {pad(index + 1)} / {pad(total)}
        </span>
        <button className="gallery-viewer__close" type="button" onClick={onClose}>
          {ui.archive.close}
        </button>
      </div>

      <div
        className="gallery-viewer__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <AnimatePresence initial={false} mode="popLayout" custom={offset}>
          <motion.img
            key={photo.file}
            className="gallery-viewer__image"
            src={photo.src}
            alt=""
            width={photo.width}
            height={photo.height}
            draggable={false}
            initial={{ opacity: 0, x: offset, scale: reduceMotion ? 1 : 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -offset }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE }}
          />
        </AnimatePresence>
      </div>

      <div className="gallery-viewer__nav">
        <button type="button" onClick={() => onStep(-1)} aria-label={ui.archive.previousLabel}>
          {ui.archive.previous}
        </button>
        <button type="button" onClick={() => onStep(1)} aria-label={ui.archive.nextLabel}>
          {ui.archive.nextPhoto}
        </button>
      </div>
    </motion.div>
  );
}
