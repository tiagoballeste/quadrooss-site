import { ArchiveView, archiveMetadata } from "@/views/archive";

export const metadata = archiveMetadata("en");

export default function ArchiveEnPage() {
  return <ArchiveView locale="en" />;
}
