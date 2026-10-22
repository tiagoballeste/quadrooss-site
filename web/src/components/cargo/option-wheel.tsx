"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/page-transition";
import { siteNavigation } from "@/lib/site-config";

const items = siteNavigation.map(({ label, href }) => [label, href] as const);

export function OptionWheel() {
  const pathname = usePathname();
  const activeIndex = Math.max(0, items.findIndex(([, href]) => href === pathname));
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(activeIndex);
  const positionRef = useRef(activeIndex);
  const drag = useRef<{ y: number; position: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const wheelAccumulator = useRef(0);
  const wheelDirection = useRef(0);
  const wheelLockedUntil = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle("ow-scroll-lock", open);
    return () => document.documentElement.classList.remove("ow-scroll-lock");
  }, [open]);

  useEffect(() => {
    positionRef.current = activeIndex;
    setPosition(activeIndex);
  }, [activeIndex]);

  const placements = useMemo(() => {
    const fontSize = 28;
    const rowHeight = fontSize * 1.65;
    const tilt = (6 * Math.PI) / 180;
    const radius = rowHeight / tilt;

    return items.map((_, index) => {
      const distance = index - position;
      const angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, distance * tilt));
      return {
        x: -radius * (1 - Math.cos(angle)),
        y: radius * Math.sin(angle),
        rotate: (angle * 180) / Math.PI,
        opacity: Math.max(0.26, 1 - Math.abs(distance) * 0.2),
        blur: Math.abs(distance) * 1.4,
      };
    });
  }, [position]);

  const move = (value: number) => {
    const next = Math.max(0, Math.min(items.length - 1, value));
    positionRef.current = next;
    setPosition(next);
  };

  const close = () => {
    setOpen(false);
    wheelAccumulator.current = 0;
  };

  return (
    <>
      <button
        className={`ow-toggle${open ? " is-open" : ""}`}
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => {
          setOpen((current) => !current);
          wheelAccumulator.current = 0;
        }}
      >
        <span className="ow-toggle__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <div
        className={`ow-backdrop${open ? " is-open" : ""}`}
        data-lenis-prevent
        onClick={(event) => {
          if (event.currentTarget === event.target) close();
        }}
      >
        <div
          className="ow-root"
          role="listbox"
          aria-label="Menu de navegação"
          tabIndex={open ? 0 : -1}
          onWheel={(event) => {
            event.preventDefault();
            const now = performance.now();
            if (now < wheelLockedUntil.current) return;

            const delta = event.deltaMode === 1 ? event.deltaY * 24 : event.deltaY;
            const direction = Math.sign(delta);
            if (direction !== wheelDirection.current) {
              wheelAccumulator.current = 0;
              wheelDirection.current = direction;
            }
            wheelAccumulator.current += delta;

            const threshold = 110;
            if (Math.abs(wheelAccumulator.current) < threshold) return;

            move(Math.round(positionRef.current) + Math.sign(wheelAccumulator.current));
            wheelAccumulator.current = 0;
            wheelLockedUntil.current = now + 180;
          }}
          onPointerDown={(event) => {
            drag.current = { y: event.clientY, position: positionRef.current, moved: false };
            suppressClick.current = false;
          }}
          onPointerMove={(event) => {
            if (!drag.current) return;
            const distance = event.clientY - drag.current.y;
            if (!drag.current.moved && Math.abs(distance) < 10) return;
            if (!drag.current.moved) {
              drag.current.moved = true;
              event.currentTarget.setPointerCapture(event.pointerId);
            }
            move(drag.current.position - distance / 96);
          }}
          onPointerUp={() => {
            suppressClick.current = Boolean(drag.current?.moved);
            drag.current = null;
            move(Math.round(positionRef.current));
          }}
          onPointerCancel={() => {
            drag.current = null;
            move(Math.round(positionRef.current));
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") close();
            if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
              event.preventDefault();
              move(Math.round(positionRef.current) - 1);
            }
            if (event.key === "ArrowDown" || event.key === "ArrowRight") {
              event.preventDefault();
              move(Math.round(positionRef.current) + 1);
            }
          }}
        >
          {items.map(([label, href], index) => {
            const placement = placements[index];
            return (
              <TransitionLink
                className={`ow-item${Math.round(position) === index ? " ow-item--selected" : ""}`}
                href={href}
                key={href}
                transitionLabel={label.toUpperCase()}
                role="option"
                aria-selected={Math.round(position) === index}
                onClick={(event) => {
                  if (suppressClick.current) {
                    event.preventDefault();
                    suppressClick.current = false;
                    return;
                  }
                  close();
                }}
                style={{
                  opacity: placement.opacity,
                  filter: `blur(${placement.blur}px)`,
                  transform: `translate(${placement.x}px, calc(${placement.y}px - 50%)) rotate(${placement.rotate}deg)`,
                }}
              >
                {label}
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </>
  );
}
