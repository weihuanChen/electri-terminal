# SEO / Search Frontend Handoff

本文档用于承接当前阶段已经完成的 SEO、sitemap、structured data、站内搜索能力，并作为后续前端改造的约束说明。

目标：

- 后续可以重做前端视觉与交互
- 不能破坏当前已落地的 SEO 结构
- 不能让可索引页面退化为 mock 内容、空内容或无语义页面
- 不能让搜索、sitemap、robots、schema 之间失去一致性

## 1. 当前已落地能力

### 1.1 域名与基础 metadata

- 站点域名统一为 `https://electriterminal.com`
- `metadataBase` 已配置
- 默认 robots 已配置

关键文件：

- `app/layout.tsx`
- `lib/site.ts`
- `lib/metadata.ts`

### 1.2 sitemap / robots

已落地：

- `sitemap.xml`
- `sitemap-images.xml`
- `robots.txt`

规则重点：

- 只收录 `published` 内容
- `variant` 参数页不收录
- 常见参数化低质量 URL 已屏蔽
- 图片 sitemap 使用绝对地址

关键文件：

- `app/sitemap.ts`
- `app/sitemap-images.xml/route.ts`
- `app/robots.ts`
- `lib/sitemap.ts`
- `convex/frontend.ts`

### 1.3 动态详情页服务端取数

以下动态详情页已改为服务端取数，不再依赖页面级前端二次请求：

- `/products/[slug]`
- `/families/[slug]`
- `/categories/[slug]`
- `/blog/[slug]`

关键文件：

- `app/products/[slug]/page.tsx`
- `app/families/[slug]/page.tsx`
- `app/categories/[slug]/page.tsx`
- `app/blog/[slug]/page.tsx`

### 1.4 分类页 URL 驱动筛选

分类页现在采用：

- `searchParams` 驱动
- 服务端过滤
- 参数页 `noindex, follow`

这意味着：

- 交互可以重做
- 但筛选后的 URL 仍然必须被视作非主索引页面

关键文件：

- `app/categories/[slug]/page.tsx`
- `app/categories/[slug]/CategoryPageControls.tsx`
- `lib/categoryFilters.ts`

### 1.5 Header 与 /products 已接入真实服务端数据

已落地：

- Header 的 `Products` 下拉不再是静态 mock
- `/products` 不再是纯静态目录页
- 通过服务端缓存查询提供真实 category / family 数据

关键文件：

- `components/layout/Header.tsx`
- `components/layout/HeaderClient.tsx`
- `app/products/page.tsx`
- `lib/publicData.ts`
- `convex/frontend.ts`

### 1.6 Structured Data 已接入

已落地 schema 类型：

- `Organization`
- `WebSite`
- `SearchAction`
- `BreadcrumbList`
- `CollectionPage`
- `ItemList`
- `Product`
- `Article`
- `SearchResultsPage`

关键文件：

- `components/seo/JsonLd.tsx`
- `lib/schema.ts`
- `app/layout.tsx`
- `app/products/page.tsx`
- `app/products/[slug]/page.tsx`
- `app/families/[slug]/page.tsx`
- `app/categories/[slug]/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/search/page.tsx`

### 1.7 站内搜索

已落地：

- `/search` 服务端搜索页
- `/api/search/suggestions` 联想 API
- Header 搜索入口

搜索范围：

- products
- product families
- categories
- articles

建议词优先级：

1. `model`
2. `sku`
3. `family`
4. `category`
5. `article title`

关键文件：

- `app/search/page.tsx`
- `app/api/search/suggestions/route.ts`
- `components/layout/HeaderClient.tsx`
- `convex/frontend.ts`

## 2. 后续前端改造必须遵守的约束

### 2.1 不可破坏的 SEO 主体

以下页面必须继续保持为真实服务端内容页，不允许退回静态 mock：

- `/products`
- `/products/[slug]`
- `/families/[slug]`
- `/categories/[slug]`
- `/blog/[slug]`
- `/search`

禁止事项：

- 用硬编码假数据替换服务端主内容
- 让核心内容只在客户端点击后才出现
- 把当前已存在的服务端结构化数据删除
- 把主内容区域改造成只依赖浏览器端二次请求才能首屏出现

### 2.2 不可破坏的 schema 约束

后续重构时必须保留以下 schema 语义，不要求 DOM 结构不变，但要求语义仍然成立：

