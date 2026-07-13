import type { Locale } from "./config";

export type TerminologyEntry = {
  preferred: Record<Locale, string>;
  context: string;
  protected?: boolean;
};

export const TERMINOLOGY = {
  productFamily: {
    preferred: { en: "Product Family", ru: "Серия продукции" },
    context: "A reusable product series, not a biological family.",
  },
  specifications: {
    preferred: { en: "Specifications", ru: "Технические характеристики" },
    context: "Heading for structured technical attributes.",
  },
  requestQuote: {
    preferred: { en: "Request a Quote", ru: "Запросить коммерческое предложение" },
    context: "Primary commercial call to action.",
  },
  terminalBlock: {
    preferred: { en: "Terminal Block", ru: "Клеммная колодка" },
    context: "Electrical connection product category.",
  },
  ringTerminal: {
    preferred: { en: "Ring Terminal", ru: "Кольцевая клемма" },
    context: "Cable lug with a closed ring connection.",
  },
  forkTerminal: {
    preferred: { en: "Fork Terminal", ru: "Вилочная клемма" },
    context: "Cable terminal with an open fork connection.",
  },
  IEC: {
    preferred: { en: "IEC", ru: "IEC" },
    context: "Standards organization abbreviation.",
    protected: true,
  },
  UL: {
    preferred: { en: "UL", ru: "UL" },
    context: "Certification mark.",
    protected: true,
  },
  RoHS: {
    preferred: { en: "RoHS", ru: "RoHS" },
    context: "Compliance abbreviation.",
    protected: true,
  },
  AWG: {
    preferred: { en: "AWG", ru: "AWG" },
    context: "Wire gauge unit abbreviation.",
    protected: true,
  },
  SKU: {
    preferred: { en: "SKU", ru: "SKU" },
    context: "Stock keeping unit abbreviation.",
    protected: true,
  },
  BOM: {
    preferred: { en: "BOM", ru: "BOM" },
    context: "Bill of materials abbreviation.",
    protected: true,
  },
} as const satisfies Record<string, TerminologyEntry>;
