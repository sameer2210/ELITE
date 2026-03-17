import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useProjects } from "../../api/projects";
import { getPrimaryImage } from "../../utils/projectImages";

const FeaturedProject = () => {
  const shouldReduceMotion = useReducedMotion();
  const { data, isLoading, isError } = useProjects({
    sort: "-likes",
    limit: 1,
    populate: "developerId,technologies,awards",
  });

  const project = Array.isArray(data) ? data[0] : null;
  const projectId = project?.id || project?._id;
  const title = project?.title || "Project of the Week";
  const description = project?.description;
  const techStack = Array.isArray(project?.technologies)
    ? project.technologies
        .map((tech) => tech?.name || tech?.title || tech)
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const image = getPrimaryImage(project?.image, project?.images);

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
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50 font-semibold">
            Featured Project
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white font-['Playfair_Display']">
            Project of the Week
          </h2>
        </div>

        {isError && (
          <p className="text-sm text-red-300">Failed to load featured project.</p>
        )}
        {isLoading && (
          <p className="text-sm text-white/60">Loading featured project...</p>
        )}

        {!isLoading && !project && !isError ? (
          <div className="rounded-3xl bg-white/5 border border-white/10 px-8 py-10 text-white/70">
            No featured project yet.
          </div>
        ) : null}

        {project ? (
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { y: -6, scale: 1.01 }}
            className="overflow-hidden rounded-3xl bg-white text-stone-900 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.75)] border border-white/40"
          >
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-8 sm:p-10 lg:p-12 flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold text-stone-500">
                  <Sparkles className="h-4 w-4 text-stone-400" />
                  Project of the Week
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-['Playfair_Display']">
                    {title}
                  </h3>
                  {description ? (
                    <p className="mt-4 text-sm sm:text-base text-stone-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                      {description}
                    </p>
                  ) : null}
                </div>
                {techStack.length ? (
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] uppercase tracking-wide px-3 py-1 rounded-full bg-stone-100 text-stone-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}
                {projectId ? (
                  <Link
                    to={`/projects/${projectId}`}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-stone-900 text-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-stone-800 transition"
                  >
                    Explore Project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
              <div className="relative min-h-[240px] lg:min-h-[420px]">
                {image ? (
                  <>
                    <img
                      src={image}
                      alt={title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-slate-800 to-indigo-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_60%)] opacity-60" />
                    <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute top-12 left-12 h-24 w-24 rounded-2xl border border-white/20" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
    </motion.section>
  );
};

export default FeaturedProject;
