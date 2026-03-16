import { motion, useReducedMotion } from "framer-motion";
import {
  Code,
  Cloud,
  Cpu,
  Database,
  Globe,
  Layers,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";
import { useMemo } from "react";
import { useTechnologies } from "../../api/lookups";
import { useProjects } from "../../api/projects";

const techIcon = (name = "") => {
  const value = name.toLowerCase();
  if (value.includes("react")) return Code;
  if (value.includes("next")) return Layers;
  if (value.includes("node")) return Server;
  if (value.includes("python")) return Terminal;
  if (value.includes("typescript") || value.includes("javascript")) return Code;
  if (value.includes("mongo") || value.includes("database")) return Database;
  if (value.includes("ai") || value.includes("ml")) return Cpu;
  if (value.includes("docker") || value.includes("cloud")) return Cloud;
  if (value.includes("web3") || value.includes("blockchain")) return Globe;
  return Sparkles;
};

const TechnologyExplorer = () => {
  const shouldReduceMotion = useReducedMotion();
  const {
    data: technologies,
    isLoading: techLoading,
    isError: techError,
  } = useTechnologies();

  const {
    data: projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects({
    limit: 0,
    populate: "technologies",
    enabled: Array.isArray(technologies) && technologies.length > 0,
  });

  const techStats = useMemo(() => {
    const items = Array.isArray(technologies) ? technologies : [];
    const counts = new Map();
    if (Array.isArray(projects)) {
      projects.forEach((project) => {
        const list = Array.isArray(project?.technologies)
          ? project.technologies
          : [];
        list.forEach((tech) => {
          const id = tech?.id || tech?._id || tech;
          if (!id) return;
          counts.set(id, (counts.get(id) || 0) + 1);
        });
      });
    }

    const mapped = items.map((tech) => {
      const id = tech?.id || tech?._id || tech?.name;
      return {
        ...tech,
        count: id ? counts.get(id) || 0 : 0,
      };
    });

    const sorted = mapped.sort((a, b) => b.count - a.count);
    const withCount = sorted.filter((item) => item.count > 0);
    return (withCount.length ? withCount : sorted).slice(0, 12);
  }, [technologies, projects]);

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
            Technology Explorer
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white font-['Playfair_Display']">
            Explore by Technology
          </h2>
        </div>

        {(techError || projectsError) && (
          <p className="text-sm text-red-300">Failed to load technologies.</p>
        )}
        {(techLoading || projectsLoading) && (
          <p className="text-sm text-white/60">Loading technologies...</p>
        )}
        {!techLoading && !techStats.length && !techError && (
          <p className="text-sm text-white/60">No technologies yet.</p>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          {techStats.map((tech) => {
            const Icon = techIcon(tech?.name || "");
            const count = tech?.count || 0;
            return (
              <motion.div
                key={tech?.id || tech?._id || tech?.name}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -4, scale: 1.02 }
                }
                className="min-w-[190px] rounded-3xl bg-white text-stone-900 p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.6)] border border-white/40"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="h-10 w-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-stone-500">
                    {count === 1 ? "1 project" : `${count} projects`}
                  </span>
                </div>
                <h3 className="text-base font-semibold font-['Playfair_Display']">
                  {tech?.name || "Technology"}
                </h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default TechnologyExplorer;
