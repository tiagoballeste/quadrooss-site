"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/page-transition";
import { BrandLogo } from "@/components/brand-logo";

const homeNavigation = [
  { label: "Work", href: "/work" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
] as const;

export function HomeHeader() {
  const pathname = usePathname();
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLanguageOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const scrollToHero = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;

    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    window.dispatchEvent(new Event("quad:scroll-hero"));
  };

  return (
    <header className="home-header">
      <TransitionLink
        aria-label={pathname === "/" ? "Voltar à seção hero" : "Voltar à página inicial"}
        className="home-header__brand"
        href="/"
        onClick={scrollToHero}
      >
        <BrandLogo priority />
      </TransitionLink>

      <nav className="home-header__navigation" aria-label="Navegação principal">
        {homeNavigation.map(({ label, href }) => (
          <TransitionLink href={href} key={href} transitionLabel={label.toUpperCase()}>
            {label}
          </TransitionLink>
        ))}
      </nav>

      <div className={`home-header__language${languageOpen ? " is-open" : ""}`} ref={languageMenuRef}>
        <button
          aria-expanded={languageOpen}
          aria-haspopup="menu"
          className="home-header__language-toggle"
          onClick={() => setLanguageOpen((current) => !current)}
          type="button"
        >
          <span>PT-BR</span>
          <span className="home-header__language-arrow" aria-hidden="true">↓</span>
        </button>

        <div className="home-header__language-menu" role="menu" aria-label="Selecionar idioma">
          <button
            aria-current="true"
            onClick={() => setLanguageOpen(false)}
            role="menuitem"
            type="button"
          >
            PT-BR
          </button>
          <button
            aria-disabled="true"
            disabled
            role="menuitem"
            title="A versão em inglês será disponibilizada em breve"
            type="button"
          >
            EN-US
          </button>
        </div>
      </div>
    </header>
  );
}
