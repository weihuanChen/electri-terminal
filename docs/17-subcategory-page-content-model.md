# SubCategory Page Content Model

本文档定义 `subCategory` 页面（当前由 `categories` 的子级承载）的内容模型与页面职责，用于把“聚合页”升级为“SEO 承接 + family 导流”页面。

适用范围：

- `/categories/[slug]` 中 `level > 0` 的页面
- `categories.pageConfig`（后续拟新增）
- `lib/categoryPage.ts`
- `app/categories/[slug]/CategoryPageClient.tsx`
- `app/admin/components/CategoryForm.tsx`

## 1. 背景与目标

当前状态：

- family 页已承担主要流量承接任务
- subCategory 页仍以“聚合 + 按钮”为主
- 页面缺少明确 SEO 语义与内容分层

升级目标：

1. 承接更泛但清晰的关键词搜索意图
2. 在 subCategory 内完成类型解释与选型引导
3. 将流量稳定导向高转化 family 页面

一句话定位：

`SubCategory = 关键词锚点页 + 类型解释页 + Family 导流页`

## 2. 与 Family 的职责差异

family 页面更偏“产品系列级”表达：

- 讲产品设计与系列能力
- 展示 SKU 与系列技术细节
- 承接深层转化（RFQ / Contact）

subCategory 页面更偏“分类级”表达：

- 讲该类型是什么、为何存在、与邻近类型差异
- 讲该类型内部差异（types）
- 把用户导入最相关的 family（`featuredFamilies`）

## 3. 目标数据结构

```json
{
  "summary": "",
  "heroIntro": "",
  "overview": {
    "intro": "",
    "keyPoints": []
  },
  "typesOverview": [
    {
      "name": "",
      "description": "",
      "link": ""
    }
  ],
  "applications": {
    "intro": "",
    "items": []
  },
  "selectionGuide": {
    "intro": "",
    "steps": []
  },
  "featuredFamilies": [
    {
      "name": "",
      "description": "",
      "image": "",
      "link": ""
    }
  ],
  "faq": [
    {
      "question": "",
      "answer": ""
    }
  ],
  "seo": {
    "metaTitle": "",
    "metaDescription": ""
  }
}
```

建议落位为（与现有架构一致）：

- `categories.pageConfig.content.summary`
- `categories.pageConfig.content.heroIntro`
- `categories.pageConfig.content.overview`
- `categories.pageConfig.content.typesOverview`
- `categories.pageConfig.content.applications`
- `categories.pageConfig.content.selectionGuide`
- `categories.pageConfig.content.featuredFamilies`
- `categories.pageConfig.seoBoost.embeddedFaqItems`
- `categories.pageConfig.seo.metaTitle/metaDescription`

## 4. 字段设计说明

### 4.1 summary（核心关键词锚点）

用途：

- 承接更泛关键词，而非 family 级长尾词
- 作为首屏与 metadata 的候选 fallback

示例关键词：

- `insulated ring terminals`
- `copper ring terminals`

要求：

- 泛但清晰，不堆词
- 建议 1 到 2 句，覆盖主意图

### 4.2 heroIntro（首页风格延续）

用途：

- 承接 hero 区介绍
- 保持与首页/主站内容语气一致

要求：

- 分类级描述，不写成 family 级卖点
- 建议 1 段

### 4.3 overview（比 family 更概括）

用途：

- 定义该 subCategory
- 解释存在原因
- 说明与其他类型区别

建议结构：

- `overview.intro`：1 段摘要
- `overview.keyPoints`：3 到 6 条要点

### 4.4 typesOverview（内部差异解释）

用途：

- 解释 subCategory 内部类型差异
- 承接“X vs Y”类搜索意图

示例：

```json
[
  {
    "name": "PVC Insulated",
    "description": "Standard insulation for general wiring"
  },
  {
    "name": "Nylon Insulated",
    "description": "Higher temperature resistance"
  }
]
```

### 4.5 applications

用途：

- 明确应用场景，减少抽象描述

建议结构：

- `applications.intro`：场景说明
- `applications.items`：4 到 8 条场景列表

### 4.6 selectionGuide

用途：

- 指导用户如何从 subCategory 进入合适 family

建议结构：

- `selectionGuide.intro`：说明判断维度
- `selectionGuide.steps`：3 到 6 步

### 4.7 featuredFamilies（最关键字段）

用途：

- 把 subCategory 流量导入 family 页面
- 构建“分类词 -> 系列词 -> SKU词”内容漏斗

示例：

```json
{
  "name": "RV Series",
  "description": "Standard insulated ring terminals",
  "link": "/ring-terminals/rv-series"
}
```

设计建议：

- 优先使用已发布 family
- 每个 subCategory 配置 3 到 8 个 family
- 排序依据：相关性 > 转化能力 > 内容完整度

### 4.8 faq

用途：

- 覆盖常见问题搜索意图
- 补全页面问答语义

建议：

- 优先 relation（复用现有 FAQ 内容管理）
- 缺口场景使用 embedded FAQ 补充

