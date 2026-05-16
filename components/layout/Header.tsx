import HeaderClient from "./HeaderClient";
import { getEnabledSocialMediaLinks } from "@/lib/contactConfig";
import { categoryUrl } from "@/lib/routes";
import { getHeaderNavigation, getPublicContactSettings } from "@/lib/publicData";

export default async function Header() {
  const [categories, contactSettings] = await Promise.all([
    getHeaderNavigation(),
    getPublicContactSettings(),
  ]);
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);
  const linkedInLink = socialLinks.find(
    (item) => item.platform.trim().toLowerCase() === "linkedin"
  );

  return (
    <HeaderClient
      productCategories={categories.map((category) => ({
        name: category.name,
        href: categoryUrl(category.slug),
      }))}
      socialLink={
        linkedInLink
          ? {
              platform: linkedInLink.platform,
              label: linkedInLink.label,
              url: linkedInLink.url,
            }
          : null
      }
    />
  );
}
