# Blade、Splice、Quick Disconnect、Flag 产品需求审计

生成日期：2026-08-18
市场口径：Google 美国、英文（US/en）
GSC 口径：2026-05-16 至 2026-08-15，过去三个月

## 一、决策摘要

| 产品线 | 美国搜索需求规模 | 当前 GSC 产品页表现 | 核心判断 | 优先级 |
|---|---:|---:|---|---|
| Blade Terminals | 核心约 300-800/月 | 83 曝光、3 点击 | 中小规模；Angled/90° 长尾已有真实表现 | P2 |
| Splice Connectors | 核心约 4,000-12,000/月 | 64 曝光、1 点击 | 四类中最大供需缺口，当前明显未覆盖市场 | P0 |
| Quick Disconnect Terminals | 核心约 400-1,500/月 | 1,235 曝光、0 点击 | 市场成立，但页面排名与产品范围匹配差 | P0 |
| Flag Terminals | 核心约 140-400/月 | 172 曝光、0 点击 | 小而专业，CPC 高，Family/SKU 已接近或进入前 10 | P1 |

规模为搜索次数量级，不是买家数或询盘数。区间避免直接累加 Google Ads 可能合并的单复数和近义词。

四类页面不能孤立优化。当前 Blade、Quick Disconnect、Flag 和 Spade 的语言存在明显交叉：Blade 页面描述 male/female push-on；Quick Disconnect 也描述 tab/receptacle；Flag 是 90° female quick disconnect；Spade Title 又使用 `Quick Connect`。建议先定义页面所有权，再改 TDK，否则会把关键词竞争从一个页面转移到另一个页面。

## 二、推荐的产品语义边界

以下是针对 Electri Terminal 当前产品结构的站内分类规则，不代表行业存在完全统一的命名标准。

| 页面 | 主要结构 | 应拥有的关键词 | 不应主打的词 |
|---|---|---|---|
| Blade Terminals | 直式、扁平 male blade/tab，压接在线端，用于插接或端子块 | blade terminals, flat blade terminals, male blade terminals, blade terminal connectors | female spade connectors, flag terminals, generic quick disconnects |
| Quick Disconnect Terminals | 可插拔 male tab + female receptacle 系统，以当前 female receptacle 产品为核心 | quick disconnect terminals, FASTON terminals, push-on terminals, female quick disconnects | fork/spade screw terminals, generic blade terminal block pins |
| Flag Terminals | 90° female receptacle / right-angle quick disconnect，用于紧凑空间 | flag terminals, flag connectors, female flag terminals, flag spade terminals | generic blade terminals, open fork terminals |
| Spade Terminals | 开口 U/叉形 tongue，压在 screw/stud 下；本站主要为小线规绝缘型 | spade terminals, insulated spade terminals, fork-spade terms, locking spade terminals | female spade connectors, FASTON, quick disconnect connectors |

Quick Disconnect Category 应成为“可拆卸 tab/receptacle 连接系统”的总入口，并链接到兼容的直式 Blade、Female Receptacle 和 90° Flag；三个子类仍保留各自独立页面和具体结构词。

## 三、GSC 基线

| 页面/页面组 | 点击 | 曝光 | CTR | 平均排名 |
|---|---:|---:|---:|---:|
| Blade Category / Family / SKU 合计 | 3 | 83 | 3.61% | 不合并计算 |
| `/categories/blade-terminals` | 0 | 47 | 0% | 30.68 |
| `/families/angled-blade-terminals` | 2 | 21 | 9.52% | 10.43 |
| `/families/standard-blade-terminals` | 1 | 7 | 14.29% | 30.86 |
| `/products/90-degree-non-insulated-blade-terminals-g01` | 0 | 2 | 0% | 2.50 |
| Splice Category / Family / SKU 合计 | 1 | 64 | 1.56% | 不合并计算 |
| `/families/butt-splice-connectors` | 0 | 35 | 0% | 28.66 |
| `/categories/splice-connectors` | 0 | 15 | 0% | 22.13 |
| `/families/parallel-splice-connectors` | 0 | 7 | 0% | 22.00 |
| `/products/parallel-splice-connectors-g01` | 1 | 5 | 20% | 3.40 |
| Quick Disconnect Category / Family / SKU 合计 | 0 | 1,235 | 0% | 不合并计算 |
| `/categories/quick-disconnect-terminals` | 0 | 1,131 | 0% | 33.47 |
| `/families/female-quick-disconnects` | 0 | 45 | 0% | 25.20 |
| `/families/heat-shrink-quick-disconnects` | 0 | 24 | 0% | 43.17 |
| `/products/vinyl-fully-insulated-female-quick-disconnects-g01` | 0 | 6 | 0% | 6.83 |
| `/products/nylon-insulated-female-quick-disconnects-g01` | 0 | 4 | 0% | 8.50 |
| Flag Category / Family / SKU 合计 | 0 | 172 | 0% | 不合并计算 |
| `/categories/flag-terminals` | 0 | 134 | 0% | 33.78 |
| `/families/standard-flag-terminals` | 0 | 27 | 0% | 10.00 |
| `/products/non-insulated-flag-terminals-g01` | 0 | 11 | 0% | 6.18 |

