import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const AIMatchingBanner = () => {
  const shouldReduceMotion = useReducedMotion();

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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-slate-900 to-zinc-900 border border-white/10 px-8 py-12 sm:px-12 sm:py-16">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.35),_transparent_55%)]" />
          <div className="absolute -bottom-24 right-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                <Sparkles className="h-4 w-4 text-white/70" />
                AI Matching
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white font-['Playfair_Display']">
                Find the Perfect Developer Instantly
              </h2>
              <p className="text-sm sm:text-base text-white/70 max-w-xl font-['Plus_Jakarta_Sans']">
                Submit your project requirements and our AI matching engine will
                recommend the most compatible developers based on skills,
                experience, and portfolio similarity.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Link
                to="/projects"
                className="rounded-full bg-white text-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-stone-100 transition"
              >
                Find Developers
              </Link>
              <Link
                to="/submit"
                className="rounded-full border border-white/30 text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white hover:text-stone-900 transition"
              >
                Submit Project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default AIMatchingBanner;
