import { describe, expect, it } from "vitest";

import { getLocalizedRouteEntity, matchLocalizedRoute } from "./localizedRoutes";

describe("localized route matching", () => {
  it.each([
    ["/", "staticPage", "home"],
    ["/contact", "staticPage", "contact"],
    ["/categories/connectors", "category", "connectors"],
    ["/families/uk", "family", "uk"],
    ["/products/uk-2-5", "product", "uk-2-5"],
    ["/blog/how-to-select", "article", "how-to-select"],
    ["/blog/page/2", "blogPage", 2],
  ] as const)("matches %s as %s", (path, kind, identity) => {
    const route = matchLocalizedRoute("ru", path);
    expect(route?.kind).toBe(kind);

    if (route?.kind === "staticPage") expect(route.pageKey).toBe(identity);
    if ("slug" in (route ?? {})) expect((route as { slug: string }).slug).toBe(identity);
    if (route?.kind === "blogPage") expect(route.page).toBe(identity);
  });

  it.each([
    "/unknown",
    "/products/a/extra",
    "/blog/page/1",
    "/blog/page/0",
    "/blog/page/-2",
    "/blog/page/not-a-number",
    "/blog/page/9007199254740992",
  ])("rejects unsupported path %s", (path) => {
    expect(matchLocalizedRoute("ru", path)).toBeNull();
  });

  it("converts route matches to URL entities", () => {
    const product = matchLocalizedRoute("ru", "/products/uk-2-5");
    const blogPage = matchLocalizedRoute("ru", "/blog/page/3");

    expect(product && getLocalizedRouteEntity(product)).toEqual({
      type: "product",
      slug: "uk-2-5",
    });
    expect(blogPage && getLocalizedRouteEntity(blogPage)).toEqual({
      type: "blogPage",
      page: 3,
    });
  });
});
