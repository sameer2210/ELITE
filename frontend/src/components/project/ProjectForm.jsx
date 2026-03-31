import {
  Save,
  Trash2,
  Image,
  Upload,
  FileText,
  Tag,
  Link2,
  Github,
  Layers,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import Button from "../common/Button";

const InputField = ({ label, icon: Icon, error, children, required }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      {Icon && <Icon size={16} className="text-gray-500" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-sm text-red-500 flex items-center gap-1">
        <span className="w-1 h-1 bg-red-500 rounded-full" />
        {error.message}
      </p>
    )}
  </div>
);

const URL_PATTERN = /^https?:\/\/.+/i;

const getItemId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || "";
};

const getItemLabel = (item) => {
  if (!item || typeof item === "string") return "";
  return item.name || item.title || "";
};

const pickRandom = (items) => {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
};

const pickMany = (items, count) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const pool = [...items];
  const picked = [];
  while (pool.length && picked.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
};

const buildSeedData = ({ categories = [], technologies = [] } = {}) => {
  const adjectives = [
    "Modern",
    "Bold",
    "Clean",
    "Nova",
    "Swift",
    "Orbit",
    "Prime",
    "Pulse",
    "Vivid",
    "Vertex",
  ];
  const nouns = [
    "Portfolio",
    "Dashboard",
    "Marketplace",
    "Studio",
    "Tracker",
    "Showcase",
    "Landing",
    "Analytics",
    "Builder",
    "Hub",
  ];

  const adjective = pickRandom(adjectives) || "Modern";
  const noun = pickRandom(nouns) || "Project";
  const title = `${adjective} ${noun}`;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const categoryItem = pickRandom(categories);
  const category = getItemId(categoryItem);

  const techItems = pickMany(technologies, Math.min(3, technologies.length || 0));
  const technologiesIds = techItems.map(getItemId).filter(Boolean);
  const techLabel = techItems.map(getItemLabel).filter(Boolean).join(", ");

  const seedTag = Math.random().toString(36).slice(2, 8);
  const image = `https://picsum.photos/seed/${slug || "elite"}-${seedTag}/1200/800`;
  const images = [
    `https://picsum.photos/seed/${slug || "elite"}-${seedTag}-sub1/1200/800`,
    `https://picsum.photos/seed/${slug || "elite"}-${seedTag}-sub2/1200/800`,
  ];

  const description = techLabel
    ? `A ${adjective.toLowerCase()} ${noun.toLowerCase()} built with ${techLabel} for fast iteration, clear UX, and measurable impact.`
    : `A ${adjective.toLowerCase()} ${noun.toLowerCase()} built for fast iteration, clear UX, and measurable impact.`;

  return {
    image,
    images,
    title,
    description,
    category,
    technologies: technologiesIds,
    liveDemo: `https://example.com/${slug || "elite-project"}`,
    githubRepo: `https://github.com/example/${slug || "elite-project"}`,
  };
};

