import { FileText, HeadphonesIcon, ShieldCheck, Users } from "lucide-react";
import HeroSection from "@/components/home/HeroSection";
import CategoryGrid from "@/components/home/CategoryGrid";
import CapabilityGrid from "@/components/home/CapabilityGrid";
import FactoryOverview from "@/components/home/FactoryOverview";
import FlagshipProducts from "@/components/home/FlagshipProducts";
import ApplicationGrid from "@/components/home/ApplicationGrid";
import SecondaryCapabilitySection from "@/components/home/SecondaryCapabilitySection";
import HomeFAQSection from "@/components/home/HomeFAQSection";
import BottomRFQSection from "@/components/home/BottomRFQSection";
import {
  getEnabledSocialMediaLinks,
  getSocialMediaDisplayLabel,
  toSingleLineAddress,
} from "@/lib/contactConfig";
import { getHomePageData } from "@/lib/publicData";
import { contactUrl, productsUrl, requestQuoteUrl, solutionsUrl } from "@/lib/routes";
import { getTranslations } from "next-intl/server";

const homepageCategoryFallbackImages: Record<string, string> = {
  "ring-terminals":
    "https://assets.electriterminal.com/families/v3/product-family/ring-terminals-product-family.webp",
  "fork-terminals":
    "https://assets.electriterminal.com/families/v3/product-family/fork-terminals-product-family.webp",
  "spade-terminals":
    "https://assets.electriterminal.com/products/v3/webp/spade-terminals-categories.webp",
  "pin-terminals":
    "https://assets.electriterminal.com/products/v3/webp/pin-terminal-categories.webp",
};

