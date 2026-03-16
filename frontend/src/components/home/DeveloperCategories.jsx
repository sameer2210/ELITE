import { motion, useReducedMotion } from "framer-motion";
import {
  Code,
  Cloud,
  Cpu,
  Database,
  Globe,
  Layers,
  Monitor,
  PenTool,
  Server,
  Shield,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useCategories } from "../../api/lookups";

const categoryIcon = (name = "") => {
  const value = name.toLowerCase();
  if (value.includes("frontend")) return Monitor;
  if (value.includes("backend")) return Server;
  if (value.includes("full stack") || value.includes("fullstack")) return Layers;
  if (value.includes("ai") || value.includes("machine")) return Cpu;
  if (value.includes("mobile")) return Smartphone;
  if (value.includes("web3") || value.includes("blockchain")) return Globe;
  if (value.includes("devops") || value.includes("cloud")) return Cloud;
  if (value.includes("ui") || value.includes("ux")) return PenTool;
  if (value.includes("data") || value.includes("database")) return Database;
  if (value.includes("security")) return Shield;
  return Code;
};

const subtitleFor = (category) => {
  if (category?.description?.trim()) return category.description;
  const name = category?.name || category?.title || "Engineering";
  return `Specialists in ${name} projects and delivery.`;
};

const DeveloperCategories = () => {
  const shouldReduceMotion = useReducedMotion();
  const { data, isLoading, isError } = useCategories();
  const categories = Array.isArray(data) ? data.slice(0, 8) : [];

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
            Developer Categories
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white font-['Playfair_Display']">
            Discover Developer Talent
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl font-['Plus_Jakarta_Sans']">
            Explore developers across specialized engineering disciplines.
          </p>
        </div>

        {isError && (
          <p className="text-sm text-red-300">Failed to load categories.</p>
        )}
        {isLoading && (
          <p className="text-sm text-white/60">Loading categories...</p>
        )}
        {!isLoading && !categories.length && !isError && (
          <p className="text-sm text-white/60">No categories yet.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = categoryIcon(category?.name || category?.title);
            return (
              <motion.div
                key={category?.id || category?._id || category?.name}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }
                }
                className="rounded-3xl bg-white text-stone-900 p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.7)] border border-white/40"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700 text-white flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Sparkles className="h-4 w-4 text-stone-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 font-['Playfair_Display']">
                  {category?.name || category?.title || "Developer Category"}
                </h3>
                <p className="text-sm text-stone-600 font-['Plus_Jakarta_Sans']">
                  {subtitleFor(category)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default DeveloperCategories;
