# Convex public-read I/O reduction

The public blog list reads `articleCards` instead of article bodies. Related
articles rank a bounded pool of recent cards. Article detail pages load at most
six linked products, matching what the UI displays. Category, article, blog,
related-series, and sitemap reads use a Next.js data cache with a short TTL.

Catalog sitemap and related-series queries use `sitemapCards` after a one-time
backfill. Category facets use separate product and family attribute cards.
Family SKU tables and category product grids use `productListCards`, which
store only the fields those views render. Catalog create, update, delete,
bulk-update, and seed mutations keep these cards synchronized in the same
transaction as the source records. Before backfill completes, public queries
continue using their original tables, but category and family reads already
use status indexes and stop after the requested limit.

Search reads published matches through search indexes. It no longer scans
article bodies or every catalog document to answer a query. Suggestions come
from those matches, and an empty query only reads a small set of visible
categories, families, and featured products.

## Rollout

1. Configure `CONVEX_ADMIN_KEY`, then deploy the Next.js app and Convex
   functions in that order. See `docs/convex-admin-access.md`.
2. Run `pnpm backfill:sitemap-cards --prod` from a checkout configured for the
   production Convex project. For another deployment, pass
   `--deployment <name>` instead.
3. The script resumes each table through Convex pagination and enables card
   reads only after categories, families, and products have all completed. The
   product pass also fills `productListCards`. Re-run it after deploying the
   list-card schema so family and category pages stop reading full product
   documents. A failed run can be restarted from the beginning; upserts are
   idempotent.
4. Run `pnpm backfill:article-derived-data --prod` to complete the article
   cards. Until then, the blog and sitemap page through published articles.
5. Compare per-function database bytes read and invocation counts in Convex
   after rollout. Check `searchSiteContent`, `getCategoryContent`,
   `getFamilyWithProducts`, `listSitemapContentPage`, and
   `getRelatedSeriesForFamily`.

The Next.js cache can serve content for up to five minutes after an admin edit
for blog, category, and related-series pages; sitemap data is cached for one
hour. Related-article ranking considers the newest 64 cards of the same type
plus 32 newest cards overall, so an older highly related article may no longer
appear in the three suggestions.
