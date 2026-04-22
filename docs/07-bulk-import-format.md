# 后台批量导入格式说明

本文档用于定义当前项目推荐采用的导入目标结构，供你把供应商目录、图片、CAD、证书解析成系统可导入的数据结构。

说明：

- 本文档已经按新的 4 层业务模型更新：`category -> family -> product -> variant`
- `product` 表示一个公开产品详情页实体，不再等同于最细粒度 SKU
- `variant` 表示产品页中的规格行 / SKU
- 图片资源当前不是导入阻塞项；可暂时留空，或后续在统一转成 `webp` 后补录

目标是统一以下几层数据：

1. 分类 `categories`
2. 规格定义与模板 `attributeDefinitions + attributeTemplates + attributeFields`
3. 系列 `productFamilies`
4. 产品 `products`
5. 规格变体 `productVariants`
6. 下载资源 `assets + assetRelations`

推荐目标关系是：

`categories -> attributeTemplates -> productFamilies -> products -> productVariants`

同时：

- `attributeDefinitions` 是全局规格字典
- `attributeFields` 是分类模板里的字段绑定
- `productFamilies.attributes` 存系列默认规格
- `products.attributes` 存产品页公共规格
- `productVariants.attributes` 存变体差异规格
- 视觉图片走 `mediaItems`，但当前可暂不作为导入阻塞条件
- CAD / 证书 / 数据手册走 `assets + assetRelations`

---

## 1. 推荐导入顺序

推荐按 7 步执行：

1. 导入分类 `categories`
2. 导入规格定义 `attributeDefinitions`
3. 为分类创建规格模板 `attributeTemplates + attributeFields`
4. 导入系列 `productFamilies`
5. 导入产品 `products`
6. 导入规格变体 `productVariants`
7. 导入下载资源 `assets`，再建立关联 `assetRelations`

这样做的原因是：

- Family / Product / Variant 的 `attributes` key 必须先在 `attributeDefinitions.fieldKey` 中存在
- Product 和 Variant 写入前，后台都应按所属分类模板校验属性类型
- Product 的 `categoryId` 必须和 `familyId` 对应系列的分类一致

---

## 2. 核心设计原则

### 2.1 属性值只存 value

`products.attributes` 和 `productFamilies.attributes` 只存值，不重复存 label、type、unit。

示例：

```json
{
  "d2_mm": 2.2,
  "wire_range_mm2": [0.2, 0.5],
  "material": "copper",
  "certifications": ["UL", "CE"],
  "waterproof": true
}
```

字段含义、单位、显示精度、筛选方式由 `attributeDefinitions` 决定。

### 2.2 系列写默认值，Product 写公共值，Variant 只写差异

工业品常见公共参数，例如材质、电镀、认证、外壳颜色，优先写在 `productFamilies.attributes`。

一个公开产品页下的公共参数写在 `products.attributes`。

最细规格差异只写在 `productVariants.attributes`。

示例：

```json
{
  "family.attributes": {
    "material": "copper",
    "plating": "tin"
  },
  "product.attributes": {
    "insulated": false,
    "terminal_type": "ring",
    "certifications": ["cULus"]
  },
  "productVariant.attributes": {
    "d2_mm": 2.2,
    "wire_range_mm2": [0.2, 0.5]
  }
}
```

前台最终展示值是：

`family.attributes + product.attributes + productVariant.attributes override`

### 2.3 视觉媒体和下载资源分开

- 产品图、尺寸图、包装图、应用图：写入 `mediaItems`
- CAD、证书、datasheet、manual、catalog：写入 `assets`
- `assets` 与产品/系列/分类的关系通过 `assetRelations` 建立

不要把 CAD 和证书混进图片数组。

当前阶段：

- 图片可后补，不作为主数据导入阻塞项
- 若图片尚未转成最终 `webp` 或未上传 CDN，可暂不填 `mediaItems`

---

## 3. 分类导入结构

### 3.1 目标表

`categories`

### 3.2 必填字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 分类名称 |
| `slug` | string | 分类 URL 标识，唯一 |

