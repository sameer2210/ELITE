import { motion, useReducedMotion } from "framer-motion";
import { Award, Star } from "lucide-react";
import { useDeveloperProfiles } from "../../api/developerProfiles";

const formatList = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => item?.name || item?.title || item)
    .filter(Boolean);
};

const initialsFromName = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const TopDevelopers = () => {
  const shouldReduceMotion = useReducedMotion();
  const { data, isLoading, isError } = useDeveloperProfiles({
    sort: "-rating",
    limit: 4,
    populate: "userId,technologies,awards",
  });

  const profiles = Array.isArray(data) ? data : [];

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
            Developer Spotlight
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white font-['Playfair_Display']">
            Top Developers This Month
          </h2>
        </div>

        {isError && (
          <p className="text-sm text-red-300">Failed to load developers.</p>
        )}
        {isLoading && (
          <p className="text-sm text-white/60">Loading developers...</p>
        )}
        {!isLoading && !profiles.length && !isError && (
          <p className="text-sm text-white/60">No developers yet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {profiles.map((profile) => {
            const user = profile?.userId;
            const name = user?.name || "Developer";
            const avatar = user?.avatar;
            const title = profile?.title || "Developer";
            const skills = formatList(profile?.skills);
            const techs = formatList(profile?.technologies);
            const secondary = skills.length
              ? skills.slice(0, 3).join(" • ")
              : techs.slice(0, 3).join(" • ");
            const rating =
              typeof profile?.rating === "number"
                ? profile.rating.toFixed(1)
                : "0.0";
            const awards = formatList(profile?.awards).slice(0, 2);

            return (
              <motion.div
                key={profile?.id || profile?._id || name}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -6, scale: 1.02 }
                }
                className="rounded-3xl bg-white text-stone-900 p-6 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.7)] border border-white/40 flex flex-col gap-5"
              >
                <div className="flex items-center gap-4">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-14 w-14 rounded-2xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center text-sm font-semibold">
                      {initialsFromName(name)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold font-['Playfair_Display']">
                      {name}
                    </h3>
                    <p className="text-sm text-stone-500 font-['Plus_Jakarta_Sans']">
                      {title}
                    </p>
                  </div>
                </div>

                {secondary ? (
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                    {secondary}
                  </p>
                ) : null}

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    {rating} rating
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Award className="h-4 w-4 text-stone-400" />
                    {awards.length ? `${awards.length} awards` : "No awards yet"}
                  </div>
                </div>

                {awards.length ? (
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default TopDevelopers;
