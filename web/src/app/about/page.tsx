import { AboutView, aboutMetadata } from "@/views/about";

export const metadata = aboutMetadata("pt");

export default function AboutPage() {
  return <AboutView locale="pt" />;
}
