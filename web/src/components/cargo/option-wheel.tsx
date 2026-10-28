"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/page-transition";
import { siteNavigation } from "@/lib/site-config";

export function OptionWheel() {
  const pathname = usePathname();
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
        aria-label={open ? "Fechar menu" : "Abrir menu"}
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
          aria-label="Menu de navegação"
          tabIndex={open ? 0 : -1}
          ref={menuRef}
        >
          {siteNavigation.map(({ label, href }) => (
            <TransitionLink
              aria-current={pathname === href ? "page" : undefined}
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
        </nav>
      </div>
    </>
  );
}
