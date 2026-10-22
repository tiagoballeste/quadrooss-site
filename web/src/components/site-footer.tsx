import { TransitionLink } from "@/components/page-transition";
import { BrandLogo } from "@/components/brand-logo";
import { siteConfig } from "@/lib/site-config";

const footerNavigation = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <nav className="site-footer__column" aria-label="Navegação do rodapé">
          <span className="site-footer__label">Navigation</span>
          {footerNavigation.map(({ label, href }) => (
            <TransitionLink href={href} key={href}>{label}</TransitionLink>
          ))}
        </nav>

        <div className="site-footer__column">
          <span className="site-footer__label">Social</span>
          <a href="https://www.instagram.com/quadrooss/" rel="noreferrer" target="_blank">Instagram</a>
          <a href="https://www.youtube.com/channel/UC4xAbYxpbcxeWGhW6VPXCQQ" rel="noreferrer" target="_blank">YouTube</a>
          <a href="https://on.soundcloud.com/FJppKmQt8D0te6Tokn" rel="noreferrer" target="_blank">Soundcloud</a>
        </div>

        <div className="site-footer__column site-footer__contact">
          <span className="site-footer__label">Contact</span>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </div>
      </div>

      <BrandLogo className="site-footer__wordmark" />
    </footer>
  );
}
