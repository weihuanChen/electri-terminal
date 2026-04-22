import Link from "next/link";
import type { ReactNode } from "react";
import { FilePlus2, FileText, Link2, Pencil, FolderTree, Folder, FileImage } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { actionAdmin, loadAdminData } from "@/lib/convex-admin";
import { buildPublicAssetUrl } from "@/lib/images";
import { DashboardLayout } from "../components/DashboardLayout";

type R2MetadataItem = {
  key: string;
  size?: number;
  contentType?: string;
  lastModified?: string;
  url: string;
};

type R2TreeNode = {
  name: string;
  path: string;
  children: Map<string, R2TreeNode>;
  files: R2MetadataItem[];
};

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

function createTreeNode(name: string, path: string): R2TreeNode {
  return {
    name,
    path,
    children: new Map<string, R2TreeNode>(),
    files: [],
  };
}

function buildR2Tree(items: R2MetadataItem[]) {
  const root = createTreeNode("root", "/");

  for (const item of items) {
    const normalizedKey = item.key.replace(/^\/+/, "");
    if (!normalizedKey) {
      continue;
    }

    const parts = normalizedKey.split("/").filter(Boolean);
    if (parts.length === 0) {
      continue;
    }

    let current = root;
    for (const segment of parts.slice(0, -1)) {
      const existing = current.children.get(segment);
      if (existing) {
        current = existing;
        continue;
      }

      const nextPath = current.path === "/" ? `/${segment}` : `${current.path}/${segment}`;
      const next = createTreeNode(segment, nextPath);
      current.children.set(segment, next);
      current = next;
    }

    current.files.push(item);
  }

  return root;
}

