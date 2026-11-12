"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { GalleryPhoto } from "@/lib/gallery";
import { useUi } from "@/components/use-locale";

/*
 * Photo grid for a gallery page plus its viewer. Clicking a photo grows it
 * from its place in the grid to the middle of the screen at its real
 * proportions, over a blurred page (like the Archive dome); closing sends it
 * back to its tile. Arrows, keys or a swipe step through the gallery.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const SIZES = "(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw";
const OPEN_MS = 0.6;

const pad = (value: number) => String(value).padStart(2, "0");

type Rect = { left: number; top: number; width: number; height: number };
type Props = { title: string; photos: GalleryPhoto[] };

/** The tile's frame on screen, or null when it is scrolled out of view. */
function tileRect(index: number): Rect | null {
  const frame = document.querySelector<HTMLElement>(`[data-gallery-index="${index}"] .gallery-grid__frame`);
  if (!frame) return null;
  const rect = frame.getBoundingClientRect();
  const visible = rect.bottom > 0 && rect.top < window.innerHeight;
  return visible ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height } : null;
}

/** The largest box with the photo's proportions that fits the stage. */
function fitRect(photo: GalleryPhoto): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const compact = vw <= 700;
  const sides = compact ? 12 : Math.max(32, vw * 0.06);
  const top = compact ? 64 : 72;
  const bottom = compact ? 72 : 80;
  const maxWidth = vw - sides * 2;
  const maxHeight = vh - top - bottom;
  const scale = Math.min(maxWidth / photo.width, maxHeight / photo.height);
  const width = Math.round(photo.width * scale);
  const height = Math.round(photo.height * scale);
  return { left: Math.round((vw - width) / 2), top: Math.round(top + (maxHeight - height) / 2), width, height };
}

export function GalleryPhotoGrid({ title, photos }: Props) {
  const reduceMotion = useReducedMotion();
  const ui = useUi();
  const [active, setActive] = useState<number | null>(null);
  // The tile whose photo is in the viewer stays hidden until the photo is back.
  const [hidden, setHidden] = useState<number | null>(null);
  const [origin, setOrigin] = useState<Rect | null>(null);
  const closing = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const total = photos.length;

  const open = (index: number, trigger: HTMLElement) => {
    returnFocus.current = trigger;
    closing.current = false;
    setOrigin(tileRect(index));
    setActive(index);
    setHidden(index);
  };

  const close = useCallback(() => {
    closing.current = true;
    setActive(null);
  }, []);

  const step = useCallback(
    (delta: number) =>
      setActive((current) => {
        if (current === null) return current;
        const next = (current + delta + total) % total;
        setHidden(next);
        return next;
      }),
    [total],
  );

  const isOpen = active !== null;

  useEffect(() => {
    if (!isOpen) return;
    // Lenis stops the page from scrolling; the scrollbar stays, so nothing shifts.
    window.dispatchEvent(new Event("quad:modal-open"));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
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
            data-gallery-index={index}
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
              <span className="gallery-grid__frame" style={{ visibility: hidden === index ? "hidden" : undefined }}>
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
            <AnimatePresence onExitComplete={() => setHidden(null)}>
              {isOpen ? (
                <GalleryViewer
                  key="viewer"
                  title={title}
                  photos={photos}
                  index={active}
                  origin={origin}
                  closing={closing}
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
  origin: Rect | null;
  closing: { current: boolean };
  onClose: () => void;
  onStep: (delta: number) => void;
};

function GalleryViewer({ title, photos, index, origin, closing, onClose, onStep }: ViewerProps) {
  const reduceMotion = useReducedMotion();
  const ui = useUi();
  const dialog = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const firstIndex = useRef(index);
  const photo = photos[index];
  const total = photos.length;
  const [target, setTarget] = useState<Rect | null>(null);

  // Measure on the client, and again when the window changes size.
  useLayoutEffect(() => {
    const measure = () => setTarget(fitRect(photo));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [photo]);

  useEffect(() => {
    dialog.current?.focus({ preventScroll: true });
  }, []);

  // Warm the neighbours so stepping feels instant.
  useEffect(() => {
    for (const offset of [1, -1]) {
      const image = new Image();
      image.src = photos[(index + offset + total) % total].src;
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

  const duration = reduceMotion ? 0 : OPEN_MS;
  // The first photo grows out of its tile; later ones fade in where they belong.
  const startRect = index === firstIndex.current && origin && !reduceMotion ? origin : null;

  return (
    <motion.div
      ref={dialog}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={ui.archive.photoOf(title, pad(index + 1), pad(total))}
      className="gallery-viewer"
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
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <motion.div
        className="gallery-viewer__backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE }}
      />

      <AnimatePresence propagate>
        {target ? (
          <motion.div
            key={photo.file}
            className="gallery-viewer__photo"
            initial={startRect ? { ...startRect, opacity: 1 } : { ...target, opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
            animate={{ ...target, opacity: 1, scale: 1 }}
            variants={{
              // Closing sends the photo back into its tile when the tile is on
              // screen; stepping to another photo just fades this one out.
              leave: () => {
                const back = closing.current && !reduceMotion ? tileRect(index) : null;
                return back
                  ? { ...back, opacity: 1, scale: 1, transition: { duration: OPEN_MS * 0.8, ease: EASE } }
                  : { opacity: 0, transition: { duration: 0.25 } };
              },
            }}
            exit="leave"
            transition={{ duration, ease: EASE }}
          >
            <img src={photo.src} alt="" draggable={false} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="gallery-viewer__chrome"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.35, delay: reduceMotion ? 0 : 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
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
        <div className="gallery-viewer__nav">
          <button type="button" onClick={() => onStep(-1)} aria-label={ui.archive.previousLabel}>
            {ui.archive.previous}
          </button>
          <button type="button" onClick={() => onStep(1)} aria-label={ui.archive.nextLabel}>
            {ui.archive.nextPhoto}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
