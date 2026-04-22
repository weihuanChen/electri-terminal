import { mutation } from "../../_generated/server";

function now() {
  return Date.now();
}

function normalizeModel(model: string) {
  return model.toLowerCase().replace(/\s+/g, "");
}

function bytes(mb: number) {
  return Math.round(mb * 1024 * 1024);
}

export const seedMockCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    const timestamp = now();

    const categorySeeds = [
      {
        name: "Terminal Blocks",
        slug: "terminal-blocks",
        description:
          "High-performance DIN rail and PCB terminal blocks engineered for reliable industrial connections.",
        shortDescription: "DIN rail and PCB terminal blocks for industrial wiring.",
        image:
          "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
        templateKey: "terminal-blocks",
      },
      {
        name: "Cable Glands",
        slug: "cable-glands",
        description:
          "Heavy-duty waterproof brass and nylon cable glands for secure wire entry and strain relief.",
        shortDescription: "Waterproof nylon and brass cable glands for industrial enclosures.",
        image:
          "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?q=80&w=2000&auto=format&fit=crop",
        templateKey: "cable-glands",
      },
      {
        name: "Electrical Enclosures",
        slug: "electrical-enclosures",
        description:
          "Rugged industrial electrical enclosures and junction boxes for protecting control components.",
        shortDescription: "Industrial enclosures and junction boxes for demanding environments.",
        image:
          "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop",
        templateKey: "electrical-enclosures",
      },
      {
        name: "DIN Rail Accessories",
        slug: "din-rail-accessories",
        description:
          "Complete mounting and marking systems for electrical panels including rails and end brackets.",
        shortDescription: "DIN rails, brackets, markers, and panel assembly accessories.",
        image:
          "https://images.unsplash.com/photo-1517420879255-5f3c250e6bc4?q=80&w=2000&auto=format&fit=crop",
        templateKey: "din-rail-accessories",
      },
    ] as const;

    const categories = new Map<string, string>();
    for (const [index, seed] of categorySeeds.entries()) {
      const existing = await ctx.db
        .query("categories")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();

      const data = {
        name: seed.name,
        slug: seed.slug,
        parentId: undefined,
        level: 0,
        path: `/categories/${seed.slug}`,
        description: seed.description,
        shortDescription: seed.shortDescription,
        image: seed.image,
        icon: undefined,
        sortOrder: index,
        status: "published" as const,
        templateKey: seed.templateKey,
        seoTitle: seed.name,
        seoDescription: seed.description,
        canonical: `/categories/${seed.slug}`,
        isVisibleInNav: true,
        updatedAt: timestamp,
      };

      const id = existing
        ? (await ctx.db.patch(existing._id, data), existing._id)
        : await ctx.db.insert("categories", {
            ...data,
            createdAt: timestamp,
          });

      categories.set(seed.slug, id);
    }

    const templateSeeds = [
      {
        categorySlug: "terminal-blocks",
        name: "Terminal Block Specifications",
        fields: [
          { fieldKey: "rated_voltage", label: "Rated Voltage", fieldType: "string", unit: "V", groupName: "Electrical", isFilterable: true },
          { fieldKey: "rated_current", label: "Rated Current", fieldType: "string", unit: "A", groupName: "Electrical", isFilterable: true },
          { fieldKey: "wire_range", label: "Wire Range", fieldType: "string", groupName: "Connection", isFilterable: true },
          { fieldKey: "mounting_type", label: "Mounting Type", fieldType: "string", groupName: "Connection", isFilterable: true },
          { fieldKey: "connection_type", label: "Connection Type", fieldType: "string", groupName: "Connection", isFilterable: true },
        ],
      },
      {
        categorySlug: "cable-glands",
        name: "Cable Gland Specifications",
        fields: [
          { fieldKey: "thread_type", label: "Thread Type", fieldType: "string", groupName: "Mechanical", isFilterable: true },
          { fieldKey: "clamping_range", label: "Clamping Range", fieldType: "string", groupName: "Mechanical", isFilterable: true },
          { fieldKey: "material", label: "Material", fieldType: "string", groupName: "Material", isFilterable: true },
          { fieldKey: "protection_rating", label: "Protection Rating", fieldType: "string", groupName: "Protection", isFilterable: true },
          { fieldKey: "operating_temperature", label: "Operating Temperature", fieldType: "string", groupName: "Protection", isFilterable: false },
        ],
      },
      {
        categorySlug: "electrical-enclosures",
        name: "Enclosure Specifications",
        fields: [
          { fieldKey: "protection_rating", label: "Protection Rating", fieldType: "string", groupName: "Protection", isFilterable: true },
          { fieldKey: "material", label: "Material", fieldType: "string", groupName: "Material", isFilterable: true },
          { fieldKey: "dimensions", label: "Dimensions", fieldType: "string", groupName: "Mechanical", isFilterable: false },
          { fieldKey: "mounting_type", label: "Mounting Type", fieldType: "string", groupName: "Mechanical", isFilterable: true },
          { fieldKey: "impact_rating", label: "Impact Rating", fieldType: "string", groupName: "Protection", isFilterable: true },
        ],
      },
      {
        categorySlug: "din-rail-accessories",
        name: "DIN Rail Accessory Specifications",
        fields: [
          { fieldKey: "accessory_type", label: "Accessory Type", fieldType: "string", groupName: "Basic", isFilterable: true },
          { fieldKey: "material", label: "Material", fieldType: "string", groupName: "Material", isFilterable: true },
          { fieldKey: "length", label: "Length", fieldType: "string", groupName: "Dimensions", isFilterable: true },
          { fieldKey: "thickness", label: "Thickness", fieldType: "string", groupName: "Dimensions", isFilterable: false },
          { fieldKey: "compatibility", label: "Compatibility", fieldType: "string", groupName: "Basic", isFilterable: true },
        ],
      },
    ] as const;

    let templateCount = 0;
    for (const seed of templateSeeds) {
      const categoryId = categories.get(seed.categorySlug)!;
      const existingTemplate = await ctx.db
        .query("attributeTemplates")
        .withIndex("by_categoryId_name", (q) => q.eq("categoryId", categoryId).eq("name", seed.name))
        .unique();

      const templateData = {
        name: seed.name,
        categoryId,
        description: `${seed.name} for seeded demo data`,
        status: "published" as const,
        updatedAt: timestamp,
      };

      const templateId = existingTemplate
        ? (await ctx.db.patch(existingTemplate._id, templateData), existingTemplate._id)
        : await ctx.db.insert("attributeTemplates", {
            ...templateData,
            createdAt: timestamp,
          });

      templateCount += 1;

      for (const [index, field] of seed.fields.entries()) {
        const existingDefinition = await ctx.db
          .query("attributeDefinitions")
          .withIndex("by_fieldKey", (q) => q.eq("fieldKey", field.fieldKey))
          .unique();

        const definitionData = {
          fieldKey: field.fieldKey,
          label: field.label,
          fieldType: field.fieldType,
          unit: field.unit,
          options: undefined,
          groupName: field.groupName,
          description: undefined,
          updatedAt: timestamp,
        };

        const definitionId = existingDefinition
          ? (await ctx.db.patch(existingDefinition._id, definitionData), existingDefinition._id)
          : await ctx.db.insert("attributeDefinitions", {
              ...definitionData,
              createdAt: timestamp,
            });

        const existingField = await ctx.db
          .query("attributeFields")
          .withIndex("by_templateId_definitionId", (q) =>
            q.eq("templateId", templateId).eq("definitionId", definitionId)
          )
          .unique();

        const fieldData = {
          templateId,
          definitionId,
          isRequired: false,
          isFilterable: field.isFilterable,
          isSearchable: true,
          isVisibleOnFrontend: true,
          importAlias: field.fieldKey,
          sortOrder: index,
          helpText: undefined,
          updatedAt: timestamp,
        };

        if (existingField) {
          await ctx.db.patch(existingField._id, fieldData);
        } else {
          await ctx.db.insert("attributeFields", {
            ...fieldData,
            createdAt: timestamp,
          });
        }
      }
    }

    const familySeeds = [
      {
        name: "UK Series Universal Terminal Blocks",
        slug: "uk-series",
        categorySlug: "terminal-blocks",
        summary: "Industry-standard screw connection terminal blocks for control cabinets and panel wiring.",
      },
      {
        name: "PT Series Push-in Terminal Blocks",
        slug: "pt-series",
        categorySlug: "terminal-blocks",
        summary: "Tool-free push-in terminal blocks optimized for high-efficiency panel assembly.",
      },
      {
        name: "M-Series Metric Cable Glands",
        slug: "m-series-glands",
        categorySlug: "cable-glands",
        summary: "Metric IP68 nylon cable glands for reliable sealing and strain relief.",
      },
      {
        name: "PG Series Nylon Cable Glands",
        slug: "pg-series-glands",
        categorySlug: "cable-glands",
        summary: "PG thread nylon cable glands designed for cost-effective industrial enclosure entry.",
      },
      {
        name: "Heavy Duty Die-Cast Enclosures",
        slug: "die-cast-enclosures",
        categorySlug: "electrical-enclosures",
        summary: "Industrial die-cast aluminum enclosures with strong sealing and shielding performance.",
      },
      {
        name: "ABS Junction Boxes",
        slug: "abs-junction-boxes",
        categorySlug: "electrical-enclosures",
        summary: "ABS and polycarbonate junction boxes for compact electrical protection applications.",
      },
      {
        name: "Standard DIN Rails",
        slug: "standard-din-rails",
        categorySlug: "din-rail-accessories",
        summary: "Standard 35mm DIN rails for panel assembly and device mounting.",
      },
      {
        name: "End Brackets and Stops",
        slug: "end-brackets-stops",
        categorySlug: "din-rail-accessories",
        summary: "End brackets, stops, and retention accessories for secure terminal mounting.",
      },
    ] as const;

    const familyImages: Record<string, string> = {
      "terminal-blocks":
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
      "cable-glands":
        "https://images.unsplash.com/photo-1544724569-5f546fd6f2b6?q=80&w=2000&auto=format&fit=crop",
      "electrical-enclosures":
        "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=2000&auto=format&fit=crop",
      "din-rail-accessories":
        "https://images.unsplash.com/photo-1517420879255-5f3c250e6bc4?q=80&w=2000&auto=format&fit=crop",
    };

    const families = new Map<string, string>();
    for (const [index, seed] of familySeeds.entries()) {
      const existing = await ctx.db
        .query("productFamilies")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();

      const image = familyImages[seed.categorySlug];
      const data = {
        name: seed.name,
        slug: seed.slug,
        categoryId: categories.get(seed.categorySlug)!,
        brand: "Electri Pro",
        summary: seed.summary,
        content: seed.summary,
        highlights: [
          `Designed for ${seed.categorySlug.replace(/-/g, " ")}`,
          "Stable industrial-grade performance",
          "Suitable for export-oriented B2B catalog presentation",
        ],
        heroImage: image,
        gallery: [image],
        status: "published" as const,
        sortOrder: index,
        seoTitle: seed.name,
        seoDescription: seed.summary,
        canonical: `/families/${seed.slug}`,
        updatedAt: timestamp,
      };

      const id = existing
        ? (await ctx.db.patch(existing._id, data), existing._id)
        : await ctx.db.insert("productFamilies", {
            ...data,
            createdAt: timestamp,
          });

      families.set(seed.slug, id);
    }

    const productSeeds = [
      {
        skuCode: "UK-2.5B",
        model: "UK2.5",
        slug: "uk-2-5-terminal-block",
        title: "UK-2.5 Universal Screw Terminal Block",
        shortTitle: "UK-2.5 Terminal Block",
        familySlug: "uk-series",
        categorySlug: "terminal-blocks",
        summary: "Universal screw connection terminal block for control cabinets.",
        attributes: {
          rated_voltage: "800",
          rated_current: "32",
          wire_range: "0.2-4mm²",
          mounting_type: "DIN rail",
          connection_type: "Screw",
        },
      },
      {
        skuCode: "UK-4",
        model: "UK4",
        slug: "uk-4-terminal-block",
        title: "UK-4 Universal Screw Terminal Block",
        shortTitle: "UK-4 Terminal Block",
        familySlug: "uk-series",
        categorySlug: "terminal-blocks",
        summary: "Higher current screw terminal block for industrial panel power distribution.",
        attributes: {
          rated_voltage: "800",
          rated_current: "41",
          wire_range: "0.2-6mm²",
          mounting_type: "DIN rail",
          connection_type: "Screw",
        },
      },
      {
        skuCode: "PT-2.5",
        model: "PT2.5",
        slug: "pt-2-5-terminal-block",
        title: "PT-2.5 Push-in Terminal Block",
        shortTitle: "PT-2.5 Terminal Block",
        familySlug: "pt-series",
        categorySlug: "terminal-blocks",
        summary: "Push-in terminal block for rapid wiring and assembly efficiency.",
        attributes: {
          rated_voltage: "800",
          rated_current: "24",
          wire_range: "0.14-4mm²",
          mounting_type: "DIN rail",
          connection_type: "Push-in",
        },
      },
      {
        skuCode: "PT-4",
        model: "PT4",
        slug: "pt-4-terminal-block",
        title: "PT-4 Push-in Terminal Block",
        shortTitle: "PT-4 Terminal Block",
        familySlug: "pt-series",
        categorySlug: "terminal-blocks",
        summary: "Push-in terminal block for faster cabinet assembly in automation projects.",
        attributes: {
          rated_voltage: "800",
          rated_current: "32",
          wire_range: "0.2-6mm²",
          mounting_type: "DIN rail",
          connection_type: "Push-in",
        },
      },
      {
        skuCode: "M20-PA66-IP68",
        model: "M20",
        slug: "m20-ip68-cable-gland",
        title: "M20 Nylon IP68 Cable Gland",
        shortTitle: "M20 Cable Gland",
        familySlug: "m-series-glands",
        categorySlug: "cable-glands",
        summary: "Metric nylon cable gland for waterproof enclosure cable entry.",
        attributes: {
          thread_type: "M20",
          clamping_range: "6-12mm",
          material: "PA66 Nylon",
          protection_rating: "IP68",
          operating_temperature: "-40C to +100C",
        },
      },
      {
        skuCode: "M25-PA66-IP68",
        model: "M25",
        slug: "m25-ip68-cable-gland",
        title: "M25 Nylon IP68 Cable Gland",
        shortTitle: "M25 Cable Gland",
        familySlug: "m-series-glands",
        categorySlug: "cable-glands",
        summary: "Metric nylon cable gland with wider clamping range for industrial enclosures.",
        attributes: {
          thread_type: "M25",
          clamping_range: "9-17mm",
          material: "PA66 Nylon",
          protection_rating: "IP68",
          operating_temperature: "-40C to +100C",
        },
      },
      {
        skuCode: "PG9-PA66-IP68",
        model: "PG9",
        slug: "pg9-cable-gland",
        title: "PG9 Nylon Cable Gland",
        shortTitle: "PG9 Cable Gland",
        familySlug: "pg-series-glands",
        categorySlug: "cable-glands",
        summary: "PG thread nylon cable gland for general industrial enclosure use.",
        attributes: {
          thread_type: "PG9",
          clamping_range: "4-8mm",
          material: "PA66 Nylon",
          protection_rating: "IP68",
          operating_temperature: "-20C to +80C",
        },
      },
      {
        skuCode: "PG13.5-PA66-IP68",
        model: "PG13.5",
        slug: "pg13-5-cable-gland",
        title: "PG13.5 Nylon Cable Gland",
        shortTitle: "PG13.5 Cable Gland",
        familySlug: "pg-series-glands",
        categorySlug: "cable-glands",
        summary: "PG thread cable gland for cabinet and junction box cable entry.",
        attributes: {
          thread_type: "PG13.5",
          clamping_range: "6-12mm",
          material: "PA66 Nylon",
          protection_rating: "IP68",
          operating_temperature: "-20C to +80C",
        },
      },
      {
        skuCode: "HD-AL-01",
        model: "HD-AL-01",
        slug: "heavy-duty-die-cast-enclosure",
        title: "Heavy Duty Die-Cast Aluminum Enclosure",
        shortTitle: "Die-Cast Enclosure",
        familySlug: "die-cast-enclosures",
        categorySlug: "electrical-enclosures",
        summary: "Die-cast aluminum enclosure engineered for harsh environments.",
        attributes: {
          protection_rating: "IP67",
          material: "Die-cast aluminum",
          dimensions: "200x120x90mm",
          mounting_type: "Wall mount",
          impact_rating: "IK10",
        },
      },
      {
        skuCode: "HD-AL-02",
        model: "HD-AL-02",
        slug: "heavy-duty-die-cast-enclosure-large",
        title: "Large Die-Cast Aluminum Enclosure",
        shortTitle: "Large Die-Cast Enclosure",
        familySlug: "die-cast-enclosures",
        categorySlug: "electrical-enclosures",
        summary: "Large die-cast enclosure for control systems and field wiring protection.",
        attributes: {
          protection_rating: "IP67",
          material: "Die-cast aluminum",
          dimensions: "280x180x100mm",
          mounting_type: "Wall mount",
          impact_rating: "IK10",
        },
      },
      {
        skuCode: "ABS-JB-01",
        model: "ABS-150",
        slug: "abs-junction-box-150",
        title: "ABS Junction Box 150x110x70",
        shortTitle: "ABS Junction Box",
        familySlug: "abs-junction-boxes",
        categorySlug: "electrical-enclosures",
        summary: "ABS junction box for compact indoor and outdoor wiring protection.",
        attributes: {
          protection_rating: "IP65",
          material: "ABS",
          dimensions: "150x110x70mm",
          mounting_type: "Wall mount",
          impact_rating: "IK08",
        },
      },
      {
        skuCode: "DR-35-1M",
        model: "DR35-1M",
        slug: "35mm-din-rail-1m",
        title: "35mm DIN Rail 1 Meter",
        shortTitle: "35mm DIN Rail",
        familySlug: "standard-din-rails",
        categorySlug: "din-rail-accessories",
        summary: "Standard top-hat DIN rail for terminal blocks and modular device mounting.",
        attributes: {
          accessory_type: "DIN Rail",
          material: "Galvanized steel",
          length: "1000mm",
          thickness: "1.0mm",
          compatibility: "35mm top-hat",
        },
      },
      {
        skuCode: "EUK-01",
        model: "E/UK",
        slug: "e-uk-end-bracket",
        title: "E/UK End Bracket",
        shortTitle: "End Bracket",
        familySlug: "end-brackets-stops",
        categorySlug: "din-rail-accessories",
        summary: "End bracket for securing terminal blocks and accessories on DIN rails.",
        attributes: {
          accessory_type: "End Bracket",
          material: "PA66",
          length: "45mm",
          thickness: "8mm",
          compatibility: "35mm top-hat",
        },
      },
    ] as const;

    const products = new Map<string, string>();
    for (const [index, seed] of productSeeds.entries()) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();

      const image = familyImages[seed.categorySlug];
      const data = {
        skuCode: seed.skuCode,
        model: seed.model,
        normalizedModel: normalizeModel(seed.model),
        slug: seed.slug,
        title: seed.title,
        shortTitle: seed.shortTitle,
        familyId: families.get(seed.familySlug)!,
        categoryId: categories.get(seed.categorySlug)!,
        brand: "Electri Pro",
        summary: seed.summary,
        content: seed.summary,
        attributes: seed.attributes,
        featureBullets: [
          "Seeded catalog demo product",
          "Published and visible on frontend",
          `Belongs to ${seed.familySlug.replace(/-/g, " ")}`,
        ],
        mainImage: image,
        gallery: [image],
        status: "published" as const,
        isFeatured: ["uk-2-5-terminal-block", "m20-ip68-cable-gland", "heavy-duty-die-cast-enclosure", "35mm-din-rail-1m"].includes(seed.slug),
        moq: 50,
        packageInfo: "Export carton packaging",
        leadTime: "2-3 weeks",
        origin: "China",
        searchKeywords: [seed.model, seed.shortTitle, seed.title],
        sortOrder: index,
        seoTitle: seed.title,
        seoDescription: seed.summary,
        canonical: `/products/${seed.slug}`,
        updatedAt: timestamp,
      };

      const id = existing
        ? (await ctx.db.patch(existing._id, data), existing._id)
        : await ctx.db.insert("products", {
            ...data,
            createdAt: timestamp,
          });

      products.set(seed.slug, id);
    }

    const assetSeeds = [
      ...categorySeeds.map((category) => ({
        title: `${category.name} Product Catalog`,
        type: "catalog" as const,
        fileUrl: `/catalogs/${category.slug}.pdf`,
        fileSize: bytes(4.2),
        entityType: "category" as const,
        entitySlug: category.slug,
      })),
      ...familySeeds.map((family) => ({
        title: `${family.name} Datasheet`,
        type: "datasheet" as const,
        fileUrl: `/datasheets/${family.slug}.pdf`,
        fileSize: bytes(1.3),
        entityType: "family" as const,
        entitySlug: family.slug,
      })),
      {
        title: "Terminal Block CE Certificate",
        type: "certificate" as const,
        fileUrl: "/certificates/terminal-block-ce.pdf",
        fileSize: bytes(0.3),
        entityType: "product" as const,
        entitySlug: "uk-2-5-terminal-block",
      },
      {
        title: "Cable Gland CE Certificate",
        type: "certificate" as const,
        fileUrl: "/certificates/cable-gland-ce.pdf",
        fileSize: bytes(0.3),
        entityType: "product" as const,
        entitySlug: "m20-ip68-cable-gland",
      },
      {
        title: "Enclosure Installation Manual",
        type: "manual" as const,
        fileUrl: "/manuals/enclosure-installation.pdf",
        fileSize: bytes(1.1),
        entityType: "family" as const,
        entitySlug: "die-cast-enclosures",
      },
      {
        title: "DIN Rail CAD Bundle",
        type: "cad" as const,
        fileUrl: "/cad/din-rail-bundle.zip",
        fileSize: bytes(6.5),
        entityType: "family" as const,
        entitySlug: "standard-din-rails",
      },
    ] as const;

    const existingAssets = await ctx.db.query("assets").collect();
    const assets = new Map<string, string>();
    for (const seed of assetSeeds) {
      const existing = existingAssets.find((asset) => asset.title === seed.title);
      const data = {
        title: seed.title,
        type: seed.type,
        fileUrl: seed.fileUrl,
        previewImage: undefined,
        language: "en",
        version: "2024.1",
        fileSize: seed.fileSize,
        mimeType: seed.fileUrl.endsWith(".zip") ? "application/zip" : "application/pdf",
        isPublic: true,
        requireLeadForm: false,
        updatedAt: timestamp,
      };

      const id = existing
        ? (await ctx.db.patch(existing._id, data), existing._id)
        : await ctx.db.insert("assets", {
            ...data,
            createdAt: timestamp,
          });

      assets.set(seed.title, id);
    }

    for (const [index, seed] of assetSeeds.entries()) {
      const assetId = assets.get(seed.title)!;
      const entityId =
        seed.entityType === "category"
          ? categories.get(seed.entitySlug)!
          : seed.entityType === "family"
            ? families.get(seed.entitySlug)!
            : products.get(seed.entitySlug)!;

      const existing = await ctx.db
        .query("assetRelations")
        .withIndex("by_asset_entity", (q) =>
          q.eq("assetId", assetId).eq("entityType", seed.entityType).eq("entityId", entityId)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("assetRelations", {
          assetId,
          entityType: seed.entityType,
          entityId,
          sortOrder: index,
        });
      }
    }

    const articleSeeds = [
      {
        type: "blog" as const,
        title: "How to Choose the Right Terminal Block for Control Cabinets",
        slug: "choose-terminal-block-control-cabinets",
        excerpt: "A practical selection guide for voltage, current, and wiring range.",
        content: "A practical selection guide for voltage, current, and wiring range.",
        relatedCategorySlugs: ["terminal-blocks"],
        relatedFamilySlugs: ["uk-series"],
        relatedProductSlugs: ["uk-2-5-terminal-block"],
        coverImage: familyImages["terminal-blocks"],
      },
      {
        type: "blog" as const,
        title: "How to Select the Right Enclosure Protection Rating",
        slug: "select-enclosure-protection-rating",
        excerpt: "Understanding IP and IK ratings for harsh industrial environments.",
        content: "Understanding IP and IK ratings for harsh industrial environments.",
        relatedCategorySlugs: ["electrical-enclosures"],
        relatedFamilySlugs: ["die-cast-enclosures"],
        relatedProductSlugs: ["heavy-duty-die-cast-enclosure"],
        coverImage: familyImages["electrical-enclosures"],
      },
      {
        type: "application" as const,
        title: "Industrial Automation Wiring Solutions",
        slug: "industrial-automation-wiring-solutions",
        excerpt: "Terminal blocks and DIN rail accessories for PLC cabinets and automation lines.",
        content: "Terminal blocks and DIN rail accessories for PLC cabinets and automation lines.",
        relatedCategorySlugs: ["terminal-blocks", "din-rail-accessories"],
        relatedFamilySlugs: ["uk-series", "standard-din-rails"],
        relatedProductSlugs: ["uk-2-5-terminal-block", "35mm-din-rail-1m"],
        coverImage: "https://images.unsplash.com/photo-1565514020179-026b92b647bf?q=80&w=2000&auto=format&fit=crop",
      },
      {
        type: "application" as const,
        title: "Control Panel Cable Entry and Sealing",
        slug: "control-panel-cable-entry-sealing",
        excerpt: "Cable glands and junction boxes for secure cable entry and enclosure sealing.",
        content: "Cable glands and junction boxes for secure cable entry and enclosure sealing.",
        relatedCategorySlugs: ["cable-glands", "electrical-enclosures"],
        relatedFamilySlugs: ["m-series-glands", "abs-junction-boxes"],
        relatedProductSlugs: ["m20-ip68-cable-gland", "abs-junction-box-150"],
        coverImage: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=2000&auto=format&fit=crop",
      },
      {
        type: "application" as const,
        title: "Power Distribution Cabinets",
        slug: "power-distribution-cabinets",
        excerpt: "Terminal blocks and die-cast enclosures for safe power distribution architectures.",
        content: "Terminal blocks and die-cast enclosures for safe power distribution architectures.",
        relatedCategorySlugs: ["terminal-blocks", "electrical-enclosures"],
        relatedFamilySlugs: ["uk-series", "die-cast-enclosures"],
        relatedProductSlugs: ["uk-4-terminal-block", "heavy-duty-die-cast-enclosure-large"],
        coverImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=2000&auto=format&fit=crop",
      },
      {
        type: "application" as const,
        title: "Renewable Energy Junction Systems",
        slug: "renewable-energy-junction-systems",
        excerpt: "Cable glands, junction boxes, and DIN rail mounting components for outdoor projects.",
        content: "Cable glands, junction boxes, and DIN rail mounting components for outdoor projects.",
        relatedCategorySlugs: ["cable-glands", "din-rail-accessories", "electrical-enclosures"],
        relatedFamilySlugs: ["pg-series-glands", "standard-din-rails", "abs-junction-boxes"],
        relatedProductSlugs: ["pg13-5-cable-gland", "35mm-din-rail-1m", "abs-junction-box-150"],
        coverImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2000&auto=format&fit=crop",
      },
      ...categorySeeds.map((category) => ({
        type: "faq" as const,
        title: `${category.name}: How do I select the right model?`,
        slug: `${category.slug}-selection-faq`,
        excerpt: `Selection FAQ for ${category.name}.`,
        content: `Review rated requirements, environment, and mounting constraints when selecting ${category.name.toLowerCase()}.`,
        relatedCategorySlugs: [category.slug],
        relatedFamilySlugs: [],
        relatedProductSlugs: [],
        coverImage: undefined,
      })),
      {
        type: "faq" as const,
        title: "UK Series: Do you support export labeling?",
        slug: "uk-series-export-labeling-faq",
        excerpt: "Export labeling and OEM packaging options.",
        content: "Yes. We support custom labels, carton marks, and OEM packaging for UK Series projects.",
        relatedCategorySlugs: [],
        relatedFamilySlugs: ["uk-series"],
        relatedProductSlugs: [],
        coverImage: undefined,
      },
      {
        type: "faq" as const,
        title: "M20 Cable Gland: Is outdoor use supported?",
        slug: "m20-cable-gland-outdoor-faq",
        excerpt: "Outdoor use conditions for M20 cable glands.",
        content: "Yes. For outdoor use we recommend confirming UV resistance and matching gasket material for the target environment.",
        relatedCategorySlugs: [],
        relatedFamilySlugs: [],
        relatedProductSlugs: ["m20-ip68-cable-gland"],
        coverImage: undefined,
      },
    ];

    for (const seed of articleSeeds) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .unique();

      const data = {
        type: seed.type,
        title: seed.title,
        slug: seed.slug,
        excerpt: seed.excerpt,
        coverImage: seed.coverImage,
        content: seed.content,
        categoryIds: seed.relatedCategorySlugs.map((slug) => categories.get(slug)!),
        tagNames: ["seed", "industrial", seed.type],
        relatedCategoryIds: seed.relatedCategorySlugs.map((slug) => categories.get(slug)!),
        relatedFamilyIds: seed.relatedFamilySlugs.map((slug) => families.get(slug)!),
        relatedProductIds: seed.relatedProductSlugs.map((slug) => products.get(slug)!),
        status: "published" as const,
        publishedAt: timestamp,
        seoTitle: seed.title,
        seoDescription: seed.excerpt,
        canonical: `/blog/${seed.slug}`,
        updatedAt: timestamp,
      };

      if (existing) {
        await ctx.db.patch(existing._id, data);
      } else {
        await ctx.db.insert("articles", {
          ...data,
          createdAt: timestamp,
        });
      }
    }

    return {
      categories: categories.size,
      templates: templateCount,
      families: families.size,
      products: products.size,
      assets: assets.size,
      articles: articleSeeds.length,
      seededAt: timestamp,
    };
  },
});
