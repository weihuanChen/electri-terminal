import { api, internal } from "../convex/_generated/api";

// These references are checked by `pnpm typecheck` and keep management APIs
// from accidentally becoming public during later refactors.
void internal.mutations.admin.articles.createArticle;
void internal.mutations.admin.products.updateProduct;
void internal.queries.modules.articles.listArticles;
void internal.actions.r2.listBucketObjects;
void internal.llmLab.startRun;

// @ts-expect-error Article writes must not be exposed on the public API.
void api.mutations.admin.articles.createArticle;
// @ts-expect-error Product writes must not be exposed on the public API.
void api.mutations.admin.products.updateProduct;
// @ts-expect-error Draft article listing must not be exposed on the public API.
void api.queries.modules.articles.listArticles;
// @ts-expect-error R2 bucket listing must not be exposed on the public API.
void api.actions.r2.listBucketObjects;
// @ts-expect-error LLM Lab writes must not be exposed on the public API.
void api.llmLab.startRun;