### 3.3 可选字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `parentId` | string | 父级分类 ID；顶级分类可为空 |
| `description` | string | 详细描述 |
| `shortDescription` | string | 简短描述 |
| `image` | string | 分类图片 URL |
| `icon` | string | 图标 URL 或标识 |
| `sortOrder` | number | 排序，默认 `0` |
| `status` | `"draft" \| "published" \| "archived"` | 状态 |
| `templateKey` | string | 模板标识，可选 |
| `seoTitle` | string | SEO 标题 |
| `seoDescription` | string | SEO 描述 |
| `canonical` | string | 规范链接 |
| `isVisibleInNav` | boolean | 是否在导航显示，默认 `true` |

### 3.4 系统自动生成字段

| 字段 | 说明 |
| --- | --- |
| `level` | 根据父子层级自动生成 |
| `path` | 根据 `slug + parentId` 自动生成 |
| `createdAt` | 自动生成 |
| `updatedAt` | 自动生成 |

### 3.5 推荐 CSV 表头

```csv
name,slug,parent_slug,description,short_description,sort_order,status,is_visible_in_nav
Terminal Blocks,terminal-blocks,,Terminal block category,Connection products,10,published,true
DIN Rail Terminal Blocks,din-rail-terminal-blocks,terminal-blocks,DIN rail terminal blocks,DIN rail series,20,published,true
```

说明：

- 导入文件里建议用 `parent_slug`，不要直接写 `parentId`
- 导入程序先把 `parent_slug` 查成 `parentId`

---

## 4. 属性定义表 `attributeDefinitions`

### 4.1 作用

这是全局规格字典。所有 `fieldKey`、字段类型、单位、前台显示精度、筛选方式都定义在这里。

### 4.2 当前支持的字段类型

| `fieldType` | 示例 |
| --- | --- |
| `string` | `model`, `thread_type` |
| `number` | `d2_mm`, `length_mm`, `voltage_v` |
| `boolean` | `insulated`, `waterproof` |
| `enum` | `material`, `plating` |
| `array` | `certifications` |
| `range` | `wire_range_mm2`, `temperature_range_c`, `awg_range` |

### 4.3 当前支持的单位预设 `unitKey`

| `unitKey` | 前台显示 |
| --- | --- |
| `mm` | `mm` |
| `mm2` | `mm²` |
| `g` | `g` |
| `kg` | `kg` |
| `v` | `V` |
| `a` | `A` |
| `c` | `°C` |
| `awg` | `AWG` |
| `nm` | `N·m` |
| `pcs` | `pcs` |

### 4.4 推荐字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `fieldKey` | string | 全局唯一 key，例如 `d2_mm` |
| `label` | string | 展示名，例如 `D2` |
| `fieldType` | string | 见上表 |
| `unitKey` | string | 单位预设 key，推荐优先使用 |
| `unit` | string | 旧字段/兜底自由文本单位，可选 |
| `options` | string[] | `enum` 可选项 |
| `groupName` | string | 分组，例如 `dimension` / `electrical` |
| `description` | string | 字段描述 |
| `displayPrecision` | number | 前台显示精度，建议 `0-6` 整数 |
| `filterMode` | `"exact" \| "range_bucket"` | 分类页筛选方式 |

### 4.5 推荐 JSON 示例

```json
[
  {
    "fieldKey": "d2_mm",
    "label": "D2",
    "fieldType": "number",
    "unitKey": "mm",
    "groupName": "dimension",
    "displayPrecision": 1,
    "filterMode": "range_bucket"
  },
  {
    "fieldKey": "wire_range_mm2",
    "label": "Wire Range",
    "fieldType": "range",
    "unitKey": "mm2",
    "groupName": "connection",
    "displayPrecision": 2,
    "filterMode": "range_bucket"
  },
  {
    "fieldKey": "material",
    "label": "Material",
    "fieldType": "enum",
    "options": ["copper", "aluminum", "brass"],
    "groupName": "material",
    "filterMode": "exact"
  },
  {
    "fieldKey": "certifications",
    "label": "Certifications",
    "fieldType": "array",
    "groupName": "compliance",
    "filterMode": "exact"
  }
]
```

### 4.6 规则

