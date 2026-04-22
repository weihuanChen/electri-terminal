# Final Import Primary Playbook v3

## Goal

This document records the production pipeline used to build the current primary import package:

- `23` families
- `58` products
- `2588` product variants

Primary output:

- [output/v3/final_import_primary](/Users/yinglian/webproject/python/b2b-products-model/output/v3/final_import_primary)

This playbook is intended for the next SKU parsing cycle, so the same workflow can be reused with new source data.

## Final Data Model

The final import structure is:

1. `families`
2. `products`
3. `product-variants`

Rules:

- SEO pages live at the `products` layer.
- SKU/spec rows live at the `product-variants` layer.
- Common page-level information goes into `products.attributes`.
- Variant differences go into `product-variants.attributes`.
- Aggregation stats and extraction helper fields do not go into formal attributes.
- Source catalog pages are no longer the formal product identity.
- `productKey` is the stable internal product identity used by the import package.
- `productCode` is the import-facing product code and should stay unique.
- `slug` is the public route identity.
- `seriesCode` is the series/type code used for compatibility with the current app schema, but should not replace `productKey` as the primary join key.

## Identity Model

The current primary package is intentionally compressed from page-level source records into product-type records.

This means:

- one public product can absorb multiple supplier pages when those pages describe the same product type
- source `page-xxx` is now a traceability input, not the formal product key
- the number of products is therefore lower than the number of source pages
- uniqueness is enforced at the product-type layer, not the page layer

Practical rules:

- importers should match products by `productKey` first
- admin/database `skuCode` should be populated from `productCode`
- public product pages should resolve by `slug`
- `seriesCode` can be stored in legacy `model` fields where the app schema still requires one
- frontend lists, caches, and dedupe logic must not use source page ids as product identity

## Core Inputs

Main source inputs used in v3:

- [docs/origin-sku-docs.md](/Users/yinglian/webproject/python/b2b-products-model/docs/origin-sku-docs.md)
- [output/v2/family_extract_combined.json](/Users/yinglian/webproject/python/b2b-products-model/output/v2/family_extract_combined.json)
- page-level cropped assets under `output/page-xxx/assets/`
- page-level final product matching under [output/v3/page_origin_doc_products.final.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/page_origin_doc_products.final.json)

## Pipeline Overview

### 1. Region Cropping

Purpose:

- isolate `family_info`
- isolate `product_photo`
- isolate `spec_table`

Reference config:

- [config/single_product_profile.yaml](/Users/yinglian/webproject/python/b2b-products-model/config/single_product_profile.yaml)

Key result:

- stable cropped page assets under `output/page-xxx/assets/`

### 2. Family Extraction

Purpose:

- extract page-level family information from `family_info.png`
- normalize Chinese-only content into English

Key scripts:

- [scripts/extract_family_info_gemini.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/extract_family_info_gemini.py)
- [scripts/classify_family_extracts_gemini.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/classify_family_extracts_gemini.py)

Key outputs:

- [output/v2/family_extract_combined.json](/Users/yinglian/webproject/python/b2b-products-model/output/v2/family_extract_combined.json)
- [output/v2/family_classification.json](/Users/yinglian/webproject/python/b2b-products-model/output/v2/family_classification.json)

### 3. Slug and Taxonomy Planning

Purpose:

- define stable subcategory and family naming
- separate internal keys from public slugs
- merge overly fine-grained families into user-facing groups

Key outputs:

- [output/v3/terminal_slug_plan.extended.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/terminal_slug_plan.extended.json)
- [output/v3/terminal_taxonomy.merged.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/terminal_taxonomy.merged.json)
- [output/v3/terminal_family_merge_plan.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/terminal_family_merge_plan.json)

Current merged strategy:

- taxonomy can hold more candidate families
- active import is intentionally compressed into fewer public-facing families
- current primary package uses `23` active families
- current primary package also compresses page-level source rows into `58` canonical products

### 4. Parse Markdown Source Blocks

Purpose:

- parse the original markdown-exported document instead of relying on OCR as the primary spec source
- group repeated family sections
- normalize HTML tables with `rowspan` / `colspan`

Key scripts:

- [scripts/build_origin_sku_family_blocks.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/build_origin_sku_family_blocks.py)
- [scripts/normalize_origin_sku_tables.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/normalize_origin_sku_tables.py)
- [scripts/build_origin_sku_variants.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/build_origin_sku_variants.py)

Key outputs:

- [output/v3/origin_sku_family_blocks.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/origin_sku_family_blocks.json)
- [output/v3/origin_sku_tables.normalized.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/origin_sku_tables.normalized.json)
- [output/v3/origin_sku_family_variants.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/origin_sku_family_variants.json)

### 5. Match Page to Source Product Group

Purpose:

- map each scanned page to the correct markdown product group
- use `ITEM NO` signatures to disambiguate repeated family names
- preserve source-page provenance before final product-type compression

Key scripts:

- [scripts/extract_spec_item_nos_gemini.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/extract_spec_item_nos_gemini.py)
- [scripts/match_pages_to_doc_groups.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/match_pages_to_doc_groups.py)

Key outputs:

- [output/v3/spec_item_nos_combined.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/spec_item_nos_combined.json)
- [output/v3/page_to_doc_group_matches.final.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/page_to_doc_group_matches.final.json)
- [output/v3/page_origin_doc_products.final.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/page_origin_doc_products.final.json)

