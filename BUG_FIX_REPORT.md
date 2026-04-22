# Bug修复报告

## 问题描述

### Bug 1: Client Component Context Error
```
createContext only works in Client Components.
Add the "use client" directive at the top of the file to use it.
```

### Bug 2: Incorrect API Import Path
```
api.modules.navigation.getPublicNavigation is not a function
```

## 问题原因

### Bug 1
在Next.js 13+的App Router中,使用了React Context或hooks(如`useQuery` from Convex)的组件必须标记为Client Component,需要在文件顶部添加`"use client"`指令。

### Bug 2
组件中调用了错误的API路径:
- 使用了 `api.modules.xxx.xxx` (管理端API路径)
- 应该使用 `api.frontend.xxx` (前端API路径)

## 修复的文件

### ✅ 已修复 (7个页面文件)

1. **app/page.tsx** - 首页
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery` from Convex

2. **app/categories/[slug]/page.tsx** - 分类详情页
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery` 和 `useState`

3. **app/families/[slug]/page.tsx** - 产品系列页
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery`

4. **app/products/[slug]/page.tsx** - 产品详情页
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery`

5. **app/blog/page.tsx** - 博客列表页
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery` 和 `useState`

6. **app/blog/[slug]/page.tsx** - 博客文章页
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery`

7. **app/categories/page.tsx** - 分类列表页
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery`

### ✅ 已修复 (1个布局组件)

8. **components/layout/Footer.tsx** - 页脚组件
   - 添加: `"use client";`
   - 原因: 使用了 `useQuery`

### ✅ 已确认正确 (3个页面文件)

这些文件创建时已经包含`"use client"`指令:

1. **app/contact/page.tsx** ✅
2. **app/rfq/page.tsx** ✅
3. **app/resources/page.tsx** ✅

### ✅ 已修复 API路径 (4个文件)

修改了错误的API导入路径:

1. **components/layout/Header.tsx**
   - 修改前: `api.modules.navigation.getPublicNavigation`
   - 修改后: `api.frontend.getPublicNavigation`

2. **components/layout/Footer.tsx**
   - 修改前: `api.modules.navigation.getPublicNavigation`
   - 修改后: `api.frontend.getPublicNavigation`

3. **app/blog/page.tsx**
   - 修改前: `api.modules.categories.listCategories`
   - 修改后: `api.frontend.listCategoriesForPublic`

4. **app/categories/page.tsx**
   - 修改前: `api.modules.categories.listCategories`
   - 修改后: `api.frontend.listCategoriesForPublic`

### ✅ 已确认正确 (2个组件)

1. **components/layout/Header.tsx** ✅
   - 已包含 `"use client";`
   - 使用了 `useState` 和 `useQuery`

2. **components/shared/InquiryForm.tsx** ✅
   - 已包含 `"use client";`
   - 使用了 `useState` 和 `useAction`

## 修复方式

在每个文件的开头添加:
```typescript
"use client";

import { useQuery } from "convex/react";
// ... 其他imports
```

## 总计修复

- **页面文件**: 7个
- **布局组件**: 1个
- **总计**: 8个文件

## 验证

修复后,所有页面和组件应该能够正常运行,不再出现Context错误。

## 技术说明

### Server Components vs Client Components

**Server Components** (默认):
- 在服务器上渲染
- 不能使用hooks或Context
- 更好的性能

**Client Components** (标记为"use client"):
- 在客户端渲染
- 可以使用React hooks和Context
- 支持交互功能

### 何时使用 "use client"

需要添加`"use client"`的情况:
- ✅ 使用useState, useEffect等hooks
- ✅ 使用Context API
- ✅ 使用事件处理器(onClick, onChange等)
- ✅ 使用浏览器API(window, document等)
- ✅ 使用第三方需要客户端的库(Convex useQuery等)

## 下一步

修复完成后,项目应该可以正常运行。如果还有其他错误,请查看:
1. 依赖是否正确安装 (`pnpm install`)
2. Convex后端是否运行 (`npx convex dev`)
3. 环境变量是否配置 (`.env.local`)
