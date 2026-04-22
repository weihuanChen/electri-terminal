# AWG Copper Tube Lugs 数据异常排查清单

本文档用于指示解析服务修复以下产品的导入异常：

- 页面 URL: `http://localhost:3000/products/awg-american-standard-copper-tube-lugs-1012-to-8516`
- `products.slug`: `awg-american-standard-copper-tube-lugs-1012-to-8516`
- `products._id`: `ks77s04xvnr0yhdnn8ae5apv9s83knzp`
- `products.skuCode`: `page-106`
- `products.model`: `awg-american-standard-copper-tube-lugs-g01`
- `family._id`: `kn7ftket3xq86nx5vkyx429t2n83k9za`

## 1. 结论摘要

当前问题不是前端渲染丢字段，而是导入后的 `productVariants` 数据本身异常。

已确认的异常有两类：

1. 分数制规格行没有写入尺寸字段和 `PCS/PACK`
2. 同一个产品下混入了另一套命名体系的规格行，疑似串表导入

前台只是把已有数据原样展示：

- 产品页取数：[`convex/frontend.ts#L1067`](/Users/yinglian/webproject/next/electri-pro-source/convex/frontend.ts#L1067)
- 规格表渲染：[`components/shared/VariantTable.tsx#L21`](/Users/yinglian/webproject/next/electri-pro-source/components/shared/VariantTable.tsx#L21)
- 产品页只展示数据库里已有的 `variant.attributes`：[`app/products/[slug]/ProductPageClient.tsx#L164`](/Users/yinglian/webproject/next/electri-pro-source/app/products/[slug]/ProductPageClient.tsx#L164)

## 2. 原图识别结果

本次对话中提供的图片附件分辨率为：

- `543 x 764 px`

注意：

- 这是当前对话附件尺寸，不一定等于供应商原始 PDF 页面像素尺寸
- 但表格内容足以确认 `1*1/2` 这一行本应存在完整的尺寸值和 `PCS/PACK`

## 3. 目标异常行

用户指出的异常行为：

- `itemNo = 1*1/2`

从图片人工识别，这一行应至少包含以下列值：

| ITEM NO. | φE | D | d | W | B | L | PCS/PACK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `1*1/2` | `13.1` | `11.7` | `9.1` | `19.1` | `16.0` | `46.8` | `50` |

备注：

- 图中表头还有 `T` 等字段，但当前页面模板字段实际使用的是 `b_mm / d1_mm / d2_mm / d_mm / l_mm / pcs_per_pack / w_mm`
- 解析服务修复时应以原始供应商结构为准，再映射到系统字段

## 4. 已确认的数据层异常

### 4.1 `1*1/2` 当前入库值不完整

当前数据库中，`itemNo = 1*1/2` 这一行仅有：

```json
{
  "itemNo": "1*1/2",
  "skuCode": "1*1/2",
  "attributes": {
    "certifications": ["cULus"],
    "material": "copper",
    "plating": "tin"
  }
}
```

缺失字段包括但不限于：

- `d1_mm`
- `d2_mm`
- `d_mm`
- `w_mm`
- `b_mm`
- `l_mm`
- `pcs_per_pack`

### 4.2 同一产品下混入了异常规格行

同一个 `productId = ks77s04xvnr0yhdnn8ae5apv9s83knzp` 下，除了分数制 `1*1/2`、`1*1/4`、`1*3/8` 这类 itemNo，还混入了：

- `TLKF70-12`
- `TLKF95-20`
- `TLKH10-12`
- `TLKH25-10`
- `TLKH35-16`

这些行和当前产品标题 `AWG American Standard Copper Tube Terminals (1012 to 8516)` 不属于同一命名体系，极大概率来自其他产品表。

### 4.3 混入行的数据完整度也不一致

部分 `TLKF* / TLKH*` 行只写入了：

- `d1_mm`
- `d2_mm`
- `pcs_per_pack`

但仍缺少其他尺寸列。

这说明问题不是单纯的“某个字段未创建”，更像是：

- 解析阶段只抽出部分列
- 或导入阶段只写入部分字段
- 同时 product 与 variant 的归属关系也发生错配

## 5. 当前系统字段映射情况

该分类模板里，目标字段其实已经存在，系统并不缺规格字典。

当前模板字段包括：

- `b_mm`
- `d1_mm`
- `d2_mm`
- `d_mm`
- `d_phi_mm`
- `k_mm`
- `l1_mm`
- `l_mm`
- `pcs_per_pack`
- `phi_mm`
- `t_mm`
- `w_mm`

因此修复重点不在前端，而在解析和导入：

1. 正确抽出原表每行规格值
2. 正确映射到既有 `fieldKey`
3. 正确挂到对应 `productId`

## 6. 最可能的根因

### 6.1 规格行解析失败

分数制 `itemNo` 如：

- `1*1/2`
- `1*1/4`
- `1*3/8`

可能在 OCR / 表格解析阶段被识别为“只有型号，没有后续列”，导致尺寸列整行丢失。

关注点：

- `*`、`/` 混合分数格式是否影响列切分
- OCR 是否把 `1*1/2` 附近整行切断
- 是否存在把空白单元格向右吞并的问题

### 6.2 产品边界识别错误

当前产品下混入 `TLKF* / TLKH*` 行，说明解析服务可能把多张表或多段表头归到了同一个产品。

关注点：

- PDF 多页或续表是否误归并
- 同页多个命名体系是否被当成同一 product block
- `page-106` 是否被当成唯一产品标识，但实际这一页承载了多套产品数据

### 6.3 字段映射不完整

从图片看，原表至少存在：

- 导体规格/孔径类列
- 外径/内径类列
- 长度类列
- `PCS/PACK`

但当前入库经常只剩：

- `d1_mm`
- `d2_mm`
- `pcs_per_pack`

说明映射规则可能只覆盖了部分列名，或列名标准化存在遗漏。

重点检查：

- `φE`
- `D`
- `d`
- `W`
- `B`
- `L`
- `PCS/PACK`

是否全部建立了映射。

## 7. 解析服务修复任务清单

### 任务 1：锁定原始来源

需要解析服务提供：

- 该产品对应的原始 PDF 文件
- 原始页码
- OCR / 表格抽取后的中间 JSON 或 CSV
- 最终写入导入结构前的 normalized rows

输出要求：

- 能看到 `1*1/2` 这一行在每个阶段的中间结果
- 能看到 `TLKF* / TLKH*` 行为什么被归到同一个产品

### 任务 2：校验 product 边界切分

确认以下问题：

- 当前 `page-106` 是否应只生成一个 product
- `TLKF* / TLKH*` 是否应属于其他 product slug
- 如果同页有多个产品块，解析器是否支持在同一页拆成多个 product

修复要求：

- 不同命名体系的规格行不得落入同一个 `productId`

### 任务 3：修复规格列抽取

针对分数制 itemNo 行，确保能稳定抽出：

- `φE`
- `D`
- `d`
- `W`
- `B`
- `L`
- `PCS/PACK`

至少要保证：

- `1*1/2`
- `1*1/4`
- `1*3/8`
- `1*5/16`

这批行不再出现“只有材质/电镀、尺寸全空”的情况。

### 任务 4：校验字段映射表

对照文档：

- [`docs/07-bulk-import-format.md`](/Users/yinglian/webproject/next/electri-pro-source/docs/07-bulk-import-format.md)
- [`docs/08-pdf-to-sku-mapping-template.md`](/Users/yinglian/webproject/next/electri-pro-source/docs/08-pdf-to-sku-mapping-template.md)

确认原始列到系统字段的映射是否完整。

建议最少建立以下对应关系：

| 原始列 | 系统字段候选 |
| --- | --- |
| `φE` | `phi_mm` 或 `d_phi_mm` |
| `D` | `d1_mm` 或 `d_mm` |
| `d` | `d2_mm` 或 `d_mm` |
| `W` | `w_mm` |
| `B` | `b_mm` |
| `L` | `l_mm` |
| `PCS/PACK` | `pcs_per_pack` |

注意：

- `φE / D / d` 与现有 `fieldKey` 的最终一一对应，必须由解析服务结合原图和业务定义最终确认
- 修复时不要凭名字猜测，必须以原始图纸尺寸定义为准

### 任务 5：回填并重导

修复后需要：

1. 删除该 product 下错误归属的 variant
2. 重新导入正确的分数制规格行
3. 重新导入真正属于该 product 的其他行
4. 保持 `products._id` 或 `slug` 稳定，避免破坏前台 URL

## 8. 验收标准

解析服务修复后，至少满足以下条件：

1. `itemNo = 1*1/2` 的 `variant.attributes` 包含完整尺寸字段和 `pcs_per_pack`
2. 当前 product 下不再出现明显异类的 `TLKF* / TLKH*` 规格行
3. 前台产品页规格表中，`1*1/2` 这一行不再出现大面积空值
4. 相同页来源的其他分数制行也能正确显示，不只修一条
5. 后台产品编辑页中，对应 variant 能看到完整属性值并可编辑

后台编辑的属性写入逻辑见：

- [`app/admin/components/ProductVariantsManager.tsx#L55`](/Users/yinglian/webproject/next/electri-pro-source/app/admin/components/ProductVariantsManager.tsx#L55)

## 9. 建议的排查输出格式

建议解析服务按下面结构回传修复结果：

```json
{
  "sourcePdf": "xxx.pdf",
  "sourcePage": 106,
  "productSlug": "awg-american-standard-copper-tube-lugs-1012-to-8516",
  "productBoundaryDecision": {
    "splitIntoMultipleProducts": true,
    "reason": "..."
  },
  "rows": [
    {
      "itemNo": "1*1/2",
      "rawCells": ["1*1/2", "13.1", "11.7", "9.1", "19.1", "16.0", "46.8", "50"],
      "mappedAttributes": {
        "d1_mm": 13.1,
        "d2_mm": 11.7,
        "d_mm": 9.1,
        "w_mm": 19.1,
        "b_mm": 16.0,
        "l_mm": 46.8,
        "pcs_per_pack": 50
      }
    }
  ],
  "excludedRows": [
    {
      "itemNo": "TLKF70-12",
      "reason": "belongs to another product block"
    }
  ]
}
```

## 10. 执行建议

修复顺序建议如下：

1. 先导出当前 `productVariants` 现状做快照
2. 再回看原始 PDF / OCR 中间层
3. 先修 product 边界切分
4. 再修字段抽取和字段映射
5. 最后重导并人工验收前台页面

如果只补 `1*1/2` 一条而不修解析逻辑，后续同类页面还会重复出现同样问题。
