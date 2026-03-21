import { useCallback, useMemo, useState } from "react";
import { useCategories, useTechnologies } from "../../api/lookups";
import FilterSidebar from "../../components/filters/FilterSidebar";
import ProjectList from "../../components/project/ProjectList";
import {
  createDefaultProjectFilters,
  parseAiProjectQuery,
  PROJECT_SORT_TO_SERVER,
} from "../../utils/projectFilters";

const ProjectsPage = () => {
  const { data: categoryData, isLoading: categoriesLoading } = useCategories();
  const { data: technologyData, isLoading: technologiesLoading } = useTechnologies();

  const categories = useMemo(
    () => (Array.isArray(categoryData) ? categoryData : []),
    [categoryData]
  );
  const technologies = useMemo(
    () => (Array.isArray(technologyData) ? technologyData : []),
    [technologyData]
  );

  const [filters, setFilters] = useState(() => createDefaultProjectFilters());

  const updateFilters = useCallback((updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(createDefaultProjectFilters());
  }, []);

  const applyAiSearch = useCallback(
    (query) => {
      const parsed = parseAiProjectQuery(query, { categories, technologies });
      setFilters(parsed);
    },
    [categories, technologies]
  );

  const serverFilters = useMemo(() => {
    const mapped = {};
    if (filters.categoryId) mapped.category = filters.categoryId;
    if (Array.isArray(filters.technologyIds) && filters.technologyIds.length > 0) {
      mapped.technologies = filters.technologyIds;
    }
    return mapped;
  }, [filters.categoryId, filters.technologyIds]);

  const serverSort = useMemo(
    () => PROJECT_SORT_TO_SERVER[filters.sortBy] || PROJECT_SORT_TO_SERVER.newest,
    [filters.sortBy]
  );

  return (
    <section className="min-h-screen bg-stone-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="self-start lg:sticky lg:top-24">
            <FilterSidebar
              filters={filters}
              categories={categories}
              technologies={technologies}
              lookupsLoading={categoriesLoading || technologiesLoading}
              onFiltersChange={updateFilters}
              onAiSearch={applyAiSearch}
              onResetFilters={resetFilters}
            />
          </aside>
          <div className="min-w-0">
            <ProjectList
              search={filters.searchText}
              serverFilters={serverFilters}
              serverSort={serverSort}
              clientFilters={filters}
              onClearFilters={resetFilters}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsPage;
