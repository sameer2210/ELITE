const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export const isValidObjectId = (value) =>
  typeof value === "string" && OBJECT_ID_REGEX.test(value);

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
};

const parseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeImageList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.url) return item.url;
        if (item?.value) return item.value;
        return "";
      })
      .filter(Boolean);
  }
  return parseList(value);
};

const unique = (items) => Array.from(new Set(items));

const isFileLike = (value) =>
  typeof File !== "undefined" && value instanceof File;

const isFileListLike = (value) =>
  typeof FileList !== "undefined" && value instanceof FileList;

const extractImageFile = (value) => {
  if (!value) return null;
  if (isFileLike(value)) return value;
  if (isFileListLike(value)) return value[0] || null;
  if (Array.isArray(value)) return value[0] || null;
  return null;
};

export const buildProjectPayload = (formData = {}) => {
  const title = formData.title?.trim() || "";
  const description = formData.description?.trim() || "";
  const imageFile = extractImageFile(formData.imageFile);

  const coverImage = formData.image?.trim() || formData.coverImage?.trim();
  const gallerySource =
    formData.images !== undefined ? formData.images : formData.gallery;
  const gallery = normalizeImageList(gallerySource);
  const images = unique(
    [coverImage, ...gallery].map((value) => value?.trim()).filter(Boolean)
  );

  const payload = { title, description };

  if (images.length) payload.images = images;

  const categoryId = formData.category?.trim();
  if (isValidObjectId(categoryId)) {
    payload.category = categoryId;
  }

  const techList = normalizeArray(formData.technologies)
    .map((value) => (value?.toString ? value.toString() : value))
    .filter(Boolean)
    .filter(isValidObjectId);

  if (techList.length) {
    payload.technologies = unique(techList);
  }

  const liveDemo = formData.liveDemo?.trim();
  if (liveDemo) payload.liveDemo = liveDemo;

  const githubRepo = formData.githubRepo?.trim();
  if (githubRepo) payload.githubRepo = githubRepo;

  if (imageFile) payload.imageFile = imageFile;

  return payload;
};

export const buildProjectFormDefaults = (project = {}) => {
  const rawImages = Array.isArray(project.images)
    ? project.images
    : project.image
      ? [project.image]
      : [];

  const categoryId =
    project.category?._id ||
    project.category?.id ||
    project.category ||
    "";

  const technologies = normalizeArray(project.technologies)
    .map((tech) => tech?._id || tech?.id || tech)
    .filter(Boolean)
    .filter(isValidObjectId);

  const defaults = {
    title: project.title || "",
    description: project.description || "",
    imageFile: null,
    image: rawImages[0] || "",
    images: rawImages.slice(1),
    category: isValidObjectId(categoryId) ? categoryId : "",
    technologies,
    liveDemo: project.liveDemo || "",
    githubRepo: project.githubRepo || "",
  };

  defaults.coverImage = defaults.image;
  defaults.gallery = defaults.images.join(", ");

  return defaults;
};
