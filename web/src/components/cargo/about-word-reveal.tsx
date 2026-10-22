"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Fragment, useRef } from "react";

export const ABOUT_COPY = {
  "pt-BR": [
    "Salve, eu sou o Quadros. Filmmaker e diretor criativo, faço filmes para artistas, festivais e marcas da música.",
    "Trabalho com artistas, managers, agências e marcas, no Brasil e fora dele. Escrevo o roteiro, monto a equipe, estou no set e acompanho a montagem até a entrega.",
    "De São Paulo para o mundo.",
  ],
  "en-US": [
    "Hey, I’m Quadros. Filmmaker and creative director, I make films for artists, festivals and music brands.",
    "I work with artists, managers, agencies and brands, in Brazil and abroad. I write the script, build the crew, run the set and stay on the edit through delivery.",
    "From São Paulo to the world.",
  ],
} as const;

const PARAGRAPHS = ABOUT_COPY["pt-BR"];

const START_OPACITY = 0.15;
const SPREAD = 0.8;
const WORD_DURATION = 0.2;

interface WordProgressRange {
  start: number;
  end: number;
}

function getWordProgressRange(index: number, count: number): WordProgressRange {
  const start = count <= 1 ? 0 : (index / (count - 1)) * SPREAD;

  return {
    start,
    end: Math.min(1, start + WORD_DURATION),
  };
}

function Word({
  children,
  progress,
  index,
  count,
  reducedMotion,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  count: number;
  reducedMotion: boolean;
}) {
  const { start, end } = getWordProgressRange(index, count);
  const opacity = useTransform(
    progress,
    [start, end],
    [START_OPACITY, 1],
    { clamp: true },
  );

  return (
    <motion.span aria-hidden="true" style={reducedMotion ? undefined : { opacity }}>
      {children}
    </motion.span>
  );
}

export function AboutWordReveal() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 82%", "start 50%"],
  });
  const wordCount = PARAGRAPHS.join(" ").split(" ").length;
  let wordIndex = 0;

  return (
    <section
      ref={sectionRef}
      className="about-reveal"
      aria-labelledby="about-reveal-heading"
    >
      <div className="about-reveal__stage">
        <h1
          id="about-reveal-heading"
          className="about-reveal__heading"
          aria-label={PARAGRAPHS.join(" ")}
        >
          {PARAGRAPHS.map((paragraph, paragraphIndex) => (
            <Fragment key={paragraph}>
              <span className="about-reveal__paragraph">
                {paragraph.split(" ").map((word, index, words) => {
                  const currentIndex = wordIndex++;

                  return (
                    <Fragment key={`${word}-${currentIndex}`}>
                      <Word
                        progress={scrollYProgress}
                        index={currentIndex}
                        count={wordCount}
                        reducedMotion={Boolean(reducedMotion)}
                      >
                        {word}
                      </Word>
                      {index < words.length - 1 ? " " : null}
                    </Fragment>
                  );
                })}
              </span>
              {paragraphIndex < PARAGRAPHS.length - 1 ? <br /> : null}
            </Fragment>
          ))}
        </h1>
      </div>
    </section>
  );
}
