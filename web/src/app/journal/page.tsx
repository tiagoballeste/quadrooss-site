import type { Metadata } from "next";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import {
  journalEmbedEntries,
  journalLinkEntries,
} from "@/data/journal-entries";

export const metadata: Metadata = { title: "Journal" };

export default function JournalPage() {
  return (
    <main className="cargo-page journal-page">
      <CargoNav />
      <section className="cargo-hero">
        <span className="cargo-eyebrow">JOURNAL</span>
        <h1>Um pouco do que ando vivendo...</h1>
        <p>Um feed contínuo com anotações, o diário de bordo do mochilão pela Europa e a curadoria musical que ando fazendo.</p>
      </section>
      <div className="jr-feed">
        {journalLinkEntries.map((entry) => (
          <a className="jr-entry" href={entry.href} target="_blank" rel="noopener noreferrer" key={entry.href}>
            <span className="jr-entry-tag">{entry.tag}</span>
            <span className="jr-entry-title">{entry.title}</span>
            {entry.description ? <p className="jr-entry-desc">{entry.description}</p> : null}
            <span className="jr-entry-link">Assistir no YouTube ↗</span>
          </a>
        ))}
        {journalEmbedEntries.map((entry) => (
          <div className="jr-entry jr-entry-embed" key={entry.embedSrc}>
            <span className="jr-entry-tag">{entry.tag}</span>
            <span className="jr-entry-title">{entry.title}</span>
            <iframe
              title={entry.embedTitle}
              allow="autoplay"
              height="166"
              src={entry.embedSrc}
              width="100%"
            />
          </div>
        ))}
      </div>
      <SiteFooter />
    </main>
  );
}
