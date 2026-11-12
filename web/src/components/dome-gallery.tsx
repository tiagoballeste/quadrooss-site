"use client";

import { useEffect, useMemo, useRef } from "react";
import { useUi } from "@/components/use-locale";
import type { ArchiveImage } from "@/lib/archive-media";

/*
 * The Archive dome: every archive photo on the inside of a slowly turning
 * sphere. Drag to spin it (with inertia), click a photo to enlarge it over a
 * blurred backdrop. Based on React Bits' DomeGallery, written as a React
 * component so it mounts and cleans up with the page.
 */

type DomeItem = ArchiveImage & { x: number; y: number; sizeX: number; sizeY: number };

const SEGMENTS = 35;
const FIT = 0.75;
const MIN_RADIUS = 800;
const MAX_VERTICAL_ROTATION = 9;
const DRAG_SENSITIVITY = 20;
const DRAG_DAMPENING = 1;
const ENLARGE_MS = 300;
const OPENED_SIZE = 400;
const AUTO_ROTATE_SPEED = -0.0025; // degrees per millisecond

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const normalizeAngle = (degrees: number) => ((degrees % 360) + 360) % 360;
const wrapAngleSigned = (degrees: number) => ((((degrees + 180) % 360) + 360) % 360) - 180;

function buildItems(pool: ArchiveImage[]): DomeItem[] {
  const xCols = Array.from({ length: SEGMENTS }, (_, index) => -37 + index * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];
  const coords = xCols.flatMap((x, column) =>
    (column % 2 === 0 ? evenYs : oddYs).map((y) => ({ x, y, sizeX: 2, sizeY: 2 })),
  );
  if (pool.length === 0) return [];

  const used = coords.map((_, index) => pool[index % pool.length]);
  // Avoid the same photo twice in a row.
  for (let i = 1; i < used.length; i++) {
    if (used[i].src !== used[i - 1].src) continue;
    for (let j = i + 1; j < used.length; j++) {
      if (used[j].src !== used[i].src) {
        [used[i], used[j]] = [used[j], used[i]];
        break;
      }
    }
  }
  return coords.map((coord, index) => ({ ...coord, ...used[index] }));
}

function baseRotation(item: { x: number; y: number; sizeX: number; sizeY: number }) {
  const unit = 360 / SEGMENTS / 2;
  return {
    rotateX: unit * (item.y - (item.sizeY - 1) / 2),
    rotateY: unit * (item.x + (item.sizeX - 1) / 2),
  };
}

