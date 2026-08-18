# Fork / Ring / Spade 产品族关键词意图小规模审计

生成日期：2026-08-18
市场口径：Google 美国、英文（US/en）
抽样范围：Ring Terminals、Fork Terminals、Spade Terminals，以及 manufacturer / supplier / wholesale / OEM / custom 等 B2B 修饰词

## 一、结论摘要

1. `ring terminals` 和 `fork terminals` 都是**混合交易意图**，电商平台确实参与竞争，但并没有垄断 SERP。结果页同时容纳制造商品牌、工业分销商、零售/平台和少量教程内容，因此核心产品词仍值得保留，不能因为 Amazon 出现就放弃。
2. 不建议把所有品类页的 Title 统一改成 `... Manufacturing` 或 `... OEM`。产品族级的 `manufacturer`、`OEM`、`factory`、`custom` 基本没有 DataForSEO 可报告搜索量；它们适合表达供应能力和提高询盘匹配度，不适合替代主关键词承担获客量。
3. 若要在 TDK 中加入 B2B 身份，搜索用语应优先采用名词 `Manufacturer` 或 `Supplier`，而不是过程词 `Manufacturing`。但应放在主产品词之后，并只在品类页或制造能力页使用，不要向所有 Family / SKU 页复制。
4. Ring 的增长机会主要来自产品属性和用途：`ring terminal connectors` 1,900/月、`battery ring terminals` 480/月、`copper ring terminals` 320/月、`heavy duty ring terminals` 110/月。Fork 应优先覆盖自身的类型和规格词，不应依赖制造/OEM修饰词。
5. Fork 页面当前 Title 使用了 `Spade Electrical Wire Connectors Supplier`，但网站已有独立 Spade 品类。`spade terminals` 搜索量 2,400/月，显著高于 `fork terminals` 的 880/月。这不是简单的同义词扩展问题，而是潜在的站内关键词争夺，需要用 GSC 的“查询 × 页面”数据确认并拆开页面职责。
6. Spade 应作为独立商业分类保留，但需限定为 screw/stud 下使用的开口 U/叉形端子。`spade connectors` 虽有 8,100/月，却会混入 female push-on receptacles；后者应由 Quick Disconnect 页面承接，不能把全部流量算给 Spade Category。

## 二、数据与方法

- DataForSEO Google Ads Search Volume Live：美国 `location_code=2840`、英文，采集月均搜索量、CPC、广告竞争度和近 12 个月月度值。
- Serper：相同 US/en 设置，首轮对 12 个 Ring/Fork 查询采集自然结果，补充轮次单独采集 5 个 Spade 查询。
- GSC：过去三个月的 Query、Page、Country、Device 汇总导出。
- 线上页面抽查：Ring、Fork、Spade 品类，Standard Ring Family 和 Manufacturing 页面。
- 原始数据：`tmp/keyword-intent-audit/`、`tmp/vertical-terminal-demand-audit/`。
- 可复跑脚本：`scripts/audit_keyword_intent.py`、`scripts/audit_vertical_terminal_demand.py`。

注意：Google Ads 会合并近义词并使用分档数值，例如单复数可能得到相同数据；`null` 表示没有可报告数据，不应解释为严格的 0。`competition=HIGH` 是广告主竞争度，不是自然排名难度。

## 三、搜索量结果

### 3.1 核心词和更有效的细化方向

| 关键词 | 美国月均搜索量 | CPC (USD) | 广告竞争度 | 判断 |
|---|---:|---:|---|---|
| ring terminals | 6,600 | 0.94 | High / 100 | 主品类词，必须保留 |
| ring terminal connectors | 1,900 | 0.50 | High / 100 | Ring 的高价值同义/扩展词 |
| insulated ring terminals | 720 | 1.39 | High / 94 | 类型页或品类模块 |
| crimp ring terminals | 720 | 0.68 | High / 100 | 工艺/类型表达 |
| battery ring terminals | 480 | 0.54 | High / 100 | 应用场景页或品类模块 |
| copper ring terminals | 320 | 0.55 | High / 100 | 材料属性，适合品类/Family |
| electrical ring terminals | 260 | 0.91 | High / 100 | 可自然覆盖，不必独立页 |
| non insulated ring terminals | 260 | 0.95 | High / 100 | 类型页或 Family |
| heavy duty ring terminals | 110 | 0.42 | High / 100 | 高电流产品组 |
| fork terminals | 880 | 0.89 | High / 99 | Fork 主品类词 |
| insulated fork terminals | 90 | 5.84 | High / 82 | 量小但商业价值强 |
| wire fork terminals | 50 | 0.74 | High / 100 | 辅助表达 |
| electrical fork terminals | 20 | 0.96 | High / 99 | 自然覆盖即可 |
| spade terminals | 2,400 | 0.63 | High / 100 | 应由独立 Spade 品类承接 |
| spade terminal connectors | 590 | 0.51 | High / 100 | 使用 screw/stud 语境消歧 |
| insulated spade terminals | 390 | 0.62 | High / 82 | 应由 Spade 页面承接 |
| wire spade terminals | 210 | 0.35 | High / 100 | 高匹配辅助词 |
| fork spade connectors | 140 | 0.46 | High / 95 | 明确显示 Fork/Spade 命名混用 |
| non insulated spade terminals | 70 | 0.61 | High / 100 | 可由 Spade Family/SKU 承接 |
| fork spade terminals | 70 | 0.41 | High / 86 | 用对比和分类说明承接 |
| locking spade terminals | 70 | 0.38 | High / 99 | 有产品时作为结构模块 |
| crimp spade terminals | 30 | 0.52 | High / 97 | 自然覆盖 |

