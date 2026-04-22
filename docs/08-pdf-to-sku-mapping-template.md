# 供应商 PDF 到导入结构映射表模板

本文档用于把供应商 PDF、表格、图片目录、压缩包文件映射成当前项目的新导入结构。

目标不是直接保存原始 PDF 字段，而是统一映射到以下 4 类数据：

1. 产品主字段 `products`
2. 规格值 `productFamilies.attributes` / `products.attributes`
3. 视觉媒体 `mediaItems`
4. 下载资源 `assets + assetRelations`

配合文档 [07-bulk-import-format.md](/Users/yinglian/webproject/next/electri-pro-source/docs/07-bulk-import-format.md) 一起使用。

---

## 1. 使用原则

- 同一个供应商建议单独维护一套映射表
- 同一个分类建议单独维护一套规格字段映射表
- PDF 原字段名不直接入库，必须先标准化
- 进入 `attributes` 的 key 必须是 `attributeDefinitions.fieldKey`
- SKU 层只写差异值；系列公共值优先落到 `productFamilies.attributes`
- 视觉图片和下载文件必须分开映射
- 如果 PDF 只有说明文字，没有结构化字段，先抽成中间表再映射

---

## 2. 你需要维护的 4 张映射表

推荐最少维护这 4 张：

1. 主字段映射表
2. 规格字段映射表
3. 视觉媒体映射表
4. 文件资源映射表

如果供应商分类和系列命名不稳定，再补：

5. 分类映射表
6. 系列映射表

---

## 3. 主字段映射表模板

这部分映射到 `products` 顶层字段，或者导入中间层的 `categorySlug` / `familySlug`。