- `fieldKey` 必须全局唯一
- `enum` 类型建议提供 `options`
- `range_bucket` 只适合 `number` 和 `range`
- `displayPrecision` 只建议用于 `number` 和 `range`
- 单位优先使用 `unitKey`，不要在 value 里重复拼单位

---

## 5. 分类规格模板 `attributeTemplates + attributeFields`

### 5.1 作用

`attributeDefinitions` 解决“字段是什么”，`attributeFields` 解决“某个分类模板里哪些字段可用、是否必填、是否展示、顺序如何”。

### 5.2 目标表

- `attributeTemplates`
- `attributeFields`

### 5.3 `attributeTemplates`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 模板名称 |
| `categoryId` | string | 所属分类 |
| `description` | string | 描述 |
| `status` | `"draft" \| "published" \| "archived"` | 状态 |

### 5.4 `attributeFields`

注意：当前版本不是直接存 `fieldKey`，而是引用 `definitionId`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `templateId` | string | 所属模板 |
| `definitionId` | string | 对应 `attributeDefinitions` |
| `isRequired` | boolean | 是否必填 |
| `isFilterable` | boolean | 是否可筛选 |
| `isSearchable` | boolean | 是否可搜索 |
| `isVisibleOnFrontend` | boolean | 前台是否显示 |
| `importAlias` | string | 供应商导入别名，可写 PDF 常见列名 |
| `sortOrder` | number | 排序 |
| `helpText` | string | 后台帮助说明 |

### 5.5 推荐模板字段配置示例

```json
{
  "template": {
    "name": "DIN Rail Terminal Block Specs",
    "categorySlug": "din-rail-terminal-blocks",
    "status": "published"
  },
  "fields": [
    {
      "fieldKey": "d2_mm",
      "isRequired": false,
      "isFilterable": true,
      "isSearchable": false,
      "isVisibleOnFrontend": true,
      "importAlias": "D2",
      "sortOrder": 10
    },
    {
      "fieldKey": "wire_range_mm2",
      "isRequired": false,
      "isFilterable": true,
      "isSearchable": false,
      "isVisibleOnFrontend": true,
      "importAlias": "Conductor cross section",
      "sortOrder": 20
    },
    {
      "fieldKey": "material",
      "isRequired": false,
      "isFilterable": true,
      "isSearchable": false,
      "isVisibleOnFrontend": true,
      "importAlias": "Material",
      "sortOrder": 30
    }
  ]
}
```

导入程序需要先用 `fieldKey` 找到 `definitionId`，再创建 `attributeFields`。

---

## 6. 系列导入结构 `productFamilies`

### 6.1 目标表

`productFamilies`

### 6.2 必填字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | string | 系列名称 |
| `slug` | string | 系列 URL 标识，唯一 |
| `categoryId` | string | 所属分类 ID |

### 6.3 可选字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `brand` | string | 品牌 |
| `summary` | string | 系列摘要 |
| `content` | string | 详细内容 |
| `attributes` | object | 系列默认规格值 |
| `highlights` | string[] | 系列亮点 |
| `heroImage` | string | 旧头图字段，兼容保留 |
| `gallery` | string[] | 旧图集字段，兼容保留 |
| `mediaItems` | object[] | 新视觉媒体数组，推荐使用 |
| `status` | `"draft" \| "published" \| "archived"` | 状态 |
| `sortOrder` | number | 排序 |
| `seoTitle` | string | SEO 标题 |
| `seoDescription` | string | SEO 描述 |
| `canonical` | string | 规范链接 |

### 6.4 `attributes` 示例

```json
{
  "material": "copper",
  "plating": "tin",
  "certifications": ["UL", "CE"]
}
```

### 6.5 `mediaItems` 结构

当前支持的视觉媒体类型：

- `product`
- `dimension`
- `packaging`
- `application`

示例：

```json
[
  {
    "type": "product",
    "url": "https://cdn.example.com/families/uk-series/product-1.jpg",
    "alt": "UK series product view",
    "sortOrder": 0
  },
  {
    "type": "dimension",
    "url": "https://cdn.example.com/families/uk-series/dimension-1.jpg",
    "alt": "UK series dimension drawing",
    "sortOrder": 10
  }
]
```

### 6.6 推荐 CSV 表头

