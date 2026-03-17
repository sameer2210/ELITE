import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Eye, Github, Heart } from "lucide-react";
import { getPrimaryImage } from "../../utils/projectImages";

const ProjectCard = ({ p }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const image =
    getPrimaryImage(p?.image, p?.images) ||
    "https://via.placeholder.com/600x450?text=Project+Preview";
  const title = p?.title || "Untitled Project";
  const description = p?.description || "No description available.";
  const category =
    p?.category?.name || p?.category?.title || p?.category || "Uncategorized";

  const techStack = useMemo(() => {
    if (!Array.isArray(p?.technologies)) return [];
    return p.technologies
      .map((tech) => tech?.name || tech?.title || tech)
      .filter(Boolean)
      .slice(0, 3);
  }, [p?.technologies]);

  const liveDemo = p?.liveDemo;
  const githubRepo = p?.githubRepo;

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  return (
    <motion.div>
      <div className="group relative w-full max-w-sm mx-auto mt-6 transition-all duration-700 transform hover:-translate-y-1 overflow-hidden">
        <motion.button
          onClick={toggleWishlist}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-2 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isWishlisted
              ? "bg-red-50 shadow-md"
              : "bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all duration-300 ${
              isWishlisted
                ? "text-red-500 fill-red-500"
                : "text-gray-400 hover:text-red-500"
            }`}
          />
        </motion.button>

        <div className="relative h-72 w-68 mb-6 overflow-hidden bg-gradient-to-br from-stone-50 via-stone-25 to-white">
          <img
            className="w-full h-full object-center object-cover p-5 group-hover:scale-110 transition-transform duration-700"
            src={image}
            alt={title}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/600x450?text=Project+Preview";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
            <div className="flex space-x-3">
              <Link
                to={`/projects/${p?.id || p?._id}`}
                className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all duration-300"
              >
                <Eye className="w-5 h-5 text-stone-600" />
              </Link>
              {liveDemo && (
                <a
                  href={liveDemo}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center shadow-xl hover:bg-stone-800 hover:scale-110 transition-all duration-300"
                >
                  <ExternalLink className="w-5 h-5 text-white" />
                </a>
              )}
              {githubRepo && (
                <a
                  href={githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:bg-white hover:scale-110 transition-all duration-300"
                >
                  <Github className="w-5 h-5 text-stone-700" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
            {category}
          </p>
          <h1 className="text-lg font-serif font-medium text-stone-900 leading-tight line-clamp-2">
            {title.length > 40 ? `${title.slice(0, 40)}...` : title}
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
            {description.length > 70
              ? `${description.slice(0, 70)}...`
              : description}
          </p>
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-stone-100 text-stone-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;


