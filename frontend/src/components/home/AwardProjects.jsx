import { motion, useReducedMotion } from "framer-motion";
import { Award, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useAwards } from "../../api/awards";

const formatAward = (award) => {
  if (!award) return null;
  if (award?.name) return award.name;
  if (award?.title) return award.title;
  if (award?.type) {
    return award.type.replace(/([a-z])([A-Z])/g, "$1 $2");
  }
  if (typeof award === "string") return award;
  return null;
};

const AwardProjects = () => {
  const shouldReduceMotion = useReducedMotion();
  const { data, isLoading, isError } = useAwards({
    populate: "projectId,developerId",
    sort: "-createdAt",
    limit: 6,
  });

  const featured = useMemo(() => {
    if (!Array.isArray(data)) return [];
    const map = new Map();
    data.forEach((award) => {
      const project = award?.projectId;
      if (!project || typeof project === "string") return;
      const projectId = project?.id || project?._id;
      if (!projectId) return;
      const entry = map.get(projectId) || { project, awards: [] };
      const label = formatAward(award);
      if (label && !entry.awards.includes(label)) {
        entry.awards.push(label);
      }
      map.set(projectId, entry);
    });
    return Array.from(map.values()).slice(0, 6);
  }, [data]);

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
            Awards
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white font-['Playfair_Display']">
            Award Winning Projects
          </h2>
        </div>

        {isError && (
          <p className="text-sm text-red-300">Failed to load award projects.</p>
        )}
        {isLoading && (
          <p className="text-sm text-white/60">Loading award projects...</p>
        )}
        {!isLoading && !featured.length && !isError && (
          <p className="text-sm text-white/60">No award winning projects yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(({ project, awards }) => {
            const projectId = project?.id || project?._id;
            const image = project?.images?.[0] || project?.image;
            const title = project?.title || "Awarded Project";
            const description = project?.description;
            return (
              <motion.div
                key={projectId || title}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }
                }
                className="rounded-3xl bg-white text-stone-900 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.7)] overflow-hidden border border-white/40"
              >
                <div className="relative h-48">
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
                  <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-700">
                    <Award className="h-3.5 w-3.5 text-stone-500" />
                    Awarded
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
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
                  {description ? (
                    <p className="text-sm text-stone-600 line-clamp-2 font-['Plus_Jakarta_Sans']">
                      {description}
                    </p>
                  ) : null}
                  {awards?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {awards.map((award) => (
                        <span
                          key={award}
                          className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-stone-100 text-stone-600"
                        >
                          {award}
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

export default AwardProjects;
