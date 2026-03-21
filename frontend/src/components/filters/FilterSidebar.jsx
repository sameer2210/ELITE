import React, { useEffect, useMemo, useState } from "react";
import { RotateCcw, Sparkles, WandSparkles } from "lucide-react";
import { countActiveFilters } from "../../utils/projectFilters";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "most_liked", label: "Most liked" },
  { value: "most_viewed", label: "Most viewed" },
  { value: "title_asc", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" },
];

const RECENCY_OPTIONS = [
  { value: "any", label: "Any time" },
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last year" },
];

const getId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item.id || item._id || "";
};

const getLabel = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item.name || item.title || "";
};

const parseNumber = (value) => {
  if (value === "") return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

const FilterSidebar = ({
  filters,
  categories = [],
  technologies = [],
  lookupsLoading = false,
  onFiltersChange,
  onAiSearch,
  onResetFilters,
}) => {
  const [aiInput, setAiInput] = useState(filters?.aiQuery || "");
  const activeCount = countActiveFilters(filters);

  useEffect(() => {
    setAiInput(filters?.aiQuery || "");
  }, [filters?.aiQuery]);

  const technologyMap = useMemo(() => {
    const mapped = new Map();
    (Array.isArray(technologies) ? technologies : []).forEach((item) => {
      const id = getId(item);
      if (!id) return;
      mapped.set(id, getLabel(item));
    });
    return mapped;
  }, [technologies]);
  const categoryMap = useMemo(() => {
    const mapped = new Map();
    (Array.isArray(categories) ? categories : []).forEach((item) => {
      const id = getId(item);
      if (!id) return;
      mapped.set(id, getLabel(item));
    });
    return mapped;
  }, [categories]);

  const activeChips = useMemo(() => {
    const chips = [];
    if (filters?.searchText) chips.push(`Keywords: ${filters.searchText}`);

    if (filters?.categoryId) {
      const categoryLabel = categoryMap.get(filters.categoryId);
      if (categoryLabel) chips.push(`Category: ${categoryLabel}`);
    }

    if (Array.isArray(filters?.technologyIds) && filters.technologyIds.length > 0) {
      const names = filters.technologyIds
        .map((id) => technologyMap.get(id))
        .filter(Boolean)
        .slice(0, 3);
      if (names.length) chips.push(`Tech: ${names.join(", ")}`);
    }

    if ((Number(filters?.minLikes) || 0) > 0) {
      chips.push(`Min likes: ${filters.minLikes}`);
    }
    if ((Number(filters?.minViews) || 0) > 0) {
      chips.push(`Min views: ${filters.minViews}`);
    }
    if (filters?.hasLiveDemo) chips.push("Has live demo");
    if (filters?.hasGithubRepo) chips.push("Has GitHub");
    if (filters?.awardsOnly) chips.push("Awarded only");
    if (filters?.createdWithinDays && filters.createdWithinDays !== "any") {
      chips.push(`Recent: ${filters.createdWithinDays}d`);
    }
    if (filters?.sortBy && filters.sortBy !== "newest") {
      const sortLabel = SORT_OPTIONS.find((item) => item.value === filters.sortBy)?.label;
      if (sortLabel) chips.push(`Sort: ${sortLabel}`);
    }
    return chips;
  }, [categoryMap, filters, technologyMap]);

  const handleAiSubmit = (event) => {
    event.preventDefault();
    onAiSearch(aiInput);
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">AI Filter Sidebar</h2>
          <p className="mt-1 text-sm text-stone-600">
            Describe what you want and AI will map it to smart filters.
          </p>
        </div>
        <span className="rounded-full border border-stone-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-stone-600">
          {activeCount} active
        </span>
      </div>

      <form onSubmit={handleAiSubmit} className="mt-4 space-y-2">
        <label className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          <Sparkles className="h-3.5 w-3.5" />
          AI Search
        </label>
        <textarea
          value={aiInput}
          onChange={(event) => setAiInput(event.target.value)}
          placeholder="Example: Show recent React or Next.js projects with live demo, GitHub, and at least 100 likes"
          rows={4}
          className="w-full resize-y rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
        />
        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-stone-700"
          >
            <WandSparkles className="h-3.5 w-3.5" />
            Analyze
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInput("");
              onAiSearch("");
            }}
            className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-700 transition hover:border-stone-500"
          >
            Clear AI
          </button>
        </div>
      </form>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-700"
            >
              {chip}
            </span>
          ))}
        </div>
      )}

      {Array.isArray(filters?.keywordTokens) && filters.keywordTokens.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            AI Tokens
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {filters.keywordTokens.map((token) => (
              <span
                key={token}
                className="rounded-full border border-stone-300 px-2.5 py-1 text-[11px] text-stone-700"
              >
                {token}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-4 border-t border-stone-200 pt-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Sort
          </label>
          <select
            value={filters?.sortBy || "newest"}
            onChange={(event) => onFiltersChange({ sortBy: event.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Category
          </label>
          <select
            value={filters?.categoryId || ""}
            onChange={(event) => onFiltersChange({ categoryId: event.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
          >
            <option value="">All categories</option>
            {(Array.isArray(categories) ? categories : []).map((item) => (
              <option key={getId(item)} value={getId(item)}>
                {getLabel(item)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Technologies
          </label>
          <select
            multiple
            value={filters?.technologyIds || []}
            onChange={(event) => {
              const selected = Array.from(event.target.selectedOptions).map(
                (option) => option.value
              );
              onFiltersChange({ technologyIds: selected });
            }}
            className="h-28 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
          >
            {(Array.isArray(technologies) ? technologies : []).map((item) => (
              <option key={getId(item)} value={getId(item)}>
                {getLabel(item)}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-stone-500">
            Hold Ctrl/Cmd to select multiple technologies.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
            Recency
          </label>
          <select
            value={filters?.createdWithinDays || "any"}
            onChange={(event) => onFiltersChange({ createdWithinDays: event.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
          >
            {RECENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Min Likes
            </label>
            <input
              type="number"
              min="0"
              value={filters?.minLikes ?? 0}
              onChange={(event) =>
                onFiltersChange({ minLikes: parseNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Min Views
            </label>
            <input
              type="number"
              min="0"
              value={filters?.minViews ?? 0}
              onChange={(event) =>
                onFiltersChange({ minViews: parseNumber(event.target.value) })
              }
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none transition focus:border-stone-500"
            />
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={Boolean(filters?.hasLiveDemo)}
              onChange={(event) =>
                onFiltersChange({ hasLiveDemo: event.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
            />
            Has live demo
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={Boolean(filters?.hasGithubRepo)}
              onChange={(event) =>
                onFiltersChange({ hasGithubRepo: event.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
            />
            Has GitHub repo
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={Boolean(filters?.awardsOnly)}
              onChange={(event) =>
                onFiltersChange({ awardsOnly: event.target.checked })
              }
              className="h-4 w-4 rounded border-stone-300 text-stone-800 focus:ring-stone-500"
            />
            Award winning only
          </label>
        </div>
      </div>

      <div className="mt-5 border-t border-stone-200 pt-4">
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-700 transition hover:border-stone-500"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset All Filters
        </button>
        {lookupsLoading && (
          <p className="mt-2 text-xs text-stone-500">Loading categories and technologies...</p>
        )}
      </div>
    </section>
  );
};

export default FilterSidebar;