| PDF 原字段名 | 中文含义 | 系统目标字段 | 落库位置 | 是否必填 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Order No.` | 订货号 | `skuCode` | `products.skuCode` | 是 | 去首尾空格，保留原编码 | ` UK2.5 ` | `UK2.5` | 全局唯一 |
| `Model` | 型号 | `model` | `products.model` | 是 | 保留原型号写法 | `UK 2.5` | `UK 2.5` | 同系列内唯一 |
| `Model` | 型号 | `normalizedModel` | `products.normalizedModel` | 是 | 小写并移除空格 | `UK 2.5` | `uk2.5` | 建议程序自动生成 |
| `Product Name` | 产品名 | `title` | `products.title` | 是 | 原样保留或统一大小写 | `UK 2.5 Terminal Block` | `UK 2.5 Terminal Block` | 前台主标题 |
| `Product Name` | 产品名 | `shortTitle` | `products.shortTitle` | 否 | 必要时截短 | `UK 2.5 Terminal Block` | `UK 2.5` | 可选 |
| `Series` | 系列名 | `familySlug` | 导入中间层字段 | 是 | 先映射系列，再查 `familyId` | `UK Series` | `uk-terminal-blocks` | 建议不要直接写 `familyId` |
| `Category` | 分类名 | `categorySlug` | 导入中间层字段 | 是 | 先映射分类，再查 `categoryId` | `DIN Rail Terminal Blocks` | `din-rail-terminal-blocks` | 必须和系列一致 |
| `Brand` | 品牌 | `brand` | `products.brand` | 否 | 统一品牌命名 | `ELECTRI PRO` | `Electri Pro` | 可标准化 |
| `Description` | 简介 | `summary` | `products.summary` | 建议 | 清理换行和多余空格 | `Compact terminal block` | `Compact terminal block` | 建议保留短摘要 |
| `Content` | 详情 | `content` | `products.content` | 否 | 保留换段结构 | `...` | `...` | 富文本可后处理 |
| `Features` | 卖点 | `featureBullets` | `products.featureBullets` | 否 | 按分号、换行拆分数组 | `Easy wiring; High safety` | `["Easy wiring","High safety"]` | 数组 |
| `Packing` | 包装 | `packageInfo` | `products.packageInfo` | 否 | 原样保留 | `50 pcs/box` | `50 pcs/box` | 可直接展示 |
| `MOQ` | 起订量 | `moq` | `products.moq` | 否 | 转 number | `100` | `100` | 数值类型 |
| `Lead Time` | 交期 | `leadTime` | `products.leadTime` | 否 | 原样保留 | `15 days` | `15 days` | 文本即可 |
| `Origin` | 产地 | `origin` | `products.origin` | 否 | 统一国家写法 | `China` | `China` | 可枚举化 |
| `Keywords` | 搜索词 | `searchKeywords` | `products.searchKeywords` | 否 | 按逗号/换行拆数组 | `terminal block, din rail` | `["terminal block","din rail"]` | 数组 |
| `Status` | 状态 | `status` | `products.status` | 建议 | 限定为 `draft/published/archived` | `published` | `published` | 导入时统一最好 |
| `Featured` | 推荐 | `isFeatured` | `products.isFeatured` | 否 | 转布尔值 | `Yes` | `true` | 布尔类型 |
| `Sort` | 排序 | `sortOrder` | `products.sortOrder` | 建议 | 转 number | `10` | `10` | 数值类型 |
| `SEO Title` | SEO 标题 | `seoTitle` | `products.seoTitle` | 否 | 原样保留 | `UK 2.5 Terminal Block Supplier` | `UK 2.5 Terminal Block Supplier` | 可选 |
| `SEO Description` | SEO 描述 | `seoDescription` | `products.seoDescription` | 否 | 原样保留 | `Industrial DIN rail terminal block` | `Industrial DIN rail terminal block` | 可选 |

注意：

- `model` 建议保留供应商原始型号格式
- `normalizedModel` 建议脚本自动生成，不要手工维护
- `categorySlug` 和 `familySlug` 比直接写 ID 更适合导入文件
- 图片字段不要再直接映射到旧 `mainImage/gallery`，应优先走 `mediaItems`

---

## 4. 规格字段映射表模板

这部分映射到：

- `productFamilies.attributes`
- `products.attributes`

关键点：

- `系统字段 key` 必须提前在 `attributeDefinitions` 中建好
- value 类型必须和 `fieldType` 一致
- 单位不要拼在 value 里，由 `unitKey` 决定前台显示

### 4.1 规格字段映射表示例

| PDF 原字段名 | 中文含义 | 系统字段 key | 对应 definition label | 字段类型 | `unitKey` | 建议落点 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `D2` | D2 尺寸 | `d2_mm` | `D2` | `number` | `mm` | SKU | 去单位后转 number | `2.2 mm` | `2.2` | 数值字段 |
| `Length` | 长度 | `length_mm` | `Length` | `number` | `mm` | SKU | 去单位后转 number | `42.5 mm` | `42.5` | 数值字段 |
| `Weight` | 重量 | `weight_g` | `Weight` | `number` | `g` | SKU | 去单位后转 number | `12 g` | `12` | 数值字段 |
| `Voltage` | 电压 | `voltage_v` | `Voltage` | `number` | `v` | SKU | 去单位后转 number | `600 V` | `600` | 数值字段 |
| `Wire Range` | 线径范围 | `wire_range_mm2` | `Wire Range` | `range` | `mm2` | SKU | 拆成最小值和最大值 | `0.2-0.5 mm²` | `[0.2, 0.5]` | 范围字段 |
| `AWG` | AWG 范围 | `awg_range` | `AWG Range` | `range` | `awg` | SKU | 拆成最小值和最大值 | `22-26 AWG` | `[22, 26]` | 范围字段 |
| `Temperature Range` | 温度范围 | `temperature_range_c` | `Temperature Range` | `range` | `c` | SKU | 拆成最小值和最大值 | `-40~125 C` | `[-40, 125]` | 范围字段 |
| `Material` | 材质 | `material` | `Material` | `enum` |  | Family | 统一枚举值 | `Copper` | `"copper"` | 公共值优先写 Family |
| `Plating` | 电镀 | `plating` | `Plating` | `enum` |  | Family | 统一枚举值 | `Tin` | `"tin"` | 公共值优先写 Family |
| `Thread Type` | 螺纹类型 | `thread_type` | `Thread Type` | `string` |  | SKU | 原样清洗 | `M3` | `"M3"` | 文本字段 |
| `Insulated` | 是否绝缘 | `insulated` | `Insulated` | `boolean` |  | SKU | 转布尔值 | `No` | `false` | 布尔字段 |
| `Waterproof` | 是否防水 | `waterproof` | `Waterproof` | `boolean` |  | SKU | 转布尔值 | `Yes` | `true` | 布尔字段 |
| `Certification` | 认证 | `certifications` | `Certifications` | `array` |  | Family | 按逗号或分号拆数组 | `CE, RoHS, UL` | `["CE","RoHS","UL"]` | 多值字段 |

### 4.2 值类型规则

| `fieldType` | 存储结构 | 示例 |
| --- | --- | --- |
| `string` | string | `"thread_type": "M3"` |
| `number` | number | `"d2_mm": 2.2` |
| `boolean` | boolean | `"waterproof": true` |
| `enum` | string | `"material": "copper"` |
| `array` | string[] | `"certifications": ["UL","CE"]` |
| `range` | `[number, number]` | `"wire_range_mm2": [0.2, 0.5]` |

### 4.3 Family 和 SKU 的落点建议

优先写 Family 的字段：

- `material`
- `plating`
- `certifications`
- 颜色、公共材质、系列通用认证

优先写 SKU 的字段：

- 尺寸
- 电压、电流、扭矩、重量
- 线径范围、温度范围
- SKU 专属 thread、安装方式、特殊功能

判断原则：

- 同一系列 80% 以上 SKU 都相同的值，优先进 Family
- 只属于个别 SKU 的值，进 SKU

---

## 5. 视觉媒体映射表模板

这部分映射到 `mediaItems`。

当前支持的视觉媒体类型：

- `product`
- `dimension`
- `packaging`
- `application`

### 5.1 映射表示例

| PDF/文件原字段 | 中文含义 | 最终类型 | 落库位置 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `Image` | 产品图 | `product` | `products.mediaItems[]` | 单图转媒体对象 | `img/uk2.5.jpg` | `{"type":"product","url":"https://.../uk2.5.jpg"}` | 产品主视图 |
| `Gallery` | 产品图集 | `product` | `products.mediaItems[]` | 多图拆多条 | `img1.jpg;img2.jpg` | 两条 `product` 媒体对象 | 多图 |
| `Dimension Drawing` | 尺寸图 | `dimension` | `products.mediaItems[]` | 转媒体对象 | `dim/uk2.5.png` | `{"type":"dimension","url":"https://.../uk2.5.png"}` | 工程图 |
| `Packaging Image` | 包装图 | `packaging` | `products.mediaItems[]` | 转媒体对象 | `pkg/uk2.5.jpg` | `{"type":"packaging","url":"https://.../uk2.5.jpg"}` | 包装展示 |
| `Application Image` | 应用图 | `application` | `products.mediaItems[]` | 转媒体对象 | `app/uk2.5.jpg` | `{"type":"application","url":"https://.../uk2.5.jpg"}` | 场景展示 |

### 5.2 推荐媒体对象结构

```json
[
  {
    "type": "product",
    "url": "https://cdn.example.com/products/uk2.5/front.jpg",
    "alt": "UK 2.5 front view",
    "sortOrder": 0
  },
  {
    "type": "dimension",
    "url": "https://cdn.example.com/products/uk2.5/dimension.jpg",
    "alt": "UK 2.5 dimension drawing",
    "sortOrder": 10
  }
]
```

### 5.3 Family 与 Product 的媒体归属

适合写 Family 的媒体：

- 系列主图
- 系列尺寸总图
- 系列应用图

适合写 Product 的媒体：

- SKU 单品图
- SKU 尺寸图
- SKU 单独包装图

---

## 6. 文件资源映射表模板

这部分映射到：

- `assets`
- `assetRelations`

适合进入资源层的类型：

- `cad`
- `certificate`
- `datasheet`
- `manual`
- `catalog`

### 6.1 映射表示例

| PDF/文件原字段 | 中文含义 | `assets.type` | 目标实体 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `CAD` | CAD 图纸 | `cad` | `product` | 生成 asset，再关联 SKU | `uk2.5.step` | `type=cad,fileUrl=https://.../uk2.5.step` | 不放进 `mediaItems` |
| `Certificate` | 证书 | `certificate` | `family` | 生成 asset，再关联系列 | `ul-cert.pdf` | `type=certificate,fileUrl=https://.../ul-cert.pdf` | 可多个系列共用 |
| `Datasheet` | 数据手册 | `datasheet` | `product` | 生成 asset，再关联 SKU | `uk2.5.pdf` | `type=datasheet,fileUrl=https://.../uk2.5.pdf` | 常见下载资源 |
| `Manual` | 说明书 | `manual` | `family` | 生成 asset，再关联系列 | `manual.pdf` | `type=manual,fileUrl=https://.../manual.pdf` | 通用资料 |
| `Catalog` | 目录 | `catalog` | `category` | 生成 asset，再关联分类 | `terminal-blocks.pdf` | `type=catalog,fileUrl=https://.../terminal-blocks.pdf` | 上层资料 |

