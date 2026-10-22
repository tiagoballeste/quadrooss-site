import { AboutWordReveal } from "@/components/cargo/about-word-reveal";
import { ContactWizard } from "@/components/cargo/contact-wizard";
import { HomeHeader } from "@/components/home-header";
import { HomeWorkShowcase } from "@/components/home-work-showcase";
import { SiteFooter } from "@/components/site-footer";
import { OptionWheel } from "@/components/cargo/option-wheel";
import { getContentStats } from "@/lib/content-stats";

export default function Home() {
  const stats = getContentStats();

  return (
    <main className="cargo-home">
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
            <p>
              Um arquivo visual dos projetos que eu conduzo, das cenas e vivências
              que fazem parte da minha vida.
            </p>
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
