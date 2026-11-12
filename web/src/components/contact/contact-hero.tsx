"use client";

import { Fragment, useEffect, useRef } from "react";

/*
 * Contact page opening: a tall section with the title pinned in the middle of
 * the screen. As the page scrolls, the words come in one after another (from
 * transparent and blurred to sharp) and the block straightens from a slight tilt.
 */

const BASE_ROTATION = 5;
const BLUR = 10;
const STAGGER = 0.55;
const START_AT = 0.12;

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, index) =>
        /^\s+$/.test(part) ? (
          <Fragment key={index}>{part}</Fragment>
        ) : part ? (
          <span className="sr-word" key={index}>
            {part}
          </span>
        ) : null,
      )}
    </>
  );
}

export function ContactHero({ title, sub }: { title: string; sub: string }) {
  const heroRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const inner = innerRef.current;
    if (!hero || !inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const words = [...hero.querySelectorAll<HTMLElement>(".sr-word")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = hero.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.min(1, Math.max(0, -rect.top / travel));
      const progress = START_AT + (1 - START_AT) * raw;
      inner.style.transform = `rotate(${(BASE_ROTATION * (1 - progress)).toFixed(3)}deg)`;
      const count = words.length;
      words.forEach((word, index) => {
        const start = count > 1 ? (index / (count - 1)) * (1 - STAGGER) : 0;
        const wordProgress = Math.min(1, Math.max(0, (progress - start) / STAGGER));
        word.style.opacity = String(wordProgress);
        word.style.filter = `blur(${(BLUR * (1 - wordProgress)).toFixed(2)}px)`;
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [title, sub]);

  return (
    <section className="ct-hero" ref={heroRef}>
      <div className="ct-hero-sticky">
        <div className="ct-hero-inner" ref={innerRef}>
          <h1 className="ct-hero-title">
            <Words text={title} />
          </h1>
          <p className="ct-hero-sub">
            <Words text={sub} />
          </p>
        </div>
      </div>
    </section>
  );
}
