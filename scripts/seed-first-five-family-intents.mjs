import { ConvexHttpClient } from "convex/browser";
import { families } from "./seed-first-five-intent-hierarchy.mjs";
import { seedFamilyIntentTemplatesAndGroups } from "./seed-next-ten-family-intent-templates.mjs";

const url =
  process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("convex_url_required");

const client = new ConvexHttpClient(url);
const workspace = await client.query(
  "queries/modules/intentHierarchy:getIntentHierarchyWorkspace",
  {},
);

const deploymentFamilyIds = new Map(
  workspace.families.map((family) => [family.name, family._id]),
);
const deploymentFamilies = families.map((family) => {
  const familyId = deploymentFamilyIds.get(family.name);
  if (!familyId) {
    throw new Error(`product_family_not_found:${family.name}`);
  }
  return { ...family, id: familyId };
});

await seedFamilyIntentTemplatesAndGroups(deploymentFamilies);
