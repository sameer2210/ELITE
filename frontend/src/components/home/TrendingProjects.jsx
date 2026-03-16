import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "../../api/projects";

const awardLabel = (award) => {
  if (!award) return null;
  if (typeof award === "string") return award;
  if (award?.name) return award.name;
  if (award?.title) return award.title;
  if (award?.type) {
    return award.type.replace(/([a-z])([A-Z])/g, "$1 $2");
  }
  return null;
};

const TrendingProjects = () => {
  const shouldReduceMotion = useReducedMotion();
  const { data, isLoading, isError } = useProjects({
    sort: "-views",
    limit: 4,
    populate: "developerId,technologies,awards",
  });
  const projects = Array.isArray(data) ? data : [];

  const sectionMotion = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease: "easeOut" },
      };

  return (
    <motion.section className="py-16 sm:py-20" {...sectionMotion}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50 font-semibold">
            Trending
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white font-['Playfair_Display']">
            Trending Developer Projects
          </h2>
        </div>

        {isError && (
          <p className="text-sm text-red-300">Failed to load projects.</p>
        )}
        {isLoading && (
          <p className="text-sm text-white/60">Loading trending projects...</p>
        )}
        {!isLoading && !projects.length && !isError && (
          <p className="text-sm text-white/60">No trending projects yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {projects.map((project) => {
            const projectId = project?.id || project?._id;
            const image = project?.images?.[0] || project?.image;
            const title = project?.title || "Untitled Project";
            const developer =
              project?.developerId?.name ||
              project?.developer?.name ||
              "Developer";
            const techStack = Array.isArray(project?.technologies)
              ? project.technologies
                  .map((tech) => tech?.name || tech?.title || tech)
                  .filter(Boolean)
                  .slice(0, 3)
              : [];
            const award = Array.isArray(project?.awards)
              ? awardLabel(project.awards[0])
              : null;

            return (
              <motion.div
                key={projectId || title}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }
                }
                className="rounded-3xl bg-white text-stone-900 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.7)] overflow-hidden border border-white/40"
              >
                <div className="relative h-44">
                  {image ? (
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-slate-800 to-indigo-900" />
                  )}
                  {award ? (
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-700">
                      {award}
                    </span>
                  ) : null}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold font-['Playfair_Display'] line-clamp-2">
                      {title}
                    </h3>
                    {projectId ? (
                      <Link
                        to={`/projects/${projectId}`}
                        className="h-8 w-8 rounded-full border border-stone-200 flex items-center justify-center hover:bg-stone-900 hover:text-white transition"
                        aria-label="Open project"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                  </div>
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                    {developer}
                  </p>
                  {techStack.length ? (
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-stone-100 text-stone-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default TrendingProjects;
