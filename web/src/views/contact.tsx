import { SiteNav } from "@/components/site-nav";
import { ContactHero } from "@/components/contact/contact-hero";
import { ProjectForm } from "@/components/contact/project-form";
import { SiteFooter } from "@/components/site-footer";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const contactMetadata = (locale: Locale) => pageMetadata({ locale, path: "/contact", title: "Contact" });

const HERO = {
  pt: {
    title: "Fechado com boas ideias, narrativas autênticas e marcas que somam.",
    sub: "Manda o contexto do que você tá pensando, escopo e tempo. A gente alinha o conceito e faz acontecer do jeito certo.",
  },
  en: {
    title: "Into good ideas, authentic stories and brands that add up.",
    sub: "Send me the context of what you have in mind, the scope and the timing. We line up the concept and make it happen the right way.",
  },
} as const;

export function ContactView({ locale }: { locale: Locale }) {
  return (
    <main className="site-page contact-page">
      <SiteNav />
      <div className="ct-page-outer">
        <ContactHero title={HERO[locale].title} sub={HERO[locale].sub} />
        <ProjectForm locale={locale} />
      </div>
      <SiteFooter />
    </main>
  );
}