```csv
name,slug,category_slug,brand,summary,status,sort_order
UK Terminal Blocks,uk-terminal-blocks,din-rail-terminal-blocks,Electri Pro,Universal screw terminal block series,published,10
Push-in Terminal Blocks,push-in-terminal-blocks,din-rail-terminal-blocks,Electri Pro,Fast wiring product family,published,20
```

说明：

- CSV 适合导入系列主字段
- `attributes` 和 `mediaItems` 更适合单独用 JSON 文件导入

---

## 7. 产品导入结构 `products`

### 7.1 目标表

`products`

### 7.2 必填字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `productCode` | string | 产品组编码；建议唯一 |
| `model` | string | 产品型号；同系列内唯一 |
| `slug` | string | 产品 URL 标识，全局唯一 |
| `title` | string | 产品标题 |
| `familyId` | string | 所属系列 ID |
| `categoryId` | string | 所属分类 ID，必须与系列分类一致 |

### 7.3 常用可选字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `shortTitle` | string | 短标题 |
| `brand` | string | 品牌 |
| `summary` | string | 简介 |
| `content` | string | 详情内容 |
| `attributes` | `Record<string, unknown>` | 产品页公共规格对象 |
| `featureBullets` | string[] | 卖点列表 |
| `mainImage` | string | 旧主图字段，兼容保留 |
| `gallery` | string[] | 旧图集字段，兼容保留 |
| `mediaItems` | object[] | 新视觉媒体数组，推荐使用 |
| `status` | `"draft" \| "published" \| "archived"` | 状态 |
| `isFeatured` | boolean | 是否推荐 |
| `moq` | number | 最小起订量 |
| `packageInfo` | string | 包装信息 |
| `leadTime` | string | 交期 |
| `origin` | string | 产地 |
| `searchKeywords` | string[] | 搜索词 |
| `sortOrder` | number | 排序 |
| `seoTitle` | string | SEO 标题 |
| `seoDescription` | string | SEO 描述 |
| `canonical` | string | 规范链接 |

### 7.4 系统自动生成或建议自动生成字段

| 字段 | 说明 |
| --- | --- |
| `normalizedModel` | 根据 `model.toLowerCase().replace(/\s+/g, "")` 自动生成 |
| `createdAt` | 自动生成 |
| `updatedAt` | 自动生成 |

### 7.5 `attributes` 值类型规则

| `fieldType` | `attributes` 中的值结构 | 示例 |
| --- | --- | --- |
| `string` | string | `"thread_type": "M6"` |
| `number` | number | `"d2_mm": 2.2` |
| `boolean` | boolean | `"waterproof": true` |
| `enum` | string | `"material": "copper"` |
| `array` | string[] | `"certifications": ["UL", "CE"]` |
| `range` | `[number, number]` | `"wire_range_mm2": [0.2, 0.5]` |

规则：

- 不要把单位拼进 value，例如不要写 `"2.2 mm"`
- `range` 用两个 number 的数组表示
- `enum` 存 option value，不存 label
- `array` 推荐存字符串数组

### 7.6 推荐 Product JSON 结构

```json
[
  {
    "categorySlug": "din-rail-terminal-blocks",
    "familySlug": "uk-terminal-blocks",
    "productCode": "UK-SCREW-2P5",
    "model": "UK 2.5",
    "slug": "uk-2-5-terminal-block",
    "title": "UK 2.5 Terminal Block",
    "brand": "Electri Pro",
    "summary": "DIN rail terminal block for industrial wiring",
    "status": "published",
    "isFeatured": false,
    "moq": 100,
    "packageInfo": "50 pcs/box",
    "leadTime": "15 days",
    "origin": "China",
    "sortOrder": 10,
    "featureBullets": [
      "Reliable screw connection",
      "DIN rail mounting"
    ],
    "searchKeywords": [
      "terminal block",
      "uk2.5",
      "din rail"
    ],
    "attributes": {
      "thread_type": "M3",
      "waterproof": false,
      "certifications": ["UL"]
    },
    "mediaItems": [
      {
        "type": "product",
        "url": "https://cdn.example.com/products/uk2.5/product-1.webp",
        "alt": "UK 2.5 front view",
        "sortOrder": 0
      },
      {
        "type": "dimension",
        "url": "https://cdn.example.com/products/uk2.5/dimension-1.webp",
        "alt": "UK 2.5 dimension drawing",
        "sortOrder": 10
      }
    ]
  }
]
```