- 全局保留 `Organization` + `WebSite` + `SearchAction`
- 产品详情页保留 `BreadcrumbList`
- 只有在具备合法的 `offers` / `review` / `aggregateRating` 数据时才输出 `Product`
- 系列页保留 `BreadcrumbList` + `CollectionPage` + `ItemList`
- 分类页保留 `BreadcrumbList` + `CollectionPage` + `ItemList`
- `/products` 保留 `CollectionPage` + `ItemList`
- 文章页保留 `BreadcrumbList` + `Article`
- 搜索页保留 `SearchResultsPage`

前端可调整：

- 卡片样式
- 页面布局
- tab 结构
- 折叠/展开交互
- 搜索框外观

前端不可删除：

- `JsonLd` 输出
- canonical / robots 策略
- 面包屑语义
- 搜索入口 URL 约定

### 2.3 不可破坏的索引规则

必须继续保持：

- `published` 才能索引
- `variant` 不生成独立可索引 SEO 页
- `variant` 不进 sitemap
- 参数化筛选页 `noindex, follow`
- 搜索结果页 `noindex, follow`

禁止事项：

- 给 `variant` 详情生成新落地页并加入 sitemap
- 把 `/search?q=...` 改成 indexable 页面
- 让筛选参数页参与 canonical 主链路

### 2.4 Header / Search 改造约束

Header 可以重做，但必须保留：

- `/products` 入口
- 分类导航来自真实数据
- 搜索入口可访问 `/search`
- 联想接口优先调用 `/api/search/suggestions`

搜索交互可以升级为：

- 输入联想下拉
- 键盘导航
- 搜索历史
- 热门搜索词

但必须保留：

- GET URL 结构：`/search?q=...`
- 搜索页可直接访问
- 搜索页服务端可渲染

## 3. 建议的前端改造方式

### 3.1 推荐原则

- 优先替换表现层，不先动数据层
- 优先保留 `page.tsx` 中的服务端数据获取与 `JsonLd`
- 如果要新增交互，尽量通过 client 子组件承接
- 如果要重构为 server/client 双层组件，保持 server wrapper 不丢

推荐模式：

1. server page 取数
2. server page 生成 metadata 和 JSON-LD
3. client component 只负责交互与视觉

### 3.2 推荐不要先改的层

以下内容建议后续前端改造第一阶段不要改：

- `lib/schema.ts`
- `lib/metadata.ts`
- `lib/sitemap.ts`
- `app/sitemap.ts`
- `app/sitemap-images.xml/route.ts`
- `app/robots.ts`
- `app/api/search/suggestions/route.ts`

这些是 SEO 骨架层，后续可以扩展，不建议轻易重写。

### 3.3 推荐优先改造的层

建议优先级：

1. `components/layout/HeaderClient.tsx`
2. `app/products/page.tsx`
3. `app/search/page.tsx`
4. `app/categories/[slug]/CategoryPageClient.tsx`
5. `app/products/[slug]/ProductPageClient.tsx`
6. `app/families/[slug]/FamilyPageClient.tsx`

原因：

- 这些文件主要是表现层
- 改造风险可控
- 对 SEO 骨架破坏最小

## 4. 前端改造验收清单

每次改造后至少检查以下项目：

1. `pnpm build` 通过
2. 关键页面仍输出 JSON-LD
3. `/search` 仍然支持直接访问和服务端结果渲染
4. `/api/search/suggestions` 仍返回建议词
5. `variant` 仍未进入 sitemap 和 schema 主链路
6. 分类筛选参数页仍为 `noindex`
7. 页面主内容不是 mock，也不是首屏空壳

建议手动抽查页面：

- `/products`
- `/products/[slug]`
- `/families/[slug]`
- `/categories/[slug]`
- `/search?q=terminal`
- `/blog/[slug]`
- `/sitemap.xml`
- `/sitemap-images.xml`
- `/robots.txt`

## 5. 当前可直接复用的能力

后续前端可直接依赖：

- 服务端公共数据缓存：`lib/publicData.ts`
- 统一 metadata：`lib/metadata.ts`
- 统一 schema：`lib/schema.ts`
- 搜索 suggestions API：`/api/search/suggestions`
- 搜索结果页：`/search`

## 6. 后续可继续增强但不影响当前约束的方向

- 搜索联想下拉 UI
- 建议词命中高亮
- 搜索结果权重进一步精细化
- `/products` 页的分层目录与专题区块
- 更细的 Product schema 字段映射
- 列表页的分页与分页语义
- 图片和媒体的更细粒度 schema

## 7. 结论

后续前端可以大胆重做视觉和交互，但要把当前 SEO 体系视为“基础设施层”：

- 页面可以重画
- 组件可以重拆
- 交互可以升级

但以下三件事不能丢：

- 服务端真实内容
- 稳定的 schema / metadata / robots / sitemap 结构
- 搜索与导航的真实可抓取入口
