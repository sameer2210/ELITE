const normalizeLabel = (value) => (value || "").toString().trim();

const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.id || value._id || "";
};

const normalizeItemLabel = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item.name || item.title || "";
};

const normalizeItemId = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item.id || item._id || "";
};

const safeLower = (value) => (value || "").toString().toLowerCase();

const stripToken = (source, token) => {
  if (!token) return source;
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source.replace(new RegExp(`\\b${escaped}\\b`, "gi"), " ");
};

const parseCompactNumber = (input) => {
  const value = (input || "").toString().trim().toLowerCase().replace(/\s+/g, "");
  if (!value) return 0;
  const numeric = Number.parseFloat(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  if (value.endsWith("k")) return Math.round(numeric * 1000);
  if (value.endsWith("m")) return Math.round(numeric * 1000000);
  return Math.round(numeric);
};

const extractMetricThreshold = (query, metric) => {
  const patterns = [
    new RegExp(
      `(?:at\\s+least|min(?:imum)?|more\\s+than|over|above|greater\\s+than|>=?)\\s*(\\d+(?:\\.\\d+)?\\s*[km]?)\\s*${metric}s?`,
      "i"
    ),
    new RegExp(`(\\d+(?:\\.\\d+)?\\s*[km]?)\\s*\\+\\s*${metric}s?`, "i"),
    new RegExp(
      `${metric}s?\\s*(?:at\\s+least|min(?:imum)?|more\\s+than|over|above|greater\\s+than|>=?)\\s*(\\d+(?:\\.\\d+)?\\s*[km]?)`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match?.[1]) {
      return parseCompactNumber(match[1]);
    }
  }

  return 0;
};

const extractRecency = (query) => {
  if (/(today|last 24 hours|past 24 hours)/i.test(query)) return "1";
  if (/(this week|last week|last 7 days|past week)/i.test(query)) return "7";
  if (/(this month|last 30 days|past month)/i.test(query)) return "30";
  if (/(last 90 days|past 3 months)/i.test(query)) return "90";
  if (/(this year|last 365 days|past year)/i.test(query)) return "365";
  return "any";
};

const inferSort = (query) => {
  if (/(most liked|top liked|highest likes|popular|popularity)/i.test(query)) {
    return "most_liked";
  }
  if (/(most viewed|top viewed|highest views|trending|viral)/i.test(query)) {
    return "most_viewed";
  }
  if (/(a-z|alphabetical|alphabetic)/i.test(query)) return "title_asc";
  if (/(z-a|reverse alphabet)/i.test(query)) return "title_desc";
  if (/(oldest|earliest)/i.test(query)) return "oldest";
  if (/(latest|newest|recent)/i.test(query)) return "newest";
  return "newest";
};

const STOP_WORDS = new Set([
  "with",
  "without",
  "projects",
  "project",
  "show",
  "find",
  "me",
  "that",
  "this",
  "from",
  "within",
  "past",
  "having",
  "have",
  "has",
  "more",
  "than",
  "least",
  "over",
  "above",
  "and",
  "the",
  "for",
  "all",
  "new",
  "latest",
  "recent",
  "sorted",
  "by",
  "only",
  "demo",
  "github",
  "source",
  "code",
  "open",
  "award",
  "awards",
  "winning",
  "winner",
  "likes",
  "views",
]);

const extractKeywords = (query, usedTerms = []) => {
  let cleaned = safeLower(query)
    .replace(
      /(?:at\s+least|min(?:imum)?|more\s+than|over|above|greater\s+than|>=?)\s*\d+(?:\.\d+)?\s*[km]?\s*(likes?|views?)/gi,
      " "
    )
    .replace(/\d+(?:\.\d+)?\s*[km]?\s*\+\s*(likes?|views?)/gi, " ");

  for (const term of usedTerms) {
    cleaned = stripToken(cleaned, term);
  }

  const tokens = cleaned
    .split(/[^a-z0-9]+/gi)
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length >= 3 && !STOP_WORDS.has(item));

  return Array.from(new Set(tokens)).slice(0, 8);
};