说明：

- 导入程序用 `categorySlug` 查 `categoryId`
- 导入程序用 `familySlug` 查 `familyId`
- Product `attributes` 只写产品页公共值，不写逐规格变化的尺寸行

---

## 8. 规格变体导入结构 `productVariants`

### 8.1 目标表

`productVariants`

### 8.2 必填字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `productSlug` | string | 所属产品 slug |
| `skuCode` | string | SKU 编码，全局唯一 |
| `itemNo` | string | 订货号 / 料号 |
| `sortOrder` | number | 表格排序 |

### 8.3 常用可选字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `shortTitle` | string | 规格简称，可选 |
| `attributes` | `Record<string, unknown>` | 规格差异值 |
| `status` | `"draft" \| "published" \| "archived"` | 状态 |
| `packageInfo` | string | 包装说明 |
| `moq` | number | 最小起订量 |
| `leadTime` | string | 交期 |
| `searchKeywords` | string[] | 搜索词，可选 |

### 8.4 `attributes` 建议内容

放这类每行不同的字段：

- 尺寸：`d2_mm`、`w_mm`、`l_mm`
- 规格：`stud_size_metric_mm`、`stud_size_american`
- 导线范围：`wire_range_mm2`、`awg_range`
- 电气参数：`max_current_a`
- 包装参数：`pcs_per_pack`

不要放这类聚合信息：

- `variant_count`
- `item_nos`
- `*_options`
- 页面来源说明

### 8.5 推荐 Variant JSON 结构

```json
[
  {
    "productSlug": "non-insulated-ring-terminals-rnb0-5-2-to-rnb1-25-8l",
    "skuCode": "RNB0.5-2",
    "itemNo": "RNB0.5-2",
    "sortOrder": 10,
    "status": "published",
    "attributes": {
      "stud_size_metric_mm": 2,
      "stud_size_american": "#2",
      "wire_range_mm2": [0.2, 0.5],
      "awg_range": [22, 26],
      "max_current_a": 9,
      "thread_type": "M3",
      "d2_mm": 2.2
    }
  }
]
```

说明：

- 导入程序用 `productSlug` 查 `productId`
- Variant 不应生成独立 SEO 落地页
- Variant 用于产品页规格表、筛选、询盘和报价

---

## 9. 下载资源导入结构 `assets + assetRelations`

### 8.1 适用资源类型

当前支持：

- `catalog`
- `datasheet`
- `certificate`
- `cad`
- `manual`

### 8.2 `assets` 建议字段

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `title` | string | 资源标题 |
| `type` | string | 见上表 |
| `fileUrl` | string | 文件 URL |
| `previewImage` | string | 预览图，可选 |
| `language` | string | 语言，可选 |
| `version` | string | 版本，可选 |
| `fileSize` | number | 文件大小，可选 |
| `mimeType` | string | MIME 类型，可选 |
| `isPublic` | boolean | 是否公开 |
| `requireLeadForm` | boolean | 是否需留资后下载 |

### 8.3 `assetRelations`

用于把资源关联到分类、系列或产品。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `assetId` | string | 资源 ID |
| `entityType` | `"category" \| "family" \| "product" \| "article"` | 关联实体类型 |
| `entityId` | string | 实体 ID |
| `sortOrder` | number | 排序 |

### 8.4 资源导入示例

```json
{
  "asset": {
    "title": "UK 2.5 CAD Drawing",
    "type": "cad",
    "fileUrl": "https://cdn.example.com/assets/uk2-5.step",
    "previewImage": "https://cdn.example.com/assets/uk2-5-preview.jpg",
    "isPublic": true,
    "requireLeadForm": false
  },
  "relations": [
    {
      "entityType": "product",
      "entitySlug": "uk-2-5",
      "sortOrder": 10
    }
  ]
}
```

---

## 10. 供应商 PDF / 图片解析的推荐中间层

