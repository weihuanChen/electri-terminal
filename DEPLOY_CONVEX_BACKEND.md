# 修复步骤: 部署Convex后端

## 问题
```
Could not find public function for 'frontend:getPublicNavigation'.
Did you forget to run `npx convex dev` or `npx convex deploy`?
```

## 原因
我们创建了新的`convex/queries/frontend.ts`文件,但Convex后端还没有部署这些新函数。

## 解决方案

### 步骤1: 创建queries导出文件 ✅
已创建: `convex/queries/index.ts`
```typescript
import * as frontend from "./frontend";
import * as modules from "./modules";
import * as common from "./common";

export { frontend, modules, common };

export * from "./frontend";
export * from "./common";
```

### 步骤2: 重新生成Convex类型
```bash
npx convex dev
```

这会:
1. 生成新的API类型
2. 上传新的查询函数到Convex
3. 启动开发服务器

### 步骤3: 验证
启动后,你应该看到类似的输出:
```
Convex function URLs:
  frontend:listCategoriesForPublic
  frontend:listFeaturedFamilies
  frontend:listLatestArticles
  frontend:getCategoryWithChildren
  frontend:getCategoryContent
  frontend:getFamilyWithProducts
  frontend:getProductBySlug
  frontend:getArticleBySlug
  frontend:getPublicNavigation
```

## 如果问题仍然存在

### 选项A: 使用Convex CLI重新部署
```bash
# 1. 停止现有的convex dev进程
# 2. 重新部署
npx convex deploy
```

### 选项B: 清除并重新生成
```bash
# 1. 删除生成的文件
rm -rf convex/_generated

# 2. 重新启动
npx convex dev
```

### 选项C: 检查环境变量
确保`.env.local`中有正确的Convex URL:
```
NEXT_PUBLIC_CONVEX_URL=https://glad-deer-519.convex.cloud
```

## 常见问题

### Q: 为什么需要重新部署?
A: Convex需要知道所有可用的函数。添加新文件后需要重新同步。

### Q: 会不会丢失数据?
A: 不会。这只更新函数定义,不影响现有数据。

### Q: 多久需要做一次?
A: 每次添加新的query、mutation或action时。

## 下一步

1. 运行 `npx convex dev`
2. 等待部署完成
3. 刷新浏览器
4. 应用应该可以正常工作了!

**现在运行 `npx convex dev` 来部署新函数! 🚀**
