"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/page-transition";
import { siteNavigation } from "@/lib/site-config";
import { getUi } from "@/i18n/ui";
import { LANG_COOKIE, LOCALES, LOCALE_LABEL, localeFromPath, stripLocale } from "@/lib/i18n";

export function OptionWheel() {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const ui = getUi(locale);
  const basePath = stripLocale(pathname ?? "/");
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("ow-scroll-lock", open);
    if (open) menuRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.documentElement.classList.remove("ow-scroll-lock");
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const close = () => {
    setOpen(false);
  };

  return (
    <>
      <button
        className={`ow-toggle${open ? " is-open" : ""}`}
        type="button"
        aria-label={open ? ui.nav.closeMenu : ui.nav.openMenu}
        aria-expanded={open}
        aria-controls="responsive-navigation"
        onClick={() => setOpen((current) => !current)}
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
        aria-hidden={!open}
        onClick={(event) => {
          if (event.currentTarget === event.target) close();
        }}
      >
        <nav
          id="responsive-navigation"
          className="ow-root"
          aria-label={ui.nav.menu}
          tabIndex={open ? 0 : -1}
          ref={menuRef}
        >
          {siteNavigation.map(({ label, href }) => (
            <TransitionLink
              aria-current={basePath === href ? "page" : undefined}
              className="ow-item"
              href={href}
              key={href}
              onClick={close}
              tabIndex={open ? 0 : -1}
              transitionLabel={label.toUpperCase()}
            >
              {label}
            </TransitionLink>
          ))}
          <div className="ow-languages" aria-label={ui.nav.language} role="group">
            {LOCALES.map((option) => (
              <TransitionLink
                aria-current={option === locale ? "true" : undefined}
                className="ow-language"
                href={basePath}
                hrefLang={option === "en" ? "en-US" : "pt-BR"}
                key={option}
                locale={option}
                onClick={(event) => {
                  document.cookie = `${LANG_COOKIE}=${option}; Path=/; Max-Age=31536000; SameSite=Lax`;
                  close();
                  if (option === locale) event.preventDefault();
                }}
                tabIndex={open ? 0 : -1}
              >
                {LOCALE_LABEL[option]}
              </TransitionLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
