import { ContactView, contactMetadata } from "@/views/contact";

export const metadata = contactMetadata("en");

export default function ContactEnPage() {
  return <ContactView locale="en" />;
}
