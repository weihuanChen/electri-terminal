# Frontend SEO Resolver Handoff

本文档总结当前阶段针对 `category / family / product` 三条核心 SEO 页面完成的解析层改造，用于指导后续前端重构。

目标：

- 后续可以大改前端页面结构、视觉、交互
- SEO 规则、metadata 规则、structured data 规则不应重新散落到页面组件中
- category / family / product 页面应继续通过稳定解析层输出 SEO 所需内容

## 1. 本阶段完成内容

### 1.1 family 内容模型落地

已完成：

- `productFamilies` 新增 `pageConfig`
- 后台 `FamilyForm` 支持录入 `pageConfig`
- family 页优先读取 `pageConfig`
- legacy 字段已 backfill 到 `pageConfig`

关键文件：

- `convex/schema.ts`
- `convex/lib/familyPageConfig.ts`
- `convex/mutations/admin/productFamilies.ts`
- `app/admin/actions.ts`
- `app/admin/components/FamilyForm.tsx`
- `docs/11-family-page-content-model.md`

### 1.2 family 页面 SEO 解析层

已完成：

- family metadata fallback 规则抽离
- family FAQ 合并规则抽离
- family CTA / display / content slot 解析抽离
- family structured data 生成抽离

关键文件：

- `lib/familyPage.ts`
- `app/families/[slug]/page.tsx`
- `app/families/[slug]/FamilyPageClient.tsx`

### 1.3 category 页面 SEO 解析层

已完成：

- category refinement `noindex` 规则抽离
- category metadata fallback 规则抽离
- category FAQ / downloads / CTA 展示规则抽离
- category structured data 生成抽离

关键文件：

- `lib/categoryPage.ts`
- `app/categories/[slug]/page.tsx`
- `app/categories/[slug]/CategoryPageClient.tsx`

### 1.4 product 页面 SEO 解析层

已完成：

- product metadata fallback 规则抽离
- product FAQ 解析抽离
- product hero / CTA / FAQ / downloads 基础视图模型抽离
- product structured data 生成抽离

关键文件：

- `lib/productPage.ts`
- `app/products/[slug]/page.tsx`
- `app/products/[slug]/ProductPageClient.tsx`

### 1.5 公共 resolver 基础层

已完成：

- FAQ 通用类型
- CTA 通用类型
- metadata 通用 fallback 工具
- metadata robots 通用工具

关键文件：

- `lib/pageResolvers.ts`

## 2. 当前推荐架构

后续前端改造时，建议继续维持下面的职责分层。

### 2.1 页面文件职责

页面入口文件：

- `app/categories/[slug]/page.tsx`
- `app/families/[slug]/page.tsx`
- `app/products/[slug]/page.tsx`

仅负责：

- 服务端取数
- `generateMetadata`
- `JsonLd` 输出
- 将解析后的数据交给页面客户端组件

不应再承担：

- 复杂 fallback 逻辑
- FAQ 合并逻辑
- CTA 默认值拼接
- structured data 拼装细节

### 2.2 页面解析层职责

页面解析层：

- `lib/categoryPage.ts`
- `lib/familyPage.ts`
- `lib/productPage.ts`

负责：

- 页面内容槽位 fallback
- 展示开关判断
- CTA 解析
- FAQ 解析
- metadata 辅助解析
- structured data 生成

这三层是后续重构时最重要的稳定边界。

### 2.3 通用基础层职责

公共基础层：

- `lib/pageResolvers.ts`

负责：

- FAQ 通用解析
- metadata 通用解析
- robots `noindex` 输出
- CTA / metadata 基础类型

## 3. 后续前端重构时哪些内容可以自由调整

以下内容可以自由改：

- 页面布局
- Hero 视觉形式
- section 顺序
- 卡片样式
- tabs / accordion / sticky sidebars
- 移动端交互
- typography / spacing / motion
- 组件拆分方式

只要保持服务端内容链路和 resolver 层不被绕开，这些调整不会影响 SEO 主逻辑。

## 4. 后续前端重构时不能破坏的内容

### 4.1 metadata 仍必须通过服务端输出

不能把以下逻辑改成仅客户端决定：

- title
- description
- canonical
- robots
- OG image

这些规则目前已分别通过 resolver 层提供。

### 4.2 JsonLd 仍必须保留

当前必须继续保留：

- category: `BreadcrumbList` + `CollectionPage` + `ItemList` + `FAQPage` 条件输出
- family: `BreadcrumbList` + `CollectionPage` + `ItemList` + `FAQPage` + downloads/related item lists 条件输出
- product: `BreadcrumbList` + `FAQPage` 条件输出

