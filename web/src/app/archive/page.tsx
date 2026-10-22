import type { Metadata } from "next";
import Script from "next/script";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import { getArchiveImages } from "@/lib/archive-media";
import { readCargoScript } from "@/lib/cargo-script";

export const metadata: Metadata = { title: "Archive" };

const archiveImages = getArchiveImages();

let domeScript = readCargoScript("01-domegallery.html");
const imageBuilderStart = domeScript.indexOf("  function buildImagesFromPairs");
const imageBuilderEnd = domeScript.indexOf("\n  function harvestImagesAndMount", imageBuilderStart);
if (imageBuilderStart >= 0 && imageBuilderEnd > imageBuilderStart) {
  domeScript = `${domeScript.slice(0, imageBuilderStart)}  function buildImagesFromPairs() {\n    return ${JSON.stringify(archiveImages)};\n  }\n${domeScript.slice(imageBuilderEnd)}`;
}

export default function ArchivePage() {
  return (
    <main className="cargo-page archive-page archive-page--autoplay">
      <CargoNav />
      <h1 className="sr-only">Archive</h1>
      <div className="ar-foot" aria-hidden="true" />
      <SiteFooter />
      <Script id="cargo-dome-gallery" strategy="afterInteractive">{domeScript}</Script>
    </main>
  );
}
