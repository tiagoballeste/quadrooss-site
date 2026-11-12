import { mkdir, readdir, stat } from "node:fs/promises";
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
