"use client";

import { TransitionLink } from "@/components/page-transition";
import { useUi } from "@/components/use-locale";

export function JournalCta() {
  const ui = useUi();

  return (
    <section className="journal-cta" aria-label={ui.journal.contact}>
      <p className="journal-cta__title">{ui.journal.ctaTitle}</p>
      <TransitionLink className="journal-cta__link" href="/contact">
        {ui.journal.ctaLink}
      </TransitionLink>
    </section>
  );
}
