import { ArchiveView, archiveMetadata } from "@/views/archive";

export const metadata = archiveMetadata("pt");

export default function ArchivePage() {
  return <ArchiveView locale="pt" />;
}