GSC 显示 Category 普遍停留在第 3-5 页，但专业 Family/SKU 更容易接近或进入第一页。优化应保留专业页面，并改善 Category 的命名、产品范围和内链，而不是把所有 SKU 合并成一个大页。

## 四、Blade Terminals

### 4.1 搜索量

| 关键词 | 月均量 | CPC (USD) | 判断 |
|---|---:|---:|---|
| blade connectors | 590 | 1.03 | 更宽泛，可能混入插接件 |
| blade terminals | 260 | 1.05 | 核心品类词 |
| male blade terminals | 210 | 0.40 | 与直式 blade/tab 产品匹配 |
| blade terminal connectors | 140 | 0.66 | 辅助品类词 |
| tab terminals | 140 | 0.91 | 行业同义词，但需用图片/尺寸消歧 |
| female blade terminals | 50 | 0.44 | 应主要由 Quick Disconnect receptacle 承接 |
| flat blade terminals | 30 | 2.85 | 结构明确，商业价值较高 |
| insulated blade terminals | 20 | 50.17 | 数据可能受极少量高价广告影响，不宜用 CPC 外推市场 |
| non-insulated blade terminals | 10 | 1.34 | 小型专业词 |
| 90 degree / angled / custom / manufacturer | 无可报告量 | - | 依赖长尾和型号 |

`blade terminals` 近 12 个月约 210-320/月，需求稳定但规模有限。

### 4.2 特型判断

90° 精确词没有可报告量，但 Angled Family 已有 21 次曝光、2 次点击、平均排名 10.43；90° SKU 平均排名 2.5。它符合“第三方量小、GSC 长尾有效”的专业页面特征，应保留。

`90 degree blade terminals` 的 SERP 实际由 flag-shaped / female spade / right-angle connectors 主导，说明该词会与 Flag 页面竞争。Blade 页面应使用 `90° bent blade wire-end terminal`、具体型号和结构图，不把它扩成通用 90° Connector 内容。

### 4.3 页面建议

Category 推荐 Title：

`Blade Terminals | Flat Male Blade & Insulated Crimp Terminals`

Category 推荐 H1：

`Blade Terminals for Flat Plug-In Wire Connections`

执行要点：

- 明确 Blade 页面以直式 flat male blade/tab 和 wire-end crimp terminal 为主。
- 当前页面介绍 Female Blade，但实际 Female 产品集中在 Quick Disconnect，应改为兼容关系并链接过去。
- 保留 Angled Family，但在首屏说明其与 90° Flag Receptacle 的差异。
- `custom blade` 无公开搜索量，定制能力放入 blade width、thickness、length、wire gauge、plating 和 insulation 的 RFQ 模块。

## 五、Splice Connectors

### 5.1 搜索量

| 关键词 | 月均量 | CPC (USD) | 判断 |
|---|---:|---:|---|
| butt connectors | 12,100 | 0.52 | 最大词，但需用 electrical/wire 语境消歧 |
| wire splice connectors | 4,400 | 0.45 | Category 最佳主词 |
| butt splice connectors | 3,600 | 0.50 | Butt Family 核心词 |
| splice connectors | 2,400 | 0.47 | Category 核心词 |
| non-insulated butt connectors | 1,300 | 0.52 | 当前裸端子产品高度匹配 |
| inline splice connectors | 720 | 0.61 | end-to-end 同义词 |
| crimp splice connectors | 210 | 0.78 | 工艺词 |
| electrical wire splice connectors | 140 | 0.76 | 消歧词 |
| heat shrink splice connectors | 110 | 0.38 | 若有真实产品可扩展 |
| wire splice terminals | 20 | 1.64 | 辅助词 |
| parallel splice connectors | 10 | 2.34 | 小而准确，已有 GSC 转化信号 |
| closed end splice connectors | 10 | - | 仅在有对应产品时承接 |

