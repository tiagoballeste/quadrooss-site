import { AboutWordReveal } from "@/components/about-word-reveal";
import { ContactWizard } from "@/components/contact-wizard";
import { OptionWheel } from "@/components/option-wheel";
import { HomeHeader } from "@/components/home-header";
import { HomeWorkShowcase } from "@/components/home-work-showcase";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import { getContentStats } from "@/lib/content-stats";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/lib/site-config";

export const homeMetadata = (locale: Locale) =>
  pageMetadata({ locale, path: "/", absoluteTitle: siteConfig.title });

export function HomeView({ locale }: { locale: Locale }) {
  const stats = getContentStats();
  const ui = getUi(locale);

  return (
    <main className="site-home">
      <HomeHeader />
      <OptionWheel />

      <section className="idx-hero" id="hero">
        <div className="idx-hero__stage">
          <div className="idx-stats">
            {stats.map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>

          <div className="idx-foot">
            <p>{ui.home.intro}</p>
          </div>
        </div>
      </section>

      <AboutWordReveal />
      <HomeWorkShowcase />
      <ContactWizard theme="light" />
      <SiteFooter />
    </main>
  );
}
