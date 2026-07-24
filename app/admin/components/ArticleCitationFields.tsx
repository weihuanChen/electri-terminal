"use client";

import {
  ARTICLE_CITATION_SOURCE_TYPES,
  makeCitationId,
  type ArticleCitation,
  type ArticleCitationSourceType,
  type ArticleQuotation,
} from "@/lib/articleCitations";

type ArticleCitationFieldsProps = {
  citations: ArticleCitation[];
  quotations: ArticleQuotation[];
  onCitationsChange: (citations: ArticleCitation[]) => void;
  onQuotationsChange: (quotations: ArticleQuotation[]) => void;
};

const SOURCE_TYPE_LABELS: Record<ArticleCitationSourceType, string> = {
  standard: "标准",
  paper: "论文",
  regulator: "监管/认证机构",
  datasheet: "原厂 Datasheet",
  "internal-test": "内部测试",
  webpage: "网页资料",
};

function toDateInputValue(timestamp?: number) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function fromDateInputValue(value: string) {
  if (!value) return undefined;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isFinite(timestamp) ? timestamp : undefined;
}

export function ArticleCitationFields({
  citations,
  quotations,
  onCitationsChange,
  onQuotationsChange,
}: ArticleCitationFieldsProps) {
  const updateCitation = (index: number, patch: Partial<ArticleCitation>) => {
    const previousId = citations[index]?.id;
    onCitationsChange(
      citations.map((citation, citationIndex) =>
        citationIndex === index ? { ...citation, ...patch } : citation
      )
    );
    if (previousId && patch.id && patch.id !== previousId) {
      onQuotationsChange(
        quotations.map((quotation) =>
          quotation.citationId === previousId
            ? { ...quotation, citationId: patch.id as string }
            : quotation
        )
      );
    }
  };

  const removeCitation = (index: number) => {
    const removedId = citations[index]?.id;
    onCitationsChange(citations.filter((_, citationIndex) => citationIndex !== index));
    if (removedId) {
      onQuotationsChange(
        quotations.filter((quotation) => quotation.citationId !== removedId)
      );
    }
  };

  const addCitation = () => {
    onCitationsChange([
      ...citations,
      {
        id: makeCitationId(citations.map((citation) => citation.id)),
        title: "",
        publisher: "",
        url: "",
        sourceType: "standard",
        accessedAt: Date.now(),
      },
    ]);
  };

  const updateQuotation = (
    index: number,
    patch: Partial<ArticleQuotation>
  ) => {
    onQuotationsChange(
      quotations.map((quotation, quotationIndex) =>
        quotationIndex === index ? { ...quotation, ...patch } : quotation
      )
    );
  };

  const addQuotation = () => {
    if (citations.length === 0) return;
    onQuotationsChange([
      ...quotations,
      {
        text: "",
        attribution: "",
        citationId: citations[0].id,
      },
    ]);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          引用与原文引语
        </h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          来源会自动显示在文章 References 区域，并写入 Article JSON-LD 的 citation。
          引语必须关联到已保存的来源。
        </p>
      </div>

      <section className="mt-6 space-y-4" aria-labelledby="article-citations-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3
              id="article-citations-title"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Sources / Citations
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              标题、发布机构、URL、来源类型和唯一 ID 为必填项。
            </p>
          </div>
          <button
            type="button"
            onClick={addCitation}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700"
          >
            添加来源
          </button>
        </div>

        {citations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            尚未添加结构化来源。旧文章仍可正常发布和显示。
          </p>
        ) : (
          <div className="space-y-4">
            {citations.map((citation, index) => (
              <fieldset
                key={`${citation.id}-${index}`}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between gap-3">
                  <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    来源 {index + 1}
                  </legend>
                  <button
                    type="button"
                    onClick={() => removeCitation(index)}
                    className="text-xs font-medium text-rose-600 hover:text-rose-700"
                  >
                    删除来源
                  </button>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    Citation ID
                    <input
                      required
                      value={citation.id}
                      onChange={(event) =>
                        updateCitation(index, {
                          id: event.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                      placeholder="source-1"
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    来源类型
                    <select
                      value={citation.sourceType}
                      onChange={(event) =>
                        updateCitation(index, {
                          sourceType: event.target.value as ArticleCitationSourceType,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                    >
                      {ARTICLE_CITATION_SOURCE_TYPES.map((sourceType) => (
                        <option key={sourceType} value={sourceType}>
                          {SOURCE_TYPE_LABELS[sourceType]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 md:col-span-2">
                    标题
                    <input
                      required
                      value={citation.title}
                      onChange={(event) =>
                        updateCitation(index, { title: event.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                      placeholder="IEC 60352-2:2024 — Crimped connections"
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    发布机构
                    <input
                      required
                      value={citation.publisher}
                      onChange={(event) =>
                        updateCitation(index, { publisher: event.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                      placeholder="IEC"
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    原始资料 URL
                    <input
                      required
                      type="url"
                      value={citation.url}
                      onChange={(event) =>
                        updateCitation(index, { url: event.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                      placeholder="https://..."
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    标准编号（可选）
                    <input
                      value={citation.standardNumber || ""}
                      onChange={(event) =>
                        updateCitation(index, {
                          standardNumber: event.target.value || undefined,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                      placeholder="IEC 60352-2"
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    版本/Edition（可选）
                    <input
                      value={citation.standardEdition || ""}
                      onChange={(event) =>
                        updateCitation(index, {
                          standardEdition: event.target.value || undefined,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                      placeholder="Edition 3.0 / 2024"
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    发布日期（可选）
                    <input
                      type="date"
                      value={toDateInputValue(citation.publishedAt)}
                      onChange={(event) =>
                        updateCitation(index, {
                          publishedAt: fromDateInputValue(event.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    访问日期（可选）
                    <input
                      type="date"
                      value={toDateInputValue(citation.accessedAt)}
                      onChange={(event) =>
                        updateCitation(index, {
                          accessedAt: fromDateInputValue(event.target.value),
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                    />
                  </label>

                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 md:col-span-2">
                    定位信息（可选）
                    <input
                      value={citation.locator || ""}
                      onChange={(event) =>
                        updateCitation(index, {
                          locator: event.target.value || undefined,
                        })
                      }
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                      placeholder="Section 5.2 / Table 3 / p. 18"
                    />
                  </label>
                </div>
              </fieldset>
            ))}
          </div>
        )}
      </section>

      <section
        className="mt-8 space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
        aria-labelledby="article-quotations-title"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3
              id="article-quotations-title"
              className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
            >
              Verified Quotations
            </h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              只录入已经逐字核验、长度合理且允许引用的原文。
            </p>
          </div>
          <button
            type="button"
            onClick={addQuotation}
            disabled={citations.length === 0}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            添加引语
          </button>
        </div>

        {quotations.map((quotation, index) => (
          <fieldset
            key={`${quotation.citationId}-${index}`}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-3">
              <legend className="px-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                引语 {index + 1}
              </legend>
              <button
                type="button"
                onClick={() =>
                  onQuotationsChange(
                    quotations.filter(
                      (_, quotationIndex) => quotationIndex !== index
                    )
                  )
                }
                className="text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                删除引语
              </button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300 md:col-span-2">
                原文
                <textarea
                  required
                  rows={3}
                  value={quotation.text}
                  onChange={(event) =>
                    updateQuotation(index, { text: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                />
              </label>

              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                归属/署名
                <input
                  required
                  value={quotation.attribution}
                  onChange={(event) =>
                    updateQuotation(index, { attribution: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                  placeholder="IEC 60352-2:2024 scope summary"
                />
              </label>

              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                关联来源
                <select
                  required
                  value={quotation.citationId}
                  onChange={(event) =>
                    updateQuotation(index, { citationId: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
                >
                  {citations.map((citation) => (
                    <option key={citation.id} value={citation.id}>
                      {citation.id} — {citation.title || "Untitled source"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>
        ))}
      </section>
    </div>
  );
}
