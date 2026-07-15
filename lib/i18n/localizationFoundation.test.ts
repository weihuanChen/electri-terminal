import { describe, expect, it } from "vitest";
import {
  assertCanonicalIntentContract,
  assertIntentDeltaBaseReference,
  assertIntentPatchOperations,
  applyIntentPatch,
  buildSourceFieldHashes,
  getIntentConfidenceBand,
  hashLocalizationFoundationValue,
  normalizeFoundationKey,
  normalizeLocale,
  requiresManualIntentReview,
  stableLocalizationValue,
} from "@/convex/lib/localizationFoundation";

const baseIntent = {
  schemaVersion: 1 as const,
  pageRole: "product_selection",
  primaryAudience: ["electrical_engineer"],
  buyerStage: ["evaluation"],
  primaryGoal: "Select a suitable product",
  primaryConceptIds: ["ring_terminal"],
  secondaryConceptIds: [],
  mustCommunicate: [
    {
      key: "scope",
      intent: "Define the range",
      evidencePaths: ["family.summary"],
    },
  ],
  verifiedClaims: [],
  prohibitedClaims: ["Unsupported certifications"],
  conversionIntent: { primaryAction: "request_quote" },
  sectionIntents: [
    {
      sectionKey: "overview",
      purpose: "Define the product",
      requiredConceptIds: ["ring_terminal"],
      requiredFactPaths: ["product.summary"],
    },
  ],
};

