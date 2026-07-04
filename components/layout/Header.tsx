import HeaderClient from "./HeaderClient";
import { getEnabledSocialMediaLinks } from "@/lib/contactConfig";
import { categoryUrl } from "@/lib/routes";
import type { NavigationCategoryTree } from "@/lib/publicData";
import {
  getHeaderNavigation,
  getPublicContactSettings,
} from "@/lib/publicData";

interface HeaderCategory {
  name: string;
  href: string;
  children: HeaderCategory[];
}

function toHeaderCategory(category: NavigationCategoryTree): HeaderCategory {
  return {
    name: category.name,
    href: categoryUrl(category.slug),
    children: category.children.map(toHeaderCategory),
  };
}

export default async function Header() {
  const [categories, contactSettings] = await Promise.all([
    getHeaderNavigation(),
    getPublicContactSettings(),
  ]);
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);
  const linkedInLink = socialLinks.find(
    (item) => item.platform.trim().toLowerCase() === "linkedin",
  );

  return (
    <HeaderClient
      productCategories={categories.map(toHeaderCategory)}
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
