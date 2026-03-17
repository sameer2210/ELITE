import React, { memo, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { getPrimaryImage } from "../../utils/projectImages";

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => entry?.name || entry?.title || entry)
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const ProjectSearchResults = ({
  query,
  results,
  loading,
  error,
  minChars = 2,
  onSelect,
}) => {
  const trimmed = query.trim();
  const normalizedResults = useMemo(() => {
    if (!Array.isArray(results)) return [];
    return results.map((item) => {
      const id = item.id || item._id || item.slug || item.title;
      const title =
        item.title || item.name || item.projectName || "Untitled Project";
      const developer =
        item.developer?.name ||
        item.developerId?.name ||
        item.developerName ||
        item.author ||
        item.brand ||
        "Unknown Developer";
      const techStack = normalizeList(
        item.techStack || item.stack || item.technologies
      );
      const awards = normalizeList(item.awards || item.badges);
      const image =
        getPrimaryImage(
          item.image,
          item.thumbnail,
          item.cover,
          item.images
        ) || "https://placehold.co/96";
      return {
        id,
        title,
        developer,
        techStack,
        awards,
        image,
      };
    });
  }, [results]);

  if (!trimmed) return null;

  if (trimmed.length < minChars) {
    return (
      <p className="px-4 py-3 text-sm text-white/60">
        Type at least {minChars} characters to search.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="px-4 py-3 text-sm text-white/70">Searching projects...</p>
    );
  }

  if (error) {
    return (
      <p className="px-4 py-3 text-sm text-red-400">{error}</p>
    );
  }

  if (!normalizedResults.length) {
    return (
      <p className="px-4 py-3 text-sm text-white/60">
        No projects found for "{trimmed}".
      </p>
    );
  }

  return (
    <ul className="max-h-80 overflow-auto divide-y divide-white/10" role="listbox">
      {normalizedResults.map((project) => {
        const techPreview = project.techStack.slice(0, 3).join(" • ");
        const awardPreview = project.awards.slice(0, 2).join(" • ");
        return (
          <li key={project.id} role="option">
            <NavLink
              to={`/projects/${project.id}`}
              onClick={onSelect}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/10">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/96";
                  }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {project.title}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {project.developer}
                  {techPreview ? ` • ${techPreview}` : ""}
                </p>
                {awardPreview ? (
                  <p className="text-[11px] text-teal-300/80 truncate">
                    Awards: {awardPreview}
                  </p>
                ) : null}
              </div>
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
};

export default memo(ProjectSearchResults);