### 6.2 推荐 `assets` 对象

```json
{
  "title": "UK 2.5 CAD Drawing",
  "type": "cad",
  "fileUrl": "https://cdn.example.com/assets/uk2-5.step",
  "previewImage": "https://cdn.example.com/assets/uk2-5-preview.jpg",
  "language": "en",
  "version": "v1",
  "isPublic": true,
  "requireLeadForm": false
}
```

### 6.3 推荐 `assetRelations` 对象

```json
{
  "entityType": "product",
  "entitySlug": "uk-2-5",
  "sortOrder": 10
}
```

说明：

- 导入程序根据 `entitySlug` 查出真实 `entityId`
- 同一 asset 可以关联到多个实体

---

## 7. 分类与系列映射表模板

如果供应商 PDF 里的分类和你后台分类/系列名称不完全一致，建议维护这两张对照表。

### 7.1 分类映射

| 供应商原分类名 | 内部标准分类名 | `categorySlug` | 备注 |
| --- | --- | --- | --- |
| `DIN Rail Terminal Block` | `DIN Rail Terminal Blocks` | `din-rail-terminal-blocks` | 单复数统一 |
| `Terminal Block` | `Terminal Blocks` | `terminal-blocks` | 上级分类 |

### 7.2 系列映射

| 供应商原系列名 | 内部标准系列名 | `familySlug` | `categorySlug` | 备注 |
| --- | --- | --- | --- | --- |
| `UK Series` | `UK Terminal Blocks` | `uk-terminal-blocks` | `din-rail-terminal-blocks` | 螺钉式系列 |
| `Push-in Series` | `Push-in Terminal Blocks` | `push-in-terminal-blocks` | `din-rail-terminal-blocks` | 直插式系列 |