近 12 个月中，`ring terminals` 月度值约 5,400-8,100，`fork terminals` 约 720-1,000，没有显示依赖单一月份的异常峰值。

### 3.2 Manufacturing / OEM / 批发词是否有量

| 关键词组 | DataForSEO 结果 | 结论 |
|---|---:|---|
| ring terminal manufacturer / ring terminals manufacturer | 无可报告数据 | 不足以作为主 Title 的流量依据 |
| ring terminal supplier / ring terminals supplier | 10/月 | 有极小量，意图准确但不是规模流量 |
| wholesale ring terminals / bulk ring terminals | 各 10/月 | 可用于文案和询盘模块，不应替换核心词 |
| ring terminal factory / OEM / custom | 无可报告数据 | 仅作能力与转化表达 |
| fork manufacturer / supplier / wholesale / bulk / OEM / custom | 全部无可报告数据 | 不支持用这些词重写 Fork 主标题 |
| electrical terminal manufacturer | 10/月 | 更适合 Manufacturing 总能力页 |
| crimp terminal manufacturer | 10/月 | 更适合 Manufacturing 总能力页 |
| electrical terminals wholesale | 10/月 | 可在总品类或采购页辅助覆盖 |

结论：`Manufacturer` / `OEM` 的价值主要是**筛选访客和强化供应身份**，不是增加显著搜索量。即使加入，也应以真实能力为前提，例如 MOQ、模具/冲压、材料与镀层、认证支持、打样、交期和质量追溯；只加一个词不会自动改变 Google 对页面意图的判断。

### 3.3 Spade 的需求规模与歧义

`spade terminals` 近 12 个月稳定在约 2,400-2,900/月，市场明显大于 Fork。`spade connectors` 为 8,100/月，但 SERP 同时包含开口叉形 screw terminal、female push-on receptacle、Blade/Quick Disconnect 等不同结构，因此不能把 8,100 全部视为本站 Spade Category 的可服务市场。

保守估计，本站开口叉形 Spade 产品可直接承接约 2,400-4,000 次/月的核心与类型查询；更大的 `spade connectors` 只能通过清晰的产品图片、open fork tongue、screw/stud connection 等语境争取其中一部分。

GSC 三个月数据显示：Spade 相关 Category / Family / SKU 合计 347 次曝光、1 次点击；Category 为 255 次曝光、平均排名 29.7，Standard Family 为 56 次曝光、平均排名 49.93，而部分 SKU 已进入前 10。这说明产品已经被识别，但 Category 与 Family 的职责和内容仍不够清晰。

## 四、SERP 意图审计

| 查询 | 代表性结果 | 意图判断 |
|---|---|---|
| ring terminals | TE #1、Amazon #2、FerrulesDirect #3，另有 Grainger、DigiKey | 混合交易意图；平台只占一部分，制造商和工业分销同样可排名 |
| fork terminals | Amazon #1，另有 Graybar、ElecDirect、Ideal、Home Depot、3M | 电商/分销更强，但制造商品牌仍存在 |
| ring terminal manufacturer | TE、Amphenol、3M、KST，以及 Graybar、MSC、Thomasnet | 修饰词能明显把结果推向制造商/供应商评估 |
| fork terminal manufacturer | Amazon 仍在 #2，Grainger、YouTube 也出现 | Fork 的修饰词消歧较弱，不能保证纯厂家意图 |
| OEM ring terminals | TE、定制厂家、DigiKey、论坛、Amazon 混合 | `OEM` 未形成稳定的纯采购 SERP |
| OEM fork terminals | Amazon #1、eBay #7，另有品牌、论坛、视频 | `OEM` 对 Fork 几乎未能隔离电商意图 |
| custom ring terminals | 定制套件、定制厂家、精密冲压厂占据前列 | 虽无规模量，但适合做高转化能力页/案例页 |
| custom fork terminals | 混入 welded swage fork、零售、论坛 | 存在跨行业词义漂移，需加 `electrical`、`crimp` 等语境词 |
| spade terminals | RS、DigiKey、Amazon、McMaster 等产品页 | 混合交易意图，既有 open fork 也有其他 spade connector 用法 |
| insulated spade terminals | Amazon、工业零售和工具教程 | 产品意图明确，但零售型结果较强 |
| fork spade terminals | Amazon、ElecDirect、Home Depot、Grainger、Ferrules Direct | Google 把 Fork 与 Spade 视为高度相关，页面必须主动分工 |
| spade terminals vs fork terminals | 对比文章、论坛、教程和供应商分类页 | 行业没有完全统一边界，适合用站内 taxonomy 说明而非宣称绝对定义 |

