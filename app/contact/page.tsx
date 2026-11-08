import { getPublicContactSettings } from "@/lib/publicData";
import ContactPageClient from "./ContactPageClient";

export default async function ContactPage() {
  const contactSettings = await getPublicContactSettings();

  return <ContactPageClient contactSettings={contactSettings} />;
}