describe("localization foundation contracts", () => {
  it("produces stable hashes regardless of object key order", () => {
    const left = {
      title: "Ring Terminal",
      facts: { material: "Copper", size: 4 },
    };
    const right = {
      facts: { size: 4, material: "Copper" },
      title: "Ring Terminal",
    };

    expect(stableLocalizationValue(left)).toBe(stableLocalizationValue(right));
    expect(hashLocalizationFoundationValue(left)).toBe(
      hashLocalizationFoundationValue(right),
    );
  });

  it("creates independent top-level source field hashes", () => {
    const hashes = buildSourceFieldHashes({
      title: "Ring Terminal",
      summary: "For industrial wiring",
    });

    expect(hashes.title).toHaveLength(8);
    expect(hashes.summary).toHaveLength(8);
    expect(hashes.title).not.toBe(hashes.summary);
  });

  it("normalizes locale and registry keys", () => {
    expect(normalizeLocale(" RU ")).toBe("ru");
    expect(normalizeLocale("pt-BR")).toBe("pt-br");
    expect(normalizeFoundationKey(" Ring Terminal Connector ", "key")).toBe(
      "ring_terminal_connector",
    );
  });

  it("rejects malformed locale values", () => {
    expect(() => normalizeLocale("russian")).toThrow("invalid_locale");
  });

  it("requires evidence-backed communication intent", () => {
    expect(() =>
      assertCanonicalIntentContract({
        primaryGoal: "Support product selection",
        primaryAudience: ["electrical_engineer"],
        mustCommunicate: [
          { key: "scope", intent: "Define the family", evidencePaths: [] },
        ],
        sectionIntents: [
          { sectionKey: "overview", purpose: "Define the product" },
        ],
      }),
    ).toThrow("canonical_intent_communication_evidence_required");
  });

  it("reports a stable field error for an empty generated intent", () => {
    expect(() => assertCanonicalIntentContract({})).toThrow(
      "canonical_intent_primary_goal_required",
    );
  });

  it("accepts a v2 canonical intent with inheritance-aware evidence policy", () => {
    expect(() =>
      assertCanonicalIntentContract({
        schemaVersion: 2,
        pageRole: "industrial_product_selection",
        entityScope: "product_group",
        primaryGoal: "Help buyers select the appropriate product group",
        buyerStage: ["evaluation"],
        primaryAudience: ["electrical_engineer"],
        conversionIntent: { primaryAction: "request_quote" },
        mustCommunicate: [
          {
            key: "product_definition",
            intent: "Define the shared product group",
            inheritanceMode: "shared",
            evidenceRequirement: "approved_group_or_page_evidence",
          },
        ],
        sectionIntents: [
          {
            sectionKey: "overview",
            purpose: "Define the product group",
            inheritanceMode: "shared",
            requiredEvidenceClass: "group_definition",
          },
        ],
        prohibitedClaims: [],
        primaryConceptIds: [],
        secondaryConceptIds: [],
        verifiedClaims: [],
      }),
    ).not.toThrow();
  });

  it("accepts a minimal valid canonical intent contract", () => {
    expect(() =>
      assertCanonicalIntentContract({
        primaryGoal: "Support product selection",
        primaryAudience: ["electrical_engineer"],
        mustCommunicate: [
          {
            key: "scope",
            intent: "Define the family",
            evidencePaths: ["family.summary"],
          },
        ],
        sectionIntents: [
          { sectionKey: "overview", purpose: "Define the product" },
        ],
      }),
    ).not.toThrow();
  });

  it("routes exact confidence boundaries", () => {
    expect(getIntentConfidenceBand()).toBe("pending");
    expect(getIntentConfidenceBand(0.9)).toBe("high");
    expect(getIntentConfidenceBand(0.75)).toBe("medium");
    expect(getIntentConfidenceBand(0.7499)).toBe("low");
    expect(() => getIntentConfidenceBand(1.01)).toThrow(
      "intent_confidence_out_of_range",
    );
  });

  it("requires stable keys for keyed intent patch targets", () => {
    expect(() =>
      assertIntentPatchOperations([
        {
          operation: "replace",
          target: "sectionIntents",
          value: { purpose: "Emphasize the current range" },
          reason: "Group specification range changes selection guidance",
          evidencePaths: ["products[*].attributes.rated_current"],
        },
      ]),
    ).toThrow("intent_patch_item_key_required:sectionIntents");
  });

  it("requires values for add and replace but forbids them for remove", () => {
    expect(() =>
      assertIntentPatchOperations([
        {
          operation: "add",
          target: "primaryConceptIds",
          reason: "Add group concept",
          evidencePaths: ["conceptBindings"],
        },
      ]),
    ).toThrow("intent_patch_value_required");

    expect(() =>
      assertIntentPatchOperations([
        {
          operation: "remove",
          target: "mustCommunicate",
          itemKey: "legacy_scope",
          value: "unexpected",
          reason: "Remove an inapplicable inherited goal",
          evidencePaths: [],
        },
      ]),
    ).toThrow("intent_patch_remove_cannot_have_value");
  });

  it("validates delta base references by base kind", () => {
    expect(() =>
      assertIntentDeltaBaseReference({
        baseKind: "l1_policy_baseline",
      }),
    ).not.toThrow();
    expect(() =>
      assertIntentDeltaBaseReference({
        baseKind: "l1_previous_revision",
        baseCanonicalIntentRevisionId: "intent-revision-1",
      }),
    ).not.toThrow();
    expect(() =>
      assertIntentDeltaBaseReference({
        baseKind: "product_group_revision",
        baseCanonicalIntentRevisionId: "wrong-base",
      }),
    ).toThrow("intent_delta_product_group_base_required");
  });

  it("forces manual review for open mandatory conflicts regardless of confidence", () => {
    expect(
      requiresManualIntentReview([
        { category: "material_conflict", status: "open" },
      ]),
    ).toBe(true);
    expect(
      requiresManualIntentReview([
        { category: "material_conflict", status: "resolved" },
        { category: "rated_voltage_conflict", status: "open" },
      ]),
    ).toBe(false);
  });

  it("resolves keyed and list patches without relying on array position", () => {
    const resolved = applyIntentPatch(baseIntent, [
      {
        operation: "replace",
        target: "sectionIntents",
        itemKey: "overview",
        value: {
          purpose: "Explain the high-current range",
          requiredConceptIds: ["ring_terminal"],
          requiredFactPaths: ["product.ratedCurrent"],
        },
        reason: "Group range differs",
        evidencePaths: ["product.ratedCurrent"],
      },
      {
        operation: "add",
        target: "primaryAudience",
        value: "industrial_buyer",
        reason: "Purchasing audience is relevant",
        evidencePaths: ["family.summary"],
      },
    ]);

    expect(resolved.sectionIntents[0]).toMatchObject({
      sectionKey: "overview",
      purpose: "Explain the high-current range",
    });
    expect(resolved.primaryAudience).toEqual([
      "electrical_engineer",
      "industrial_buyer",
    ]);
    expect(baseIntent.sectionIntents[0].purpose).toBe("Define the product");
  });

  it("rejects keyed patch operations that point to missing inherited items", () => {
    expect(() =>
      applyIntentPatch(baseIntent, [
        {
          operation: "remove",
          target: "mustCommunicate",
          itemKey: "not_present",
          reason: "Not applicable",
          evidencePaths: [],
        },
      ]),
    ).toThrow("intent_patch_item_not_found:mustCommunicate:not_present");
  });
});
