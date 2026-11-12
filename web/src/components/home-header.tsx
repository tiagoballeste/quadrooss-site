"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/page-transition";
import { BrandLogo } from "@/components/brand-logo";
import { getUi } from "@/i18n/ui";
import { LANG_COOKIE, LOCALES, LOCALE_LABEL, localeFromPath, stripLocale, type Locale } from "@/lib/i18n";

function rememberLocale(locale: Locale) {
  // Read by the Cloudflare middleware: a manual choice beats the country.
  document.cookie = `${LANG_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

const homeNavigation = [
  { label: "Work", href: "/work" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
] as const;

export function HomeHeader() {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const ui = getUi(locale);
  const basePath = stripLocale(pathname ?? "/");
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
    if (basePath !== "/") return;

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
        aria-label={basePath === "/" ? ui.nav.backToHero : ui.nav.backToHome}
        className="home-header__brand"
        href="/"
        onClick={scrollToHero}
      >
        <BrandLogo priority />
      </TransitionLink>

      <nav className="home-header__navigation" aria-label={ui.nav.main}>
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
          <span>{LOCALE_LABEL[locale]}</span>
          <span className="home-header__language-arrow" aria-hidden="true">↓</span>
        </button>

        <div className="home-header__language-menu" role="menu" aria-label={ui.nav.language}>
          {LOCALES.map((option) => (
            <TransitionLink
              aria-current={option === locale ? "true" : undefined}
              href={basePath}
              hrefLang={option === "en" ? "en-US" : "pt-BR"}
              key={option}
              locale={option}
              onClick={(event) => {
                rememberLocale(option);
                setLanguageOpen(false);
                if (option === locale) event.preventDefault();
              }}
              role="menuitem"
            >
              {LOCALE_LABEL[option]}
            </TransitionLink>
          ))}
        </div>
      </div>
    </header>
  );
}
