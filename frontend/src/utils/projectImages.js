const URL_PATTERN = /^(https?:\/\/|data:image\/|\/)/i;

const normalizeValue = (value) => {
  if (typeof value === "string") return value.trim();
  if (value?.url) return String(value.url).trim();
  if (value?.src) return String(value.src).trim();
  return "";
};

const isValidImage = (value) => {
  if (!value) return false;
  return URL_PATTERN.test(value);
};

export const normalizeImageList = (...sources) => {
  const raw = [];
  sources.forEach((source) => {
    if (!source) return;
    if (Array.isArray(source)) {
      raw.push(...source);
    } else {
      raw.push(source);
    }
  });

  const normalized = raw
    .map(normalizeValue)
    .filter(Boolean)
    .filter(isValidImage);

  return Array.from(new Set(normalized));
};

export const getPrimaryImage = (...sources) => {
  const list = normalizeImageList(...sources);
  return list[0] || "";
};
