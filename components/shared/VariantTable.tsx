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
      <div className="overflow-x-auto">
        <div className="border-b border-border bg-muted/70 px-6 py-3 text-xs text-secondary md:hidden">
          Swipe left and right to view all columns.
        </div>
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

      <div className="px-6 py-4 border-t border-border bg-muted text-sm text-secondary">
        Showing {variants.length} specification rows
      </div>
    </div>
  );
}
