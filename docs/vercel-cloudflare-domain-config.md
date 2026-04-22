# Cloudflare 域名托管 + Vercel 部署配置文档

## 1. 目标与适用范围

本文用于以下架构：

- 域名 DNS 托管在 Cloudflare
- Next.js 应用部署在 Vercel
- 仅使用 Cloudflare 做 DNS（不做反向代理/CDN）

适用于生产域名与预发布域名接入。

---

## 2. 推荐架构与原则

推荐模式：

- Cloudflare：仅做权威 DNS（`DNS only`，灰云）
- Vercel：负责应用托管、证书、路由、缓存与流量接入

不推荐模式：

- Cloudflare 橙云代理在 Vercel 前面（可能导致缓存、性能与安全可见性问题）

---

## 3. 前置条件

1. Vercel 项目已成功部署，存在可访问的 `*.vercel.app` 域名。
2. Cloudflare 已接管目标域名（Name Server 已生效）。
3. 你有以下权限：
   - Vercel 项目 `Settings > Domains`
   - Cloudflare `DNS` 编辑权限

---

## 4. 标准 DNS 方案（推荐）

以 `example.com` 为例：

1. 根域（apex）：
   - 类型：`A`
   - 名称：`@`
   - 值：`76.76.21.21`
   - Proxy status：`DNS only`
2. `www` 子域：
   - 类型：`CNAME`
   - 名称：`www`
   - 值：以 Vercel 后台提示为准（常见为 `cname.vercel-dns.com` 或平台给出的目标）
   - Proxy status：`DNS only`

说明：

- 记录值以 Vercel 控制台该域名页面的实时提示为准。
- `TTL` 建议 `Auto`。

---

## 5. 配置步骤（逐步执行）

### 步骤 1：在 Vercel 添加域名

1. 进入项目：`Project > Settings > Domains`
2. 添加：
   - `example.com`
   - `www.example.com`
3. 查看 Vercel 给出的 DNS 记录要求（A/CNAME/TXT）

### 步骤 2：在 Cloudflare 配置 DNS 记录

1. 进入 Cloudflare 对应 Zone 的 `DNS` 页面。
2. 按 Vercel 提示添加或更新记录。
3. 所有指向 Vercel 的记录将 `Proxy status` 设为 `DNS only`（灰云）。

### 步骤 3：等待域名验证

1. 回到 Vercel `Domains` 页面。
2. 等待状态变为 `Valid Configuration`。
3. 如需验证所有权，按提示添加 `TXT` 记录。

### 步骤 4：设置主域与重定向

建议：

1. 选择一个主域（常见为 `www.example.com`）。
2. 在 Vercel 中将另一个域名做 301 重定向到主域（避免 SEO 分流）。

### 步骤 5：上线后校验

执行以下检查：

```bash
# DNS 结果
dig +short example.com
dig +short www.example.com

# HTTP 状态与跳转
curl -I https://example.com
curl -I https://www.example.com
```

预期：

- 两个域名都可访问
- 非主域 301 到主域
- 证书正常（浏览器无 HTTPS 告警）

---

## 6. 变更窗口建议

1. 在低流量时段变更。
2. 先添加新记录，再删除旧记录。
3. 保留旧平台 DNS 记录快照，便于快速回滚。

---

## 7. 常见问题与排查

### 问题 1：Vercel 显示 `Invalid Configuration`

排查：

1. 记录值是否与 Vercel 提示完全一致。
2. Cloudflare 代理是否误开成橙云。
3. 是否存在冲突记录（同名 `A` 与 `CNAME` 冲突）。
4. 是否缺少 Vercel 要求的 `TXT` 验证记录。

### 问题 2：浏览器证书异常

排查：

1. 等待证书签发完成（初次接入可能需要一些时间）。
2. 确认域名已在 Vercel 项目中绑定成功。
3. Cloudflare 侧该记录保持 `DNS only`。

### 问题 3：访问命中旧站点

排查：

1. 本地/运营商 DNS 缓存未刷新，等待传播或切换网络验证。
2. 使用 `dig` 对权威解析结果做确认。

---

## 8. 回滚方案

若新链路异常，可执行：

1. 在 Cloudflare 将域名记录改回旧平台目标（旧 A/CNAME）。
2. 在 Vercel 保留域名配置，不影响后续再次切换。
3. 验证回滚后业务恢复，再进行复盘与二次切换。

---

## 9. 执行清单（Checklist）

- [ ] Vercel 项目部署成功（`*.vercel.app` 可访问）
- [ ] 域名已添加到 Vercel 项目
- [ ] Cloudflare DNS 记录按 Vercel 要求配置
- [ ] 指向 Vercel 的记录均为 `DNS only`（灰云）
- [ ] Vercel 域名状态为 `Valid Configuration`
- [ ] 主域与 301 重定向配置完成
- [ ] `dig`/`curl` 验证通过
- [ ] 监控与日志观察 24 小时无异常

---

## 10. 参考资料

- Vercel 自定义域名配置  
  https://vercel.com/docs/domains/working-with-domains/add-a-domain
- Vercel 域名设置快速指南  
  https://vercel.com/docs/domains/set-up-custom-domain
- Vercel 关于 Cloudflare 与反向代理建议  
  https://vercel.com/kb/guide/cloudflare-with-vercel

