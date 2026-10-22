import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIRECTORY = path.join(ROOT, "src", "data", "work");
const SOURCE_PATH = path.join(DATA_DIRECTORY, "work-source.json");
const PROFILE_URL = "https://vimeo.com/user214428166/videos";

const namedEntities = {
  amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " ",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Acirc: "Â", Ecirc: "Ê", Ocirc: "Ô", acirc: "â", ecirc: "ê", ocirc: "ô",
  Atilde: "Ã", Otilde: "Õ", atilde: "ã", otilde: "õ",
  Ccedil: "Ç", ccedil: "ç",
};

const decodeEntities = (value) =>
  value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith("#x")) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    if (code.startsWith("#")) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    return namedEntities[code] ?? entity;
  });

const normalizeTitle = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&|\bx\b/g, " x ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

function levenshtein(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      previous = current;
    }
  }
  return row[b.length];
}

const similarity = (a, b) => {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);
  const longest = Math.max(left.length, right.length) || 1;
  return Math.round((1 - levenshtein(left, right) / longest) * 100);
};

async function fetchVimeoVideos() {
  const videos = [];
  for (let page = 1; page <= 6; page += 1) {
    const response = await fetch(`${PROFILE_URL}/page:${page}/sort:date`);
    if (!response.ok) throw new Error(`Vimeo page ${page} returned ${response.status}`);
    const html = await response.text();
    const itemPattern = /<li[^>]*id="clip_(\d+)"[\s\S]*?<a href="\/\1" title="([^"]+)"[\s\S]*?<img src="([^"]+)" srcset="([^"]+)"[\s\S]*?<time datetime="([^"]+)"[\s\S]*?<\/li>/g;

    for (const match of html.matchAll(itemPattern)) {
      const [, vimeoId, rawTitle, rawThumbnail, rawSrcset, publishedAt] = match;
      const highResolutionThumbnail = rawSrcset.split(" ")[0] || rawThumbnail;
      videos.push({
        vimeoId,
        title: decodeEntities(rawTitle),
        thumbnail: decodeEntities(highResolutionThumbnail),
        publishedAt,
      });
    }
  }
  return videos;
}

function matchSourceToVimeo(sourceItem, vimeoVideos, usedIds) {
  const requestedTitle = sourceItem.vimeoTitle || sourceItem.title;
  const normalizedRequestedTitle = normalizeTitle(requestedTitle);
  const available = vimeoVideos.filter((video) => !usedIds.has(video.vimeoId));
  const exact = available.find(
    (video) => normalizeTitle(video.title) === normalizedRequestedTitle,
  );
  if (exact) return { video: exact, score: 100, method: sourceItem.vimeoTitle ? "manual" : "exact" };

  const candidates = available
    .map((video) => ({ video, score: similarity(requestedTitle, video.title) }))
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const runnerUp = candidates[1];
  if (best && best.score >= 90 && best.score > (runnerUp?.score ?? -1)) {
    return { ...best, method: "similarity" };
  }
  return null;
}

async function main() {
  const source = JSON.parse(await readFile(SOURCE_PATH, "utf8"));
  const vimeoVideos = await fetchVimeoVideos();
  const usedIds = new Set();
  const projects = [];
  const missing = [];

  for (const [sourceOrder, sourceItem] of source.entries()) {
    const match = matchSourceToVimeo(sourceItem, vimeoVideos, usedIds);
    if (!match) {
      const candidates = vimeoVideos
        .filter((video) => !usedIds.has(video.vimeoId))
        .map((video) => ({ title: video.title, score: similarity(sourceItem.title, video.title) }))
        .sort((a, b) => b.score - a.score);
      missing.push({ title: sourceItem.title, bestCandidate: candidates[0] ?? null });
      continue;
    }

    usedIds.add(match.video.vimeoId);
    projects.push({
      title: sourceItem.title,
      vimeoTitle: match.video.title,
      vimeoId: match.video.vimeoId,
      href: `https://vimeo.com/${match.video.vimeoId}`,
      thumbnail: match.video.thumbnail,
      publishedAt: match.video.publishedAt,
      roles: sourceItem.roles,
      sourceOrder,
      match: match.method,
    });
  }

  const unmatched = vimeoVideos
    .filter((video) => !usedIds.has(video.vimeoId))
    .map((video) => {
      const bestCandidate = source
        .map((item) => ({ title: item.title, score: similarity(item.title, video.title) }))
        .sort((a, b) => b.score - a.score)[0];
      return { ...video, bestCandidate };
    });

  await mkdir(DATA_DIRECTORY, { recursive: true });
  await Promise.all([
    writeFile(
      path.join(DATA_DIRECTORY, "projects.json"),
      `${JSON.stringify({ source: PROFILE_URL, count: projects.length, projects }, null, 2)}\n`,
    ),
    writeFile(
      path.join(DATA_DIRECTORY, "unmatched-vimeo.json"),
      `${JSON.stringify(unmatched, null, 2)}\n`,
    ),
    writeFile(
      path.join(DATA_DIRECTORY, "missing-on-vimeo.json"),
      `${JSON.stringify(missing, null, 2)}\n`,
    ),
  ]);

  console.log(`Matched ${projects.length}/${source.length} source projects.`);
  console.log(`Unmatched Vimeo videos: ${unmatched.length}. Missing on Vimeo: ${missing.length}.`);
  if (projects.length !== source.length || missing.length > 0) process.exitCode = 1;
}

await main();
