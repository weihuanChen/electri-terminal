# 分类页重构执行文档（3秒抓要点版）

本文档用于替换旧版提示词式文档，目标是将 `Categories` 页从“说明阅读页”改为“快速导航页”。

适用页面：

- [app/categories/page.tsx](/Users/yinglian/webproject/next/electri-pro-source/app/categories/page.tsx)
- [components/shared/CategoryCard.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/shared/CategoryCard.tsx)

---

## 1. 目标与判断标准

核心目标：

- 用户在 3 秒内完成以下其中一项：
- 识别页面用途（这是“分类导航页”）
- 定位到目标分类入口（看到可点击卡片）
- 找到下一步动作（Contact / RFQ / Need Help）

反目标：

- 不追求在此页讲完整产品知识
- 不在首屏堆叠 SEO 长文本
- 不做“电商陈列风”复杂筛选

---

## 2. 当前问题（基于现状实现）

当前 [app/categories/page.tsx](/Users/yinglian/webproject/next/electri-pro-source/app/categories/page.tsx) 的主要问题：

- 一级分类卡片文字负担偏重（`description + shortDescription` 同时出现）
- 一级分类与子分类在同一视觉层级混排，阅读路径容易断裂
- 主体内容后还有 `Quick Links`，与分类入口存在信息重复
- 文案块和网格块节奏不稳定，导致“有的地方太挤，有的地方太空”

结论：

- 你的方向是合理的：保留分类卡为核心、压缩 Hero、弱化长文、强化 CTA。
- 但要再补 3 个关键约束：信息优先级、字数预算、可量化验收。

---

## 3. 信息层级（3秒模型）

页面只保留四层信息：

1. `L1 - 立即识别`：H1 + 1 行说明 + 1 个主动作
2. `L2 - 立即选择`：分类卡网格（页面核心）
3. `L3 - 犹豫兜底`：Need Help 断点区 + RFQ/Contact
4. `L4 - SEO 补充`：折叠长文（默认收起）

执行原则：

- 首屏只放 `L1 + L2` 起始部分
- 一屏内出现的可点击入口不超过 12 个（避免决策过载）
- 同级模块只允许一个“主视觉焦点”

---

## 4. 页面结构（重构后）

推荐顺序：

1. Breadcrumb（细条）
2. Hero（压缩版）
3. Categories Grid（核心）
4. Need Help Break Section（视觉节奏缓冲）
5. Final CTA（Contact / RFQ）
6. SEO Read More（折叠）
7. Footer

说明：

- `Quick Links` 建议并入 Hero 下方的“Top Categories Chips”或直接删除，避免重复。
- 分类页不承载“完整说明文”，把深度说明留给分类详情页。

---

## 5. 各模块约束

### 5.1 Hero（压缩，不讲故事）

- 保留 H1
- 描述限制为 1 到 2 行（建议 <= 90 英文字符或 <= 45 中文字）
- 不放第二段说明
- 主按钮只保留 1 个（如 `Browse Categories` 或 `Request Quote`），次按钮可放文本链接

### 5.2 分类卡网格（主战场）

- 桌面 `3` 列、平板 `2` 列、移动 `1` 列
- 卡片高度统一，图片比例统一（建议 `4:3`）
- 每卡只保留：
- 标题
- 一行短描述（`line-clamp-1`）
- 方向性图标（箭头）
- Hover：边框增强 + 图片轻微放大（避免夸张动效）
- 卡片间距建议 `gap-6`（桌面）/ `gap-4`（移动）

### 5.3 节奏缓冲区（Need Help）

- 放在分类网格之后，作为视觉“呼吸位”
- 文案只做一句判断引导：`Not sure which terminal you need?`
- 提供 1 到 2 个动作：`Talk to Engineer` / `Request Quote`

### 5.4 SEO 长文（必须降权）

- 放在页面底部
- 默认折叠（`Read More`）
- 最大阅读宽度 `max-w-[700px]`
- 行高 `leading-7` 左右，段间距明确
- 不允许进入首屏

### 5.5 CTA（终点清晰）

- 保留 Contact + RFQ，但视觉上明确主次
- 与上一区块保留足够留白（建议 `pt-14` 起）
- 文案强调“下一步动作”，不重复产品说明

---

## 6. 文案预算（硬约束）

- Hero 标题：<= 8 词
- Hero 描述：<= 2 行
- 卡片标题：<= 2 行
- 卡片描述：<= 1 行
- Break Section 文案：<= 1 行主句 + 1 行补充

超过预算必须删减，不做“换行式保留”。

---

## 7. 实施建议（对应现有代码）

针对 [app/categories/page.tsx](/Users/yinglian/webproject/next/electri-pro-source/app/categories/page.tsx)：

- 一级分类卡片中只展示 `shortDescription`，移除并发显示 `description`
- 若页面目标是“快速进分类”，不在概览页展开全部子分类网格
- 子分类建议放入对应分类详情页 [app/categories/[slug]/CategoryPageClient.tsx](/Users/yinglian/webproject/next/electri-pro-source/app/categories/[slug]/CategoryPageClient.tsx)
- 删除或合并底部 `Quick Links`，避免与主网格重复

针对 [components/shared/CategoryCard.tsx](/Users/yinglian/webproject/next/electri-pro-source/components/shared/CategoryCard.tsx)：

- 描述从 `line-clamp-2` 改为 `line-clamp-1`
- 保持箭头、边框 hover，增加图片轻微 `scale-105` 过渡
- 确保卡片标题/描述区域高度稳定，减少视觉抖动

---

## 8. 验收标准（是否达成“3秒找要点”）

设计验收：

- 首屏可见“页面用途 + 分类入口 + 下一步动作”
- 无大段说明文抢占注意力
- 模块节奏均衡，无明显“文字堆积区”和“空白孤岛区”

行为验收（建议埋点）：

- 首次分类点击中位时间 <= 3 秒
- 首屏交互率提升（分类卡或主 CTA 点击）
- 页面底部 SEO 文本展开率低于主网格点击率（说明主路径正确）

---

## 9. 结论

你提出的方向总体正确，且适合 B2B 分类导航场景。  
要从“合理”变成“可落地并可验证”，关键是三点：

1. 先定信息层级，再谈视觉风格
2. 先定文案预算，再填内容
3. 先定量化验收，再做主观评审