---

## 8. 清洗规则建议

建议在转换脚本里统一做这些清洗：

| 规则类型 | 建议规则 | 示例 |
| --- | --- | --- |
| 去空格 | 去首尾空格，内部连续空格压缩为 1 个 | ` UK  2.5 ` -> `UK 2.5` |
| slug 生成 | 小写、空格转连字符、特殊字符清理 | `UK 2.5 Terminal Block` -> `uk-2-5-terminal-block` |
| 布尔值 | `yes/y/true/1` -> `true`；`no/n/false/0` -> `false` | `Yes` -> `true` |
| 数值提取 | 去单位后转 number | `42.5 mm` -> `42.5` |
| range 解析 | 拆出最小值和最大值 | `0.2-0.5 mm²` -> `[0.2, 0.5]` |
| 单位标准化 | `mm²` 统一为 `mm2`，`℃` 统一为 `C` | `0.2-4mm²` -> `0.2-4mm2` |
| 多值拆分 | 逗号、分号、换行统一拆数组 | `CE;RoHS;UL` -> `["CE","RoHS","UL"]` |
| 枚举标准化 | 统一颜色、材质、电镀等值 | `Grey` -> `gray` |
| 图片归类 | 根据文件名或页标题判断 `product/dimension/...` | `uk2.5-dim.png` -> `dimension` |
| 文件归类 | 根据扩展名和标题判断 `cad/certificate/...` | `*.step` -> `cad` |

