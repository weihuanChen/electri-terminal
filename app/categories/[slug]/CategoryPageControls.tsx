"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FilterPanel } from "@/components/shared";
import {
  buildCategoryFilterQueryString,
  type CategoryContentView,
  type CategoryFilterState,
} from "@/lib/categoryFilters";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type?: "checkbox" | "radio";
  options: FilterOption[];
}

interface CategoryPageControlsProps {
  filterGroups: FilterGroup[];
  activeFilters: CategoryFilterState;
  contentView: CategoryContentView;
  familyCount: number;
  productCount: number;
  collapsedFilterGroupKeys?: string[];
}

function useCategoryPageNavigation(
  activeFilters: CategoryFilterState,
  contentView: CategoryContentView
) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const navigateWithState = (
    nextView: CategoryContentView,
    nextFilters: CategoryFilterState
  ) => {
    const query = buildCategoryFilterQueryString(nextView, nextFilters);
    const href = query ? `${pathname}?${query}` : pathname;

    startTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  const handleFilterChange = (groupId: string, value: string) => {
    const currentValues = activeFilters[groupId] || [];
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    const nextFilters = {
      ...activeFilters,
      [groupId]: nextValues,
    };

    if (nextValues.length === 0) {
      delete nextFilters[groupId];
    }

    navigateWithState(contentView, nextFilters);
  };

  return {
    activeFilterCount: Object.values(activeFilters).flat().length,
    navigateWithState,
    handleFilterChange,
    handleClearFilters: () => navigateWithState(contentView, {}),
  };
}

export function CategoryFilterSidebar({
  filterGroups,
  activeFilters,
  contentView,
  collapsedFilterGroupKeys = [],
}: CategoryPageControlsProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { activeFilterCount, handleFilterChange, handleClearFilters } =
    useCategoryPageNavigation(activeFilters, contentView);

  return (
    <>
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <FilterPanel
          groups={filterGroups}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          defaultCollapsedGroupKeys={collapsedFilterGroupKeys}
        />
      </aside>

      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsFilterOpen((open) => !open)}
          className="btn btn-outline tap-target w-full"
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </button>
      </div>

        <div className="lg:hidden">
          <FilterPanel
            groups={filterGroups}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            defaultCollapsedGroupKeys={collapsedFilterGroupKeys}
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen((open) => !open)}
          />
        </div>
    </>
  );
}

export default function CategoryContentTabs({
  activeFilters,
  contentView,
  familyCount,
  productCount,
}: CategoryPageControlsProps) {
  const { navigateWithState } = useCategoryPageNavigation(activeFilters, contentView);

  return (
    <div className="-mx-2 mb-8 overflow-x-auto">
      <div className="flex min-w-max gap-2 border-b border-border px-2">
        <button
          onClick={() => navigateWithState("all", activeFilters)}
          className={`tap-target px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
            contentView === "all"
              ? "border-primary text-primary"
              : "border-transparent text-secondary hover:text-foreground"
          }`}
        >
          All
        </button>
        <button
          onClick={() => navigateWithState("families", activeFilters)}
          className={`tap-target px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
            contentView === "families"
              ? "border-primary text-primary"
              : "border-transparent text-secondary hover:text-foreground"
          }`}
        >
          Series ({familyCount})
        </button>
        <button
          onClick={() => navigateWithState("products", activeFilters)}
          className={`tap-target px-4 py-3 text-sm font-semibold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap ${
            contentView === "products"
              ? "border-primary text-primary"
              : "border-transparent text-secondary hover:text-foreground"
          }`}
        >
          Products ({productCount})
        </button>
      </div>
    </div>
  );
}
