/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import InfiniteScroll from "react-infinite-scroll-component";
import { useInfiniteProjects } from "../../api/projects";
import {
  applyClientProjectFilters,
  countActiveFilters,
} from "../../utils/projectFilters";

const ProjectTemplate = lazy(() => import("./ProjectCard"));

const ProjectList = ({
  search = "",
  serverFilters = {},
  serverSort = "-createdAt",
  clientFilters = {},
  onClearFilters,
}) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteProjects({
    limit: 6,
    search,
    filters: serverFilters,
    sort: serverSort,
  });

  const projects = data?.pages?.flat() || [];
  const filteredProjects = useMemo(
    () => applyClientProjectFilters(projects, clientFilters),
    [projects, clientFilters]
  );
  const activeFilterCount = useMemo(
    () => countActiveFilters(clientFilters),
    [clientFilters]
  );

  const fetchProjects = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  };

  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    if (!activeFilterCount) return;
    if (filteredProjects.length >= 4) return;
    fetchNextPage();
  }, [
    activeFilterCount,
    filteredProjects.length,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  ]);

  const showNoResults = !isLoading && !isError && filteredProjects.length === 0;
  const noResultsTitle =
    activeFilterCount > 0
      ? "No projects match the current AI filters."
      : "No projects published yet.";
  const noResultsDescription =
    activeFilterCount > 0
      ? "Try adjusting your prompt or clear some filters."
      : "New projects will appear here once creators publish them.";

  return (
    <>
      {isError && (
        <p className="py-4 text-center font-semibold text-red-500">
          Failed to load projects. Please try again.
        </p>
      )}

      {isLoading && (
        <p className="py-4 text-center text-gray-500">Loading projects...</p>
      )}

      {showNoResults && (
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-stone-900">{noResultsTitle}</p>
          <p className="mt-2 text-sm text-stone-600">{noResultsDescription}</p>
          {activeFilterCount > 0 && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-4 rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-stone-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!showNoResults && (
        <InfiniteScroll
          dataLength={filteredProjects.length}
          next={fetchProjects}
          hasMore={Boolean(hasNextPage)}
          loader={
            <p className="py-4 text-center text-gray-500">Loading more projects...</p>
          }
          endMessage={
            <p className="py-4 text-center font-semibold text-green-600">
              Yay! You have seen all projects.
            </p>
          }
        >
          <div className="flex flex-wrap items-start justify-center gap-4 px-4 py-6">
            {filteredProjects.map((project, index) => (
              <Suspense
                key={project.id || project._id || Math.random()}
                fallback={<div className="text-center">Loading project...</div>}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="w-full p-2 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
                >
                  <ProjectTemplate p={project} />
                </motion.div>
              </Suspense>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </>
  );
};

export default ProjectList;
