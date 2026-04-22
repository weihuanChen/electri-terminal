"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal, Trash2, Edit2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  onDelete?: (rows: TData[]) => void;
  onEdit?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  onDelete,
  onEdit,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {searchKey && (
          <input
            placeholder="搜索..."
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm"
          />
        )}

        {onDelete && selectedRows.length > 0 && (
          <button
            onClick={() => onDelete(selectedRows.map((row) => row.original))}
            className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            删除选中 ({selectedRows.length})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-6 py-3 text-left">
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 ${
                          header.column.getCanSort() ? "cursor-pointer select-none" : ""
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span>
                            {header.column.getIsSorted() === "desc" ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : header.column.getIsSorted() === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-400">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          已选择 {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} 条
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:hover:bg-white dark:bg-zinc-900"
          >
            上一页
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            第 {table.getState().pagination.pageIndex + 1} /{" "}
            {table.getPageCount()} 页
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:hover:bg-white dark:bg-zinc-900"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
