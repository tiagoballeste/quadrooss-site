import { AboutView, aboutMetadata } from "@/views/about";

export const metadata = aboutMetadata("en");

export default function AboutEnPage() {
  return <AboutView locale="en" />;
}
