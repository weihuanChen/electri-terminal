# Bulk Import Examples

本目录提供一组与当前推荐导入结构对齐的样板文件，供后续供应商数据整理和导入脚本开发使用。

文件说明：

- `categories.sample.csv`
  - 分类导入样板
- `attribute-definitions.sample.json`
  - 全局规格定义样板
- `attribute-templates.sample.json`
  - 分类规格模板和字段绑定样板
- `families.sample.json`
  - 系列导入样板，包含 Family 默认属性和视觉媒体
- `products.sample.json`
  - Product 导入样板，包含公开产品页公共属性和视觉媒体
- `product-variants.sample.json`
  - Variant / SKU 导入样板，包含规格行差异属性
- `assets.sample.json`
  - CAD / 证书 / datasheet 等资源及关联样板
- `supplier-spec-rows.sample.csv`
  - 供应商规格抽取中间表样板
- `supplier-media-rows.sample.csv`
  - 供应商图片抽取中间表样板
- `supplier-asset-rows.sample.csv`
  - 供应商文件资源抽取中间表样板

使用建议：

1. 先按 `categories.sample.csv` 建立分类
2. 再按 `attribute-definitions.sample.json` 和 `attribute-templates.sample.json` 建立规格体系
3. 再导入 `families.sample.json` 和 `products.sample.json`
4. 再导入 `product-variants.sample.json`
5. 最后导入 `assets.sample.json`
6. 供应商原始 PDF / 图片 / 压缩包，先整理成三份 `supplier-*.sample.csv` 同结构的中间表，再生成最终导入 JSON

当前说明：

- 图片资源可后补；若尚未统一转成 `webp` 或未上传 CDN，可暂时不作为主数据导入阻塞项
