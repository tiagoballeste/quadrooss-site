import { HomeView, homeMetadata } from "@/views/home";

export const metadata = homeMetadata("pt");

export default function HomePage() {
  return <HomeView locale="pt" />;
}