不要从 PDF 或图片识别结果一步生成最终入库 JSON。

推荐先落一份中间标准表，再由中间表生成最终导入结构。

### 10.1 规格中间表

```csv
supplier_name,source_file,source_page,category_slug,family_slug,product_slug,sku_code,model,title,raw_field_name,raw_field_value
Supplier A,catalog-2026.pdf,12,ring-terminals,heat-shrink-ring-terminals,non-insulated-ring-terminals-rnb0-5-2-to-rnb1-25-8l,RNB0.5-2,RNB0.5-2,Non-Insulated Ring Terminals,D2,2.2
Supplier A,catalog-2026.pdf,12,ring-terminals,heat-shrink-ring-terminals,non-insulated-ring-terminals-rnb0-5-2-to-rnb1-25-8l,RNB0.5-2,RNB0.5-2,Non-Insulated Ring Terminals,Wire Range,0.2-0.5 mm2
Supplier A,catalog-2026.pdf,12,ring-terminals,heat-shrink-ring-terminals,non-insulated-ring-terminals-rnb0-5-2-to-rnb1-25-8l,RNB0.5-2,RNB0.5-2,Non-Insulated Ring Terminals,Material,Copper
```

好处：

- 便于人工校对 OCR / PDF 抽取结果
- 便于不同供应商字段统一到 `fieldKey`
- 能追踪来源文件和页码

### 10.2 图片中间表

```csv
supplier_name,source_file,source_page,entity_type,entity_slug,media_role,file_url,alt_text,sort_order
Supplier A,catalog-2026.pdf,12,product,non-insulated-ring-terminals-rnb0-5-2-to-rnb1-25-8l,product,https://cdn.example.com/products/non-insulated-ring-terminals/front.webp,Front view,0
Supplier A,catalog-2026.pdf,13,family,heat-shrink-ring-terminals,dimension,https://cdn.example.com/families/heat-shrink-ring-terminals/dimension.webp,Series drawing,10
```

`media_role` 映射关系：

| 中间层类型 | 最终 `mediaItems.type` |
| --- | --- |
| `product` | `product` |
| `dimension` | `dimension` |
| `packaging` | `packaging` |
| `application` | `application` |

### 10.3 文件资源中间表

```csv
supplier_name,source_file,entity_type,entity_slug,asset_type,title,file_url,preview_image,language,version
Supplier A,page-009.zip,product,non-insulated-ring-terminals-rnb0-5-2-to-rnb1-25-8l,cad,Product CAD Drawing,https://cdn.example.com/assets/page-009.step,https://cdn.example.com/assets/page-009-preview.jpg,en,v1
Supplier A,certificates.pdf,family,heat-shrink-ring-terminals,certificate,UL Certificate,https://cdn.example.com/assets/ul-cert.pdf,,en,
```

`asset_type` 映射到 `assets.type`。

---

## 11. PDF 字段到系统字段的映射规则

建议维护一张规格映射表，而不是在脚本里硬编码。

### 10.1 主字段映射

| PDF 字段名 | 目标字段 | 目标位置 | 转换规则 |
| --- | --- | --- | --- |
| `Family` | `familySlug` | 导入中间层字段 | 查系列 |
| `Product Group` | `productSlug` | 导入中间层字段 | 查产品 |
| `Model` | `model` | `productVariants.itemNo` / `products.model` | 按语义落位 |
| `Order No.` | `skuCode` | `productVariants.skuCode` | 去空格 |
| `Product Name` | `title` | `products.title` | 原样保留 |
| `Series` | `familySlug` | 导入中间层字段 | 查系列 |
| `Category` | `categorySlug` | 导入中间层字段 | 查分类 |
| `MOQ` | `moq` | `productVariants.moq` | 转 number |
| `Packing` | `packageInfo` | `productVariants.packageInfo` | 原样保留 |

### 10.2 规格字段映射

