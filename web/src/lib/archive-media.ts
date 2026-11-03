import { readdirSync } from "node:fs";
import path from "node:path";

const ARCHIVE_IMAGE_PATTERN = /\.(?:jpe?g|png|webp)$/i;
const ARCHIVE_EXCLUDED_PATTERN = /Prancheta/i;

export type ArchiveImage = {
  src: string;
  thumb: string;
  alt: string;
};

export function getArchiveImages(): ArchiveImage[] {
  return readdirSync(path.join(process.cwd(), "..", "media"))
    .filter(
      (name) =>
        ARCHIVE_IMAGE_PATTERN.test(name) &&
        !ARCHIVE_EXCLUDED_PATTERN.test(name),
    )
    .map((name) => {
      const file = `${encodeURIComponent(name)}.webp`;
      return {
        src: `/media/full/${file}`,
        thumb: `/media/thumb/${file}`,
        alt: "",
      };
    });
}
