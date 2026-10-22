"use client";

import { TransitionLink } from "@/components/page-transition";
import Image from "next/image";
import { useEffect, useRef } from "react";

const projects = [
  {
    title: "Havaianas — Nuitsz",
    role: "Filmmaking",
    align: "left",
    size: "wide",
    cover: "/images/work/havaianas-nuitsz.png",
  },
  {
    title: "Nowdays 4/20",
    role: "Filmmaking",
    align: "right",
    size: "wide",
    cover: "/images/work/nowdays-420.png",
  },
  {
    title: "Kyan Cena 2K25",
    role: "Filmmaking",
    align: "left",
    size: "compact",
    cover: "/images/work/kyan-cena-2k25.png",
  },
  {
    title: "Alok — Rave The World",
    role: "Filmmaking",
    align: "right",
    size: "compact",
    cover: "/images/work/alok-rave-the-world.png",
  },
  {
    title: "Umbro — Urban Glow",
    role: "Direção Criativa & Produção Executiva",
    align: "left",
    size: "wide",
    cover: "/images/work/umbro-urban-glow.png",
  },
  {
    title: "Champion — What Moves You?",
    role: "Direção Criativa & Produção Executiva",
    align: "right",
    size: "wide",
    cover: "/images/work/champion-what-moves-you.png",
  },
] as const;

export function HomeWorkShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinLayerRef = useRef<HTMLDivElement>(null);
  const riseLayerRef = useRef<HTMLDivElement>(null);

  // The reference transition uses two opposing scroll-linked movements:
  // the black Work layer rises one viewport while its content compensates at
  // half that speed. The result is a restrained parallax before sticky takes over.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const section = sectionRef.current;
        const pinLayer = pinLayerRef.current;
        const riseLayer = riseLayerRef.current;
        if (!section || !pinLayer || !riseLayer) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          pinLayer.style.transform = "translate3d(0, 0, 0)";
          riseLayer.style.transform = "translate3d(0, 0, 0)";
          return;
        }

        const viewportHeight = window.innerHeight;
        const sectionTop = section.getBoundingClientRect().top;
        const progress = 1 - sectionTop / viewportHeight;
        const clampedProgress = Math.min(1, Math.max(0, progress));
        const distance = viewportHeight * (1 - clampedProgress);

        pinLayer.style.transform = `translate3d(0, ${-distance}px, 0)`;
        riseLayer.style.transform = `translate3d(0, ${distance * 0.5}px, 0)`;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="home-work-shell"
      aria-labelledby="home-work-title"
    >
      <div
        ref={pinLayerRef}
        className="home-work"
      >
        <div
          ref={riseLayerRef}
          className="home-work__rise"
        >
          <div className="home-work__sticky">
            <span className="home-work__eyebrow">( WORK )</span>
            <h2 id="home-work-title">TÁ TUDO<br />AQUI</h2>
          </div>

          <ol className="home-work__projects">
            {projects.map((project, index) => (
              <li
                className={`home-work__project is-${project.align} is-${project.size}`}
                key={project.title}
              >
                <TransitionLink
                  className="home-work__project-link"
                  href="/work"
                  aria-label={`Ver ${project.title}`}
                >
                  <span className="home-work__cover">
                    <Image
                      alt=""
                      fill
                      priority={index < 2}
                      sizes="(max-width: 700px) 84vw, (max-width: 900px) 55vw, 49vw"
                      src={project.cover}
                    />
                  </span>
                  <span className="home-work__meta">
                    <strong>{project.title}</strong>
                    <small>{project.role}</small>
                  </span>
                </TransitionLink>
              </li>
            ))}
          </ol>

          <div className="home-work__more">
            <TransitionLink href="/work" transitionLabel="WORK">
              <span>Ver mais</span>
              <span aria-hidden="true">→</span>
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
