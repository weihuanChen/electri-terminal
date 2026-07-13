import { describe, expect, it } from "vitest";
import { isStaticPageStructuredContent } from "./staticPageContent";

describe("static page structured content", () => {
  it("recognizes the versioned page envelope", () => {
    expect(isStaticPageStructuredContent({ schemaVersion: 1, pageKey: "home", sourcePath: "/", blocks: [] })).toBe(true);
    expect(isStaticPageStructuredContent({ schemaVersion: 2, pageKey: "home", sourcePath: "/", blocks: [] })).toBe(false);
    expect(isStaticPageStructuredContent({ schemaVersion: 1, pageKey: "home", blocks: [] })).toBe(false);
    expect(isStaticPageStructuredContent({ schemaVersion: 1, pageKey: "home", sourcePath: "/", blocks: [{ id: "bad" }] })).toBe(false);
  });
});
