-- B2B Industrial Product Website: Database Schema (PostgreSQL)
-- Derived from docs/01-product-prd.md, docs/03-data-model.md,
-- docs/ai-system-prompt.md, and docs/AI Backend System Prompt-codex.md.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------- Enums ----------
CREATE TYPE status_common AS ENUM ('draft', 'published', 'archived');
CREATE TYPE attribute_field_type AS ENUM (
  'text',
  'number',
  'boolean',
  'enum_single',
  'enum_multi',
  'range',
  'rich_text'
);
CREATE TYPE asset_type AS ENUM ('catalog', 'datasheet', 'certificate', 'cad', 'manual');
CREATE TYPE article_type AS ENUM ('blog', 'guide', 'faq', 'application');
CREATE TYPE inquiry_type AS ENUM ('general', 'product', 'rfq');
CREATE TYPE inquiry_status AS ENUM ('new', 'in_progress', 'resolved', 'closed', 'spam');
CREATE TYPE nav_item_type AS ENUM ('category', 'article', 'page', 'custom_url');
CREATE TYPE import_job_type AS ENUM ('product_csv', 'family_csv', 'category_csv');
CREATE TYPE import_status AS ENUM ('pending', 'running', 'completed', 'failed', 'partial_success');
CREATE TYPE relation_entity_type AS ENUM ('category', 'family', 'product', 'article');

-- ---------- Utility ----------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------- Users (for ownership/assignment) ----------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  status status_common NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- 1) Categories ----------
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
  level SMALLINT NOT NULL DEFAULT 0 CHECK (level >= 0),
  path TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  image TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  status status_common NOT NULL DEFAULT 'draft',
  template_key TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical TEXT,
  is_visible_in_nav BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_status_sort ON categories(status, sort_order);

-- ---------- 2) Attribute Templates ----------
CREATE TABLE attribute_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  status status_common NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (category_id, name)
);
CREATE INDEX idx_attribute_templates_category_id ON attribute_templates(category_id);

-- ---------- 3) Attribute Fields ----------
CREATE TABLE attribute_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES attribute_templates(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type attribute_field_type NOT NULL,
  unit TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  is_filterable BOOLEAN NOT NULL DEFAULT FALSE,
  is_searchable BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible_on_frontend BOOLEAN NOT NULL DEFAULT TRUE,
  import_alias TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  group_name TEXT,
  help_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, field_key)
);
CREATE INDEX idx_attribute_fields_template_id ON attribute_fields(template_id);

-- ---------- 4) Product Families ----------
CREATE TABLE product_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand TEXT,
  summary TEXT,
  content TEXT,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  status status_common NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  canonical TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_product_families_category_id ON product_families(category_id);
CREATE INDEX idx_product_families_status_sort ON product_families(status, sort_order);

-- ---------- 5) Products (SKUs) ----------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  normalized_model TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_title TEXT,
  family_id UUID NOT NULL REFERENCES product_families(id) ON DELETE RESTRICT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand TEXT,
  summary TEXT,
  content TEXT,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  feature_bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  main_image TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  status status_common NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  moq INT,
  package_info TEXT,
  lead_time TEXT,
  origin TEXT,
  search_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  canonical TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_id, model)
);
CREATE INDEX idx_products_family_id ON products(family_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status_sort ON products(status, sort_order);
CREATE INDEX idx_products_attributes_gin ON products USING GIN (attributes);
CREATE INDEX idx_products_keywords_gin ON products USING GIN (search_keywords);

-- ---------- 6) Assets ----------
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type asset_type NOT NULL,
  file_url TEXT NOT NULL,
  preview_image TEXT,
  language TEXT,
  version TEXT,
  file_size BIGINT,
  mime_type TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  require_lead_form BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_assets_type ON assets(type);

-- ---------- 7) Asset Relations ----------
CREATE TABLE asset_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  entity_type relation_entity_type NOT NULL,
  entity_id UUID NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (asset_id, entity_type, entity_id)
);
CREATE INDEX idx_asset_relations_entity ON asset_relations(entity_type, entity_id);

-- ---------- 8) Articles ----------
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type article_type NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  cover_image TEXT,
  content TEXT,
  category_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  tag_names JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_category_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_family_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_product_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  status status_common NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  canonical TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_articles_type_status ON articles(type, status);

-- ---------- 9) Inquiries ----------
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type inquiry_type NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  country TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  source_page TEXT,
  source_type relation_entity_type,
  source_id UUID,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status inquiry_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inquiries_type_status ON inquiries(type, status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- ---------- 10) Inquiry Items ----------
CREATE TABLE inquiry_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  sku TEXT,
  quantity INT CHECK (quantity IS NULL OR quantity > 0),
  notes TEXT
);
CREATE INDEX idx_inquiry_items_inquiry_id ON inquiry_items(inquiry_id);

-- ---------- 11) Nav Menus ----------
CREATE TABLE nav_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status status_common NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (location)
);

-- ---------- 12) Nav Items ----------
CREATE TABLE nav_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES nav_menus(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES nav_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_type nav_item_type NOT NULL,
  target_id UUID,
  url TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_highlighted BOOLEAN NOT NULL DEFAULT FALSE,
  is_external BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_nav_items_menu_parent_sort ON nav_items(menu_id, parent_id, sort_order);

-- ---------- 13) Import Jobs ----------
CREATE TABLE import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type import_job_type NOT NULL,
  file_url TEXT NOT NULL,
  status import_status NOT NULL DEFAULT 'pending',
  mapping_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_rows INT NOT NULL DEFAULT 0,
  success_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  CHECK (total_rows >= 0),
  CHECK (success_rows >= 0),
  CHECK (failed_rows >= 0),
  CHECK (success_rows + failed_rows <= total_rows)
);
CREATE INDEX idx_import_jobs_status_created_at ON import_jobs(status, created_at DESC);

-- ---------- 14) Import Job Rows ----------
CREATE TABLE import_job_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
  row_number INT NOT NULL CHECK (row_number > 0),
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status import_status NOT NULL,
  error_message TEXT,
  entity_id UUID,
  UNIQUE (job_id, row_number)
);
CREATE INDEX idx_import_job_rows_job_status ON import_job_rows(job_id, status);

-- ---------- Updated-at triggers ----------
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_attribute_templates_updated_at
BEFORE UPDATE ON attribute_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_attribute_fields_updated_at
BEFORE UPDATE ON attribute_fields
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_product_families_updated_at
BEFORE UPDATE ON product_families
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_assets_updated_at
BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_inquiries_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_nav_menus_updated_at
BEFORE UPDATE ON nav_menus
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE categories IS 'Category hierarchy: Category -> Family -> SKU';
COMMENT ON COLUMN products.attributes IS 'Flexible specification JSON keyed by attribute_fields.field_key';
COMMENT ON TABLE asset_relations IS 'Polymorphic relation between assets and category/family/product/article';
COMMENT ON TABLE import_job_rows IS 'Per-row import result for partial success and error diagnostics';
