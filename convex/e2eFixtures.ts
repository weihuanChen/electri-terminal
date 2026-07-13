import { mutation, type MutationCtx } from "./_generated/server";

const FIXTURE_CATEGORY_SLUG = "e2e-terminal-components";
const FIXTURE_FAMILY_SLUG = "e2e-terminal-family";
const PUBLISHED_PRODUCT_SLUG = "e2e-published-terminal";
const MISSING_PRODUCT_SLUG = "e2e-missing-translation-terminal";

async function deleteLocalizationsForSource(
  ctx: MutationCtx,
  entityType: "staticPage" | "category" | "family" | "product",
  sourceId: string
) {
  const records = await ctx.db
    .query("localizations")
    .withIndex("by_entity", (query) =>
      query.eq("entityType", entityType).eq("sourceId", sourceId)
    )
    .collect();

  await Promise.all(records.map((record) => ctx.db.delete(record._id)));
}

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const cloudUrl = process.env.CONVEX_CLOUD_URL ?? "";
    if (!cloudUrl.startsWith("http://127.0.0.1")) {
      throw new Error("E2E fixtures may only be seeded into a local Convex backend.");
    }

    const existingProducts = await Promise.all(
      [PUBLISHED_PRODUCT_SLUG, MISSING_PRODUCT_SLUG].map((slug) =>
        ctx.db.query("products").withIndex("by_slug", (query) => query.eq("slug", slug)).unique()
      )
    );
    for (const product of existingProducts) {
      if (!product) continue;
      await deleteLocalizationsForSource(ctx, "product", String(product._id));
      await ctx.db.delete(product._id);
    }

    const existingFamily = await ctx.db
      .query("productFamilies")
      .withIndex("by_slug", (query) => query.eq("slug", FIXTURE_FAMILY_SLUG))
      .unique();
    if (existingFamily) {
      await deleteLocalizationsForSource(ctx, "family", String(existingFamily._id));
      await ctx.db.delete(existingFamily._id);
    }

    const existingCategory = await ctx.db
      .query("categories")
      .withIndex("by_slug", (query) => query.eq("slug", FIXTURE_CATEGORY_SLUG))
      .unique();
    if (existingCategory) {
      await deleteLocalizationsForSource(ctx, "category", String(existingCategory._id));
      await ctx.db.delete(existingCategory._id);
    }

    const now = 1_700_000_000_000;
    await deleteLocalizationsForSource(ctx, "staticPage", "home");
    const categoryId = await ctx.db.insert("categories", {
      name: "E2E Terminal Components",
      slug: FIXTURE_CATEGORY_SLUG,
      level: 1,
      path: `/${FIXTURE_CATEGORY_SLUG}`,
      description: "Deterministic E2E category fixture.",
      sortOrder: 9_000,
      status: "published",
      isVisibleInNav: false,
      createdAt: now,
      updatedAt: now,
    });
    const familyId = await ctx.db.insert("productFamilies", {
      name: "E2E Terminal Family",
      slug: FIXTURE_FAMILY_SLUG,
      categoryId,
      summary: "Deterministic E2E family fixture.",
      status: "published",
      sortOrder: 9_000,
      createdAt: now,
      updatedAt: now,
    });
    const publishedProductId = await ctx.db.insert("products", {
      skuCode: "E2E-PUBLISHED-001",
      model: "E2E-PUBLISHED-001",
      normalizedModel: "e2e-published-001",
      slug: PUBLISHED_PRODUCT_SLUG,
      title: "E2E Published Terminal",
      familyId,
      categoryId,
      summary: "English source fixture.",
      status: "published",
      isFeatured: false,
      sortOrder: 9_000,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("products", {
      skuCode: "E2E-MISSING-001",
      model: "E2E-MISSING-001",
      normalizedModel: "e2e-missing-001",
      slug: MISSING_PRODUCT_SLUG,
      title: "E2E Missing Translation Terminal",
      familyId,
      categoryId,
      summary: "English source without a Russian translation.",
      status: "published",
      isFeatured: false,
      sortOrder: 9_001,
      createdAt: now,
      updatedAt: now,
    });

    const commonLocalization = {
      locale: "ru",
      status: "published" as const,
      translationMethod: "manual" as const,
      reviewer: "p0-e2e",
      publishedBy: "p0-e2e",
      reviewRequired: true,
      requiredForRelease: true,
      reviewedAt: now,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await ctx.db.insert("localizations", {
      ...commonLocalization,
      entityType: "staticPage",
      sourceId: "home",
      title: "Тестовая главная страница",
      seoTitle: "Тестовая главная страница | Electri Terminal",
      seoDescription: "Детерминированная русская главная страница.",
      localizedFields: {
        headline: "Надежные промышленные соединения",
        intro: "Русский текст главной страницы.",
        content: {
          schemaVersion: 1,
          pageKey: "home",
          sourcePath: "/",
          blocks: [
            {
              id: "hero",
              type: "section",
              headings: [{ level: 1, text: "Надежные промышленные соединения" }],
              paragraphs: ["Русский текст главной страницы."],
              lists: [],
              ctas: [{ label: "Связаться с нами", href: "/contact#request-quote" }],
              children: [],
            },
          ],
        },
      },
    });
    await ctx.db.insert("localizations", {
      ...commonLocalization,
      entityType: "category",
      sourceId: String(categoryId),
      title: "Компоненты E2E",
      localizedFields: { description: "Тестовая категория компонентов." },
    });
    await ctx.db.insert("localizations", {
      ...commonLocalization,
      entityType: "family",
      sourceId: String(familyId),
      title: "Семейство клемм E2E",
      localizedFields: { summary: "Тестовое семейство клемм." },
    });
    await ctx.db.insert("localizations", {
      ...commonLocalization,
      entityType: "product",
      sourceId: String(publishedProductId),
      title: "Опубликованная тестовая клемма",
      seoTitle: "Тестовая клемма E2E",
      seoDescription: "Детерминированная русская тестовая страница.",
      localizedFields: {
        summary: "Русское описание тестовой клеммы.",
        featureBullets: ["Проверенная локализация"],
      },
    });

    const settings = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (query) => query.eq("key", "global"))
      .unique();
    const contact = settings?.contact ?? {
      email: { enabled: true, value: "e2e@example.com" },
      whatsapp: { enabled: false, value: "" },
      phone: { enabled: false, value: "" },
      address: { enabled: false, lines: [] },
      socialMedia: { enabled: false, items: [] },
    };
    const languageWorkflows = [
      {
        locale: "ru",
        status: "prelaunch" as const,
        gscSubmissionEnabled: false,
        sitemapEnabled: false,
        hreflangEnabled: false,
        languageSwitcherEnabled: false,
        previewEnabled: true,
        releaseOwner: "p0-e2e",
        createdAt: now,
        updatedAt: now,
      },
    ];
    if (settings) {
      await ctx.db.patch(settings._id, { contact, languageWorkflows, updatedAt: now });
    } else {
      await ctx.db.insert("siteSettings", {
        key: "global",
        contact,
        languageWorkflows,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      homepageSeeded: true,
      categorySlug: FIXTURE_CATEGORY_SLUG,
      familySlug: FIXTURE_FAMILY_SLUG,
      publishedProductSlug: PUBLISHED_PRODUCT_SLUG,
      missingProductSlug: MISSING_PRODUCT_SLUG,
    };
  },
});
