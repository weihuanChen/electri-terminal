import type { MutationCtx } from "../_generated/server";

type EntityType = "category" | "family" | "product" | "article" | "staticPage";

function stableValue(value: unknown): string {
  if (value === undefined) return "";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, child]) => `${JSON.stringify(key)}:${stableValue(child)}`)
    .join(",")}}`;
}

export function hashLocalizationSourceValue(value: unknown) {
  const input = stableValue(value);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function getChangedTranslatableFieldKeys(args: {
  current: Record<string, unknown>;
  updates: Record<string, unknown>;
  translatableFieldKeys: readonly string[];
}) {
  return args.translatableFieldKeys.filter(
    (key) => key in args.updates && stableValue(args.updates[key]) !== stableValue(args.current[key])
  );
}

export async function markChangedSourceLocalizationsStale(args: {
  ctx: MutationCtx;
  entityType: EntityType;
  sourceId: string;
  current: Record<string, unknown>;
  updates: Record<string, unknown>;
  translatableFieldKeys: readonly string[];
}) {
  const changedFieldKeys = getChangedTranslatableFieldKeys(args);
  if (changedFieldKeys.length === 0) return 0;

  const nextFields = Object.fromEntries(
    args.translatableFieldKeys.map((key) => [
      key,
      key in args.updates ? args.updates[key] : args.current[key],
    ])
  );
  const sourceFieldHashes = Object.fromEntries(
    Object.entries(nextFields).map(([key, value]) => [key, hashLocalizationSourceValue(value)])
  );
  const records = await args.ctx.db
    .query("localizations")
    .withIndex("by_entity", (q) =>
      q.eq("entityType", args.entityType).eq("sourceId", args.sourceId)
    )
    .collect();
  const now = Date.now();
  let updated = 0;

  for (const record of records) {
    if (record.status === "missing" || record.status === "draft") continue;
    await args.ctx.db.patch(record._id, {
      status: "stale",
      staleReason: "source_fields_changed",
      staleSourceUpdatedAt: now,
      sourceUpdatedAt: now,
      sourceContentHash: hashLocalizationSourceValue(nextFields),
      sourceFieldHashes,
      changedFieldKeys,
      updatedAt: now,
    });
    updated += 1;
  }
  return updated;
}
