# Convex Schema Notes

Core files:
- `convex/schema.ts`
- `convex/lib/validators.ts`
- `convex/queries/common.ts`
- `convex/queries/modules/*.ts`
- `convex/mutations/admin.ts`
- `convex/mutations/admin/*.ts`
- `convex/admin/index.ts`

## Aggregation Entry Points
- `convex/mutations/admin.ts` -> re-exports `convex/mutations/admin/index.ts`
- `convex/queries/common.ts` -> re-exports `convex/queries/modules/index.ts`
- `convex/admin/index.ts` -> unified export surface:
  - `adminMutations.<module>.<fn>`
  - `adminQueries.<module>.<fn>`

## What This Includes
- Full backend module mapping from product docs:
  - categories, attribute templates/fields, families, SKUs
  - assets + polymorphic asset relations
  - articles
  - inquiries + inquiry items
  - navigation menus/items
  - import jobs + import job rows
  - users

## Important Constraint Differences vs SQL
Convex does not provide native SQL-style constraints (UNIQUE / CHECK / FK cascade). These rules must be enforced in mutations and internal actions.

Enforce in code:
- unique slugs/paths (`categories.slug`, `categories.path`, `productFamilies.slug`, `products.slug`, `articles.slug`)
- unique SKU (`products.skuCode`)
- unique `(familyId, model)`
- unique menu location (`navMenus.location`)
- unique import row per job (`importJobRows.jobId + rowNumber`)
- quantity > 0 for RFQ items
- category tree consistency (`level`, `path`, parent-child update behavior)

## Suggested Next Step
Create typed mutation helpers:
- `assertUniqueByIndex(...)`
- `assertCategoryHierarchy(...)`
- `touchUpdatedAt(...)`
- `validateImportCounters(...)`
