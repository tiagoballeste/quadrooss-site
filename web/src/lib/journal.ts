import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/*
 * Journal posts live in web/content/journal, one Markdown file per post:
 * frontmatter for the fields below, the article text as the body. The file
 * name is the URL slug. A Git-based CMS can edit these files directly.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "journal");
const THUMB_DIR = path.join(process.cwd(), "public", "media", "journal");

export type JournalPostType = "vlog" | "set";

export type JournalPost = {
  slug: string;
  type: JournalPostType;
  title: string;
  /** Series name, e.g. "Mochilão Europeu". Optional. */
  series: string | null;
  episode: number | null;
  place: string | null;
  /** Who or what the post is credited to, e.g. "Quadrooss & Icaro". */
  credit: string | null;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Formatted for display, e.g. "11.08.2026". */
  dateLabel: string;
  duration: string;
  youtube: string;
  videoId: string;
  excerpt: string;
  featured: boolean;
  bodyHtml: string;
  /** Posts with body text get their own page; the rest open on YouTube. */
  hasPage: boolean;
  href: string;
  thumbnail: { src: string; srcSet: string | null };
};

const YOUTUBE_ID = /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/;

export function getYoutubeId(url: string) {
  return url.match(YOUTUBE_ID)?.[1] ?? null;
}

function requireString(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Journal: "${key}" is required in content/journal/${file}`);
  }
  return value.trim();
}

function optionalString(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function toIsoDate(value: unknown, file: string) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  throw new Error(`Journal: "date" must be YYYY-MM-DD in content/journal/${file}`);
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function getThumbnail(videoId: string) {
  // Written by scripts/prepare-media.mjs at build time. When the download was
  // not possible, YouTube's own thumbnail URL keeps the card working.
  const local = path.join(THUMB_DIR, `${videoId}.webp`);
  if (existsSync(local)) {
    return {
      src: `/media/journal/${videoId}.webp`,
      srcSet: `/media/journal/${videoId}-640.webp 640w, /media/journal/${videoId}.webp 1280w`,
    };
  }
  return { src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, srcSet: null };
}

function readPost(file: string): JournalPost {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(readFileSync(path.join(CONTENT_DIR, file), "utf8"));

  const type = data.type;
  if (type !== "vlog" && type !== "set") {
    throw new Error(`Journal: "type" must be "vlog" or "set" in content/journal/${file}`);
  }

  const youtube = requireString(data, "youtube", file);
  const videoId = getYoutubeId(youtube);
  if (!videoId) throw new Error(`Journal: "youtube" is not a YouTube link in content/journal/${file}`);

  const date = toIsoDate(data.date, file);
  const body = content.trim();
  // Every post has its own page; the body text is optional.
  const hasPage = true;

  return {
    slug,
    type,
    title: requireString(data, "title", file),
    series: optionalString(data, "series"),
    episode: typeof data.episode === "number" ? data.episode : null,
    place: optionalString(data, "place"),
    credit: optionalString(data, "credit"),
    date,
    dateLabel: formatDate(date),
    duration: requireString(data, "duration", file),
    youtube,
    videoId,
    excerpt: requireString(data, "excerpt", file),
    featured: data.featured === true,
    bodyHtml: body ? (marked.parse(body, { async: false }) as string) : "",
    hasPage,
    href: `/journal/${slug}`,
    thumbnail: getThumbnail(videoId),
  };
}

/** Newest first; within a day, the higher episode first. */
export function getJournalPosts(): JournalPost[] {
  return readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.episode ?? 0) - (a.episode ?? 0));
}

export function getJournalPost(slug: string) {
  return getJournalPosts().find((post) => post.slug === slug && post.hasPage) ?? null;
}

/** The post marked `featured: true`, or else the newest one with a page. */
export function getFeaturedPost(posts: JournalPost[]) {
  return posts.find((post) => post.featured) ?? posts.find((post) => post.hasPage) ?? null;
}

/** Card label: "EP. 08 · PARIS" for an episode, "DJ SET · CREDIT" for a set. */
export function getPostTag(post: JournalPost) {
  if (post.type === "set") return post.credit ? `DJ set · ${post.credit}` : "DJ set";
  const parts = [post.episode ? `Ep. ${String(post.episode).padStart(2, "0")}` : "Vlog", post.place];
  return parts.filter(Boolean).join(" · ");
}

export function getSeriesPosts(posts: JournalPost[], series: string) {
  return posts
    .filter((post) => post.series === series)
    .sort((a, b) => (a.episode ?? 0) - (b.episode ?? 0));
}

export function seriesAnchor(series: string) {
  return series
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
