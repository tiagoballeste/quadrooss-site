import projectsData from "@/data/work/projects.json";
import {
  journalEmbedEntries,
  journalLinkEntries,
} from "@/data/journal-entries";
import { getArchiveImages } from "@/lib/archive-media";

function formatCount(count: number) {
  return count.toString().padStart(3, "0");
}

export function getContentStats() {
  const archiveImages = getArchiveImages();
  const journalEntries = [...journalLinkEntries, ...journalEmbedEntries];
  const musicEntries = journalEntries.filter(
    (entry) => entry.category === "music",
  );

  return [
    ["WORKS", formatCount(projectsData.projects.length)],
    ["ARCHIVES", formatCount(archiveImages.length)],
    ["JOURNAL", formatCount(journalEntries.length)],
    ["MUSIC", formatCount(musicEntries.length)],
    ["PHOTOS", formatCount(archiveImages.length)],
  ] as const;
}
