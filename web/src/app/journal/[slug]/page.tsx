import { JournalPostView, journalPostMetadata, journalPostParams } from "@/views/journal-post";

type Props = { params: Promise<{ slug: string }> };

// Static export: every page is written at build time, nothing on demand.
export const dynamicParams = false;
export const generateStaticParams = journalPostParams;

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return journalPostMetadata(slug, "pt");
}

export default async function JournalPostPage({ params }: Props) {
  const { slug } = await params;
  return <JournalPostView slug={slug} locale="pt" />;
}
