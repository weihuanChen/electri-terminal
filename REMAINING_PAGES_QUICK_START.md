# Products 管理模块 - 快速实施指南

## ✅ 已完成

1. **后端 Mutations**
   - ✅ `deleteProduct` - 删除产品
   - ✅ `bulkUpdateProducts` - 批量更新

2. **Server Actions**
   - ✅ `updateProductAction`
   - ✅ `deleteProductAction`
   - ✅ `bulkUpdateProductsAction`

3. **前端页面**
   - ✅ Products 列表页 (`app/admin/products/page.tsx`)
   - ✅ ProductForm 组件 (`app/admin/components/ProductForm.tsx`)

## 🔄 待完成（使用相同模式）

### 1. 创建页和编辑页

创建 `app/admin/products/create/page.tsx`:

```typescript
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../components/DashboardLayout";
import { ProductForm } from "../../components/ProductForm";

export default async function CreateProductPage() {
  await requireAdmin();
  const { categories, families } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">创建产品</h1>
          <p className="text-zinc-600">添加新的产品 SKU</p>
        </div>
        <ProductForm categories={categories} families={families} />
      </div>
    </DashboardLayout>
  );
}
```

创建 `app/admin/products/[id]/edit/page.tsx`:

```typescript
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../../../components/DashboardLayout";
import { ProductForm } from "../../../components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  // 需要添加 getProduct 函数到 convex-admin.ts
  const product = await getProduct(id);
  const { categories, families } = await loadAdminData();

  if (!product) {
    notFound();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">编辑产品</h1>
          <p className="text-zinc-600">修改产品信息</p>
        </div>
        <ProductForm product={product} categories={categories} families={families} />
      </div>
    </DashboardLayout>
  );
}
```

### 2. 添加 getProduct 查询函数

在 `convex/queries/modules/products.ts` 添加:

```typescript
export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

在 `lib/convex-admin.ts` 添加:

```typescript
export async function getProduct(id: string) {
  return queryAdmin<Doc<"products">>("queries/modules/products:getProductById", { id });
}
```

---

## 📝 Articles 管理模块

### 1. 添加 Mutations (convex/mutations/admin/articles.ts)

```typescript
export const deleteArticle = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateArticles = mutation({
  args: {
    ids: v.array(v.id("articles")),
    updates: v.object({
      status: v.optional(statusCommon),
    }),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      const updateData: any = {};
      if (args.updates.status !== undefined) {
        updateData.status = args.updates.status;
      }
      await ctx.db.patch(id, updateData);
    }
  },
});
```

### 2. Server Actions (在 app/admin/actions.ts)

```typescript
// Article actions
export async function updateArticleAction(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id") as Id<"articles">;
  const title = str(formData, "title");
  const slug = str(formData, "slug");
  const type = str(formData, "type") as "blog" | "guide" | "faq" | "application";

  if (!id || !title || !slug || !type) {
    redirect("/admin/articles?error=required_fields");
  }

  try {
    const client = getAdminConvexClient();
    await client.mutation("mutations/admin/articles:updateArticle", {
      id,
      title,
      slug,
      type,
      excerpt: optionalStr(formData, "excerpt"),
      coverImage: optionalStr(formData, "coverImage"),
      content: optionalStr(formData, "content"),
      categoryIds: formData.has("categoryIds") ? JSON.parse(str(formData, "categoryIds")) : undefined,
      tagNames: formData.has("tagNames") ? JSON.parse(str(formData, "tagNames")) : undefined,
      status: str(formData, "status") as "draft" | "published" | "archived",
      seoTitle: optionalStr(formData, "seoTitle"),
      seoDescription: optionalStr(formData, "seoDescription"),
      canonical: optionalStr(formData, "canonical"),
    });

    revalidatePath("/admin/articles");
    redirect("/admin/articles?success=article_updated");
  } catch (error: any) {
    redirect(`/admin/articles?error=${encodeURIComponent(error.message)}`);
  }
}
```

### 3. Articles 列表页

```bash
mkdir -p app/admin/articles/create app/admin/articles/[id]/edit
```

`app/admin/articles/page.tsx`:

```typescript
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { Plus, Edit2, FileText } from "lucide-react";
import Link from "next/link";

