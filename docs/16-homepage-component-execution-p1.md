# P1 首页组件级执行文档（Aligned Final）

## 1. 目标与范围

本文件将 `docs/NEW Home Page.md` 拆解为可直接落地的组件级执行清单，作用于 MVP `P1` 首页改造。

对齐边界：
- `P0`：文案真实承诺边界
- `P0.5`：视觉系统（70/20/10，深色中性 + 橙 + 蓝）
- `P2`：`cable gland` 仅轻营销，不承诺完整参数体系

本阶段只处理首页，不扩展分类页和产品页深度模块。

---

## 2. 当前首页状态（改造起点）

当前 [app/page.tsx](/Users/yinglian/webproject/next/electri-pro-source/app/page.tsx) 仍以 `terminal blocks` 叙事为主，且包含多段旧结构：
- `CoreProductSolutions`（UK/PT/ST 等旧导向）
- `ProductionProcessSection`
- `QualityControlSection`
- `CertificationSection`
- `GlobalMarketSection`

与最新首页目标不一致点：
- 主定位未聚焦 `ring terminals`
- 首页区块数量偏多，信息主线分散
- 仍存在历史视觉和文案表达痕迹

---

## 3. 目标首页组件编排（9 Sections）

按以下顺序在 [app/page.tsx](/Users/yinglian/webproject/next/electri-pro-source/app/page.tsx) 编排：

1. Hero
2. Product Focus（Ring Terminal Families）
3. Why Choose Us
4. Factory in Action
5. Featured Ring Terminal Products
6. Applications
7. Secondary Capability（Cable Gland + Custom）
8. FAQ
9. Final CTA（含联系/询盘路径）

---

## 4. 组件级映射与动作清单

| Section | 组件策略 | 现有文件 | 动作 | 关键实现要求 | 验收标准 |
|---|---|---|---|---|---|
| 1. Hero | 复用并收敛 | [HeroSection.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/HeroSection.tsx) | 改造 | 标题改为 `Ring Terminals Manufacturer` 主叙事；2 个 CTA 固定主次；chip 仅 ring 相关；优先真实工厂图 | 首屏 5-8 秒可识别“主营产品 + 下一步动作” |
| 2. Product Focus | 复用分类卡模块 | [CategoryGrid.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/CategoryGrid.tsx), [CategoryCard.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/shared/CategoryCard.tsx) | 改造 | 仅展示 ring terminals 3-4 个 family/category；卡片文案短技术描述；链接到对应分类页 | 无非 ring 主线分类进入该区块 |
| 3. Why Choose Us | 复用能力卡模块 | [CapabilityGrid.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/CapabilityGrid.tsx) | 启用+收敛 | 收敛为 4 个可验证卖点（质控、工厂沟通、定制支持、文档支持） | 文案无空话，无超承诺 |
| 4. Factory in Action | 复用并简化 | [FactoryOverview.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/FactoryOverview.tsx) | 改造 | 图片主导，短图注；弱化长段叙事；全部替换为真实工厂图 | 至少 4 张真实工厂图，文本以 caption 为主 |
| 5. Featured Products | 复用并扩容 | [FlagshipProducts.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/FlagshipProducts.tsx), [ProductCard.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/shared/ProductCard.tsx) | 改造 | 数量 6-8；展示 model/item no. + 短描述 + inquiry 入口；聚焦 ring terminal SKU | 卡片可直接进入产品详情或询盘路径 |
| 6. Applications | 复用并降噪 | [ApplicationGrid.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/ApplicationGrid.tsx), [ApplicationCard.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/ApplicationCard.tsx) | 改造 | 保留 4 个应用场景；卡片信息简化为图 + 行业标签 + 简短说明 | 视觉简洁，不做重营销动效 |
| 7. Secondary Capability | 新建区块 | `components/home/SecondaryCapabilitySection.tsx`（新） | 新建 | 单区块轻营销说明 `cable gland + custom/project sourcing`；仅能力说明 + CTA，不上深参数表 | 明确“副能力”定位，不抢主叙事 |
| 8. FAQ | 新建首页封装 | `components/home/HomeFAQSection.tsx`（新）, [FAQAccordion.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/shared/FAQAccordion.tsx) | 新建 | 4-5 问；至少覆盖 MOQ/lead time、documentation、certificate | FAQ 文案符合 P0 承诺边界 |
| 9. Final CTA | 复用并增强 | [BottomRFQSection.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/home/BottomRFQSection.tsx), [InquiryForm.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/shared/InquiryForm.tsx) | 改造 | 保留主次 CTA；增加明确联系路径（email/WhatsApp）；可选嵌入简版询盘表单 | CTA 明确，移动端可快速触达联系动作 |