`splice connectors` 近 12 个月约 2,400-2,900，`butt splice connectors` 约 2,900-4,400，市场稳定。

### 5.2 当前问题

站点只获得 64 次产品页曝光，与搜索市场规模严重不匹配。当前 Category Title 方向基本正确，但 Meta 使用 `Shop high-quality`，无法体现工业采购差异；页面还列出 Heat Shrink、IDC 等类型，但现有 Product Series 只有 Butt 和 Parallel，存在内容承诺超过产品范围的问题。

### 5.3 页面建议

Category 推荐 Title：

`Wire Splice Connectors | Butt & Parallel Crimp Splices`

Butt Family 推荐 Title：

`Butt Connectors & Butt Splice Terminals for Inline Wire Joining`

执行要点：

- Category 以 `wire splice connectors` 为第一主词，清楚展示 Butt 和 Parallel 两种真实结构。
- Butt Family 覆盖 butt connectors、butt splice、inline splice、non-insulated butt connectors。
- Parallel Family 保留独立页。虽然只有约 10/月，但 SKU 已有点击、平均排名 3.4，属于有效专业需求。
- 如果没有 Heat Shrink / IDC 产品，不要在 Available Types 中把它们写成当前供应范围；可改为选型对比或未来扩展。
- 增加 inspection window、wire overlap、barrel length、conductor range、material/plating、crimp tooling 等工程参数。

## 六、Quick Disconnect Terminals

### 6.1 搜索量

| 关键词 | 月均量 | CPC (USD) | 判断 |
|---|---:|---:|---|
| FASTON terminals / connectors | 720 | 1.82 | 高价值行业术语；FASTON 是 TE 商标，正文需规范使用 |
| quick disconnect connectors | 480 | 0.67 | 系统级产品词 |
| electrical quick disconnects | 480 | 1.41 | 消歧后的高价值词 |
| quick disconnect terminals | 390 | 0.80 | Category 核心词 |
| push-on terminals | 260 | 0.97 | 可作为同义词，但 SERP 混入 push-in terminal blocks |
| fully insulated quick disconnect terminals | 140 | 0.40 | 当前产品高度匹配 |
| female quick disconnect terminals | 90 | 1.02 | Female Family 核心词 |
| insulated quick disconnect terminals | 40 | 0.31 | 类型词 |
| male / heat-shrink / tab-size / custom / manufacturer | 无可报告量 | - | 依赖长尾和具体型号 |
| female spade connectors | 2,900 | 0.58 | 常指 female push-on receptacle，但高度歧义，不纳入保守规模 |

### 6.2 为什么 1,235 次曝光仍然 0 点击

可能原因不是单一 TDK，而是以下组合：

- Category 平均排名 33.47，大多数曝光发生在用户很少点击的位置。
- 页面宣称包含 Male 与 Female，但当前 Series 和 SKU 主要是 Female、Fully Insulated 和 Heat Shrink Female，产品范围与广义查询预期不完全一致。
- `quick disconnect` 也可指流体接头、terminal block、cable coupling；GSC 中已经出现 `quick disconnect terminal block`、`electrical fittings/coupling` 等偏移查询。
- 页面没有把 0.110 / 0.187 / 0.250 tab width、male/female mating compatibility、receptacle geometry 等核心选型信息放到搜索摘要能理解的位置。

### 6.3 页面建议

Category 推荐 Title：

`Quick Disconnect Terminals | Female Receptacles & Push-On Connectors`

Category 推荐 H1：

`Electrical Quick Disconnect Terminals`

执行要点：

