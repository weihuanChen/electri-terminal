"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { X, Folder } from "lucide-react";
import { shouldBypassNextImageOptimization } from "@/lib/images";

interface MediaAssetItem {
  _id: string;
  title: string;
  resolvedUrl: string;
  previewUrl: string;
  objectKey?: string;
  fileUrl?: string;
  originalFilename?: string;
  fileSize?: number;
  mimeType?: string;
}

interface MediaAssetPickerModalProps {
  open: boolean;
  assets: MediaAssetItem[];
  selectedUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

interface PathTreeNode {
  name: string;
  path: string;
  children: Map<string, PathTreeNode>;
  assetCount: number;
}

function formatBytes(size?: number) {
  if (!size || size <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function extractPathFromUrl(urlLike?: string) {
  if (!urlLike) return "";

  if (/^https?:\/\//i.test(urlLike)) {
    try {
      const parsed = new URL(urlLike);
      return parsed.pathname.replace(/^\/+/, "");
    } catch {
      return "";
    }
  }

  return urlLike.replace(/^\/+/, "");
}

function getAssetPath(asset: MediaAssetItem) {
  const fromObjectKey = asset.objectKey?.replace(/^\/+/, "") || "";
  if (fromObjectKey) {
    return fromObjectKey;
  }

  const fromResolved = extractPathFromUrl(asset.resolvedUrl);
  if (fromResolved) {
    return fromResolved;
  }

  return extractPathFromUrl(asset.fileUrl);
}

function getAssetDirectory(asset: MediaAssetItem) {
  const path = getAssetPath(asset);
  if (!path) return "";
  const segments = path.split("/").filter(Boolean);
  if (segments.length <= 1) return "";
  return segments.slice(0, -1).join("/");
}

function createNode(name: string, path: string): PathTreeNode {
  return {
    name,
    path,
    children: new Map<string, PathTreeNode>(),
    assetCount: 0,
  };
}

function buildPathTree(assets: MediaAssetItem[]) {
  const root = createNode("/", "");

  for (const asset of assets) {
    const directory = getAssetDirectory(asset);
    root.assetCount += 1;

    if (!directory) {
      continue;
    }

    const segments = directory.split("/").filter(Boolean);
    let current = root;
    for (const segment of segments) {
      const nextPath = current.path ? `${current.path}/${segment}` : segment;
      let child = current.children.get(segment);
      if (!child) {
        child = createNode(segment, nextPath);
        current.children.set(segment, child);
      }
      child.assetCount += 1;
      current = child;
    }
  }

  return root;
}

function matchPathFilter(asset: MediaAssetItem, pathFilter: string) {
  if (!pathFilter) return true;
  const directory = getAssetDirectory(asset);
  if (!directory) return false;
  return directory === pathFilter || directory.startsWith(`${pathFilter}/`);
}

function PathTree({
  node,
  currentPath,
  onPick,
  level = 0,
}: {
  node: PathTreeNode;
  currentPath: string;
  onPick: (path: string) => void;
  level?: number;
}) {
  const children = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name));
  if (children.length === 0) return null;

  return (
    <ul className={level === 0 ? "space-y-1" : "space-y-1 pl-4"}>
      {children.map((child) => (
        <li key={child.path}>
          <button
            type="button"
            onClick={() => onPick(child.path)}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
              currentPath === child.path
                ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
            title={`/${child.path}`}
          >
            <Folder className="h-4 w-4 shrink-0" />
            <span className="truncate">{child.name}</span>
            <span className="ml-auto text-xs opacity-80">{child.assetCount}</span>
          </button>
          <PathTree node={child} currentPath={currentPath} onPick={onPick} level={level + 1} />
        </li>
      ))}
    </ul>
  );
}

export function MediaAssetPickerModal({
  open,
  assets,
  selectedUrl,
  onSelect,
  onClose,
}: MediaAssetPickerModalProps) {
  const [keyword, setKeyword] = useState("");
  const [pathFilter, setPathFilter] = useState("");
  const [focusedAssetId, setFocusedAssetId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const pathTree = useMemo(() => buildPathTree(assets), [assets]);

  const filteredAssets = useMemo(() => {
    const nextKeyword = keyword.trim().toLowerCase();

    return assets.filter((asset) => {
      if (!matchPathFilter(asset, pathFilter)) {
        return false;
      }

      if (!nextKeyword) {
        return true;
      }

      const haystack = [
        asset.title,
        asset.originalFilename || "",
        asset.objectKey || "",
        getAssetPath(asset),
        asset.resolvedUrl,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(nextKeyword);
    });
  }, [assets, keyword, pathFilter]);

  const activeAsset = useMemo(() => {
    const preferred =
      filteredAssets.find((asset) => asset._id === focusedAssetId) ||
      filteredAssets.find((asset) => asset.resolvedUrl === selectedUrl) ||
      filteredAssets[0];
    return preferred || null;
  }, [filteredAssets, focusedAssetId, selectedUrl]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/60 p-4 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="媒体库图片选择"
    >
      <div
        className="mx-auto flex h-full w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">媒体库图片</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              左侧查看路径文件树，右侧选择图片并确认使用。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
            placeholder="按标题 / 文件名 / 路径搜索"
          />
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-r border-zinc-200 p-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setPathFilter("")}
              className={`mb-2 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                pathFilter === ""
                  ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Folder className="h-4 w-4 shrink-0" />
              <span>全部路径</span>
              <span className="ml-auto text-xs opacity-80">{assets.length}</span>
            </button>
            <div className="max-h-full overflow-auto pr-1">
              <PathTree node={pathTree} currentPath={pathFilter} onPick={setPathFilter} />
            </div>
          </aside>

          <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]">
            <div className="min-h-0 overflow-auto p-4">
              {filteredAssets.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {filteredAssets.map((asset) => {
                    const isPicked = selectedUrl === asset.resolvedUrl;
                    const isFocused = activeAsset?._id === asset._id;

                    return (
                      <button
                        key={asset._id}
                        type="button"
                        onClick={() => setFocusedAssetId(asset._id)}
                        className={`overflow-hidden rounded-lg border text-left transition-colors ${
                          isFocused
                            ? "border-slate-900 bg-slate-50 dark:border-slate-300 dark:bg-zinc-800"
                            : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                        }`}
                      >
                        <div className="relative h-40 w-full border-b border-zinc-200 dark:border-zinc-700">
                          <Image
                            src={asset.previewUrl}
                            alt={asset.title}
                            fill
                            unoptimized={shouldBypassNextImageOptimization(asset.previewUrl)}
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1 p-3">
                          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {asset.title}
                          </p>
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            路径: /{getAssetPath(asset) || "ungrouped"}
                          </p>
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {asset.objectKey || asset.originalFilename || asset.resolvedUrl}
                          </p>
                          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {isPicked ? "当前已使用" : isFocused ? "已选中，点击下方按钮确认" : "点击查看详情"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">当前筛选条件下没有图片。</p>
              )}
            </div>

            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
              {activeAsset ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {activeAsset.title}
                    </p>
                    <p>路径: /{getAssetPath(activeAsset) || "ungrouped"}</p>
                    <p>MIME: {activeAsset.mimeType || "-"}</p>
                    <p>大小: {formatBytes(activeAsset.fileSize)}</p>
                    <p className="max-w-[680px] truncate">URL: {activeAsset.resolvedUrl}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(activeAsset.resolvedUrl)}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                      使用这张图片
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      关闭
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">请选择一张图片查看文件信息。</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
