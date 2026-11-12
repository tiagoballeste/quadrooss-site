import { JournalView, journalMetadata } from "@/views/journal";

export const metadata = journalMetadata("en");

export default function JournalEnPage() {
  return <JournalView locale="en" />;
}
