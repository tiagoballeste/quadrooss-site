import { ContactView, contactMetadata } from "@/views/contact";

export const metadata = contactMetadata("pt");

export default function ContactPage() {
  return <ContactView locale="pt" />;
}
