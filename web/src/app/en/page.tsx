import { HomeView, homeMetadata } from "@/views/home";

export const metadata = homeMetadata("en");

export default function HomeEnPage() {
  return <HomeView locale="en" />;
}
