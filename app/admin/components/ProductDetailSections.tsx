import Link from "next/link";
import {
  AdminAttributeTemplateSummary,
  AdminProductDetail,
} from "@/lib/convex-admin";

type AttributeField = NonNullable<AdminAttributeTemplateSummary["fields"]>[number];

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  if (Array.isArray(value)) {
    if (value.length === 2 && value.every((item) => typeof item === "number")) {
      return `${value[0]} ~ ${value[1]}`;
    }
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function getFieldValue(
  fieldKey: string,
  detail: Pick<AdminProductDetail, "product" | "family">
) {
  const productValue = detail.product.attributes?.[fieldKey];
  if (productValue !== undefined) {
    return { value: productValue, source: "product" as const };
  }

  const familyValue = detail.family?.attributes?.[fieldKey];
  if (familyValue !== undefined) {
    return { value: familyValue, source: "family" as const };
  }

  return { value: undefined, source: null };
}

export function ProductDetailSections({
  detail,
  mode = "view",
}: {
  detail: AdminProductDetail;
  mode?: "view" | "edit";
}) {
  const { product, category, family, templateFields, variants } = detail;
  const productIdentity = product as typeof product & {
    productKey?: string;
    seriesCode?: string;
  };
  const visibleFields = [...(templateFields || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Product Code</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{product.skuCode}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Series Code</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{product.model}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Category / Family</p>
          <p className="mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {category?.name || "Unknown"} / {family?.name || "Unknown"}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Variants</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{variants.length}</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">产品概览</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              当前页面展示 product 主记录及其关联 schema、family 和 variants。
            </p>
          </div>
          {mode === "view" ? (
            <Link
              href={`/admin/products/${product._id}/edit`}
              className="inline-flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              编辑产品
            </Link>
          ) : null}
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Product Key</dt>
            <dd className="mt-1 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">
              {productIdentity.productKey || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Title</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{product.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Series Code</dt>
            <dd className="mt-1 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">
              {productIdentity.seriesCode || product.model || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Slug</dt>
            <dd className="mt-1 break-all font-mono text-sm text-zinc-900 dark:text-zinc-100">
              {product.slug}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{product.status}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sort Order</dt>
            <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{product.sortOrder}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">属性 Schema</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          来自当前分类模板，共 {visibleFields.length} 个字段。
        </p>

        {visibleFields.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            当前分类没有已关联的属性模板字段。
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Label
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Field Key
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Current Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {visibleFields.map((field) => {
                  const resolved = getFieldValue(field.fieldKey, detail);
                  return (
                    <tr key={field.fieldKey}>
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {field.label}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                        {field.fieldKey}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{field.fieldType}</td>
                      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                        {formatValue(resolved.value)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                        {resolved.source === "product"
                          ? "product"
                          : resolved.source === "family"
                            ? "family"
                            : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Variants / SKU 规格表</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          当前 product 下的全部规格行。这里只读展示，便于后台核对是否已正确关联。
        </p>

        {variants.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            当前 product 还没有关联任何 variant。
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Item No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Status
                  </th>
                  {visibleFields.map((field: AttributeField) => (
                    <th
                      key={field.fieldKey}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {variants.map((variant) => (
                  <tr key={variant._id}>
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {variant.itemNo}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {variant.skuCode}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">{variant.status}</td>
                    {visibleFields.map((field: AttributeField) => (
                      <td key={field.fieldKey} className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                        {formatValue(variant.attributes?.[field.fieldKey])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
