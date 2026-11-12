import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import { WorkProjectsGrid } from "@/components/work-projects-grid";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const workMetadata = (locale: Locale) => pageMetadata({ locale, path: "/work", title: "Work" });

export function WorkView() {
  return (
    <main className="cargo-page work-index-page">
      <CargoNav />
      <WorkProjectsGrid />
      <SiteFooter />
    </main>
  );
}
