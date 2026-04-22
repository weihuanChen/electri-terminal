"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { productUrl } from "@/lib/routes";
import { formatAttributeValue } from "@/lib/productPresentation";

interface SKU {
  _id: string;
  slug: string;
  model?: string;
  skuCode?: string;
  title: string;
  shortTitle?: string;
  attributes?: Record<string, unknown>;
  moq?: number;
  leadTime?: string;
}

interface SKUTableProps {
  skus: SKU[];
  displayColumns?: Array<{
    key: string;
    label: string;
    type?: "text" | "number" | "boolean";
  }>;
}

type SortOrder = "asc" | "desc" | null;

export default function SKUTable({
  skus,
  displayColumns,
}: SKUTableProps) {
  const [sortColumn, setSortColumn] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Default columns if not provided
  const columns = displayColumns || [
    { key: "title", label: "Product", type: "text" },
    { key: "skuCode", label: "Product Code", type: "text" },
    { key: "moq", label: "MOQ", type: "number" },
    { key: "leadTime", label: "Lead Time", type: "text" },
  ];

  // Sort and filter SKUs
  const processedSKUs = skus
    .filter((sku) => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === "model") return sku.model === value;
        if (key === "skuCode") return sku.skuCode === value;
        if (key === "title") return (sku.shortTitle || sku.title) === value;
        return sku.attributes?.[key] === value;
      });
    })
    .sort((a, b) => {
      if (!sortColumn || !sortOrder) return 0;

      let aVal: unknown;
      let bVal: unknown;

      if (sortColumn === "model") {
        aVal = a.model || a.skuCode || a.shortTitle || a.title;
        bVal = b.model || b.skuCode || b.shortTitle || b.title;
      } else if (sortColumn === "skuCode") {
        aVal = a.skuCode || a.model || "";
        bVal = b.skuCode || b.model || "";
      } else if (sortColumn === "title") {
        aVal = a.shortTitle || a.title;
        bVal = b.shortTitle || b.title;
      } else if (sortColumn === "moq") {
        aVal = a.moq || 0;
        bVal = b.moq || 0;
      } else if (sortColumn === "leadTime") {
        aVal = a.leadTime || "";
        bVal = b.leadTime || "";
      } else {
        aVal = a.attributes?.[sortColumn];
        bVal = b.attributes?.[sortColumn];
      }

      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else if (sortOrder === "desc") {
        setSortOrder(null);
        setSortColumn("");
      } else {
        setSortOrder("asc");
        setSortColumn(column);
      }
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const getCellValue = (sku: SKU, key: string): string | number | boolean => {
    if (key === "model") return sku.model || sku.skuCode || "-";
    if (key === "skuCode") return sku.skuCode || sku.model || "-";
    if (key === "title") return sku.shortTitle || sku.title;
    if (key === "moq") return sku.moq || "-";
    if (key === "leadTime") return sku.leadTime || "-";
    return formatAttributeValue(sku.attributes?.[key]);
  };

  const SortIcon = () => {
    if (sortOrder === "asc") return <ArrowUp className="h-4 w-4" />;
    if (sortOrder === "desc") return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 opacity-30" />;
  };

  return (
    <div className="card overflow-hidden">
      {/* Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="px-6 py-4 border-b border-border bg-muted">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                <span>{key}: {value}</span>
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key];
                    setFilters(newFilters);
                  }}
                  className="hover:text-primary-dark"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => setFilters({})}
              className="text-sm text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="px-6 py-3 text-xs text-secondary md:hidden border-b border-border bg-muted/70">
          Swipe left and right to view all columns.
        </div>
        <table className="w-full min-w-[860px]">
          <thead className="bg-muted border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-secondary cursor-pointer hover:bg-muted/80 transition-colors whitespace-nowrap"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortColumn === column.key && <SortIcon />}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {processedSKUs.map((sku) => (
              <tr key={sku._id} className="hover:bg-muted/30 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm ${
                      column.key === "skuCode" || column.key === "model"
                        ? "font-mono text-[13px]"
                        : ""
                    }`}
                  >
                    {getCellValue(sku, column.key)}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <Link
                    href={productUrl(sku.slug)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    View <ChevronRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {processedSKUs.length === 0 && (
        <div className="text-center py-12 text-secondary">
          No products match your filters.
        </div>
      )}

      {/* Results Count */}
      {processedSKUs.length > 0 && (
        <div className="px-6 py-4 border-t border-border bg-muted text-sm text-secondary">
          Showing {processedSKUs.length} of {skus.length} products
        </div>
      )}
    </div>
  );
}