不要求 DOM 不变，但 `JsonLd` 输出必须继续存在。

### 4.3 family 页必须继续优先读 `pageConfig`

当前 family 内容模型已从 legacy 字段切向：

- `pageConfig.seo`
- `pageConfig.content`
- `pageConfig.conversion`
- `pageConfig.seoBoost`
- `pageConfig.linking`
- `pageConfig.display`

后续前端即使完全重做，也应继续优先消费这层配置。

### 4.4 refinement 页面必须继续 `noindex`

category 页当前规则：

- 只要 `view !== all`
- 或存在 active filters

则该 URL 为 refinement 页面，应 `noindex, follow`。

这个规则目前在 `lib/categoryPage.ts` 中。

## 5. 当前每条页面的稳定输入

### 5.1 category

建议后续 UI 继续消费以下结果，而不是自己拼：

- `resolveCategoryContentView`
- `resolveCategoryActiveFilters`
- `resolveCategoryFilteredContent`
- `resolveCategoryPageViewModel`
- `buildCategoryStructuredData`

### 5.2 family

建议后续 UI 继续消费以下结果：

- `resolveFamilyPageViewModel`
- `resolveFamilyFaqItems`
- `resolveFamilyMetadataEntity`
- `resolveFamilyMetadataDescription`
- `resolveFamilyMetadataImage`
- `resolveFamilyMetadataRobots`
- `buildFamilyStructuredData`

### 5.3 product

建议后续 UI 继续消费以下结果：

- `resolveProductPageViewModel`
- `resolveProductFaqItems`
- `resolveProductMetadataEntity`
- `resolveProductMetadataDescription`
- `buildProductStructuredData`

## 6. family 相关补充说明

### 6.1 已完成的数据迁移

已对当前 dev 数据执行过一次 backfill：

- `summary -> pageConfig.content.heroIntro`
- `content -> pageConfig.content.overviewText`
- `highlights -> pageConfig.content.featuresList`
- `seoTitle -> pageConfig.seo.metaTitle`
- `seoDescription -> pageConfig.seo.metaDescription`
- `canonical -> pageConfig.seo.canonicalUrl`

执行规则：

- 默认 `overwrite = false`
- 只补缺失字段，不覆盖已录入的新字段

### 6.2 family 下载控制

当前 family 页下载逻辑：

- `downloadsMode = auto`：使用 family relation 资源
- `downloadsMode = manual`：使用 `pinnedDownloadIds` 指定排序

后台已经有下载资源选择器。

### 6.3 family FAQ 逻辑

当前 family FAQ 支持：

- `relation`
- `embedded`
- `mixed`

并已同步到：

- 页面展示
- structured data

## 7. 推荐的后续重构方式

建议按下面方式推进前端大改。

### 7.1 不要直接重写 page-level SEO 逻辑

更推荐：

1. 保留现有 `page.tsx`
2. 保留现有 `lib/*Page.ts`
3. 重写新的 client component / section 组件
4. 新 UI 继续消费 resolver 层结果

### 7.2 如果要继续升级内容模型，优先改 resolver 层

例如后续你要：

- 给 category 新增 pageConfig
- 给 product 新增 pageConfig
- 调整 CTA 策略
- 调整 FAQ 策略
- 调整 structured data 输出条件

建议优先修改：

- `lib/categoryPage.ts`
- `lib/familyPage.ts`
- `lib/productPage.ts`
- `lib/pageResolvers.ts`

而不是把新规则直接写回页面组件。

### 7.3 如果要接 AI 生成内容，也应写入 pageConfig 或 resolver 兼容字段

不要让 AI 输出直接绑定某个前端 section DOM。

更推荐：

- AI 输出结构化字段
- resolver 决定字段如何进入页面和 metadata

## 8. 当前文档与代码入口

关键文档：

- `docs/09-seo-frontend-handoff.md`
- `docs/11-family-page-content-model.md`
- `docs/12-frontend-seo-resolver-handoff.md`

关键代码：

- `lib/pageResolvers.ts`
- `lib/categoryPage.ts`
- `lib/familyPage.ts`
- `lib/productPage.ts`
- `app/categories/[slug]/page.tsx`
- `app/families/[slug]/page.tsx`
- `app/products/[slug]/page.tsx`

## 9. 一句话结论

当前阶段已经把 `category / family / product` 三条核心 SEO 页面从“页面组件内零散判断”改成了“服务端页面入口 + 页面解析层 + 通用 resolver 基础层”的结构。

后续前端可以大改，但不要绕开这三层 helper，否则 SEO 规则会重新碎裂。