| PDF 字段名 | `fieldKey` | `fieldType` | 示例目标值 |
| --- | --- | --- | --- |
| `D2` | `d2_mm` | `number` | `2.2` |
| `Wire Range` | `wire_range_mm2` | `range` | `[0.2, 0.5]` |
| `AWG` | `awg_range` | `range` | `[22, 26]` |
| `Material` | `material` | `enum` | `"copper"` |
| `Plating` | `plating` | `enum` | `"tin"` |
| `Thread Type` | `thread_type` | `string` | `"M3"` |
| `Insulated` | `insulated` | `boolean` | `false` |
| `Certifications` | `certifications` | `array` | `["UL", "CE"]` |

### 10.3 前端显示效果参考

因为系统会读取 `unitKey` 和 `displayPrecision`，所以以下 value 会自动显示成：

| 存储值 | 定义 | 前台显示 |
| --- | --- | --- |
| `2.2` | `fieldType=number`, `unitKey=mm` | `2.2 mm` |
| `[0.2, 0.5]` | `fieldType=range`, `unitKey=mm2` | `0.2-0.5 mm²` |
| `[22, 26]` | `fieldType=range`, `unitKey=awg` | `22-26 AWG` |

---

## 12. 导入文件格式建议

推荐拆成 7 份：

1. `categories.csv`
2. `attribute-definitions.json`
3. `attribute-templates.json`
4. `families.json`
5. `products.json`
6. `product-variants.json`
7. `assets.json`

原因：

- 分类结构简单，适合 CSV
- 规格定义和模板是嵌套结构，更适合 JSON
- Family / Product / Variant 有嵌套字段，JSON 更稳
- 资源文件关联通常是多对多，也更适合 JSON

---

## 13. 导入校验清单

### 分类

- `slug` 是否重复
- `parent_slug` 是否存在
- 是否有循环父子关系

### 属性定义

- `fieldKey` 是否重复
- `fieldType` 是否是受支持类型
- `enum` 类型是否提供合理 `options`
- `unitKey` 是否在预设列表中
- `displayPrecision` 是否为 `0-6` 的整数
- `range_bucket` 是否只用于 `number/range`

### 模板

- `categorySlug` 是否存在
- `fieldKey` 是否已在 `attributeDefinitions` 中定义
- 同一模板内字段是否重复

### 系列

- `slug` 是否重复
- `categorySlug` 是否存在
- `attributes` key 是否都在该分类模板中
- `attributes` value 类型是否匹配 definition

### Product

- `productCode` 是否重复
- `slug` 是否重复
- 同一 `familySlug` 下 `model` 是否重复
- `familySlug` 是否存在
- `categorySlug` 是否与系列分类一致
- `attributes` 中是否存在未定义 `fieldKey`
- `range` 是否是 `[number, number]`

### Variant

- `productSlug` 是否存在
- `skuCode` 是否重复
- `itemNo` 是否为空
- `attributes` 中是否存在未定义 `fieldKey`
- `attributes` 是否只写差异值
- `range` 是否是 `[number, number]`

### 媒体和资源

- `mediaItems.type` 是否为支持的视觉类型
- 图片 URL 若已录入，是否可访问
- `assets.type` 是否为支持的资源类型
- 资源关联的 `entitySlug` 是否存在

---

## 14. 当前最适合你的落地方案

结合你接下来要做的“用供应商图片和目录解析出数据层级格式并导入”，建议这样执行：

1. 先定分类、系列、产品 slug
2. 先建立一套工业品常用 `attributeDefinitions`
3. 给每个分类配置模板字段和 `importAlias`
4. 先整理 `families.json` 和 `products.json`
5. 再把逐规格行拆成 `product-variants.json`
6. 把供应商 PDF / 表格抽成规格中间表
7. 把供应商图片抽成媒体中间表，标注 `product/dimension/packaging/application`
8. 把 CAD / 证书 / 数据手册抽成资源中间表
7. 生成 `families.json` 和 `products.json`
8. 先导入 1 个分类、1 个系列、3-5 个 SKU 做样本验证
9. 确认前台规格、单位、筛选、媒体显示都正确，再全量导入

一句话原则：

- 规格定义进 `attributeDefinitions`
- 分类可用字段进 `attributeFields`
- 系列默认值进 `productFamilies.attributes`
- SKU 差异值进 `products.attributes`
- 展示图片进 `mediaItems`
- CAD / 证书进 `assets + assetRelations`
