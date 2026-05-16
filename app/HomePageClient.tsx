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

export default async function HomePageClient() {
  const { categories, featuredProducts, applications, contactSettings } =
    await getHomePageData();

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

  const homepageFocusCategories = Array.from(uniqueCategoryMap.values()).slice(0, 4);
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
        "All images and videos come from actual workshop and production processes.",
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
          label: "Email",
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
          href: "/contact",
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
        title="Reliable Ring Terminal Manufacturer for Industrial Wiring"
        subtitle="High-quality copper ring terminals for secure and stable electrical connections."
        description="Custom solutions, flexible production, and fast response for global buyers."
        trustLine="Real Factory Production · Flexible MOQ · Custom Solutions · Fast Response"
        categories={[
          "Insulated Ring Terminals",
          "Non-Insulated Ring Terminals",
          "Copper Ring Terminals",
          "Heavy-Duty Cable Lugs",
        ]}
        primaryCta={{ text: "Request a Quote", href: "/contact" }}
        secondaryCta={{ text: "View Products", href: "/products" }}
      />

      {homepageFocusCategories.length > 0 && (
        <CategoryGrid
          categories={homepageFocusCategories}
          title="Explore Our Ring Terminal Range"
          subtitle="Designed for different materials, insulation types, and application needs."
          showViewAll={false}
          columns={4}
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
          showViewAll={false}
        />
      )}

      <SecondaryCapabilitySection />

      <HomeFAQSection />

      <BottomRFQSection
        title="Get a Quote for Your Project"
        subtitle="Tell us your requirements. We will respond quickly with suitable options and pricing. MOQ and lead time are confirmed per item number and order quantity."
        primaryCta={{
          text: "Request a Quote",
          href: "/contact",
        }}
        secondaryCta={{
          text: "View Products",
          href: "/products",
        }}
        benefits={[
          "Real factory production visibility",
          "Flexible MOQ and specification alignment",
          "Custom solutions for project needs",
          "MOQ and lead time confirmed by item number",
          "Certificates available for selected models on request",
        ]}
        contactLinks={contactLinks}
      />
    </>
  );
}