- 把页面定义为 electrical tab-and-receptacle system，排除流体 coupling 和 terminal block 快接语义。
- 若暂无独立 Male SKU，明确说明 Female Receptacles 与兼容 Male Blade/Tab 的配对关系，并链接 Blade Category；不要暗示完整 Male 系列已可选。
- 把 Fully Insulated、Female、Heat Shrink 做成清晰入口，并展示 tab size、wire gauge、current、insulation、mating type。
- `female spade connector` 仅作为行业同义词出现在 Quick Disconnect 页面定义/FAQ，不放入 Spade Category 的 Title/H1。
- 使用 `FASTON-type` 或解释 FASTON 为 TE Connectivity 的商标，不把它写成自有产品品牌。

## 七、Flag Terminals

### 7.1 搜索量

| 关键词 | 月均量 | CPC (USD) | 判断 |
|---|---:|---:|---|
| flag connectors | 260 | 0.78 | 宽泛结构词 |
| flag terminals | 140 | 3.37 | 核心专业词，商业性强 |
| flag terminal connectors | 110 | 0.43 | 高匹配词 |
| flag spade terminals | 50 | 0.69 | 常见混合命名 |
| insulated flag terminals | 50 | 0.27 | 类型词 |
| female flag terminals | 10 | 0.91 | 结构准确 |
| right angle terminals | 10 | 2.09 | 太宽泛，只作辅助 |
| non-insulated flag terminals | 10 | 0.21 | 当前 SKU 匹配 |
| 90 degree / custom / manufacturer | 无可报告量 | - | 依赖长尾 |

`flag terminals` 近 12 个月约 90-140/月，稳定但规模较小。

### 7.2 页面建议

Category 推荐 Title：

`Flag Terminals | 90° Female Quick Disconnect Connectors`

Category 推荐 H1：

`Flag Terminals for Right-Angle Electrical Connections`

执行要点：

- 保留 Category、Standard Family 和 Heavy-Duty SKU。Family 已到平均排名 10，SKU 为 6.18。
- 首屏明确 90° female receptacle / mating tab，而不只写抽象的 right-angle connection。
- 使用 tab size、wire exit direction、clearance、current、insulation、mating compatibility 解释产品选择。
- 与 Quick Disconnect Category 建立父子/相关产品内链；与 90° Blade 页面做对比图，说明 male blade/bent wire-end 与 female flag receptacle 的区别。

## 八、执行优先级

1. **P0：重构 Splice Category 与 Butt Family 的关键词和真实产品范围。** 市场规模最大，当前曝光最低。
2. **P0：修正 Quick Disconnect 的产品范围与消歧。** 先解决 1,235 曝光、0 点击，再扩内容。
3. **P1：优化 Flag Category。** Family/SKU 已有第一页基础，Category 有较大提升空间。
4. **P1：建立 Blade / Quick Disconnect / Flag 的兼容关系图和互链。** 用 male blade、female receptacle、90° flag 三种结构划分页面。
5. **P2：保留并细化 Angled Blade。** 以结构和型号长尾承接，不用无量的泛 custom 词扩页。

## 九、数据限制

- DataForSEO Google Ads 数据存在近义词合并、分档和四舍五入，`null` 不等于严格为零。
- `spade connector`、`blade connector`、`push-on terminal` 等词存在明显命名混用，必须结合 SERP 和产品结构，不能只按搜索量分配页面。
- GSC 导出没有 Query × Page 联合维度，页面竞争判断仍需通过 Search Console API 或逐 URL 筛选验证。
- 搜索量不能直接换算询盘或销售额。

## 十、原始数据

- GSC：`docs/gsc/electriterminal.com-Performance-on-Search-2026-08-18/`
- DataForSEO：`tmp/vertical-terminal-demand-audit/dataforseo-search-volume.json`
- Serper：`tmp/vertical-terminal-demand-audit/serper-serps.json`
- 复跑脚本：`scripts/audit_vertical_terminal_demand.py`

外部参考：

- DataForSEO Search Volume Live：<https://docs.dataforseo.com/v3/keywords_data-google_ads-search_volume-live/>
- Blade Terminals：<https://electriterminal.com/categories/blade-terminals>
- Splice Connectors：<https://electriterminal.com/categories/splice-connectors>
- Quick Disconnect Terminals：<https://electriterminal.com/categories/quick-disconnect-terminals>
- Flag Terminals：<https://electriterminal.com/categories/flag-terminals>