export const createDefaultProjectFilters = () => ({
  aiQuery: "",
  searchText: "",
  keywordTokens: [],
  categoryId: "",
  technologyIds: [],
  sortBy: "newest",
  createdWithinDays: "any",
  minLikes: 0,
  minViews: 0,
  hasLiveDemo: false,
  hasGithubRepo: false,
  awardsOnly: false,
});

export const PROJECT_SORT_TO_SERVER = {
  newest: "-createdAt",
  oldest: "createdAt",
  most_liked: "-likes",
  most_viewed: "-views",
  title_asc: "title",
  title_desc: "-title",
};

export const parseAiProjectQuery = (
  rawQuery,
  { categories = [], technologies = [] } = {}
) => {
  const defaults = createDefaultProjectFilters();
  const query = normalizeLabel(rawQuery);
  if (!query) return defaults;

  const normalizedCategories = (Array.isArray(categories) ? categories : [])
    .map((item) => ({
      id: normalizeItemId(item),
      label: normalizeItemLabel(item),
      lower: safeLower(normalizeItemLabel(item)),
    }))
    .filter((item) => item.id && item.label)
    .sort((a, b) => b.lower.length - a.lower.length);

  const normalizedTechnologies = (Array.isArray(technologies) ? technologies : [])
    .map((item) => ({
      id: normalizeItemId(item),
      label: normalizeItemLabel(item),
      lower: safeLower(normalizeItemLabel(item)),
    }))
    .filter((item) => item.id && item.label)
    .sort((a, b) => b.lower.length - a.lower.length);

  const lowerQuery = safeLower(query);
  const usedTerms = [];

  const matchedCategory = normalizedCategories.find((item) =>
    lowerQuery.includes(item.lower)
  );

  const matchedTechnologyIds = normalizedTechnologies
    .filter((item) => lowerQuery.includes(item.lower))
    .map((item) => {
      usedTerms.push(item.lower);
      return item.id;
    });

  if (matchedCategory?.lower) {
    usedTerms.push(matchedCategory.lower);
  }

  const hasLiveDemo =
    /(live demo|demo link|demo|deployed|production|live site)/i.test(query) &&
    !/(without demo|no demo|without live demo)/i.test(query);
  const hasGithubRepo =
    /(github|open source|opensource|source code|repository|repo)/i.test(query) &&
    !/(without github|no github|closed source)/i.test(query);
  const awardsOnly =
    /(award-winning|award winning|awarded|winner|winning project|featured)/i.test(
      query
    ) && !/(without awards|no awards)/i.test(query);

  const minLikes = extractMetricThreshold(query, "like");
  const minViews = extractMetricThreshold(query, "view");
  const createdWithinDays = extractRecency(query);
  const sortBy = inferSort(query);
  const keywordTokens = extractKeywords(query, usedTerms);
  const searchText = keywordTokens.slice(0, 4).join(" ");

  return {
    ...defaults,
    aiQuery: query,
    categoryId: matchedCategory?.id || "",
    technologyIds: Array.from(new Set(matchedTechnologyIds)),
    hasLiveDemo,
    hasGithubRepo,
    awardsOnly,
    minLikes,
    minViews,
    createdWithinDays,
    sortBy,
    keywordTokens,
    searchText,
  };
};

const getProjectCategoryId = (project) =>
  normalizeId(project?.category?.id || project?.category?._id || project?.category);

const getProjectTechnologyIds = (project) => {
  if (!Array.isArray(project?.technologies)) return [];
  return project.technologies
    .map((item) => normalizeId(item?.id || item?._id || item))
    .filter(Boolean);
};

const getProjectSearchText = (project) => {
  const categoryLabel =
    project?.category?.name || project?.category?.title || project?.category || "";
  const techLabel = Array.isArray(project?.technologies)
    ? project.technologies
        .map((item) => item?.name || item?.title || item)
        .filter(Boolean)
        .join(" ")
    : "";
  const developerLabel =
    project?.developerId?.name || project?.developerId?.username || "";
  return safeLower(
    [
      project?.title || "",
      project?.description || "",
      categoryLabel,
      techLabel,
      developerLabel,
    ].join(" ")
  );
};

