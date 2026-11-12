import Script from "next/script";
import { ArchiveGalleryList } from "@/components/archive-gallery-list";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import { getArchiveImages } from "@/lib/archive-media";
import { readCargoScript } from "@/lib/cargo-script";
import { formatPhotoCount, galleryCountLabel, getGalleries } from "@/lib/gallery";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const archiveMetadata = (locale: Locale) => pageMetadata({ locale, path: "/archive", title: "Archive" });

const archiveImages = getArchiveImages();

let domeScript = readCargoScript("01-domegallery.html");
const imageBuilderStart = domeScript.indexOf("  function buildImagesFromPairs");
const imageBuilderEnd = domeScript.indexOf("\n  function harvestImagesAndMount", imageBuilderStart);
if (imageBuilderStart >= 0 && imageBuilderEnd > imageBuilderStart) {
  domeScript = `${domeScript.slice(0, imageBuilderStart)}  function buildImagesFromPairs() {\n    return ${JSON.stringify(archiveImages)};\n  }\n${domeScript.slice(imageBuilderEnd)}`;
}

export async function ArchiveView({ locale }: { locale: Locale }) {
  const galleries = await getGalleries(locale);
  const ui = getUi(locale);

  return (
    <main className="cargo-page archive-page archive-page--autoplay">
      <CargoNav />
      <h1 className="sr-only">Archive</h1>
      {/* The dome script mounts its sphere right before .ar-foot. */}
      <div className="ar-foot" aria-hidden="true" />
      {galleries.length > 0 ? (
        <ArchiveGalleryList
          heading={ui.archive.heading(galleryCountLabel(galleries.length, locale))}
          galleries={galleries.map((gallery) => ({ ...gallery, countLabel: formatPhotoCount(gallery.count, locale) }))}
        />
      ) : null}
      <SiteFooter />
      <Script id="cargo-dome-gallery" strategy="afterInteractive">{domeScript}</Script>
    </main>
  );
}