Important lesson:

- title matching alone is not enough
- `ITEM NO` range or list is the most practical uniqueness signal
- final public products should not be keyed by source page once grouping is complete

### 6. Materialize Assets

Purpose:

- download family/group source images
- materialize page-level local assets
- convert them to production-ready `webp`
- upload to Cloudflare R2 and replace local media paths with public URLs

Key scripts:

- [scripts/download_family_group_assets_v3.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/download_family_group_assets_v3.py)
- [scripts/materialize_page_assets_v3.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/materialize_page_assets_v3.py)
- [scripts/build_page_webp_assets.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/build_page_webp_assets.py)
- [scripts/upload_webp_assets_to_r2.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/upload_webp_assets_to_r2.py)
- [scripts/backfill_public_media_urls.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/backfill_public_media_urls.py)

Key outputs:

- [output/v3/page_origin_doc_assets.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/page_origin_doc_assets.json)
- [output/v3/page_webp_assets.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/page_webp_assets.json)
- [output/v3/page_webp_assets.r2_upload.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/page_webp_assets.r2_upload.json)

Current asset hosting:

- public domain: `assets.electriterminal.com`
- bucket: `electri-pro`
- prefix: `products/v3/webp`

Naming rule:

- `{plating}-{material}-{family-singular}-{model-or-group}`
- CAD drawings append `-cad`
- collisions are resolved automatically by adding the shortest unique suffix, and page code if still needed

### 7. Build Final Import Package

Purpose:

- transform page-matched source products into canonical product-type import format
- keep SEO at product level
- keep specs at product-variant level

Key script:

- [scripts/build_page_variant_import.py](/Users/yinglian/webproject/python/b2b-products-model/scripts/build_page_variant_import.py)

Important related config:

- [config/product_attribute_rollbacks.json](/Users/yinglian/webproject/python/b2b-products-model/config/product_attribute_rollbacks.json)

Current formal output:

- [output/v3/final_import_primary](/Users/yinglian/webproject/python/b2b-products-model/output/v3/final_import_primary)

Files:

- `categories.json`
- `attribute-definitions.json`
- `attribute-templates.json`
- `families.json`
- `products.json`
- `product-variants.json`
- `summary.json`

Current package notes:

- `products.json` now uses `productKey`, `productCode`, and `seriesCode`
- `families.json` uses `coverMediaItems` for family-level visuals
- `products.json` keeps `mediaItems` at the product layer
- `product-variants.json` no longer embeds source-page identity in formal variant keys

## Attribute Rules

### Products

Allowed:

- family-level or product-group-level common properties
- public product-group title and merged media
- stable product identity
- `productKey` / `productCode` / `slug` identity fields

Not allowed:

- extraction diagnostics
- row counts
- helper signatures
- speculative aggregate attributes

### Product Variants

Allowed:

- all row-level spec differences
- SKU/item model data
- dimensions
- wire range
- pack quantity
- explanation

## Translation Rules

Explanation fields were normalized by unique-value mapping instead of per-row LLM translation.

Key output:

- [output/v3/explanation_translation_map.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/explanation_translation_map.json)

Recommendation for future runs:

- always deduplicate explanation values first
- normalize the small unique set
- backfill the full dataset afterward

## Review and Override Strategy

Use explicit override files instead of editing final JSON by hand.

Examples:

- [config/product_attribute_rollbacks.json](/Users/yinglian/webproject/python/b2b-products-model/config/product_attribute_rollbacks.json)

Recommended future override files:

- manual page-to-group remaps
- family alias overrides
- media naming overrides
- product-group attribute rollback overrides driven by source pages

## Migration Notes

Downstream app code must align with the current data model:

- full imports should read `productCode` / `productKey` instead of assuming `page-xxx`
- patch imports should target canonical products, not source pages
- frontend product cards and family listings should prefer `title` and `slug`
- structured data should prefer `skuCode` over legacy `model` labels when exposing public identifiers

## Recommended Reuse Order For New SKU Batches

When a new SKU batch arrives, reuse the workflow in this order:

1. update cropped page assets if page layout changed
2. rerun family extraction on `family_info`
3. refresh slug/taxonomy only if truly needed
4. refresh origin markdown parsing if the source doc changed
5. rerun `ITEM NO` extraction from `spec_table`
6. rerun page-to-doc matching
7. materialize local page assets
8. rebuild `webp` assets
9. upload to R2
10. backfill public media URLs
11. rebuild `final_import_primary`
12. do final manual review only on flagged exceptions

## Current Final Delivery

Main import package:

- [output/v3/final_import_primary](/Users/yinglian/webproject/python/b2b-products-model/output/v3/final_import_primary)

Main asset mapping:

- [output/v3/page_webp_assets.r2_upload.json](/Users/yinglian/webproject/python/b2b-products-model/output/v3/page_webp_assets.r2_upload.json)

Primary package summary:

- `23` families
- `93` products
- `3284` product variants

## Notes

This v3 pipeline is now source-document-first, not OCR-first.

OCR and Gemini are still useful, but mainly for:

- family block extraction
- `ITEM NO` extraction from spec tables
- ambiguity resolution

The authoritative spec values should continue to come from the parsed markdown source whenever that source is available and complete.
