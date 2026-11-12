import { JournalView, journalMetadata } from "@/views/journal";

export const metadata = journalMetadata("pt");

export default function JournalPage() {
  return <JournalView locale="pt" />;
}