export function DomeGallery({ images }: { images: ArchiveImage[] }) {
  const ui = useUi();
  const items = useMemo(() => buildItems(images), [images]);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const main = mainRef.current;
    const sphere = sphereRef.current;
    const viewer = viewerRef.current;
    const frame = frameRef.current;
    const scrim = scrimRef.current;
    if (!root || !main || !sphere || !viewer || !frame || !scrim) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rotation = { x: 0, y: 0 };
    let startRotation = { x: 0, y: 0 };
    let startPosition: { x: number; y: number } | null = null;
    let dragging = false;
    let moved = false;
    let opening = false;
    let openStartedAt = 0;
    let lastDragEndAt = 0;
    let inertiaFrame = 0;
    let autoFrame = 0;
    let focused: HTMLElement | null = null;
    let originalTile: DOMRect | null = null;
    let velocity: Array<{ x: number; y: number; t: number }> = [];
    let scrollLocked = false;
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    };

    const applyTransform = () => {
      sphere.style.transform = `translateZ(calc(var(--dg-radius) * -1)) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;
    };

    const lockScroll = () => {
      if (scrollLocked) return;
      scrollLocked = true;
      window.dispatchEvent(new Event("quad:modal-open"));
    };
    const unlockScroll = () => {
      if (!scrollLocked || root.dataset.enlarging === "true") return;
      scrollLocked = false;
      window.dispatchEvent(new Event("quad:modal-close"));
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.max(1, entry.contentRect.width);
      const height = Math.max(1, entry.contentRect.height);
      const minDim = Math.min(width, height);
      const basis = width / height >= 1.3 ? width : minDim;
      const radius = Math.round(clamp(Math.min(basis * FIT, height * 1.35), MIN_RADIUS, Infinity));
      root.style.setProperty("--dg-radius", `${radius}px`);
      root.style.setProperty("--dg-viewer-pad", `${Math.max(8, Math.round(minDim * 0.25))}px`);
      applyTransform();
    });
    resizeObserver.observe(root);

    const stopInertia = () => {
      if (inertiaFrame) cancelAnimationFrame(inertiaFrame);
      inertiaFrame = 0;
    };

    const startInertia = (vx: number, vy: number) => {
      let velocityX = clamp(vx, -1.4, 1.4) * 80;
      let velocityY = clamp(vy, -1.4, 1.4) * 80;
      let frames = 0;
      const friction = 0.94 + 0.055 * DRAG_DAMPENING;
      const stopThreshold = 0.015 - 0.01 * DRAG_DAMPENING;
      const maxFrames = Math.round(90 + 270 * DRAG_DAMPENING);
      const step = () => {
        velocityX *= friction;
        velocityY *= friction;
        if ((Math.abs(velocityX) < stopThreshold && Math.abs(velocityY) < stopThreshold) || ++frames > maxFrames) {
          inertiaFrame = 0;
          return;
        }
        rotation = {
          x: clamp(rotation.x - velocityY / 200, -MAX_VERTICAL_ROTATION, MAX_VERTICAL_ROTATION),
          y: wrapAngleSigned(rotation.y + velocityX / 200),
        };
        applyTransform();
        inertiaFrame = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaFrame = requestAnimationFrame(step);
    };

    if (!reducedMotion) {
      let previous = 0;
      const autoRotate = (time: number) => {
        const delta = previous ? Math.min(time - previous, 48) : 0;
        previous = time;
        if (!dragging && !opening && !inertiaFrame && root.dataset.enlarging !== "true") {
          rotation.y = wrapAngleSigned(rotation.y + AUTO_ROTATE_SPEED * delta);
          applyTransform();
        }
        autoFrame = requestAnimationFrame(autoRotate);
      };
      autoFrame = requestAnimationFrame(autoRotate);
    }

    const onPointerDown = (event: PointerEvent) => {
      if (focused) return;
      stopInertia();
      dragging = true;
      moved = false;
      startRotation = { ...rotation };
      startPosition = { x: event.clientX, y: event.clientY };
      velocity = [{ x: event.clientX, y: event.clientY, t: performance.now() }];
    };

    const onPointerMove = (event: PointerEvent) => {
      if (focused || !dragging || !startPosition) return;
      const dx = event.clientX - startPosition.x;
      const dy = event.clientY - startPosition.y;
      if (!moved && dx * dx + dy * dy > 16) {
        moved = true;
        try {
          main.setPointerCapture(event.pointerId);
        } catch {}
      }
      rotation = {
        x: clamp(startRotation.x - dy / DRAG_SENSITIVITY, -MAX_VERTICAL_ROTATION, MAX_VERTICAL_ROTATION),
        y: wrapAngleSigned(startRotation.y + dx / DRAG_SENSITIVITY),
      };
      applyTransform();
      velocity.push({ x: event.clientX, y: event.clientY, t: performance.now() });
      if (velocity.length > 6) velocity.shift();
    };

    const onPointerUp = (event: PointerEvent) => {
      try {
        main.releasePointerCapture(event.pointerId);
      } catch {}
      if (focused || !dragging) return;
      dragging = false;
      if (velocity.length >= 2) {
        const first = velocity[0];
        const last = velocity[velocity.length - 1];
        const dt = Math.max(1, last.t - first.t);
        const vx = clamp((last.x - first.x) / dt, -1.2, 1.2);
        const vy = clamp((last.y - first.y) / dt, -1.2, 1.2);
        if (Math.abs(vx) > 0.02 || Math.abs(vy) > 0.02) startInertia(vx, vy);
      }
      if (moved) lastDragEndAt = performance.now();
      moved = false;
      startPosition = null;
    };

    const open = (tile: HTMLElement) => {
      const image = tile.querySelector<HTMLElement>(".dg-item__image");
      if (opening || !image) return;
      opening = true;
      openStartedAt = performance.now();
      lockScroll();
      focused = image;

      const coords = {
        x: Number(tile.dataset.offsetX),
        y: Number(tile.dataset.offsetY),
        sizeX: 2,
        sizeY: 2,
      };
      const parentRotation = baseRotation(coords);
      let rotY = -(normalizeAngle(parentRotation.rotateY) + normalizeAngle(rotation.y)) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRotation.rotateX - rotation.x;
      tile.style.setProperty("--dg-rot-y-delta", `${rotY}deg`);
      tile.style.setProperty("--dg-rot-x-delta", `${rotX}deg`);

      // An invisible copy of the tile, turned to face the viewer, gives the
      // rectangle the enlarged photo starts from.
      const reference = document.createElement("div");
      reference.className = "dg-item__image dg-item__image--reference";
      reference.style.opacity = "0";
      reference.style.transform = `rotateX(${-parentRotation.rotateX}deg) rotateY(${-parentRotation.rotateY}deg)`;
      tile.appendChild(reference);
      const tileRect = reference.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      if (tileRect.width <= 0 || tileRect.height <= 0) {
        opening = false;
        focused = null;
        reference.remove();
        unlockScroll();
        return;
      }
      originalTile = tileRect;
      image.style.visibility = "hidden";

      const overlay = document.createElement("div");
      overlay.className = "dg-enlarge";
      Object.assign(overlay.style, {
        position: "absolute",
        left: `${frameRect.left - mainRect.left}px`,
        top: `${frameRect.top - mainRect.top}px`,
        width: `${frameRect.width}px`,
        height: `${frameRect.height}px`,
        opacity: "0",
        zIndex: "30",
        transformOrigin: "top left",
        transition: `transform ${ENLARGE_MS}ms ease, opacity ${ENLARGE_MS}ms ease`,
        transform: `translate(${tileRect.left - frameRect.left}px, ${tileRect.top - frameRect.top}px) scale(${
          tileRect.width / frameRect.width || 1
        }, ${tileRect.height / frameRect.height || 1})`,
      });
      const photo = document.createElement("img");
      photo.src = tile.dataset.src ?? "";
      photo.alt = "";
      overlay.appendChild(photo);
      viewer.appendChild(overlay);

      later(() => {
        if (!overlay.isConnected) return;
        overlay.style.opacity = "1";
        overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
        root.dataset.enlarging = "true";
      }, 16);

      // Second step: settle to the opened size, centred in the frame.
      const onFirstEnd = (event: TransitionEvent) => {
        if (event.propertyName !== "transform") return;
        overlay.removeEventListener("transitionend", onFirstEnd);
        const size = Math.min(OPENED_SIZE, frameRect.width, frameRect.height);
        overlay.style.transition = `left ${ENLARGE_MS}ms ease, top ${ENLARGE_MS}ms ease, width ${ENLARGE_MS}ms ease, height ${ENLARGE_MS}ms ease`;
        requestAnimationFrame(() => {
          overlay.style.left = `${frameRect.left - mainRect.left + (frameRect.width - size) / 2}px`;
          overlay.style.top = `${frameRect.top - mainRect.top + (frameRect.height - size) / 2}px`;
          overlay.style.width = `${size}px`;
          overlay.style.height = `${size}px`;
        });
      };
      overlay.addEventListener("transitionend", onFirstEnd);
    };

    const close = () => {
      if (performance.now() - openStartedAt < 250) return;
      const image = focused;
      const tile = image?.parentElement;
      const overlay = viewer.querySelector<HTMLElement>(".dg-enlarge");
      if (!image || !tile || !overlay) return;
      const reference = tile.querySelector(".dg-item__image--reference");
      const rootRect = root.getBoundingClientRect();
      const current = overlay.getBoundingClientRect();
      const target = originalTile;

      const finish = () => {
        reference?.remove();
        originalTile = null;
        tile.style.transition = "none";
        image.style.transition = "none";
        tile.style.setProperty("--dg-rot-y-delta", "0deg");
        tile.style.setProperty("--dg-rot-x-delta", "0deg");
        requestAnimationFrame(() => {
          image.style.visibility = "";
          image.style.opacity = "0";
          focused = null;
          delete root.dataset.enlarging;
          requestAnimationFrame(() => {
            tile.style.transition = "";
            image.style.transition = "opacity 300ms ease-out";
            requestAnimationFrame(() => {
              image.style.opacity = "1";
              later(() => {
                image.style.transition = "";
                image.style.opacity = "";
                opening = false;
                unlockScroll();
              }, 300);
            });
          });
        });
      };

      if (!target) {
        overlay.remove();
        finish();
        return;
      }

      const closing = document.createElement("div");
      closing.className = "dg-enlarge-closing";
      closing.style.cssText = `position:absolute;left:${current.left - rootRect.left}px;top:${current.top - rootRect.top}px;width:${current.width}px;height:${current.height}px;z-index:9999;border-radius:var(--dg-enlarge-radius,32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:all ${ENLARGE_MS}ms ease-out;pointer-events:none;`;
      const photo = overlay.querySelector("img")?.cloneNode() as HTMLImageElement | undefined;
      if (photo) {
        photo.style.cssText = "width:100%;height:100%;object-fit:cover;";
        closing.appendChild(photo);
      }
      overlay.remove();
      root.appendChild(closing);
      closing.getBoundingClientRect();
      requestAnimationFrame(() => {
        Object.assign(closing.style, {
          left: `${target.left - rootRect.left}px`,
          top: `${target.top - rootRect.top}px`,
          width: `${target.width}px`,
          height: `${target.height}px`,
          opacity: "0",
        });
      });
      closing.addEventListener(
        "transitionend",
        () => {
          closing.remove();
          finish();
        },
        { once: true },
      );
    };

    const canOpen = () => !dragging && !moved && performance.now() - lastDragEndAt >= 80 && !opening;
    const tileFromEvent = (event: Event) =>
      (event.target as HTMLElement | null)?.closest<HTMLElement>(".dg-item") ?? null;
    const onClick = (event: MouseEvent) => {
      const tile = tileFromEvent(event);
      if (tile && (event.target as HTMLElement).closest(".dg-item__image") && canOpen()) open(tile);
    };
    const onTouchUp = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      const tile = tileFromEvent(event);
      if (tile && (event.target as HTMLElement).closest(".dg-item__image") && canOpen()) open(tile);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if ((event.key === "Enter" || event.key === " ") && (event.target as HTMLElement)?.classList.contains("dg-item__image")) {
        event.preventDefault();
        const tile = (event.target as HTMLElement).closest<HTMLElement>(".dg-item");
        if (tile && canOpen()) open(tile);
      }
    };

    main.addEventListener("pointerdown", onPointerDown);
    main.addEventListener("pointermove", onPointerMove);
    main.addEventListener("pointerup", onPointerUp);
    main.addEventListener("pointercancel", onPointerUp);
    sphere.addEventListener("click", onClick);
    sphere.addEventListener("pointerup", onTouchUp);
    scrim.addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    applyTransform();

    return () => {
      resizeObserver.disconnect();
      stopInertia();
      if (autoFrame) cancelAnimationFrame(autoFrame);
      timers.forEach((id) => window.clearTimeout(id));
      main.removeEventListener("pointerdown", onPointerDown);
      main.removeEventListener("pointermove", onPointerMove);
      main.removeEventListener("pointerup", onPointerUp);
      main.removeEventListener("pointercancel", onPointerUp);
      sphere.removeEventListener("click", onClick);
      sphere.removeEventListener("pointerup", onTouchUp);
      scrim.removeEventListener("click", close);
      document.removeEventListener("keydown", onKey);
      if (scrollLocked) window.dispatchEvent(new Event("quad:modal-close"));
    };
  }, [items]);

  return (
    <div
      ref={rootRef}
      className="dg-sphere-root"
      style={{
        ["--dg-segments-x" as string]: SEGMENTS,
        ["--dg-segments-y" as string]: SEGMENTS,
        ["--dg-overlay-blur-color" as string]: "#0b0b0a",
        ["--dg-tile-radius" as string]: "30px",
        ["--dg-enlarge-radius" as string]: "30px",
      }}
    >
      <div ref={mainRef} className="dg-main">
        <div className="dg-stage">
          <div ref={sphereRef} className="dg-sphere">
            {items.map((item) => (
              <div
                className="dg-item"
                data-offset-x={item.x}
                data-offset-y={item.y}
                data-src={item.src}
                key={`${item.x},${item.y}`}
                style={{
                  ["--dg-offset-x" as string]: item.x,
                  ["--dg-offset-y" as string]: item.y,
                  ["--dg-item-size-x" as string]: item.sizeX,
                  ["--dg-item-size-y" as string]: item.sizeY,
                }}
              >
                <div aria-label={ui.archive.openPhotoShort} className="dg-item__image" role="button" tabIndex={0}>
                  <img alt={item.alt} decoding="async" draggable={false} src={item.thumb} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="dg-overlay" />
        <div className="dg-overlay dg-overlay--blur" />
        <div className="dg-edge-fade dg-edge-fade--top" />
        <div className="dg-edge-fade dg-edge-fade--bottom" />
        <div ref={viewerRef} className="dg-viewer">
          <div ref={scrimRef} className="dg-scrim" />
          <div ref={frameRef} className="dg-frame" />
        </div>
      </div>
    </div>
  );
}
