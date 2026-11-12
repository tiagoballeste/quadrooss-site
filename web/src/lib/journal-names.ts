/** Shared view-transition name for a post cover: the Journal card and the
 *  post page use the same one, so the cover morphs between them. */
export function journalCoverName(slug: string) {
  return `journal-cover-${slug}`;
}
