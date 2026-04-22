# Admin 管理系统实施指南

## 项目概述

完整的 B2B 工业产品管理系统，包含 6 个核心管理模块。

## 已完成的基础设施 ✅

### 1. 安装的库
- react-hook-form (7.71.2) - 表单管理
- @hookform/resolvers (5.2.2) - 表单解析器
- zod (4.3.6) - 验证库
- @tanstack/react-table (8.21.3) - 表格组件
- sonner (2.0.7) - Toast 通知
- date-fns (4.1.0) - 日期处理

### 2. 已创建的基础组件
- `app/admin/components/ui/Modal.tsx` - 模态对话框
- `app/admin/components/ui/ConfirmDialog.tsx` - 确认对话框
- `app/admin/components/ui/DataTable.tsx` - 数据表格
- `app/admin/components/DashboardLayout.tsx` - 布局容器
- `app/admin/components/Sidebar.tsx` - 侧边栏导航

### 3. 已存在的页面
- `app/admin/page.tsx` - 仪表盘首页（完整）
- `app/admin/login/page.tsx` - 登录页

---

## 实施步骤

### 阶段 1：完成后端 mutations（必需）

为每个实体添加删除和批量操作：

#### 1.1 Categories mutations

文件：`convex/mutations/admin/categories.ts`

```typescript
// 添加到现有文件
export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    // 检查是否有子分类
    const children = await ctx.db
      .query("categories")
      .withIndex("by_parentId", (q) => q.eq("parentId", args.id))
      .collect();

    if (children.length > 0) {
      throw new Error("无法删除：该分类下还有子分类");
    }

    // 检查是否有关联的产品系列
    const families = await ctx.db
      .query("productFamilies")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.id))
      .collect();

    if (families.length > 0) {
      throw new Error("无法删除：该分类下还有产品系列");
    }

    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateCategories = mutation({
  args: {
    ids: v.array(v.id("categories")),
    updates: v.object({
      status: v.optional(v.string()),
      isVisibleInNav: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, args.updates);
    }
  },
});
```

#### 1.2 Products mutations

文件：`convex/mutations/admin/products.ts`

```typescript
// 添加删除和批量操作
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const bulkUpdateProducts = mutation({
  args: {
    ids: v.array(v.id("products")),
    updates: v.object({
      status: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      categoryId: v.optional(v.id("categories")),
    }),
  },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.patch(id, args.updates);
    }
  },
});
```

类似地为 families, articles, inquiries 添加。

---

### 阶段 2：创建 Categories 管理页面

#### 2.1 创建页面结构

```bash
app/admin/categories/
├── page.tsx           # 列表页
├── create/
│   └── page.tsx       # 创建页
└── [id]/
    └── edit/
        └── page.tsx   # 编辑页
```

#### 2.2 列表页代码模板

`app/admin/categories/page.tsx`:

```typescript
import { requireAdmin } from "@/lib/admin-auth";
import { loadAdminData } from "@/lib/convex-admin";
import { DataTable } from "../components/ui/DataTable";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default async function CategoriesPage() {
  await requireAdmin();
  const { categories } = await loadAdminData();

  const columns = [
    {
      accessorKey: "name",
      header: "名称",
      cell: ({ row }) => (
        <Link
          href={`/admin/categories/${row.original._id}/edit`}
          className="font-medium hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "path",
      header: "路径",
    },
    {
      accessorKey: "status",
      header: "状态",
    },
    {
      accessorKey: "isVisibleInNav",
      header: "导航可见",
      cell: ({ row }) => (row.original.isVisibleInNav ? "是" : "否"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/categories/${row.original._id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">分类管理</h1>
          <p className="text-zinc-600">管理产品分类结构</p>
        </div>
        <Link href="/admin/categories/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建分类
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={categories} searchKey="name" />
    </div>
  );
}
```

#### 2.3 创建页代码模板

`app/admin/categories/create/page.tsx`:

```typescript
import { requireAdmin } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { CategoryForm } from "../../components/CategoryForm";

export default async function CreateCategoryPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">创建分类</h1>
        <p className="text-zinc-600">添加新的产品分类</p>
      </div>

      <CategoryForm />
    </div>
  );
}
```

#### 2.4 表单组件

创建 `app/admin/components/categories/CategoryForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  parentId: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  sortOrder: z.number(),
  status: z.enum(["draft", "published", "archived"]),
  isVisibleInNav: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export function CategoryForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      sortOrder: 0,
      status: "draft",
      isVisibleInNav: true,
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("创建失败");

      toast.success("分类创建成功");
      router.push("/admin/categories");
    } catch (error) {
      toast.error("创建失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 基础字段 */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">名称 *</label>
          <input
            {...register("name")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          {errors.name && (
            <p className="text-sm text-rose-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug *</label>
          <input
            {...register("slug")}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          {errors.slug && (
            <p className="text-sm text-rose-600 mt-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      {/* 其他字段... */}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-4 py-2"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading ? "创建中..." : "创建"}
        </button>
      </div>
    </form>
  );
}
```

---

### 阶段 3-8：其他页面实施

按照相同的模式实施：

**Product Families** - 与 Categories 类似，但更简单（无层级）
**Products** - 最复杂，需要属性编辑器
**Articles** - 需要 Markdown 编辑器
**Inquiries** - 只读为主，主要更新状态
**Settings** - 多个子页面

---

## 关键代码模式总结

### 列表页模式
1. 加载数据
2. 定义表格列
3. 使用 DataTable 组件渲染
4. 提供筛选和批量操作

### 表单页模式
1. 定义 Zod schema
2. 使用 react-hook-form
3. 提交到 API route 或 server action
4. 成功后重定向

### 编辑页模式
1. 加载现有数据
2. 预填充表单
3. 更新而非创建

---

## 下一步行动

由于完整实施需要创建约 50+ 个文件，我建议：

**选项 A：** 我继续完成高优先级页面（Categories → Products → Articles）
**选项 B：** 我创建完整的代码生成模板，你可以快速复制
**选项 C：** 我专注于一两个完整的页面作为示例，你复制模式

你希望我采用哪种方式继续？

---

## 注意事项

1. **API Routes vs Server Actions** - 当前使用 Server Actions，保持一致
2. **类型安全** - 使用 Convex 的类型系统
3. **错误处理** - 统一使用 toast 通知
4. **权限检查** - 每个页面都调用 `requireAdmin()`
5. **SEO** - 所有表单都包含 SEO 字段
6. **图片上传** - 先使用 URL，后续可添加文件上传

---

## 预期成果

完成后你将拥有：
- 6 个完整的管理页面
- 统一的 CRUD 操作界面
- 批量操作支持
- 高级筛选和搜索
- 响应式设计
- 类型安全的数据操作

预计总代码量：约 8000-12000 行