在首轮 12 个 Ring/Fork 查询和补充的 5 个 Spade 查询中，`electriterminal.com` 均未进入前 10。这个观察只代表采集当时的 US/en SERP，不等于所有地区、设备和日期的固定排名。

### 对“与 Amazon 重合”的回答

重合是正常现象，因为基础产品词本身就是采购/选购词。真正的问题不是“Amazon 是否出现”，而是页面能否提供平台页不擅长的 B2B 信息：完整规格矩阵、MOQ、批量价格机制、材料和镀层、模具与定制范围、测试/证书、样品与交期、批次追溯、图纸下载和 RFQ。应通过内容和页面结构分化，而不是放弃有量的核心词。

## 五、页面与 TDK 建议

### 5.1 Ring Category

当前 Title 已包含 `Ring Terminals` 和 `Supplier`，方向没有根本错误。建议将有量的产品表达放在 Title，把制造身份放进 Meta 和首屏证明模块。

推荐 Title：

`Ring Terminals & Ring Terminal Connectors | Electri Terminal`

推荐 H1：

`Ring Terminals`

推荐 Meta Description：

`Source copper ring terminals for industrial wiring, battery cables and control panels. Compare insulated, non-insulated and heavy-duty options, with bulk supply, documentation and custom production support.`

页面模块应明确承接 `battery`、`copper`、`heavy duty`、`insulated`、`non-insulated`，并链接到对应 Family，而不是为每个低量变体立即新建薄页。

### 5.2 Fork Category

推荐 Title：

`Fork Terminals | Insulated & Non-Insulated Types | Electri Terminal`

推荐 H1：

`Fork Terminals`

推荐 Meta Description：

`Source fork terminals for control panels, machinery and serviceable screw connections. Compare insulated, non-insulated and heat-shrink types by wire range and stud size, with bulk RFQ support.`

不建议在 Fork Title 中继续主打 `Spade Terminals`。网站已经有独立 `/categories/spade-terminals`，应由它承接 `spade terminals` 和 `insulated spade terminals`。Fork 页面可以在正文解释行业中两者有时混用，但需清楚说明本站分类差异并互相链接。

### 5.3 Spade Category

推荐 Title：

`Spade Terminals | Insulated Open-Fork Crimp Terminals`

推荐 H1：

`Spade Terminals for Screw and Stud Connections`

推荐 Meta Description：

`Source insulated and non-insulated spade terminals with open-fork tongues for screw and stud connections. Compare vinyl, nylon, easy-entry and double-crimp options by wire range and stud size.`

Fork 与 Spade 的区分应写成 Electri Terminal 自己的产品目录规则：

| 分类 | 本站承接范围 | 主关键词 | 避免主打 |
|---|---|---|---|
| Fork Terminals | 较重型、非绝缘、Heat Shrink、TU 型开口叉形端子，侧重维护和较大线规 | fork terminals, non-insulated fork terminals, heat-shrink fork terminals | spade terminals, female spade connectors |
| Spade Terminals | 小线规绝缘、Easy Entry、Double Crimp、Nylon/Vinyl 开口端子，压在 screw/stud 下 | spade terminals, insulated spade terminals, fork-spade terms | quick connect, FASTON, female spade connectors |

该区分不是行业通用定义，因此两个页面都应显示一句类似说明：`Terminology varies by supplier. In the Electri Terminal catalog, Fork and Spade pages are separated by construction, insulation range, and product series.`

Spade 当前 Title 中的 `Quick Connect Electrical Wire Connectors` 应删除。它会与 Quick Disconnect Category 争夺 push-on / female receptacle 查询。`female spade connectors` 应在 Quick Disconnect 页面作为同义词解释，而不是放入 Spade Category 的 Title、H1 或主导航锚文本。

Standard Spade Family 目前排名明显弱于部分 SKU。由于当前 GSC 导出没有 Query × Page 联合维度，暂不建议直接合并或 canonical；先把 Category 定位为广义类型入口，把 Family 定位为标准 insulated/non-insulated 系列，再观察 28 天。

### 5.4 Manufacturing / OEM

