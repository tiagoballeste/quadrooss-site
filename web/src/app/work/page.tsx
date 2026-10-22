import type { Metadata } from "next";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import { WorkProjectsGrid } from "@/components/work-projects-grid";

export const metadata: Metadata = { title: "Work" };

export default function WorkPage() {
  return (
    <main className="cargo-page work-index-page">
      <CargoNav />
      <WorkProjectsGrid />
      <SiteFooter />
    </main>
  );
}
