import { ArchiveGalleryList } from "@/components/archive-gallery-list";
import { SiteNav } from "@/components/site-nav";
import { DomeGallery } from "@/components/dome-gallery";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import { getArchiveImages } from "@/lib/archive-media";
import { formatPhotoCount, galleryCountLabel, getGalleries } from "@/lib/gallery";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const archiveMetadata = (locale: Locale) => pageMetadata({ locale, path: "/archive", title: "Archive" });

const archiveImages = getArchiveImages();

export async function ArchiveView({ locale }: { locale: Locale }) {
  const galleries = await getGalleries(locale);
  const ui = getUi(locale);

  return (
    <main className="site-page archive-page archive-page--autoplay">
      <SiteNav />
      <h1 className="sr-only">Archive</h1>
      <DomeGallery images={archiveImages} />
      {galleries.length > 0 ? (
        <ArchiveGalleryList
          heading={ui.archive.heading(galleryCountLabel(galleries.length, locale))}
          galleries={galleries.map((gallery) => ({ ...gallery, countLabel: formatPhotoCount(gallery.count, locale) }))}
        />
      ) : null}
      <SiteFooter />
    </main>
  );
}
