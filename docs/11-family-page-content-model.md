# Family Page Content Model

本文档定义当前 `family` 页面内容模型的正式结构。目标不是引入通用 CMS，而是把系列页拆成两层内容：

- 结构化 section 内容：服务模板渲染、稳定运营和 AI 分槽生成
- 长文 SEO 内容：服务长尾覆盖和更完整的搜索承接

适用范围：

- `/families/[slug]` 系列详情页
- `productFamilies.pageConfig`
- `app/admin/components/FamilyForm.tsx`
- `scripts/export-catalog-content.mjs`
- `scripts/apply-copy-tasks.mjs`
- `scripts/migrate-family-page-content.mjs`

## 1. 设计目标

当前 family 页已经承担以下职责：

- 系列级 SEO 落地页
- 系列介绍与 SKU 表格承接页
- 下载、FAQ、相关文章聚合页
- RFQ / Contact 转化页

旧模型的问题在于：

- `family.content` 与 `pageConfig.content.overviewText` 语义重叠
- 扁平字段只能表达“有一段文案”，无法稳定表达 section 结构
- AI 任务容易把 overview、features 和 SEO 正文写重复
- 后台很难区分“页面摘要”和“SEO 长文”

因此，新模型明确分层：

1. `pageConfig.content`
用于组件渲染的结构化内容

2. `pageConfig.longform`
用于 SEO 深度内容的 markdown 正文

## 2. 页面骨架

family 页面保持固定骨架，不做 block editor：

1. Hero
2. Overview
3. Key Features
4. Applications
5. Selection Guide
6. Technical Notes
7. SEO Longform
8. Media
9. SKU Table
10. Downloads
11. FAQ
12. Related Links
13. Bottom CTA

## 3. 数据结构

```ts
type FamilyPageConfig = {
  seo?: {
    metaTitle?: string
    metaDescription?: string
    canonicalUrl?: string
    noindex?: boolean
    ogImage?: string
  }

  content?: {
    heroIntro?: string

    overview?: {
      intro?: string
      details?: string[]
    }

    features?: {
      intro?: string
      items?: string[]
    }

    applications?: {
      intro?: string
      items?: string[]
    }

    selectionGuide?: {
      intro?: string
      steps?: string[]
    }

    technicalNotes?: string[]

    // legacy compatibility only
    overviewText?: string
    featuresIntro?: string
    featuresList?: string[]
    applicationsIntro?: string
    applicationsList?: string[]
    technicalNote?: string
  }

  longform?: {
    markdown?: string
  }

  conversion?: {
    ctaPrimaryLabel?: string
    ctaPrimaryHref?: string
    ctaSecondaryLabel?: string
    ctaSecondaryHref?: string
    downloadsMode?: "auto" | "manual"
    pinnedDownloadIds?: string[]
  }

  seoBoost?: {
    faqMode?: "relation" | "embedded" | "mixed"
    embeddedFaqItems?: Array<{
      question: string
      answer: string
    }>
  }

  linking?: {
    relatedCategoryIds?: string[]
    relatedFamilyIds?: string[]
    relatedArticleIds?: string[]
  }

  display?: {
    showOverview?: boolean
    showFeatures?: boolean
    showApplications?: boolean
    showSelectionGuide?: boolean
    showTechnicalNote?: boolean
    showLongform?: boolean
    showDownloads?: boolean
    showFaq?: boolean
    showRelatedLinks?: boolean
    showBottomCta?: boolean
  }
}
```

## 4. 字段职责

### 4.1 基础字段

- `name`
  family 页 H1
- `summary`
  列表页、卡片、Hero fallback 摘要
- `content`
  旧字段，迁移期保留，不再作为新写入目标
- `highlights`
  旧字段，迁移期保留，不再作为新写入目标

### 4.2 结构化 section 内容

- `content.heroIntro`
  Hero 区短摘要，通常 1 段

- `content.overview.intro`
  Overview 区开头摘要

- `content.overview.details`
  Overview 正文段落数组，每项一段

- `content.features.intro`
  Features 导语

- `content.features.items`
  Features 列表

- `content.applications.intro`
  Applications 导语

- `content.applications.items`
  应用场景列表

- `content.selectionGuide.intro`
  选型区开头说明

- `content.selectionGuide.steps`
  选型步骤或判断要点

- `content.technicalNotes`
  技术说明数组，每项一条

### 4.3 长文 SEO 内容

- `longform.markdown`
  markdown 正文，用于覆盖更完整的搜索意图

建议模板：

```md
## What Are Angled Blade Terminals

## Key Design Characteristics

## Typical Applications

## How to Select the Right Terminal

## Installation Considerations
```

约束：

- `longform.markdown` 不要重复 overview / features / applications 已有内容
- 长文负责延展，不负责替代上方结构化 section

### 4.4 FAQ、下载、内链

- FAQ 继续以 relation 为主，`embeddedFaqItems` 为补充
- 下载继续通过 relation + `downloadsMode` 管理
- 内链统一存 ID，不存 slug 或标题

## 5. 前端渲染规则

### 5.1 Hero

- 标题：`name`
- 摘要：`pageConfig.content.heroIntro -> summary`
- CTA：`pageConfig.conversion.* -> 默认 CTA`