---

## 9. 单条 SKU 映射示例

### 9.1 PDF / 素材抽取结果

```json
{
  "Order No.": "UK2.5",
  "Model": "UK 2.5",
  "Product Name": "UK 2.5 Terminal Block",
  "Series": "UK Series",
  "Category": "DIN Rail Terminal Block",
  "D2": "2.2 mm",
  "Wire Range": "0.2-0.5 mm²",
  "Material": "Copper",
  "Plating": "Tin",
  "Thread Type": "M3",
  "Waterproof": "No",
  "Packing": "50 pcs/box",
  "MOQ": "100",
  "Image": "img/uk2.5.jpg",
  "Dimension Drawing": "drawings/uk2.5-dim.png",
  "CAD": "cad/uk2.5.step",
  "Certificate": "cert/ul.pdf"
}
```

### 9.2 转换后目标结构

```json
{
  "family": {
    "slug": "uk-terminal-blocks",
    "attributes": {
      "material": "copper",
      "plating": "tin"
    }
  },
  "product": {
    "categorySlug": "din-rail-terminal-blocks",
    "familySlug": "uk-terminal-blocks",
    "skuCode": "UK2.5",
    "model": "UK 2.5",
    "normalizedModel": "uk2.5",
    "slug": "uk-2-5",
    "title": "UK 2.5 Terminal Block",
    "packageInfo": "50 pcs/box",
    "moq": 100,
    "attributes": {
      "d2_mm": 2.2,
      "wire_range_mm2": [0.2, 0.5],
      "thread_type": "M3",
      "waterproof": false
    },
    "mediaItems": [
      {
        "type": "product",
        "url": "https://cdn.example.com/products/uk2.5.jpg",
        "sortOrder": 0
      },
      {
        "type": "dimension",
        "url": "https://cdn.example.com/drawings/uk2.5-dim.png",
        "sortOrder": 10
      }
    ]
  },
  "assets": [
    {
      "title": "UK 2.5 CAD Drawing",
      "type": "cad",
      "fileUrl": "https://cdn.example.com/cad/uk2.5.step"
    },
    {
      "title": "UL Certificate",
      "type": "certificate",
      "fileUrl": "https://cdn.example.com/cert/ul.pdf"
    }
  ]
}
```

---

## 10. 空白模板

### 10.1 主字段映射空表

| PDF 原字段名 | 中文含义 | 系统目标字段 | 落库位置 | 是否必填 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |

### 10.2 规格字段映射空表

| PDF 原字段名 | 中文含义 | 系统字段 key | 对应 definition label | 字段类型 | `unitKey` | 建议落点 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |  |

### 10.3 视觉媒体映射空表

| PDF/文件原字段 | 中文含义 | 最终类型 | 落库位置 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

### 10.4 文件资源映射空表

| PDF/文件原字段 | 中文含义 | `assets.type` | 目标实体 | 转换规则 | 示例原值 | 示例目标值 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

---

## 11. 一句话原则

映射时始终区分这四类落点：

- 顶层业务字段：写入 `products.xxx`
- 规格参数值：写入 `productFamilies.attributes` 或 `products.attributes`
- 展示图片：写入 `mediaItems`
- 下载文件：写入 `assets + assetRelations`

只要这四层边界清楚，后面的 PDF / 图片 / 文件批量转换就会稳定很多。
