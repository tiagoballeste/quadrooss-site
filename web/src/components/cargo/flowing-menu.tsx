"use client";

import { useState } from "react";
import { TransitionLink } from "@/components/page-transition";

const roles = ["Diretor", "Editor", "Filmmaker", "Produtor executivo"];

export function FlowingMenu() {
  const [active, setActive] = useState<number | null>(null);
  const [edge, setEdge] = useState<"top" | "bottom">("bottom");

  return (
    <section className="fm-wrap">
      <nav className="fm-menu" aria-label="Áreas de atuação">
        {roles.map((role, index) => (
          <div className="fm-item" key={role}>
            <TransitionLink
              className="fm-item-link"
              href="/work"
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setEdge(event.clientY - rect.top < rect.height / 2 ? "top" : "bottom");
                setActive(index);
              }}
              onMouseLeave={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setEdge(event.clientY - rect.top < rect.height / 2 ? "top" : "bottom");
                setActive(null);
              }}
            >
              {role}
            </TransitionLink>
            <div
              className={`fm-marquee${active === index ? " is-visible" : ""}`}
              data-edge={edge}
            >
              <div className="fm-marquee-inner">
                {Array.from({ length: 14 }, (_, item) => (
                  <span key={item}>{role}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
    </section>
  );
}
