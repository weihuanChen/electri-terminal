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
import type { StaticPageKey } from "@/lib/i18n/config";
import { getNavigationEligibilitySnapshot } from "@/lib/i18n/navigationData";
import { getPublishedNavigationCategory } from "@/lib/i18n/navigationSafety";

interface HeaderCategory {
  name: string;
  href: string;
  children: HeaderCategory[];
}

function toHeaderCategory(
  category: NavigationCategoryTree,
  locale: Locale,
  snapshot: Awaited<ReturnType<typeof getNavigationEligibilitySnapshot>>
): HeaderCategory | null {
  const localized = getPublishedNavigationCategory(snapshot, category._id);
  if (!localized) return null;
  return {
    name: localized.title || category.name,
    href: categoryUrl(category.slug, { locale }),
    children: category.children
      .map((child) => toHeaderCategory(child, locale, snapshot))
      .filter((child): child is HeaderCategory => Boolean(child)),
  };
}

export default async function Header() {
  const [categories, contactSettings, locale] = await Promise.all([
    getHeaderNavigation(),
    getPublicContactSettings(),
    getRequestLocale(),
  ]);
  const navigationSnapshot = await getNavigationEligibilitySnapshot(locale);
  const socialLinks = getEnabledSocialMediaLinks(contactSettings);
  const linkedInLink = socialLinks.find(
    (item) => item.platform.trim().toLowerCase() === "linkedin",
  );

  return (
    <HeaderClient
      locale={locale}
      availableStaticPages={navigationSnapshot.publishedStaticPages as StaticPageKey[]}
      productCategories={categories
        .map((category) => toHeaderCategory(category, locale, navigationSnapshot))
        .filter((category): category is HeaderCategory => Boolean(category))}
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
