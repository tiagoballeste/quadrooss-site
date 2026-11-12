import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CargoNav } from "@/components/cargo/cargo-shell";
import { GalleryPhotoGrid } from "@/components/gallery-photo-grid";
import { TransitionLink } from "@/components/page-transition";
import { SiteFooter } from "@/components/site-footer";
import { formatPhotoCount, getGallery, getGallerySlugs, getNextGallery } from "@/lib/gallery";

type Props = { params: Promise<{ slug: string }> };

// Static export: every gallery page is written at build time.
export const dynamicParams = false;

export function generateStaticParams() {
  return getGallerySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const gallery = await getGallery(slug);
  if (!gallery) return {};
  const description = gallery.intro || `${gallery.title}, galeria do Archive de Quadrooss.`;
  return {
    title: `${gallery.title} · Archive`,
    description,
    openGraph: {
      title: `${gallery.title} · Archive`,
      description,
      images: [{ url: gallery.cover.src, width: gallery.cover.width, height: gallery.cover.height }],
    },
  };
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;
  const gallery = await getGallery(slug);
  if (!gallery) notFound();
  const next = await getNextGallery(slug);

  return (
    <main className="cargo-page gallery-page">
      <CargoNav />

      <header className="gallery-hero">
        <TransitionLink className="gallery-hero__back" href="/archive#gallery">
          ← Archive
        </TransitionLink>
        <p className="gallery-hero__meta">
          <span>(Gallery)</span>
          <span>{gallery.descriptor}</span>
          <span>{formatPhotoCount(gallery.count)}</span>
        </p>
        <h1 className="gallery-hero__title">{gallery.title}</h1>
        {gallery.intro ? <p className="gallery-hero__intro">{gallery.intro}</p> : null}
      </header>

      <GalleryPhotoGrid title={gallery.title} photos={gallery.photos} />

      {next ? (
        <nav className="gallery-next" aria-label="Outras galerias">
          <TransitionLink className="gallery-next__link" href={next.href}>
            <span className="gallery-next__label">Próxima galeria</span>
            <span className="gallery-next__cover">
              <img src={next.cover.thumb} alt="" width={next.cover.width} height={next.cover.height} loading="lazy" />
            </span>
            <span className="gallery-next__title">{next.title}</span>
            <span className="gallery-next__label gallery-next__open">
              Abrir galeria <span aria-hidden="true">↗</span>
            </span>
          </TransitionLink>
          <TransitionLink className="gallery-next__all" href="/archive#gallery">
            Todas as galerias <span aria-hidden="true">↗</span>
          </TransitionLink>
        </nav>
      ) : null}

      <SiteFooter />
    </main>
  );
}
