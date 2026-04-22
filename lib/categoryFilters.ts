import { matchesAttributeFilterValue } from "@/lib/productPresentation";

export type CategoryContentView = "all" | "families" | "products";

export type CategoryFilterState = Record<string, string[]>;

type FilterOption = {
  value: string;
};

type FilterGroup = {
  id: string;
  options: FilterOption[];
};

const FILTER_PREFIX = "filter_";

export function parseCategoryContentView(value: string | string[] | undefined): CategoryContentView {
  if (typeof value === "string" && (value === "families" || value === "products")) {
    return value;
  }
  return "all";
}

export function parseCategoryFilterState(
  searchParams: Record<string, string | string[] | undefined>,
  groups: FilterGroup[]
): CategoryFilterState {
  const allowed = new Map(
    groups.map((group) => [group.id, new Set(group.options.map((option) => option.value))])
  );

  const filters: CategoryFilterState = {};

  for (const [key, rawValue] of Object.entries(searchParams)) {
    if (!key.startsWith(FILTER_PREFIX)) {
      continue;
    }

    const groupId = key.slice(FILTER_PREFIX.length);
    const allowedValues = allowed.get(groupId);
    if (!allowedValues) {
      continue;
    }

    const values = Array.isArray(rawValue)
      ? rawValue.flatMap((item) => item.split(","))
      : typeof rawValue === "string"
        ? rawValue.split(",")
        : [];

    const normalized = Array.from(
      new Set(values.map((value) => value.trim()).filter((value) => value && allowedValues.has(value)))
    );

    if (normalized.length > 0) {
      filters[groupId] = normalized;
    }
  }

  return filters;
}

export function filterCategoryProducts<T extends { attributes?: Record<string, unknown> }>(
  products: T[],
  activeFilters: CategoryFilterState
) {
  if (Object.keys(activeFilters).length === 0) {
    return products;
  }

  return products.filter((product) =>
    Object.entries(activeFilters).every(([fieldKey, values]) => {
      if (values.length === 0) {
        return true;
      }

      const rawValue = product.attributes?.[fieldKey];
      return values.some((value) => matchesAttributeFilterValue(rawValue, value));
    })
  );
}

export function buildCategoryFilterQueryString(
  view: CategoryContentView,
  activeFilters: CategoryFilterState
) {
  const params = new URLSearchParams();

  if (view !== "all") {
    params.set("view", view);
  }

  for (const [groupId, values] of Object.entries(activeFilters)) {
    if (values.length === 0) {
      continue;
    }

    params.set(`${FILTER_PREFIX}${groupId}`, values.join(","));
  }

  return params.toString();
}

export function hasCategoryRefinement(
  view: CategoryContentView,
  activeFilters: CategoryFilterState
) {
  return view !== "all" || Object.keys(activeFilters).length > 0;
}