---

## 5. 首页编排层（app/page.tsx）改造要求

目标文件：
- [app/page.tsx](/Users/yinglian/webproject/next/electri-pro-source/app/page.tsx)

执行动作：
- 移除旧首页主链路中的 `CoreProductSolutions / ProductionProcessSection / QualityControlSection / CertificationSection / GlobalMarketSection` 挂载。
- 使用新 9 段顺序重排组件。
- 数据查询层仅服务首页必需数据，不保留旧的 terminal blocks 过滤逻辑。

建议挂载顺序（示意）：
- `HeroSection`
- `CategoryGrid`（ring focus）
- `CapabilityGrid`
- `FactoryOverview`
- `FlagshipProducts`
- `ApplicationGrid`
- `SecondaryCapabilitySection`（new）
- `HomeFAQSection`（new）
- `BottomRFQSection`（可选组合 `InquiryForm`）

---

## 6. 数据与内容依赖（组件输入）

## 6.1 数据依赖

- Ring 分类数据：3-4 个首页重点分类
- Ring 产品数据：6-8 个 featured SKU
- 应用场景：4 个场景卡片
- FAQ：4-5 条固定问答
- 联系信息：邮箱、WhatsApp、询盘链接

## 6.2 素材依赖

- Hero 真实工厂/产线主图（或轻量视频 + 移动端静态回退图）
- Product focus 分类图（3-4 张）
- Factory in Action 实拍图（至少 4 张）
- Featured 产品实拍图（6-8 张）
- Applications 场景图（4 张）

---

## 7. 文案边界（P0 必须项）

首页所有组件统一遵循：
- `Custom product documentation available upon request.`
- `MOQ and lead time are confirmed per item number and order quantity.`
- `Certificates are available for selected models upon request.`

禁止在首页出现：
- 固定 MOQ/固定交期承诺
- “全量目录可直接下载”承诺
- “全部型号均有证书”承诺

---

## 8. 样式边界（P0.5 必须项）

组件改造必须遵循：
- 深色中性底为主，不使用大面积纯黑
- CTA 橙色主导，蓝色用于导航 active/次强调
- 同一视觉焦点不出现橙蓝双主 CTA 竞争
- 首页风格关键词：Clean / Industrial / Minimal / Authentic / Structured

---

## 9. 分批执行建议（组件维度）

1. 批次 A：编排层与主链路成型
- `app/page.tsx` 重排
- Hero/Product Focus/Final CTA 先通

2. 批次 B：中段可信度模块
- Why Choose Us
- Factory in Action
- Featured Products
- Applications

3. 批次 C：补齐转化闭环
- Secondary Capability（new）
- FAQ（new）
- 联系路径补齐（email/WhatsApp/Inquiry）

---

## 10. 交付验收清单（组件级）

- 首页仅保留 9 段目标结构
- 主叙事为 ring terminals，cable gland 为单区块副能力
- 首页无过度承诺文案
- 每段均有明确 CTA 或信息功能，不存在空模块
- 桌面端与移动端可读性通过
- 关键路径可完成：浏览 -> 比较 -> 发起询盘

