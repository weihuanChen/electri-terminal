import { getPublicContactSettings } from "@/lib/publicData";
import FloatingContactClient from "./FloatingContactClient";

export default async function FloatingContact() {
  const settings = await getPublicContactSettings();

  const whatsappHref =
    settings.whatsapp.enabled && settings.whatsapp.value && settings.whatsapp.href
      ? settings.whatsapp.href
      : undefined;
  const email = settings.email.enabled && settings.email.value ? settings.email.value : undefined;

  return <FloatingContactClient whatsappHref={whatsappHref} email={email} />;
}
