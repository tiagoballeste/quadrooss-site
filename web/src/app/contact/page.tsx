import type { Metadata } from "next";
import Script from "next/script";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import { readCargoScript } from "@/lib/cargo-script";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Contact" };

const contactScript = `${readCargoScript("08-multistep-contact-form.html")}\n${readCargoScript("07-contact-page.html")}`
  .replaceAll("cttquadrooss@gmail.com", siteConfig.email)
  .replaceAll("https://wa.me/5511949202345", siteConfig.phone.whatsapp)
  .replaceAll("(+55) 11 94920-2345", siteConfig.phone.display)
  .replaceAll("(11) 94920-2345", siteConfig.phone.display)
  .replaceAll("+5511949202345", siteConfig.phone.e164)
  .replace("    outer.appendChild(buildFooter());\n", "");

export default function ContactPage() {
  return (
    <main className="cargo-page contact-page">
      <CargoNav />
      <div id="L4008122332" />
      <SiteFooter />
      <Script id="cargo-contact-page" strategy="afterInteractive">{contactScript}</Script>
    </main>
  );
}
