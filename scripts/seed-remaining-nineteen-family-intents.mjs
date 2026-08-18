import { ConvexHttpClient } from "convex/browser";
import { finalNineFamilies } from "./seed-final-nine-family-intents.mjs";
import {
  nextTenFamilies,
  seedFamilyIntentTemplatesAndGroups,
} from "./seed-next-ten-family-intent-templates.mjs";

const url =
  process.env.CONVEX_SERVER_URL || process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) throw new Error("convex_url_required");

const productionFamilyAliases = new Map([
  ["Fully Insulated Quick Disconnects", "Fully Insulated Terminals"],
]);

const client = new ConvexHttpClient(url);
const workspace = await client.query(
  "queries/modules/intentHierarchy:getIntentHierarchyWorkspace",
  {},
);
const deploymentFamilyIds = new Map(
  workspace.families.map((family) => [family.name, family._id]),
);

const definitions = [...nextTenFamilies, ...finalNineFamilies];
const deploymentFamilies = definitions.map((family) => {
  const deploymentName = productionFamilyAliases.get(family.name) ?? family.name;
  const familyId = deploymentFamilyIds.get(deploymentName);
  if (!familyId) {
    throw new Error(`product_family_not_found:${family.name}`);
  }
  return { ...family, id: familyId };
});

await seedFamilyIntentTemplatesAndGroups(deploymentFamilies);
