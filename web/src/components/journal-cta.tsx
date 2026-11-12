import { TransitionLink } from "@/components/page-transition";

export function JournalCta() {
  return (
    <section className="journal-cta" aria-label="Contato">
      <p className="journal-cta__title">Bora trocar ideia?</p>
      <TransitionLink className="journal-cta__link" href="/contact">
        Fale comigo →
      </TransitionLink>
    </section>
  );
}