const getCreatedAt = (project) => {
  const raw = project?.createdAt || project?.updatedAt;
  const date = raw ? new Date(raw) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return date;
};

const sortProjects = (projects, sortBy) => {
  const list = [...projects];
  const byDate = (item) => getCreatedAt(item)?.getTime() || 0;
  const byTitle = (item) => safeLower(item?.title || "");
  const byLikes = (item) => Number(item?.likes) || 0;
  const byViews = (item) => Number(item?.views) || 0;

  switch (sortBy) {
    case "oldest":
      return list.sort((a, b) => byDate(a) - byDate(b));
    case "most_liked":
      return list.sort((a, b) => byLikes(b) - byLikes(a) || byDate(b) - byDate(a));
    case "most_viewed":
      return list.sort((a, b) => byViews(b) - byViews(a) || byDate(b) - byDate(a));
    case "title_asc":
      return list.sort((a, b) => byTitle(a).localeCompare(byTitle(b)));
    case "title_desc":
      return list.sort((a, b) => byTitle(b).localeCompare(byTitle(a)));
    case "newest":
    default:
      return list.sort((a, b) => byDate(b) - byDate(a));
  }
};

export const applyClientProjectFilters = (projects, filters = {}) => {
  const {
    keywordTokens = [],
    categoryId = "",
    technologyIds = [],
    minLikes = 0,
    minViews = 0,
    hasLiveDemo = false,
    hasGithubRepo = false,
    awardsOnly = false,
    createdWithinDays = "any",
    sortBy = "newest",
  } = filters;

  const now = Date.now();
  const daysWindow = Number(createdWithinDays);
  const minimumLikes = Number(minLikes) || 0;
  const minimumViews = Number(minViews) || 0;

  const filtered = (Array.isArray(projects) ? projects : []).filter((project) => {
    if (categoryId && getProjectCategoryId(project) !== categoryId) return false;

    if (Array.isArray(technologyIds) && technologyIds.length > 0) {
      const projectTechIds = getProjectTechnologyIds(project);
      const hasAtLeastOne = technologyIds.some((techId) =>
        projectTechIds.includes(techId)
      );
      if (!hasAtLeastOne) return false;
    }

    if (minimumLikes > 0 && (Number(project?.likes) || 0) < minimumLikes) {
      return false;
    }

    if (minimumViews > 0 && (Number(project?.views) || 0) < minimumViews) {
      return false;
    }

    if (hasLiveDemo && !normalizeLabel(project?.liveDemo)) return false;
    if (hasGithubRepo && !normalizeLabel(project?.githubRepo)) return false;
    if (awardsOnly && (!Array.isArray(project?.awards) || project.awards.length === 0)) {
      return false;
    }

    if (Number.isFinite(daysWindow) && daysWindow > 0) {
      const createdAt = getCreatedAt(project);
      if (!createdAt) return false;
      const ageMs = now - createdAt.getTime();
      if (ageMs > daysWindow * 24 * 60 * 60 * 1000) return false;
    }

    if (Array.isArray(keywordTokens) && keywordTokens.length > 0) {
      const haystack = getProjectSearchText(project);
      const matchesKeywords = keywordTokens.every((token) =>
        haystack.includes(token)
      );
      if (!matchesKeywords) return false;
    }

    return true;
  });

  return sortProjects(filtered, sortBy);
};

export const countActiveFilters = (filters = {}) => {
  let count = 0;
  if (normalizeLabel(filters.searchText)) count += 1;
  if (filters.categoryId) count += 1;
  if (Array.isArray(filters.technologyIds) && filters.technologyIds.length) count += 1;
  if ((Number(filters.minLikes) || 0) > 0) count += 1;
  if ((Number(filters.minViews) || 0) > 0) count += 1;
  if (filters.hasLiveDemo) count += 1;
  if (filters.hasGithubRepo) count += 1;
  if (filters.awardsOnly) count += 1;
  if (filters.createdWithinDays && filters.createdWithinDays !== "any") count += 1;
  if (filters.sortBy && filters.sortBy !== "newest") count += 1;
  return count;
};
