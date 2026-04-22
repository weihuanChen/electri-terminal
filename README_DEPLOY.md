# 🚀 部署步骤指南

## 当前问题
```
Could not find public function for 'frontend:getPublicNavigation'
```

## ✅ 已完成的修复
1. ✅ 移动`frontend.ts`到`convex/`根目录
2. ✅ 创建`convex/queries.ts`导出文件
3. ✅ 创建`convex/mutations.ts`导出文件

## 📋 需要执行的步骤

### 步骤1: 停止所有运行的服务
如果正在运行,请先停止:
- `npm run dev` 或 `pnpm dev`
- `npx convex dev`

### 步骤2: 删除旧的生成文件
```bash
rm -rf convex/_generated
```

### 步骤3: 重新安装依赖(可选,但推荐)
```bash
pnpm install
```

### 步骤4: 启动Convex开发服务器
```bash
npx convex dev
```

**重要**: 等待看到类似这样的输出:
```
✓ Connected to Convex deployment (glad-deer-519)
✓ Finished configuring functions
```

### 步骤5: 在新的终端窗口启动Next.js
```bash
pnpm dev
```

### 步骤6: 验证
打开浏览器访问 `http://localhost:3000`

您应该能看到:
- ✅ 首页正常加载
- ✅ 导航菜单显示
- ✅ 没有Convex错误

## 🔍 故障排查

### 如果仍然看到错误

#### 选项1: 检查Convex函数列表
```bash
npx convex function list
```

您应该看到frontend相关的函数。

#### 选项2: 重新部署到Convex
```bash
npx convex deploy --dry-run
```

#### 选项3: 检查环境变量
确保`.env.local`包含:
```
NEXT_PUBLIC_CONVEX_URL=https://glad-deer-519.convex.cloud
```

#### 选项4: 清除Next.js缓存
```bash
rm -rf .next
pnpm dev
```

## 📁 文件结构(修复后)

```
convex/
├── frontend.ts          ← 新增(从queries/移来)
├── queries.ts           ← 新增(导出queries)
├── mutations.ts         ← 新增(导出mutations)
├── schema.ts
├── _generated/          ← 自动生成
├── queries/
│   ├── frontend.ts      ← 已移除
│   ├── index.ts
│   └── modules/
└── mutations/
    └── ...
```

## ⚡ 快速修复(一键执行)

如果上述步骤太多,可以试试这个快速版本:

```bash
# 一键脚本
rm -rf convex/_generated .next && npx convex dev & sleep 5 && pnpm dev
```

## 🎯 预期结果

成功后,您会在控制台看到:
```
✓ Convex functions:
  - frontend:listCategoriesForPublic
  - frontend:getPublicNavigation
  ...
```

**现在请执行步骤4: `npx convex dev` 🚀**
