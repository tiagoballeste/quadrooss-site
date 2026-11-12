import Script from "next/script";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import { CONTACT_PAGE_EN } from "@/i18n/contact-page";
import { readCargoScript } from "@/lib/cargo-script";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";
import { siteConfig } from "@/lib/site-config";

export const contactMetadata = (locale: Locale) => pageMetadata({ locale, path: "/contact", title: "Contact" });

const baseScript = `${readCargoScript("08-multistep-contact-form.html")}\n${readCargoScript("07-contact-page.html")}`
  .replaceAll("cttquadrooss@gmail.com", siteConfig.email)
  .replaceAll("https://wa.me/5511949202345", siteConfig.phone.whatsapp)
  .replaceAll("(+55) 11 94920-2345", siteConfig.phone.display)
  .replaceAll("(11) 94920-2345", siteConfig.phone.display)
  .replaceAll("+5511949202345", siteConfig.phone.e164)
  .replace("    outer.appendChild(buildFooter());\n", "");

function contactScript(locale: Locale) {
  if (locale === "pt") return baseScript;
  return CONTACT_PAGE_EN.reduce((script, [from, to]) => script.replaceAll(from, to), baseScript);
}

export function ContactView({ locale }: { locale: Locale }) {
  return (
    <main className="cargo-page contact-page">
      <CargoNav />
      <div id="L4008122332" />
      <SiteFooter />
      <Script id={`cargo-contact-page-${locale}`} strategy="afterInteractive">{contactScript(locale)}</Script>
    </main>
  );
}
