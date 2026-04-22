# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Electri Pro is a Next.js 16 application for showcasing electrical products with a hierarchical structure: Categories → Product Families → Products. It uses Convex for backend/database, Convex Auth for admin authentication, and React 19 with TypeScript and Tailwind CSS.

## Development Commands

### Start Development Environment
```bash
./start-dev.sh
```
This script:
1. Cleans up old Convex and Next.js build files
2. Starts Convex development server (uploads functions to Convex cloud)
3. Starts Next.js development server on http://localhost:3000

After running, access:
- Frontend: http://localhost:3000
- Convex Dashboard: https://glad-deer-519.convex.cloud
- Admin panel: http://localhost:3000/admin (credentials: admin@admin.com / admin)

### Individual Commands
```bash
# Start Convex backend (must run before/alongside Next.js)
npx convex dev

# Start Next.js frontend
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Lint code
pnpm lint
```

### Convex Commands
```bash
# Initialize Convex (first time setup)
npx convex dev

# View database in dashboard
npx convex dashboard

# Deploy to production
npx convex deploy
```

## Architecture

### Backend (Convex)
Convex functions are organized in `convex/`:

- **Schema** (`convex/schema.ts`): Defines all database tables with indexes and search indexes
  - Core entities: users, categories, productFamilies, products, articles
  - Attribute system: attributeTemplates, attributeFields (flexible product specifications)
  - Asset management: assets, assetRelations (polymorphic relations to products/families/articles)
  - Navigation: navMenus, navItems (hierarchical menu structure)
  - Import system: importJobs, importJobRows (CSV import with error tracking)
  - Lead management: inquiries, inquiryItems (supports general/product/RFQ inquiry types)

- **Admin Mutations** (`convex/mutations/admin/`): CRUD operations for admin panel
  - Split by domain: `categories.ts`, `products.ts`, `productFamilies.ts`, `articles.ts`
  - Shared utilities in `shared.ts`
  - All mutations enforce uniqueness on `slug` fields and handle category hierarchy

- **Frontend Queries** (`convex/frontend.ts`): Read-only queries for public pages
  - Category/family/product listing with filters
  - Navigation tree building
  - Article/blog queries

### Frontend (Next.js App Router)

**Public Pages** (`app/`):
- `app/page.tsx`: Homepage with hero, featured products, capabilities
- `app/categories/[slug]/page.tsx`: Category detail with families/products
- `app/families/[slug]/page.tsx`: Product family detail with SKU table
- `app/products/[slug]/page.tsx`: Individual product detail
- `app/blog/[slug]/page.tsx`: Article/blog post
- `app/rfq/page.tsx`: Request for Quote form
- `app/contact/page.tsx`: Contact/General inquiry form

**Admin Panel** (`app/admin/`):
- `app/admin/login/page.tsx`: Admin login (uses cookie-based auth from `lib/admin-auth.ts`)
- Protected routes require `requireAdmin()` which redirects unauthorized requests to login
- CRUD pages for categories, products, families, articles, inquiries
- `app/admin/import/`: CSV import system with job status tracking

**Components**:
- `components/shared/`: Reusable components (ProductCard, InquiryForm, FilterPanel, etc.)
- `components/layout/`: Header, Footer, MegaMenu, TopUtilityBar
- `components/home/`: Homepage-specific sections
- `components/providers/ConvexClientProvider.tsx`: Wraps app with Convex provider

### Data Flow

1. **Product Hierarchy**: Category (many) → ProductFamily (many) → Products (SKUs)
2. **Slug-based Routing**: All entities use unique slugs for URL routing (`/[slug]/page.tsx`)
3. **Status Management**: Most entities use `status: draft | published | archived` with `by_status_*` indexes
4. **Flexible Attributes**: Products use JSONB `attributes` field keyed by `attributeFields.field_key`

### Admin Authentication

Uses custom cookie-based auth (not Convex Auth):
- Credentials from env: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Session cookie: HMAC-signed token with 12-hour expiration
- `lib/admin-auth.ts`: `validateAdminCredentials()`, `setAdminSession()`, `requireAdmin()`
- All admin routes should call `requireAdmin()` to protect access

### Environment Variables

Required in `.env.local`:
```
CONVEX_DEPLOYMENT=dev:glad-deer-519
NEXT_PUBLIC_CONVEX_URL=https://glad-deer-519.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://glad-deer-519.convex.site
ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=admin
```

## Key Implementation Details

### Category Hierarchy
Categories support nested structure via `parentId` → `categories._id` relation. The `path` field stores full breadcrumb (e.g., "/products/terminals"). Use `by_parentId` index for tree queries.

### Product Attributes
Products have flexible specifications via `attributeFields` table:
1. Define `attributeTemplate` per category
2. Add `attributeFields` with field types: text, number, boolean, enum_single, enum_multi, range, rich_text
3. Store values in `products.attributes` as JSONB object keyed by `field_key`

### Navigation Menus
Navigation is hierarchical via `navItems.parentId`. Query items with `by_menu_parent_sort` index and build tree client-side. Supports linking to categories, articles, pages, or custom URLs.

### Import System
CSV import jobs track row-level success/failure:
1. Create `importJob` with file URL and mapping config
2. Create `importJobRows` for each CSV row
3. Update row status individually (pending/running/completed/failed)
4. Job status aggregates from row results

### Image Handling
Images stored as URLs (Unsplash in development). Update `next.config.ts` `images.remotePatterns` to add new domains.

## Database Schema Reference

PostgreSQL schema available in `backend/database/schema.sql` for reference, but app uses Convex. Tables and relationships are equivalent between both representations.

## Common Patterns

### Creating a New Entity Type
1. Add table definition to `convex/schema.ts` with indexes
2. Create admin mutations in `convex/mutations/admin/[entity].ts`
3. Create admin pages in `app/admin/[entity]/`
4. Add frontend queries to `convex/frontend.ts` if public access needed
5. Create public page in `app/[entity]/[slug]/page.tsx` if applicable

### Adding New Admin Route
1. Create page under `app/admin/[feature]/`
2. Add `await requireAdmin()` at top of server component
3. Use Convex mutations from `convex/mutations/admin/` for data operations
4. Wrap forms in client components with proper validation (Zod)

### Slug Uniqueness
All entities with `slug` fields must enforce uniqueness in mutations. Check existing `slug` via `by_slug` index before insert/update.
