import { describe, expect, it } from "vitest";

import { resolveRecommendationProductIds } from "./recommendationGroups";

describe("resolveRecommendationProductIds", () => {
  it("keeps group and product order while removing duplicates", () => {
    expect(
      resolveRecommendationProductIds(
        [
          { status: "published", productIds: ["p1", "p2", "p3"] },
          { status: "published", productIds: ["p3", "p4"] },
        ],
        ["p2", "p5"],
      ),
    ).toEqual(["p1", "p2", "p3", "p4", "p5"]);
  });

  it("ignores missing, draft, and archived groups", () => {
    expect(
      resolveRecommendationProductIds(
        [
          null,
          { status: "draft", productIds: ["draft-product"] },
          { status: "archived", productIds: ["archived-product"] },
        ],
        ["explicit-product"],
      ),
    ).toEqual(["explicit-product"]);
  });
});
