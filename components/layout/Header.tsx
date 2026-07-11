import HeaderClient from "./HeaderClient";
import { getEnabledSocialMediaLinks } from "@/lib/contactConfig";
import { categoryUrl } from "@/lib/routes";
import type { NavigationCategoryTree } from "@/lib/publicData";
import {
  getHeaderNavigation,
  getPublicContactSettings,
} from "@/lib/publicData";
import { getRequestLocale } from "@/lib/i18n/requestLocale";
import type { Locale } from "@/lib/i18n/config";

interface HeaderCategory {
  name: string;
  href: string;
  children: HeaderCategory[];
}

function toHeaderCategory(category: NavigationCategoryTree, locale: Locale): HeaderCategory {
  return {
    name: category.name,
    href: categoryUrl(category.slug, { locale }),
    children: category.children.map((child) => toHeaderCategory(child, locale)),
  };
}

export default async function Header() {
  const [categories, contactSettings, locale] = await Promise.all([
    getHeaderNavigation(),
    getPublicContactSettings(),
    getRequestLocale(),
  ]);
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);
  const linkedInLink = socialLinks.find(
    (item) => item.platform.trim().toLowerCase() === "linkedin",
  );

  return (
    <HeaderClient
      locale={locale}
      productCategories={categories.map((category) => toHeaderCategory(category, locale))}
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
