# Convex management access

The site's administrator login is a Next.js session. Convex has no user auth
provider, so management queries and mutations under `queries/modules/` and
`mutations/admin/` are internal functions. The published-only
`listPublicArticleCards` query is the exception. Server-side calls use a
deployment-scoped Convex deploy key in the project's custom `CONVEX_ADMIN_KEY`
environment variable. R2 bucket listing and LLM Lab management functions are
also internal. Public browser calls remain in `convex/frontend.ts` and must
return published data only.

## Required secret

Set `CONVEX_ADMIN_KEY` on the Next.js server and on machines running catalog
maintenance scripts. Generate a dedicated key for the deployment named by
`CONVEX_SERVER_URL` or `NEXT_PUBLIC_CONVEX_URL`, granting only
`deployment:functions:runInternalQueries`,
`deployment:functions:runInternalMutations`, and
`deployment:functions:runInternalActions`. The variable name is application
specific; it is separate from the CLI's `CONVEX_DEPLOY_KEY`. Do not prefix it
with `NEXT_PUBLIC_`, put it in Git, or expose it to browser code. Keep the
existing `ADMIN_SESSION_SECRET` for the Next.js login; it is a different key.

The Convex HTTP backfill routes also require `COPY_BACKFILL_TOKEN` in the Convex
deployment environment. They now return 503 when that token is absent.

## Rollout

1. Configure `CONVEX_ADMIN_KEY` on the Next.js deployment before deploying
   these changes. Verify the key belongs to the deployment whose URL is used by
   the Next.js server. Do not infer the target from `.env.local` alone: its
   `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` can identify different
   deployments.
2. Deploy the Next.js app, then deploy the Convex functions. The new sitemap
   reader temporarily falls back to the old query while the backend is being
   upgraded.
3. Run `pnpm backfill:article-derived-data --prod` and
   `pnpm backfill:sitemap-cards --prod` after the backend deploy. Use
   `--deployment <name>` instead of `--prod` for another deployment.
4. Check an administrator edit, a public article, a draft article (404), a
   category page, and both sitemap endpoints. Compare Convex function read
   bytes after the rollout.

Public functions in other Convex modules should be reviewed separately before
adding any new administrator workflow. A Next.js route guard never protects a
Convex public function from a direct call.
