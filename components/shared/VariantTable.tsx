"use client";

import { formatAttributeValue, type AttributeUnitKey } from "@/lib/productPresentation";

interface VariantField {
  fieldKey: string;
  label: string;
  fieldType?: "string" | "number" | "boolean" | "enum" | "array" | "range";
  displayPrecision?: number;
  unitKey?: AttributeUnitKey;
  unit?: string;
}

interface VariantRow {
  _id: string;
  skuCode: string;
  itemNo: string;
  attributes?: Record<string, unknown>;
}

interface VariantTableProps {
  variants: VariantRow[];
  fields: VariantField[];
}

export default function VariantTable({
  variants,
  fields,
}: VariantTableProps) {
  if (!variants.length || !fields.length) {
    return null;
  }

  return (
    <div className="card overflow-hidden">
      <div className="divide-y divide-border md:hidden">
        <div className="bg-muted/70 px-4 py-3 text-xs text-secondary">
          Mobile view: expand each item to read full specification.
        </div>
        {variants.map((variant, index) => (
          <details key={variant._id} className="bg-white dark:bg-slate-900" open={index === 0}>
            <summary className="cursor-pointer list-none px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[13px] font-semibold text-foreground">{variant.itemNo}</span>
                <span className="text-xs text-secondary">Tap to expand</span>
              </div>
            </summary>
            <dl className="grid gap-2 border-t border-border px-4 py-3">
              {fields.map((field) => (
                <div key={`${variant._id}-${field.fieldKey}`} className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <dt className="text-secondary">{field.label}</dt>
                  <dd className="font-medium text-foreground break-words">
                    {formatAttributeValue(variant.attributes?.[field.fieldKey], field)}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px]">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
                Item No.
              </th>
              {fields.map((field) => (
                <th
                  key={field.fieldKey}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-secondary whitespace-nowrap"
                >
                  {field.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {variants.map((variant) => (
              <tr key={variant._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-mono text-[13px] font-medium text-foreground whitespace-nowrap">
                  {variant.itemNo}
                </td>
                {fields.map((field) => (
                  <td
                    key={field.fieldKey}
                    className="px-6 py-4 text-sm text-foreground whitespace-nowrap"
                  >
                    {formatAttributeValue(variant.attributes?.[field.fieldKey], field)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-muted px-4 py-3 text-sm text-secondary md:px-6 md:py-4">
        Showing {variants.length} specification rows
      </div>
    </div>
  );
}
