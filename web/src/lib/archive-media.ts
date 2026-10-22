import { readdirSync } from "node:fs";
import path from "node:path";

const ARCHIVE_IMAGE_PATTERN = /\.(?:jpe?g|png|webp)$/i;
const ARCHIVE_EXCLUDED_PATTERN = /Prancheta/i;

export type ArchiveImage = {
  src: string;
  alt: string;
};

export function getArchiveImages(): ArchiveImage[] {
  return readdirSync(path.join(process.cwd(), "..", "media"))
    .filter(
      (name) =>
        ARCHIVE_IMAGE_PATTERN.test(name) &&
        !ARCHIVE_EXCLUDED_PATTERN.test(name),
    )
    .map((name) => ({ src: `/media/${name}`, alt: "" }));
}
