import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { GalleryPhotoGrid } from "@/components/gallery-photo-grid";
import { TransitionLink } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { getUi } from "@/i18n/ui";
import { formatPhotoCount, getGallery, getGallerySlugs, getNextGallery } from "@/lib/gallery";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-metadata";

export const galleryParams = () => getGallerySlugs().map((slug) => ({ slug }));

export async function galleryMetadata(slug: string, locale: Locale) {
  const gallery = await getGallery(slug, locale);
  if (!gallery) return {};
  return pageMetadata({
    locale,
    path: `/archive/${slug}`,
    title: `${gallery.title} · Archive`,
    description: gallery.intro || getUi(locale).meta.galleryFallback(gallery.title),
    images: [{ url: gallery.cover.src, width: gallery.cover.width, height: gallery.cover.height }],
  });
}

export async function GalleryView({ slug, locale }: { slug: string; locale: Locale }) {
  const gallery = await getGallery(slug, locale);
  if (!gallery) notFound();
  const next = await getNextGallery(slug, locale);
  const ui = getUi(locale);

  return (
    <main className="site-page gallery-page">
      <SiteNav />

      <header className="gallery-hero">
        <TransitionLink className="gallery-hero__back" href="/archive#gallery">
          {ui.archive.back}
        </TransitionLink>
        <p className="gallery-hero__meta">
          <span>{ui.archive.label}</span>
          <span>{gallery.descriptor}</span>
          <span>{formatPhotoCount(gallery.count, locale)}</span>
        </p>
        <h1 className="gallery-hero__title">{gallery.title}</h1>
        {gallery.intro ? <p className="gallery-hero__intro">{gallery.intro}</p> : null}
      </header>

      <GalleryPhotoGrid title={gallery.title} photos={gallery.photos} />

      {next ? (
        <nav className="gallery-next" aria-label={ui.archive.others}>
          <TransitionLink className="gallery-next__link" href={next.href}>
            <span className="gallery-next__label">{ui.archive.next}</span>
            <span className="gallery-next__cover">
              <img src={next.cover.thumb} alt="" width={next.cover.width} height={next.cover.height} loading="lazy" />
            </span>
            <span className="gallery-next__title">{next.title}</span>
            <span className="gallery-next__label gallery-next__open">
              {ui.archive.open} <span aria-hidden="true">↗</span>
            </span>
          </TransitionLink>
          <TransitionLink className="gallery-next__all" href="/archive#gallery">
            {ui.archive.all} <span aria-hidden="true">↗</span>
          </TransitionLink>
        </nav>
      ) : null}

      <SiteFooter />
    </main>
  );
}
