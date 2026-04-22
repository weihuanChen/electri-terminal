"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterGroup {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range";
  options: FilterOption[];
}

interface FilterPanelProps {
  groups: FilterGroup[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (groupId: string, value: string) => void;
  onClearFilters: () => void;
  defaultCollapsedGroupKeys?: string[];
  isOpen?: boolean;
  onToggle?: () => void;
}

const OPTION_PREVIEW_COUNT = 6;

function normalizeFilterKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function shouldCollapseByDefault(group: FilterGroup, configuredKeys: string[]) {
  const configuredSet = new Set(
    (configuredKeys.length > 0 ? configuredKeys : ["pcs", "t", "pcspack"]).map(normalizeFilterKey)
  );
  const normalizedId = normalizeFilterKey(group.id);
  const normalizedLabel = normalizeFilterKey(group.label);

  return configuredSet.has(normalizedId) || configuredSet.has(normalizedLabel);
}

export default function FilterPanel({
  groups,
  activeFilters,
  onFilterChange,
  onClearFilters,
  defaultCollapsedGroupKeys = [],
  isOpen = true,
  onToggle,
}: FilterPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const activeFilterCount = Object.values(activeFilters).reduce(
    (acc, values) => acc + values.length,
    0
  );

  const isFilterActive = (groupId: string, value: string) => {
    return activeFilters[groupId]?.includes(value) || false;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-40 btn btn-primary shadow-lg rounded-full"
        onClick={onToggle}
      >
        <SlidersHorizontal className="h-5 w-5" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-accent text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <div
        className={`
          fixed md:sticky top-[72px] left-0 right-0 md:left-auto md:right-auto
          z-30 md:z-auto h-[calc(100vh-72px)] md:h-auto
          bg-background md:bg-transparent
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-full overflow-y-auto p-4 md:p-0">
          <div className="card md:shadow-none md:border-none p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>

              <div className="flex items-center space-x-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={onClearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
                <button
                  className="md:hidden p-1 text-secondary hover:text-primary"
                  onClick={onToggle}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Filter Groups */}
            <div className="space-y-6">
              {groups.map((group) => {
                const hasActiveValues = (activeFilters[group.id] || []).length > 0;
                const isGroupCollapsed =
                  collapsedGroups[group.id] ??
                  (!hasActiveValues && shouldCollapseByDefault(group, defaultCollapsedGroupKeys));

                return (
                  <div key={group.id}>
                    <button
                      onClick={() =>
                        setCollapsedGroups((current) => ({
                          ...current,
                          [group.id]: !isGroupCollapsed,
                        }))
                      }
                      className="mb-3 flex w-full items-center justify-between text-left"
                    >
                      <span className="text-sm font-semibold">{group.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-secondary transition-transform ${
                          isGroupCollapsed ? "-rotate-90" : "rotate-0"
                        }`}
                      />
                    </button>

                    {!isGroupCollapsed && (
                      <div className="space-y-2">
                        {(expandedGroups[group.id]
                          ? group.options
                          : group.options.slice(0, OPTION_PREVIEW_COUNT)
                        ).map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center space-x-3 cursor-pointer group"
                          >
                            <input
                              type={group.type === "radio" ? "radio" : "checkbox"}
                              className={`
                                h-4 w-4 rounded border-border text-primary
                                focus:ring-2 focus:ring-primary focus:ring-offset-0
                                ${group.type === "radio" ? "text-primary" : ""}
                              `}
                              checked={isFilterActive(group.id, option.value)}
                              onChange={() => onFilterChange(group.id, option.value)}
                            />
                            <span className="flex-1 text-sm text-secondary group-hover:text-foreground">
                              {option.label}
                            </span>
                            {option.count !== undefined && (
                              <span className="text-xs text-secondary">
                                ({option.count})
                              </span>
                            )}
                          </label>
                        ))}

                        {group.options.length > OPTION_PREVIEW_COUNT && (
                          <button
                            onClick={() =>
                              setExpandedGroups((current) => ({
                                ...current,
                                [group.id]: !current[group.id],
                              }))
                            }
                            className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-primary hover:text-primary-dark"
                          >
                            {expandedGroups[group.id]
                              ? "Show Less"
                              : `Show More (${group.options.length - OPTION_PREVIEW_COUNT})`}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold mb-3">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(activeFilters).map(([groupId, values]) =>
                    values.map((value) => {
                      const group = groups.find((g) => g.id === groupId);
                      const option = group?.options.find((o) => o.value === value);
                      return (
                        <span
                          key={`${groupId}-${value}`}
                          className="inline-flex items-center space-x-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          <span>{option?.label || value}</span>
                          <button
                            onClick={() => onFilterChange(groupId, value)}
                            className="hover:text-primary-dark"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={onToggle}
        />
      )}
    </>
  );
}
