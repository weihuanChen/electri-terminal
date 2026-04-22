"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit2, Folder, FolderOpen } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

export type CategoryTreeNode = Doc<"categories"> & {
  children: CategoryTreeNode[];
};

function CategoryNode({ category, level = 0 }: { category: CategoryTreeNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level === 0);

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <div
        className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
        style={{ paddingLeft: `${level * 24 + 24}px` }}
      >
        {category.children.length > 0 ? (
          <button onClick={() => setIsExpanded(!isExpanded)} className="shrink-0" type="button">
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            ) : (
              <Folder className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/categories/${category._id}/edit`}
              className="truncate font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              {category.name}
            </Link>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{category.slug}</span>
            <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium">
              {category.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{category.path}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">排序: {category.sortOrder}</span>
          {category.isVisibleInNav && (
            <span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700">可见</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/admin/categories/${category._id}/edit`}
            className="rounded-lg p-2 transition-colors hover:bg-zinc-200"
            title="编辑"
          >
            <Edit2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </Link>
        </div>
      </div>

      {isExpanded && category.children.length > 0 && (
        <div>
          {category.children.map((child) => (
            <CategoryNode key={child._id} category={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ categories }: { categories: CategoryTreeNode[] }) {
  return (
    <div>
      {categories.map((category) => (
        <CategoryNode key={category._id} category={category} />
      ))}
    </div>
  );
}