const ProjectForm = ({
  defaultValues,
  onSubmit,
  onDelete,
  isEdit,
  loading,
  categories = [],
  technologies = [],
  seedable = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const subImagesError = errors.images?.root;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watchedImage = watch("image");
  const watchedImageFile = watch("imageFile");
  const watchedImages = watch("images") || [];
  const [filePreviewUrl, setFilePreviewUrl] = useState("");

  const selectedImageFile = Array.isArray(watchedImageFile)
    ? watchedImageFile[0]
    : watchedImageFile?.[0] || null;

  useEffect(() => {
    if (!selectedImageFile) {
      setFilePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImageFile);
    setFilePreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImageFile]);

  const mainPreviewImage =
    filePreviewUrl ||
    (typeof watchedImage === "string" ? watchedImage.trim() : "");

  const previewImages = Array.isArray(watchedImages)
    ? watchedImages.filter((value) => typeof value === "string" && value.trim())
    : [];

  const inputStyles =
    "w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:border-yellow-500 focus:bg-white focus:ring-1 focus:ring-yellow-600/20 transition-all outline-none";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {(mainPreviewImage || previewImages.length > 0) && (
            <div className="flex flex-col items-center gap-3">
              {mainPreviewImage && (
                <img
                  src={mainPreviewImage}
                  alt="Project preview"
                  className="w-28 h-28 object-cover rounded-lg border border-gray-200"
                  onError={(e) => e.target.classList.add("hidden")}
                />
              )}
              {previewImages.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {previewImages.map((imageUrl, index) => (
                    <img
                      key={`${imageUrl}-${index}`}
                      src={imageUrl}
                      alt={`Sub preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                      onError={(e) => e.target.classList.add("hidden")}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InputField label="Upload Cover Image" icon={Upload} error={errors.imageFile}>
                <input
                  {...register("imageFile")}
                  type="file"
                  accept="image/*"
                  className={`${inputStyles} file:mr-3 file:rounded file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white`}
                />
              </InputField>

              <InputField label="Cover Image URL (optional)" icon={Image} error={errors.image}>
                <input
                  {...register("image", {
                    pattern: {
                      value: URL_PATTERN,
                      message: "Please enter a valid image URL",
                    },
                  })}
                  placeholder="https://example.com/cover.jpg"
                  type="url"
                  className={inputStyles}
                />
              </InputField>

              <InputField label="Project Title" icon={FileText} error={errors.title} required>
                <input
                  {...register("title", {
                    required: "Project title is required",
                    minLength: { value: 3, message: "Title must be at least 3 characters" },
                  })}
                  placeholder="Enter project title"
                  className={inputStyles}
                />
              </InputField>

              <InputField label="Live Demo URL" icon={Link2} error={errors.liveDemo}>
                <input
                  {...register("liveDemo", {
                    pattern: {
                      value: URL_PATTERN,
                      message: "Please enter a valid URL",
                    },
                  })}
                  placeholder="https://yourproject.com"
                  type="url"
                  className={inputStyles}
                />
              </InputField>

              <InputField label="GitHub Repository" icon={Github} error={errors.githubRepo}>
                <input
                  {...register("githubRepo", {
                    pattern: {
                      value: URL_PATTERN,
                      message: "Please enter a valid URL",
                    },
                  })}
                  placeholder="https://github.com/username/repo"
                  type="url"
                  className={inputStyles}
                />
              </InputField>
            </div>

            <div className="space-y-4">
              <InputField label="Category" icon={Tag} error={errors.category}>
                <select {...register("category")} className={inputStyles}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name || cat.title}
                    </option>
                  ))}
                </select>
              </InputField>

              <InputField label="Technologies" icon={Layers} error={errors.technologies}>
                <select
                  {...register("technologies")}
                  multiple
                  className={`${inputStyles} h-32`}
                >
                  {technologies.map((tech) => (
                    <option key={tech._id || tech.id} value={tech._id || tech.id}>
                      {tech.name || tech.title}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">
                  Hold Ctrl/Cmd to select multiple technologies.
                </p>
              </InputField>

              <InputField label="Sub Images" icon={Image} error={subImagesError}>
                <div className="space-y-3">
                  {fields.length === 0 && (
                    <p className="text-xs text-gray-500">
                      Add extra images for the gallery.
                    </p>
                  )}
                  {fields.map((field, index) => {
                    const fieldError = errors.images?.[index];
                    return (
                      <div key={field.id} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            {...register(`images.${index}`, {
                              pattern: {
                                value: URL_PATTERN,
                                message: "Please enter a valid image URL",
                              },
                            })}
                            placeholder={`https://example.com/sub-${index + 1}.jpg`}
                            type="url"
                            className={`${inputStyles} min-w-0 flex-1`}
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {fieldError?.message && (
                          <p className="text-xs text-red-500">
                            {fieldError.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => append("")}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-700 hover:text-gray-900"
                  >
                    <Plus className="h-4 w-4" /> Add Sub Image
                  </button>
                </div>
              </InputField>
            </div>
          </div>

          <InputField label="Project Description" icon={FileText} error={errors.description} required>
            <textarea
              {...register("description", {
                required: "Project description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
              })}
              placeholder="Describe your project..."
              rows={4}
              className={`${inputStyles} resize-y`}
            />
          </InputField>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button type="submit" icon={Save} iconColor="text-yellow-600" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Project" : "Publish Project"}
            </Button>
            {seedable && !isEdit && (
              <Button
                type="button"
                icon={Sparkles}
                iconColor="text-gray-600"
                onClick={() => reset(buildSeedData({ categories, technologies }))}
              >
                Seed Sample
              </Button>
            )}
            {isEdit && onDelete && (
              <Button
                type="button"
                icon={Trash2}
                iconColor="text-red-500"
                onClick={onDelete}
                variant="danger"
              >
                Delete Project
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;

























