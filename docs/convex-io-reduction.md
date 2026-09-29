# Convex public-read I/O reduction

The public blog list reads `articleCards` instead of article bodies. Related
articles rank a bounded pool of recent cards. Article detail pages load at most
six linked products, matching what the UI displays. Category, article, blog,
related-series, and sitemap reads use a Next.js data cache with a short TTL.

Catalog sitemap and related-series queries use `sitemapCards` after a one-time
backfill. The cards store only the fields those queries need. Catalog create,
update, delete, bulk-update, and seed mutations keep cards synchronized in the
same transaction as the source records. Before backfill completes, both queries
continue using their original tables.

## Rollout

1. Deploy the Convex schema and functions, then deploy the Next.js app.
2. Run `pnpm backfill:sitemap-cards --prod` from a checkout configured for the
   production Convex project. For another deployment, pass
   `--deployment <name>` instead.
3. The script resumes each table through Convex pagination and enables card
   reads only after categories, families, and products have all completed. A
   failed run can be restarted from the beginning; upserts are idempotent.
4. If `articleCards` have not been backfilled in that deployment, run the
   existing `mutations/admin/articles:backfillArticleDerivedData` mutation.
5. Compare per-function database bytes read and invocation counts in Convex
   after rollout. Check `listSitemapContent`, `getRelatedSeriesForFamily`,
   `listRelatedArticlesBySlug`, `listArticles`, and `getCategoryWithChildren`.

The Next.js cache can serve content for up to five minutes after an admin edit
for blog, category, and related-series pages; sitemap data is cached for one
hour. Related-article ranking considers the newest 64 cards of the same type
plus 32 newest cards overall, so an older highly related article may no longer
appear in the three suggestions.
