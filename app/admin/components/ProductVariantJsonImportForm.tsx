"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { importProductVariantsJsonAction } from "../actions";

const SAMPLE_VARIANT_JSON = `{
  "productSlug": "awg-american-standard-copper-tube-lugs-g01",
  "skuCode": "AWG-810",
  "itemNo": "AWG-810",
  "sortOrder": 10,
  "status": "published",
  "attributes": {
    "source_page": "page-106",
    "original_item_no": "8#10",
    "canonical_item_no": "810",
    "awg_prefixed": true,
    "e_mm": 5.1,
    "d_mm": 4.8,
    "w_mm": 11.8,
    "b_mm": 13,
    "l_mm": 33.3,
    "pcs_per_pack": 200
  }
}`;

type ImportResult =
  | {
      ok: true;
      jobId?: string;
      totalRows?: number;
      successRows?: number;
      failedRows?: number;
    }
  | { ok: false; error: string };

export function ProductVariantJsonImportForm() {
  const [payload, setPayload] = useState(SAMPLE_VARIANT_JSON);
  const [sourceName, setSourceName] = useState("pasted-product-variants.json");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const nextResult = await importProductVariantsJsonAction(formData);
      setResult(nextResult);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Product Variant JSON 导入
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              粘贴单条对象或 JSON 数组；系统用 productSlug 查 productId，并写入 productVariants。
            </p>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            JSON paste import
          </span>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-4 p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Variant JSON
            </label>
            <textarea
              name="payload"
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              spellCheck={false}
              rows={18}
              className="min-h-[420px] w-full resize-y rounded-lg border border-zinc-300 bg-zinc-950 px-4 py-3 font-mono text-xs leading-5 text-zinc-100 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:focus:ring-slate-800"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                任务名称
              </label>
              <input
                name="sourceName"
                value={sourceName}
                onChange={(event) => setSourceName(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:ring-slate-800"
              />
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">导入规则</p>
              <p className="mt-2">
                必填字段：productSlug、skuCode、itemNo。sortOrder 不填时为 0，status 不填时为 draft。
              </p>
              <p className="mt-2">
                attributes 只会保留当前产品分类模板里已定义且类型匹配的字段；被过滤的字段会写到行日志。
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isPending ? "导入中" : "导入 Variant"}
            </button>

            {result ? (
              <div
                className={`rounded-lg border p-4 text-sm ${
                  result.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
                  )}
                  <div>
                    <p className="font-medium">
                      {result.ok
                        ? `完成：${result.successRows ?? 0}/${result.totalRows ?? 0} 成功`
                        : "导入失败"}
                    </p>
                    {result.ok ? (
                      <p className="mt-1">
                        失败 {result.failedRows ?? 0} 行。
                        {result.jobId ? (
                          <>
                            {" "}
                            <Link
                              href={`/admin/import/${result.jobId}`}
                              className="font-semibold underline underline-offset-2"
                            >
                              查看任务详情
                            </Link>
                          </>
                        ) : null}
                      </p>
                    ) : (
                      <p className="mt-1 break-words">{result.error}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
