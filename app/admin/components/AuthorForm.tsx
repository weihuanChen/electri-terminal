"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createAuthorAction,
  deleteAuthorAction,
  updateAuthorAction,
} from "../actions";
import { AdminImageField } from "./ui/AdminImageField";

interface Author {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  avatar?: string;
}

interface AuthorFormProps {
  author?: Author;
}

function normalizeAuthorError(message: string) {
  const normalized = message.trim();
  if (normalized === "required_fields_missing") {
    return "请填写作者名称。";
  }

  if (normalized === "id_required") {
    return "缺少作者 ID，请刷新后重试。";
  }

  if (/Cannot delete author with assigned articles/i.test(normalized)) {
    return "该作者已有文章使用，请先在文章中更换作者后再删除。";
  }

  if (/fetch failed/i.test(normalized)) {
    return "保存失败：后台连接异常，请稍后重试。";
  }

  return normalized || "操作失败，请重试";
}

export function AuthorForm({ author }: AuthorFormProps) {
  const router = useRouter();
  const isEdit = Boolean(author);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: author?.name || "",
    title: author?.title || "",
    description: author?.description || "",
    avatar: author?.avatar || "",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("avatar", formData.avatar);

      if (isEdit && author) {
        payload.append("id", author._id);
        const updateResult = await updateAuthorAction(payload);
        if (!updateResult.ok) {
          setError(normalizeAuthorError(updateResult.error));
          return;
        }
      } else {
        const createResult = await createAuthorAction(payload);
        if (!createResult.ok) {
          setError(normalizeAuthorError(createResult.error));
          return;
        }
      }

      toast.success(isEdit ? "作者已更新" : "作者已创建");
      router.push("/admin/authors");
      router.refresh();
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error ? submitError.message : "操作失败，请重试";
      setError(normalizeAuthorError(message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!author) return;
    if (!window.confirm("确定删除这个作者吗？")) return;

    setIsLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("id", author._id);
      const result = await deleteAuthorAction(payload);
      if (!result.ok) {
        setError(normalizeAuthorError(result.error));
        return;
      }

      toast.success("作者已删除");
      router.push("/admin/authors");
      router.refresh();
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error ? submitError.message : "删除失败，请重试";
      setError(normalizeAuthorError(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          作者信息
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              名称 <span className="text-rose-600">*</span>
            </label>
            <input
              required
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              placeholder="例如：Electri Terminal Engineering Team"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              职称
            </label>
            <input
              value={formData.title}
              onChange={(event) =>
                setFormData((current) => ({ ...current, title: event.target.value }))
              }
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              placeholder="例如：Electrical Application Engineer"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              描述
            </label>
            <textarea
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={5}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
              placeholder="作者简介、专业背景或内容方向"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <AdminImageField
          label="头像"
          value={formData.avatar}
          onChange={(value) =>
            setFormData((current) => ({ ...current, avatar: value }))
          }
          helperText="建议使用正方形头像。"
          placeholder="支持 /images/author.jpg 或 https://example.com/author.jpg"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="rounded-lg border border-rose-300 px-6 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
            >
              删除作者
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-800"
          >
            {isLoading ? "保存中..." : isEdit ? "保存更改" : "创建作者"}
          </button>
        </div>
      </div>
    </form>
  );
}
