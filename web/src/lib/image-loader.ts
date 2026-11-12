import type { ImageLoaderProps } from "next/image";

// Static export has no image server. scripts/prepare-media.mjs writes one WebP
// per configured width for everything in public/images, and this loader points
// next/image at those files. Widths come from src/lib/image-sizes.json.
const OPTIMIZABLE = /^\/images\/(.+)\.(?:png|jpe?g|webp)$/i;

export default function imageLoader({ src, width }: ImageLoaderProps) {
  const match = OPTIMIZABLE.exec(src);
  if (!match) return src;
  return `/media/optimized/${match[1]}-${width}.webp`;
}
