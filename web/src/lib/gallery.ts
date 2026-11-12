import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";
import type { Locale } from "@/lib/i18n";

/*
 * Archive galleries live in web/content/gallery, one Markdown file per
 * gallery. Frontmatter holds the title, the short descriptor, the order in
 * the list, the cover and the list of photos; the body is the intro text.
 * Photos are file names from the repo's /media folder (the same pool the
 * Archive dome uses), so a Git-based CMS only has to edit these files.
 * English: title_en, descriptor_en and intro_en in the same frontmatter;
 * any of them left out falls back to the Portuguese text.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "gallery");
const MEDIA_DIR = path.join(process.cwd(), "..", "media");

export type GalleryPhoto = {
  file: string;
  src: string;
  thumb: string;
  width: number;
  height: number;
};

export type GallerySummary = {
  slug: string;
  title: string;
  descriptor: string;
  order: number;
  intro: string;
  count: number;
  href: string;
  cover: GalleryPhoto;
};

export type Gallery = GallerySummary & { photos: GalleryPhoto[] };

type GalleryFile = {
  slug: string;
  title: string;
  descriptor: string;
  order: number;
  intro: string;
  en: { title: string | null; descriptor: string | null; intro: string | null };
  cover: string;
  photos: string[];
};

function fail(file: string, message: string): never {
  throw new Error(`Gallery: ${message} in content/gallery/${file}`);
}

function readGalleryFile(file: string): GalleryFile {
  const { data, content } = matter(readFileSync(path.join(CONTENT_DIR, file), "utf8"));
  const text = (key: string) => {
    const value = data[key];
    if (typeof value !== "string" || value.trim() === "") fail(file, `"${key}" is required`);
    return value.trim();
  };

  const photos = data.photos;
  if (!Array.isArray(photos) || photos.length === 0) fail(file, `"photos" needs at least one file`);
  const names = photos.map((photo) => {
    // A CMS may store "/media/x.jpg" or "media/x.jpg"; keep only the file name.
    const name = path.basename(String(photo).trim());
    if (!existsSync(path.join(MEDIA_DIR, name))) fail(file, `photo "${name}" is not in /media`);
    return name;
  });

  const cover = path.basename(typeof data.cover === "string" && data.cover.trim() ? data.cover.trim() : names[0]);
  if (!existsSync(path.join(MEDIA_DIR, cover))) fail(file, `cover "${cover}" is not in /media`);

  const optional = (key: string) =>
    typeof data[key] === "string" && data[key].trim() !== "" ? (data[key] as string).trim() : null;

  return {
    slug: file.replace(/\.md$/, ""),
    en: { title: optional("title_en"), descriptor: optional("descriptor_en"), intro: optional("intro_en") },
    title: text("title"),
    descriptor: text("descriptor"),
    order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
    intro: content.trim(),
    cover,
    photos: [...new Set(names)],
  };
}

const sizeCache = new Map<string, Promise<{ width: number; height: number }>>();

function photoSize(name: string) {
  let size = sizeCache.get(name);
  if (!size) {
    size = sharp(path.join(MEDIA_DIR, name))
      .metadata()
      .then(({ width = 1, height = 1, orientation = 1 }) =>
        // EXIF orientations 5 to 8 are rotated 90 degrees; prepare-media
        // applies them, so swap to match the published file.
        orientation >= 5 ? { width: height, height: width } : { width, height },
      );
    sizeCache.set(name, size);
  }
  return size;
}

async function toPhoto(name: string): Promise<GalleryPhoto> {
  const file = `${encodeURIComponent(name)}.webp`;
  return {
    file: name,
    src: `/media/full/${file}`,
    thumb: `/media/thumb/${file}`,
    ...(await photoSize(name)),
  };
}

function readAll() {
  if (!existsSync(CONTENT_DIR)) return [];
  return readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(readGalleryFile)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "pt-BR"));
}

async function toSummary(entry: GalleryFile, locale: Locale): Promise<GallerySummary> {
  const en = locale === "en";
  return {
    slug: entry.slug,
    title: (en && entry.en.title) || entry.title,
    descriptor: (en && entry.en.descriptor) || entry.descriptor,
    order: entry.order,
    intro: (en && entry.en.intro) || entry.intro,
    count: entry.photos.length,
    href: en ? `/en/archive/${entry.slug}` : `/archive/${entry.slug}`,
    cover: await toPhoto(entry.cover),
  };
}

export function getGallerySlugs() {
  return readAll().map((entry) => entry.slug);
}

export async function getGalleries(locale: Locale = "pt"): Promise<GallerySummary[]> {
  return Promise.all(readAll().map((entry) => toSummary(entry, locale)));
}

export async function getGallery(slug: string, locale: Locale = "pt"): Promise<Gallery | null> {
  const entry = readAll().find((item) => item.slug === slug);
  if (!entry) return null;
  const [summary, photos] = await Promise.all([toSummary(entry, locale), Promise.all(entry.photos.map(toPhoto))]);
  return { ...summary, photos };
}

/** The gallery after this one in list order, wrapping to the first. */
export async function getNextGallery(slug: string, locale: Locale = "pt"): Promise<GallerySummary | null> {
  const all = readAll();
  if (all.length < 2) return null;
  const index = all.findIndex((item) => item.slug === slug);
  return toSummary(all[(index + 1) % all.length], locale);
}

const COUNT_WORDS: Record<Locale, string[]> = {
  pt: ["Nenhuma", "Uma", "Duas", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez"],
  en: ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"],
};

/** "Cinco galerias" / "Five galleries" for the list heading; digits past ten. */
export function galleryCountLabel(count: number, locale: Locale = "pt") {
  const word = COUNT_WORDS[locale][count] ?? String(count);
  if (locale === "en") return `${word} ${count === 1 ? "gallery" : "galleries"}`;
  return `${word} ${count === 1 ? "galeria" : "galerias"}`;
}

export function formatPhotoCount(count: number, locale: Locale = "pt") {
  const noun = locale === "en" ? (count === 1 ? "photo" : "photos") : count === 1 ? "foto" : "fotos";
  return `${String(count).padStart(3, "0")} ${noun}`;
}