- 保留独立 `/manufacturing` 页面承接总能力词，而不是让每个产品页都争夺 `manufacturer`。
- Category 页可出现一次可验证的 `manufacturer` / `bulk supplier` 定位，以及指向 Manufacturing 的内部链接。
- OEM 若只是贴牌/包装，使用 `Private Label & Packaging`；若包含图纸定制、模具、冲压、材料/镀层调整，再使用 `Custom / OEM Manufacturing`。
- Manufacturer 文案必须配套证据：设备、工序、产能区间、MOQ、打样周期、检验点、证书和可下载文件。否则对排名和转化都很弱。

## 六、如果 Manufacturing / OEM 没有搜索量，后续怎么优化

按优先级执行：

1. **先做 GSC 查询-页面映射。** 导出最近 3-6 个月 Query、Page、Country、Device、Clicks、Impressions、CTR、Position。分别筛选 Ring、Fork、Spade 的 Category / Family / SKU，确认同一查询是否由多个 URL 获得曝光。
2. **拆清页面职责。** Category 承接广义产品词；Family 承接结构/材料/绝缘类型；SKU 承接型号、AWG、stud size；Manufacturing 承接工厂能力；Guide 承接选型和对比问题。
3. **优先做已有量的 Ring 属性词。** 在现有页增加 connectors、battery、copper、heavy duty 的可扫描模块、规格筛选和内部链接。先增强页面，不急于拆 URL。
4. **解决 Fork / Spade 重合。** 检查两个品类在 GSC 中是否争夺 `spade terminals`、`fork terminals`；若存在，调整 Title、H1、内链锚文本与正文定义，而不是用 canonical 把两个真实品类合并。
5. **用 B2B 证据提高转化。** 增加 MOQ、lead time、样品、批量包装、材料/镀层、图纸、测试、证书、可定制边界和 RFQ 字段。这些内容即使没有独立搜索量，也能帮助核心词流量转化。
6. **扩展高意图内容。** Ring 可优先做 battery cable、high current、stud size、AWG、copper thickness、vibration 等选型主题；Fork 可做 screw/stud compatibility、maintenance access、fork vs ring，并严格控制与 Spade 页的关键词分工。
7. **以 28 天为一个验证周期。** 修改 TDK 后记录日期，对比同国家、同设备下的 impressions、CTR 和平均排名；不要同时大改 Title、正文和内链，否则无法判断是哪项产生影响。

## 七、GSC 验证结果与仍缺的数据

仓库现有过去三个月 GSC 导出。主要页面基线如下：

| Category | 点击 | 曝光 | CTR | 平均排名 |
|---|---:|---:|---:|---:|
| Ring Terminals | 1 | 1,093 | 0.09% | 30.92 |
| Fork Terminals | 1 | 4,619 | 0.02% | 32.43 |
| Spade Terminals | 0 | 255 | 0% | 29.70 |

Fork 曝光远高于第三方 880/月的美国搜索量，是因为 GSC 汇总包含多个国家、长尾查询和三个月数据；它不能与单月美国精确词量直接相除。三类 Category 都主要停留在第 3-4 页，低 CTR 首要由排名解释，但 Fork 的 4,619 次曝光和 0.02% CTR 也值得检查标题语义与落地页匹配。

当前导出仍没有 Query × Page 联合维度，因此无法直接证明某个 `spade terminals` 查询同时触发 Fork 和 Spade URL。下一步最关键的输出仍是：

- 每个 Query 获得曝光的 URL 数量，以及主导 URL 的曝光占比。
- 每个 Category / Family / SKU 的 Top Queries、CTR、Position 和转化落地页匹配度。

## 八、最终决策

- **核心产品词继续保留：是。** 与 Amazon 重合不构成放弃理由。
- **继续细化意图：是。** 但优先细化产品类型、材料、用途和规格，而不是统一追加 Manufacturing/OEM。
- **Title 全面增加 Manufacturing/OEM：否。** 搜索量不支持，且会稀释主词。
- **页面中体现制造商/OEM能力：是。** 用于定位和询盘筛选，必须由真实能力证据支撑。
- **Spade 独立分类：是。** 但必须限定 open-fork screw/stud terminal，并与 Female Spade Quick Disconnect 分离。
- **当前最高优先级：** Fork/Spade TDK 分工、GSC 查询-页面映射、Ring 属性词模块、制造能力证据化。

## 数据源

- DataForSEO Google Ads Search Volume Live 文档：<https://docs.dataforseo.com/v3/keywords_data-google_ads-search_volume-live/>
- Ring Category：<https://electriterminal.com/categories/ring-terminals>
- Fork Category：<https://electriterminal.com/categories/fork-terminals>
- Spade Category：<https://electriterminal.com/categories/spade-terminals>
- Standard Ring Family：<https://electriterminal.com/families/standard-ring-terminals>
- Manufacturing：<https://electriterminal.com/manufacturing>