### 5.2 Overview

显示条件：

- `display.showOverview !== false`
- 且存在 `overview.intro` 或 `overview.details[]`

兼容 fallback：

- 若新结构为空，则读取旧 `overviewText`
- 若旧 `overviewText` 为空，则读取旧 `family.content`
- fallback 时会按段落拆成 `overview.details[]`

### 5.3 Features

显示条件：

- `display.showFeatures !== false`
- 且 `features.items[]` 非空

兼容 fallback：

- `features.items -> featuresList -> highlights`

### 5.4 Applications

显示条件：

- `display.showApplications !== false`
- 且 `applications.items[]` 非空

### 5.5 Selection Guide

显示条件：

- `display.showSelectionGuide !== false`
- 且有 `selectionGuide.intro` 或 `selectionGuide.steps[]`

兼容 fallback：

- 若旧 `selectionGuide` 是字符串，则拆为 `intro + steps`

### 5.6 Technical Notes

显示条件：

- `display.showTechnicalNote !== false`
- 且 `technicalNotes[]` 非空

兼容 fallback：

- 若旧 `technicalNote` 存在，则按行拆为数组

### 5.7 SEO Longform

显示条件：

- `display.showLongform !== false`
- 且 `longform.markdown` 有值

## 6. 后台填写规范

### 6.1 Hero Intro

- 1 段
- 用于说明该系列是什么、适合什么场景
- 不要写成长文

### 6.2 Overview

- `overview.intro`：1 段摘要
- `overview.details[]`：2 到 4 段主体说明

### 6.3 Features

- 建议 4 到 8 条
- 每条一句，尽量是可验证卖点

### 6.4 Applications

- 建议 4 到 8 条
- 直接写应用场景，不写空泛营销语

### 6.5 Selection Guide

- 回答“什么时候选这个 family”
- 回答“优先看哪些参数”
- 回答“与相邻 family 的区别”

### 6.6 Technical Notes

适合承载：

- material
- finish
- installation limits
- certification boundary
- wiring range reminders
- environmental cautions

### 6.7 SEO Longform

建议 section：

- `## What Are ...`
- `## Key Design Characteristics`
- `## Typical Applications`
- `## How to Select ...`
- `## Installation Considerations`

避免：

- 与 overview 完全重复
- 虚构认证、性能、尺寸、合规声明
- 把 SKU 级参数泛化成整个 family 的承诺

## 7. Agent 任务输出规范

family copy task 优先产出这些字段：

- `summary`
- `pageConfig.content.heroIntro`
- `pageConfig.content.overview.intro`
- `pageConfig.content.overview.details`
- `pageConfig.content.features.intro`
- `pageConfig.content.features.items`
- `pageConfig.content.applications.intro`
- `pageConfig.content.applications.items`
- `pageConfig.content.selectionGuide.intro`
- `pageConfig.content.selectionGuide.steps`
- `pageConfig.content.technicalNotes`
- `pageConfig.longform.markdown`
- `pageConfig.seo.metaTitle`
- `pageConfig.seo.metaDescription`

约束：

- 只用已提供上下文
- 不臆造认证、规格、尺寸、性能数据
- `longform.markdown` 不要机械复述 overview / features / applications

## 8. 兼容与迁移策略

当前实现采用“新结构优先，旧字段 fallback”的兼容模式。

### 8.1 旧字段到新结构的迁移规则

- `summary -> pageConfig.content.heroIntro` 仅作为 fallback，不自动覆盖已有值
- `content / overviewText -> pageConfig.content.overview.details[]`
- `featuresList / highlights -> pageConfig.content.features.items[]`
- `applicationsList -> pageConfig.content.applications.items[]`
- `selectionGuide(string) -> pageConfig.content.selectionGuide.intro + steps[]`
- `technicalNote(string) -> pageConfig.content.technicalNotes[]`
- `longform.markdown` 默认不从旧 `content` 自动生成，避免与 overview 重复

### 8.2 迁移命令

先做 dry run：

```bash
pnpm migrate:family-page-content
```

实际执行：

```bash
pnpm migrate:family-page-content --apply
```

如果希望用旧扁平字段强制重建结构化 section：

```bash
pnpm migrate:family-page-content --apply --overwrite
```

脚本会调用：

- `mutations/admin/productFamilies:migrateFamilyPageContentStructure`

## 9. 已落地的代码位置

- schema validator: `convex/lib/familyPageConfig.ts`
- mutation compatibility + migration: `convex/mutations/admin/productFamilies.ts`
- family view model: `lib/familyPage.ts`
- family page UI: `app/families/[slug]/FamilyPageClient.tsx`
- admin form: `app/admin/components/FamilyForm.tsx`
- task export: `scripts/export-catalog-content.mjs`
- task apply: `scripts/apply-copy-tasks.mjs`
- migration CLI: `scripts/migrate-family-page-content.mjs`

## 10. 不做的内容

本模型明确不做：

- 可拖拽 block editor
- 任意 block type 的 `contentBlocks[]`
- markdown 与自定义组件混排系统
- family 页面 section 自由排序
- 把 FAQ / 下载 / 相关文章完整对象内嵌到 family 主表

这些能力会显著增加后台复杂度和数据治理成本，不符合当前项目阶段。