### 4.9 seo

用途：

- 输出可控 metadata
- 与页面正文形成“关键词一致但不重复”的关系

字段：

- `seo.metaTitle`
- `seo.metaDescription`

## 5. 页面骨架建议

subCategory 页面建议固定骨架：

1. Hero（`name + summary + heroIntro`）
2. Overview（`overview.intro + keyPoints`）
3. Types Overview（`typesOverview`）
4. Applications（`applications`）
5. Selection Guide（`selectionGuide`）
6. Featured Families（`featuredFamilies`）
7. FAQ（relation / embedded）
8. Downloads（可选）
9. Bottom CTA

说明：

- 不建议继续只展示 families/products 聚合列表
- `Featured Families` 建议在页面中段及靠近 CTA 的位置都有导流入口

## 6. 渲染与 SEO 规则（建议）

### 6.1 Metadata fallback

推荐优先级：

1. `pageConfig.seo.metaTitle/metaDescription`
2. `category.seoTitle/seoDescription`
3. `pageConfig.content.summary`
4. `category.shortDescription/description`

### 6.2 Noindex 规则

保持现有规则：

- 纯主页面可索引
- refinement 页面（view/filter 参数页）`noindex,follow`

### 6.3 Structured Data

推荐保留：

- `BreadcrumbList`
- `CollectionPage`
- `FAQPage`（有 faq 时）
- `ItemList`（featuredFamilies）

## 7. 后台录入规范（内容团队）

最低可发布门槛：

1. `summary`
2. `heroIntro`
3. `overview.intro + keyPoints`
4. `typesOverview` 至少 2 条
5. `featuredFamilies` 至少 3 条
6. `seo.metaTitle + seo.metaDescription`

质量要求：

- 每个 section 语义独立，避免内容重复
- `featuredFamilies` 文案要体现差异化，不写同质模板句
- 禁止把 family 的技术细节整段复制到 subCategory

## 8. 分阶段落地计划

### Phase 1（当前）

- 先固化文档与字段定义
- 对齐运营、SEO、开发对字段职责的共识

### Phase 2（开发改造）

- `categories` 增加 `pageConfig`
- admin category 表单支持新字段
- resolver 与前台渲染读取新结构

### Phase 3（内容迁移）

- 从旧 `shortDescription/description` 回填 `summary/heroIntro/overview`
- 自动生成首版 `featuredFamilies`（按关联 family + sort order）
- 人工审核后发布

### Phase 4（持续优化）

- 基于搜索词与转化数据迭代 `typesOverview/featuredFamilies`
- 对高价值 subCategory 增加 FAQ 与长文本补充

## 9. 示例（Ring Terminals）

```json
{
  "summary": "Insulated ring terminals and copper ring terminals for stable, vibration-resistant wire-to-stud connections.",
  "heroIntro": "Ring terminals are designed for secure screw/bolt termination in panels, automotive harnesses, and industrial control assemblies.",
  "overview": {
    "intro": "A ring terminal provides a closed-end connection that reduces accidental slip-off during vibration or maintenance.",
    "keyPoints": [
      "Closed ring design improves retention under vibration.",
      "Insulated and non-insulated types serve different temperature and protection needs.",
      "Commonly used where maintenance reliability is more important than quick disconnect."
    ]
  },
  "typesOverview": [
    {
      "name": "PVC Insulated",
      "description": "Standard insulation for general wiring and cost-sensitive projects."
    },
    {
      "name": "Nylon Insulated",
      "description": "Higher heat and abrasion resistance for demanding environments."
    }
  ],
  "applications": {
    "intro": "Commonly selected for fixed, screw-type electrical terminations.",
    "items": [
      "Control panel wiring",
      "Automotive harness grounding points",
      "Power distribution terminals",
      "Industrial machinery maintenance"
    ]
  },
  "selectionGuide": {
    "intro": "Choose by conductor size, stud size, insulation requirement, and environment.",
    "steps": [
      "Match wire gauge and barrel size.",
      "Confirm stud hole diameter and terminal tongue dimensions.",
      "Select insulation type based on temperature and abrasion.",
      "Validate plating/material against corrosion and conductivity requirements."
    ]
  },
  "featuredFamilies": [
    {
      "name": "RV Series",
      "description": "Standard insulated ring terminals for general-purpose wiring.",
      "link": "/families/ring-terminals"
    },
    {
      "name": "Heat Shrink Ring Terminals",
      "description": "Sealed insulation support for moisture-prone environments.",
      "link": "/families/heat-shrink-ring-terminals"
    },
    {
      "name": "Cold Press Ring Terminals",
      "description": "Non-insulated or sleeve-based options for custom insulation strategy.",
      "link": "/families/cold-press-ring-terminals"
    }
  ],
  "seo": {
    "metaTitle": "Insulated & Copper Ring Terminals | Types, Uses, and Series Guide",
    "metaDescription": "Explore ring terminal types, application scenarios, and selection guidance. Compare insulated and copper options, then jump to the best-fit product families."
  }
}
```
