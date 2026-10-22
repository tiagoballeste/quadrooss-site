import { TransitionLink } from "@/components/page-transition";
import { HomeHeader } from "@/components/home-header";
import { OptionWheel } from "@/components/cargo/option-wheel";
import { BrandLogo } from "@/components/brand-logo";
import { siteConfig, siteNavigation, socialLinks } from "@/lib/site-config";

export function CargoNav() {
  return (
    <>
      <HomeHeader />
      <OptionWheel />
    </>
  );
}

export function CargoFooter({
  contactLabel = "CONTACT",
  className = "",
}: {
  contactLabel?: string;
  className?: string;
}) {
  return (
    <footer className={`cargo-foot ${className}`.trim()}>
      <div className="cargo-foot-top">
        <span className="caption">{contactLabel}</span>
        <div className="cargo-foot-social">
          {socialLinks.map(({ label, href }) => (
            <a href={href} key={href} target="_blank" rel="noopener noreferrer">
              {label.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
      <div className="cargo-foot-links">
        <TransitionLink href="/">Home</TransitionLink>
        {siteNavigation.map(({ label, href }) => (
          <TransitionLink key={href} href={href}>{label}</TransitionLink>
        ))}
      </div>
      <div className="cargo-foot-bottom">
        <span>Baseado em {siteConfig.location}. {siteConfig.availability}.</span>
      </div>
      <BrandLogo className="cargo-wordmark" />
    </footer>
  );
}
