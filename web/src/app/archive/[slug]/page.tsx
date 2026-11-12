import { GalleryView, galleryMetadata, galleryParams } from "@/views/gallery";

type Props = { params: Promise<{ slug: string }> };

// Static export: every page is written at build time, nothing on demand.
export const dynamicParams = false;
export const generateStaticParams = galleryParams;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return galleryMetadata(slug, "pt");
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;
  return <GalleryView slug={slug} locale="pt" />;
}