function countTreeFiles(node: R2TreeNode): number {
  let total = node.files.length;
  for (const child of node.children.values()) {
    total += countTreeFiles(child);
  }
  return total;
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function renderR2TreeNode(node: R2TreeNode, depth = 0): ReactNode {
  const folders = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name));
  const files = [...node.files].sort((a, b) => a.key.localeCompare(b.key));

  if (depth === 0) {
    return (
      <ul className="space-y-2">
        {folders.map((folder) => (
          <li key={folder.path}>{renderR2TreeNode(folder, 1)}</li>
        ))}
        {files.map((file) => (
          <li key={file.key}>
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <FileImage className="h-4 w-4 shrink-0" />
              <span className="truncate">{file.key}</span>
              <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
                {formatBytes(file.size)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <details open={depth <= 1} className="rounded-lg border border-zinc-200 dark:border-zinc-700">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800">
        <Folder className="h-4 w-4 shrink-0 text-zinc-700 dark:text-zinc-300" />
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{node.name}</span>
        <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
          {countTreeFiles(node)} files
        </span>
      </summary>

      <div className="space-y-2 border-t border-zinc-200 dark:border-zinc-700 p-2">
        {folders.map((folder) => (
          <div key={folder.path} className="ml-3">
            {renderR2TreeNode(folder, depth + 1)}
          </div>
        ))}
        {files.map((file) => (
          <a
            key={file.key}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="ml-3 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title={file.key}
          >
            <FileImage className="h-4 w-4 shrink-0" />
            <span className="truncate">{file.key.split("/").at(-1) || file.key}</span>
            <span className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
              {formatBytes(file.size)}
            </span>
          </a>
        ))}
      </div>
    </details>
  );
}

export default async function AssetsPage() {
  await requireAdmin();

  const { assets } = await loadAdminData();

  let r2Items: R2MetadataItem[] = [];
  let r2IsTruncated = false;
  let r2LoadError: string | null = null;

  try {
    const r2Data = await actionAdmin<{
      items: Array<{
        key: string;
        size?: number;
        lastModified?: string;
      }>;
      isTruncated: boolean;
      nextContinuationToken?: string;
    }>("actions/r2:listBucketObjects", {
      pageSize: 500,
      maxItems: 5000,
    });
    r2Items = r2Data.items.map((item) => ({
      ...item,
      url: buildPublicAssetUrl(item.key),
    }));
    r2IsTruncated = r2Data.isTruncated;
  } catch (error) {
    r2LoadError = error instanceof Error ? error.message : "r2_metadata_load_failed";
  }

  const assetByObjectKey = new Map(
    assets
      .filter((asset) => !!asset.objectKey)
      .map((asset) => [asset.objectKey as string, asset])
  );
  const registeredCount = r2Items.filter((item) => assetByObjectKey.has(item.key)).length;
  const unregisteredCount = Math.max(r2Items.length - registeredCount, 0);
  const r2Tree = buildR2Tree(r2Items);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">资源管理</h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              维护资源主数据，并按 R2 路径查看实际文件（例如 /family、/products）。
            </p>
          </div>
          <Link
            href="/admin/assets/create"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <FilePlus2 className="h-4 w-4" />
            新建资源
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">总资源数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{assets.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">R2 对象数</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{r2Items.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">已登记到资源主数据</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{registeredCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">未登记对象</p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{unregisteredCount}</p>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm xl:col-span-1">
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                <FolderTree className="h-4 w-4" />
                R2 文件树
              </h3>
            </div>
            <div className="max-h-[640px] overflow-auto px-4 py-4">
              {r2LoadError ? (
                <p className="text-sm text-rose-600">{r2LoadError}</p>
              ) : r2Items.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">R2 暂无可见对象。</p>
              ) : (
                renderR2TreeNode(r2Tree)
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm xl:col-span-2">
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">R2 对象明细</h3>
              {r2IsTruncated && (
                <p className="mt-1 text-xs text-amber-600">
                  结果已截断，仅显示前 5000 个对象。可在查询里调整 `maxItems`。
                </p>
              )}
            </div>

            {r2LoadError ? (
              <div className="px-6 py-8 text-sm text-rose-600">{r2LoadError}</div>
            ) : r2Items.length === 0 ? (
              <div className="px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">暂无对象。</div>
            ) : (
              <div className="max-h-[640px] overflow-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        对象 key
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        类型
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        大小
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        更新时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        资源记录
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {r2Items.map((item) => {
                      const linkedAsset = assetByObjectKey.get(item.key);
                      return (
                        <tr key={item.key} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                          <td className="px-6 py-4">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block max-w-[420px] truncate text-sm text-zinc-900 dark:text-zinc-100 hover:underline"
                              title={item.key}
                            >
                              {item.key}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                            {item.contentType || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                            {formatBytes(item.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                            {formatDate(item.lastModified)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {linkedAsset ? (
                              <Link
                                href={`/admin/assets/${linkedAsset._id}/edit`}
                                className="text-emerald-700 hover:underline"
                              >
                                已登记: {linkedAsset.title}
                              </Link>
                            ) : (
                              <span className="text-amber-700">未登记</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">资源主数据列表</h3>
          </div>

          {assets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">暂无资源</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                先创建资源主数据，再去 Relations 页面挂到分类/产品。
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      标题
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      语言 / 版本
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      大小
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      关联数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      可见性
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {assets.map((asset) => (
                    <tr key={asset._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/assets/${asset._id}/edit`}
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                          >
                            {asset.title}
                          </Link>
                          {(asset.accessUrl || asset.fileUrl || asset.objectKey) && (
                            <a
                              href={asset.accessUrl || asset.fileUrl || "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:text-zinc-300"
                            >
                              {asset.objectKey || asset.fileUrl}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {asset.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {[asset.language, asset.version].filter(Boolean).join(" / ") || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {formatBytes(asset.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                        {(asset.relations || []).length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              asset.isPublic
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                            }`}
                          >
                            {asset.isPublic ? "public" : "private"}
                          </span>
                          {asset.requireLeadForm && (
                            <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                              lead form
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/assets/${asset._id}/edit`}
                            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-200"
                            title="编辑资源"
                          >
                            <Pencil className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          </Link>
                          <Link
                            href="/admin/relations"
                            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-200"
                            title="管理关联"
                          >
                            <Link2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