export default async function ArticlesPage() {
  await requireAdmin();
  const { articles } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">文章管理</h1>
            <p className="text-zinc-600">管理博客、指南、FAQ 等内容</p>
          </div>
          <Link href="/admin/articles/create" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> 新建文章
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-600">总数</p>
            <p className="mt-2 text-3xl font-bold">{articles.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-600">已发布</p>
            <p className="mt-2 text-3xl font-bold">{articles.filter(a => a.status === "published").length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-600">草稿</p>
            <p className="mt-2 text-3xl font-bold">{articles.filter(a => a.status === "draft").length}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-600">归档</p>
            <p className="mt-2 text-3xl font-bold">{articles.filter(a => a.status === "archived").length}</p>
          </div>
        </div>

        {/* Articles Table */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3">
            <h3 className="text-sm font-semibold">文章列表</h3>
          </div>

          {articles.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium">暂无文章</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">标题</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">状态</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {articles.map((article) => (
                  <tr key={article._id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm capitalize">{article.type}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link href={`/admin/articles/${article._id}/edit`} className="font-medium hover:underline">
                        {article.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{article.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        article.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-700"
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/articles/${article._id}/edit`} className="inline-flex p-2 hover:bg-zinc-200 rounded-lg">
                        <Edit2 className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### 4. ArticleForm 组件

`app/admin/components/ArticleForm.tsx` (简化版):

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArticleAction, updateArticleAction } from "../actions";

export function ArticleForm({ article, categories = [] }: any) {
  const router = useRouter();
  const isEdit = !!article;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: article?.type || "blog",
    title: article?.title || "",
    slug: article?.slug || "",
    excerpt: article?.excerpt || "",
    content: article?.content || "",
    status: article?.status || "draft",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));

      if (isEdit) {
        data.append("id", article._id);
        await updateArticleAction(data);
      } else {
        await createArticleAction(data);
      }

      router.push("/admin/articles");
    } catch (err) {
      alert("操作失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">基础信息</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="blog">Blog</option>
              <option value="guide">Guide</option>
              <option value="faq">FAQ</option>
              <option value="application">Application</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">标题 *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">状态</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="published">已发布</option>
              <option value="archived">归档</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">摘要</label>
            <input
              type="text"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">内容（Markdown）</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-6 py-2.5 text-sm hover:bg-zinc-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {isLoading ? "保存中..." : isEdit ? "保存" : "创建"}
        </button>
      </div>
    </form>
  );
}
```

---

## 🔄 Inquiries 管理模块（只读）

Inquiries 页面主要是查看和状态更新，不需要创建功能。

`app/admin/inquiries/page.tsx`:

```typescript
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DashboardLayout } from "../components/DashboardLayout";
import { MessageSquare } from "lucide-react";

export default async function InquiriesPage() {
  await requireAdmin();
  const { inquiries } = await loadAdminData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">询盘管理</h1>
          <p className="text-zinc-600">查看和管理客户询盘</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-5">
          {["new", "in_progress", "resolved", "closed", "spam"].map((status) => (
            <div key={status} className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm font-medium text-zinc-600 capitalize">{status.replace("_", " ")}</p>
              <p className="mt-2 text-3xl font-bold">{inquiries.filter(i => i.status === status).length}</p>
            </div>
          ))}
        </div>

        {/* Inquiries Table */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-3">
            <h3 className="text-sm font-semibold">询盘列表</h3>
          </div>

          {inquiries.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-zinc-300" />
              <p className="mt-4 text-sm font-medium">暂无询盘</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">姓名</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">邮箱</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">公司</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase">日期</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry._id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 text-sm font-medium">{inquiry.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{inquiry.email}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600">{inquiry.company || "-"}</td>
                    <td className="px-6 py-4 text-sm capitalize">{inquiry.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        inquiry.status === "new" ? "bg-blue-100 text-blue-700" :
                        inquiry.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                        "bg-zinc-100 text-zinc-700"
                      }`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600">
                      {new Date(inquiry._creationTime).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

---

## 🔄 Families 管理模块

Families 与 Products 类似，但更简单（无属性模板）。

按照 Products 的模式创建：
- 列表页：`app/admin/families/page.tsx`
- 表单组件：`app/admin/components/FamilyForm.tsx`
- 创建页：`app/admin/families/create/page.tsx`
- 编辑页：`app/admin/families/[id]/edit/page.tsx`

---

## 📋 快速检查清单

### 必须添加到 Convex 的 Mutations:
- [x] Categories: delete, bulkUpdate
- [x] Products: delete, bulkUpdate
- [ ] Articles: delete, bulkUpdate
- [ ] Families: delete, bulkUpdate

### 必须添加到 Convex 的 Queries:
- [x] Categories: getById
- [ ] Products: getById
- [ ] Articles: getById
- [ ] Families: getById

### 必须创建的页面:
- [x] Categories: list, create, edit
- [x] Products: list, form
- [ ] Products: create, edit (使用上面的模板)
- [ ] Articles: list, form, create, edit
- [ ] Inquiries: list
- [ ] Families: list, form, create, edit

### 必须创建的组件:
- [x] CategoryForm
- [x] ProductForm
- [ ] ArticleForm
- [ ] FamilyForm

---

## 🚀 实施顺序

1. **完成 Products** (30分钟)
   - 创建 create/edit 页面
   - 添加 getProduct 查询
   - 测试

2. **完成 Articles** (20分钟)
   - 添加 mutations
   - 创建所有页面
   - 测试

3. **完成 Families** (15分钟)
   - 添加 mutations
   - 创建所有页面
   - 测试

4. **完成 Inquiries** (10分钟)
   - 创建列表页
   - 测试

5. **最终测试** (10分钟)
   - 测试所有页面
   - 修复bug
   - 构建验证

**总时间**: 约 1.5 小时

---

## 💡 提示

1. **复制粘贴模式**: 所有页面都遵循相同的模式，只是字段不同
2. **类型安全**: 使用 Convex 的类型系统确保类型正确
3. **表单验证**: 必填字段标记为 `required`
4. **错误处理**: 使用 try-catch 和友好的错误消息
5. **重定向**: 成功后重定向回列表页

---

所有模板都在这个文档中！你可以快速复制粘贴完成剩余的工作。
