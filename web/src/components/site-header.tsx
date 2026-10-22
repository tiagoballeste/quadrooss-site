"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/page-transition";
import { BrandLogo } from "@/components/brand-logo";
import { siteNavigation } from "@/lib/site-config";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);

    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <header className={`site-header${open ? " is-menu-open" : ""}`}>
      <TransitionLink className="site-header__logo" href="/" onClick={() => setOpen(false)}>
        <BrandLogo priority />
      </TransitionLink>

      <button
        className="site-header__toggle"
        type="button"
        aria-expanded={open}
        aria-controls="site-navigation"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? "Fechar" : "Menu"}
      </button>

      <nav
        className={`site-navigation${open ? " is-open" : ""}`}
        id="site-navigation"
        aria-label="Navegação principal"
      >
        {siteNavigation.map(({ label, href }) => (
          <TransitionLink
            className={pathname === href ? "is-active" : undefined}
            href={href}
            key={href}
            transitionLabel={label.toUpperCase()}
            onClick={() => setOpen(false)}
          >
            {label}
          </TransitionLink>
        ))}
      </nav>
    </header>
  );
}
