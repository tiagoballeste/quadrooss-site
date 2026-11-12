import { mkdir, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import imageSizes from "../src/lib/image-sizes.json" with { type: "json" };

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.resolve(webRoot, "..", "media");
const outputDir = path.join(webRoot, "public", "media");
const imagePattern = /\.(?:jpe?g|png|webp)$/i;

async function isCurrent(source, output) {
  try {
    const [inputInfo, outputInfo] = await Promise.all([stat(source), stat(output)]);
    return outputInfo.mtimeMs >= inputInfo.mtimeMs;
  } catch {
    return false;
  }
}

async function prepareImage(name) {
  const source = path.join(sourceDir, name);
  const outputName = `${name}.webp`;
  const full = path.join(outputDir, "full", outputName);
  const archiveImage = !/Prancheta/i.test(name);
  const thumb = path.join(outputDir, "thumb", outputName);

  const jobs = [];
  if (!(await isCurrent(source, full))) {
    jobs.push(
      sharp(source)
        .rotate()
        .resize({
          width: archiveImage ? 1440 : 1000,
          height: archiveImage ? 1440 : 1000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 3 })
        .toFile(full),
    );
  }
  if (archiveImage && !(await isCurrent(source, thumb))) {
    jobs.push(
      sharp(source)
        .rotate()
        .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 70, effort: 3 })
        .toFile(thumb),
    );
  }
  await Promise.all(jobs);
}

const files = (await readdir(sourceDir)).filter((name) => imagePattern.test(name));
await Promise.all([
  mkdir(path.join(outputDir, "full"), { recursive: true }),
  mkdir(path.join(outputDir, "thumb"), { recursive: true }),
]);

let next = 0;
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (next < files.length) await prepareImage(files[next++]);
  }),
);

console.log(`Prepared ${files.length} images for the public archive.`);

// Responsive WebP variants for next/image (see src/lib/image-loader.ts).
// The static export has no image server, so every configured width is built here.
const imagesDir = path.join(webRoot, "public", "images");
const optimizedDir = path.join(outputDir, "optimized");
const widths = [...new Set([...imageSizes.imageSizes, ...imageSizes.deviceSizes])];

async function listImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listImages(full);
      return imagePattern.test(entry.name) ? [full] : [];
    }),
  );
  return nested.flat();
}

const sourceImages = await listImages(imagesDir);
let variants = 0;
for (const source of sourceImages) {
  const relative = path.relative(imagesDir, source).replace(/\.[^.]+$/, "");
  await mkdir(path.dirname(path.join(optimizedDir, relative)), { recursive: true });
  await Promise.all(
    widths.map(async (width) => {
      const output = path.join(optimizedDir, `${relative}-${width}.webp`);
      variants += 1;
      if (await isCurrent(source, output)) return;
      await sharp(source)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toFile(output);
    }),
  );
}

console.log(`Prepared ${variants} responsive variants of ${sourceImages.length} site images.`);

// Journal thumbnails, taken from each post's YouTube video (see src/lib/journal.ts).
// Tries the largest version YouTube has, trims the black bars some uploads carry
// and writes 1280 and 640 px WebP. Without network the site falls back to
// YouTube's own thumbnail URL, so a failed download never breaks the build.
const journalDir = path.join(webRoot, "content", "journal");
const journalOut = path.join(outputDir, "journal");
const youtubeId = /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/;
const thumbnailSizes = ["maxresdefault", "sddefault", "hqdefault"];

async function fetchThumbnail(id) {
  for (const size of thumbnailSizes) {
    const response = await fetch(`https://i.ytimg.com/vi/${id}/${size}.jpg`);
    if (!response.ok) continue;
    const buffer = Buffer.from(await response.arrayBuffer());
    const { width = 0 } = await sharp(buffer).metadata();
    // YouTube answers a missing size with a 120 px placeholder.
    if (width > 200) return buffer;
  }
  return null;
}

async function trimBars(buffer) {
  const { width = 0, height = 0 } = await sharp(buffer).metadata();
  const trimmed = await sharp(buffer)
    .trim({ background: "#000000", threshold: 14 })
    .toBuffer({ resolveWithObject: true });
  // A very dark frame can lose real picture to the trim; keep the original then.
  const kept = trimmed.info.width >= width * 0.5 && trimmed.info.height >= height * 0.5;
  return kept ? trimmed.data : buffer;
}

const journalFiles = (await readdir(journalDir).catch(() => [])).filter((file) => file.endsWith(".md"));
const videoIds = new Set();
for (const file of journalFiles) {
  const text = await readFile(path.join(journalDir, file), "utf8");
  const id = text.match(/^youtube:\s*["']?([^"'\n]+)/m)?.[1].match(youtubeId)?.[1];
  if (id) videoIds.add(id);
}

await mkdir(journalOut, { recursive: true });
let journalReady = 0;
let journalMissing = 0;
for (const id of videoIds) {
  const large = path.join(journalOut, `${id}.webp`);
  const small = path.join(journalOut, `${id}-640.webp`);
  try {
    await stat(large);
    await stat(small);
    journalReady += 1;
    continue;
  } catch {}
  try {
    const source = await fetchThumbnail(id);
    if (!source) throw new Error("no thumbnail");
    const image = await trimBars(source);
    await sharp(image).resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(large);
    await sharp(image).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 80, effort: 4 }).toFile(small);
    journalReady += 1;
  } catch {
    journalMissing += 1;
  }
}

console.log(
  `Journal thumbnails: ${journalReady} ready` +
    (journalMissing ? `, ${journalMissing} could not be downloaded (YouTube's URL is used instead).` : "."),
);
