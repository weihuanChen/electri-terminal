# Backend Database Modeling

This folder contains the baseline relational schema for the backend data platform.

## Files
- `schema.sql`: PostgreSQL DDL for all core modules defined in project docs.

## Covered Modules
- Category hierarchy (`categories`)
- Attribute template system (`attribute_templates`, `attribute_fields`)
- Product family + SKU (`product_families`, `products`)
- Asset center (`assets`, `asset_relations`)
- Blog/knowledge (`articles`)
- Inquiry/RFQ (`inquiries`, `inquiry_items`)
- Navigation (`nav_menus`, `nav_items`)
- CSV import center (`import_jobs`, `import_job_rows`)
- Admin ownership/assignment (`users`)

## Core Relationship Rules
- Product hierarchy is enforced: `categories -> product_families -> products`.
- Product specifications are flexible via `products.attributes` JSONB, keyed by `attribute_fields.field_key`.
- Download files use polymorphic binding in `asset_relations` (category/family/product/article).
- Inquiry supports general/product/rfq, with optional multi-item RFQ rows.
- Import jobs support partial success and row-level error tracking.

## Execution
Run the schema in PostgreSQL 14+:

```bash
psql "$DATABASE_URL" -f backend/database/schema.sql
```

## Notes
- `slug` / `path` uniqueness is enforced at DB level.
- `updated_at` is auto-maintained by triggers.
- `categories.parent_id` uses `ON DELETE RESTRICT` to satisfy the “handle children before delete parent” requirement.