export default async function HomePageClient() {
  const [{ categories, featuredProducts, applications, contactSettings }, common] =
    await Promise.all([getHomePageData(), getTranslations("common")]);

  const primaryRingCategorySlugs = [
    "ring-terminals",
    "fork-terminals",
    "spade-terminals",
    "pin-terminals",
  ];

  const prioritizedCategories = primaryRingCategorySlugs
    .map((slug) => categories.find((category) => category.slug === slug))
    .filter((category): category is (typeof categories)[number] => Boolean(category));

  const keywordMatchedCategories = categories.filter((category) =>
    /(ring|fork|spade|lug)/i.test(`${category.slug} ${category.name}`)
  );

  const terminalKeywordFallback = categories.filter(
    (category) =>
      category.slug.includes("terminal") &&
      !category.slug.includes("terminal-block")
  );

  const fallbackVisibleCategories = categories.filter(
    (category) => !category.slug.includes("terminal-block")
  );

  const uniqueCategoryMap = new Map<string, (typeof categories)[number]>();
  [
    ...prioritizedCategories,
    ...keywordMatchedCategories,
    ...terminalKeywordFallback,
    ...fallbackVisibleCategories,
  ].forEach((category) => {
    uniqueCategoryMap.set(category._id, category);
  });

  const homepageFocusCategories = Array.from(uniqueCategoryMap.values())
    .slice(0, 4)
    .map((category) => ({
      ...category,
      description: category.overviewIntro,
      image: category.image || homepageCategoryFallbackImages[category.slug],
    }));
  const focusCategoryIdSet = new Set(homepageFocusCategories.map((category) => category._id));

  const ringFeaturedProducts = featuredProducts
    .filter((product) => {
      const text = `${product.slug} ${product.title} ${product.summary ?? ""}`;
      return (
        focusCategoryIdSet.has(product.categoryId) ||
        /(ring|fork|spade|lug|terminal)/i.test(text)
      );
    })
    .slice(0, 8)
    .map((product) => ({
      _id: product._id,
      name: product.title,
      slug: product.slug,
      shortDescription: product.summary,
      heroImage: product.mainImage,
    }));

  const applicationCards = applications.slice(0, 4).map((application) => ({
    title: application.title,
    slug: application.slug,
    description: application.excerpt || "",
    productCount: application.productCount,
    image: application.coverImage,
  }));

  const coreCapabilities = [
    {
      icon: ShieldCheck,
      title: "Real Production, Not Just Trading",
      description:
        "Own factory since 2009 and OEM supplier to Amazon brand sellers. All photos come from our actual workshop.",
    },
    {
      icon: Users,
      title: "Flexible Manufacturing",
      description:
        "MOQ and specifications can be adjusted based on project needs and order scope.",
    },
    {
      icon: HeadphonesIcon,
      title: "Fast Response and Sampling",
      description:
        "Quick communication and sample support for testing and validation workflows.",
    },
    {
      icon: FileText,
      title: "Cost-Aware Production",
      description:
        "Production planning aligned with copper pricing and order volume requirements.",
    },
  ];

  const contactLinks = [
    contactSettings.email.enabled && contactSettings.email.value
      ? {
          label: common("email"),
          value: contactSettings.email.value,
          href: `mailto:${contactSettings.email.value}`,
        }
      : null,
    contactSettings.whatsapp.enabled && contactSettings.whatsapp.value
      ? {
          label: "WhatsApp",
          value: contactSettings.whatsapp.value,
          href: contactSettings.whatsapp.href,
          external: true,
        }
      : null,
    contactSettings.wechat?.enabled && contactSettings.wechat.value
      ? {
          label: "WeChat",
          value: contactSettings.wechat.value,
        }
      : null,
    contactSettings.phone.enabled && contactSettings.phone.value
      ? {
          label: "Phone",
          value: contactSettings.phone.value,
          href: `tel:${contactSettings.phone.value.replace(/\s+/g, "")}`,
        }
      : null,
    contactSettings.address.enabled && contactSettings.address.lines.length > 0
      ? {
          label: "Address",
          value: toSingleLineAddress(contactSettings.address.lines),
          href: contactUrl(),
        }
      : null,
    ...getEnabledSocialMediaLinks(contactSettings).map((item) => ({
      label: getSocialMediaDisplayLabel(item),
      value: "Company Profile",
      href: item.url,
      external: true,
    })),
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <>
      <HeroSection
        title="Custom Copper Terminals & Precision Copper Parts, Made to Your Drawing"
        subtitle=""
        description="Send us a drawing or sample. We produce ring terminals, cable lugs, and custom copper connector parts from 99.9% pure copper, with tin plating and silver brazing, for industrial wiring, control cabinets, and OEM assemblies."
        trustLine="Factory-Direct Since 2009 · OEM Supplier to Amazon Brand Sellers"
        categories={[]}
        primaryCta={{ text: "Send Drawing for a Quote", href: requestQuoteUrl() }}
        secondaryCta={{ text: "Browse Standard Terminals", href: productsUrl() }}
        stats={[
          { value: "Since 2009", label: "Copper terminal factory" },
          { value: "99.9% Cu", label: "High-purity copper, tin-plated" },
          { value: "cULus · CE", label: "cULus on selected models" },
          { value: "~7 days", label: "Standard parts · custom tooling ~30 days" },
        ]}
      />

      {homepageFocusCategories.length > 0 && (
        <CategoryGrid
          categories={homepageFocusCategories}
          title="Explore Our Ring Terminal Range"
          subtitle="Designed for different materials, insulation types, and application needs."
          showViewAll={false}
          columns={4}
          descriptionLines={5}
        />
      )}

      <CapabilityGrid
        title="Why Work With Us"
        subtitle="Real production visibility and practical sourcing support for industrial projects."
        capabilities={coreCapabilities}
      />

      <FactoryOverview />

      {ringFeaturedProducts.length > 0 && (
        <FlagshipProducts
          products={ringFeaturedProducts}
          title="Selected Ring Terminals"
          subtitle="Shortlisted ring terminal models for common industrial wiring needs."
          limit={8}
        />
      )}

      {applicationCards.length > 0 && (
        <ApplicationGrid
          applications={applicationCards}
          title="Applications"
          subtitle="Control cabinets, automotive wiring, power distribution, and industrial equipment."
          showViewAll={true}
          viewAllHref={solutionsUrl()}
          viewAllText="View All Applications"
        />
      )}

      <SecondaryCapabilitySection />

      <HomeFAQSection />

      <BottomRFQSection
        title="Have a Drawing? Get a Quote for Your Custom Part"
        subtitle="Attach your drawing, sample photo, or BOM. Our engineers review dimensions, material, and finishing, then confirm pricing, MOQ, and lead time for each part."
        primaryCta={{
          text: "Send Drawing for a Quote",
          href: requestQuoteUrl(),
        }}
        secondaryCta={{
          text: "Browse Standard Terminals",
          href: productsUrl(),
        }}
        benefits={[
          "Own factory since 2009, real production, not trading",
          "OEM supplier to Amazon brand sellers",
          "99.9% pure copper with tin plating and silver brazing",
          "Standard parts in about 1 week; new tooling about 30 days",
          "MOQ confirmed by part size and order quantity",
          "cULus (selected models) and CE documents on request",
        ]}
        contactLinks={contactLinks}
      />
    </>
  );
}
